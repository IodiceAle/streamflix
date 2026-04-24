import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, SkipForward, Check, Loader2, Flag } from 'lucide-react'
import { getMovieEmbedUrl, getTVEmbedUrl } from '@/services/vidsrc'
import { getMovieDetails, getTVDetails, getSeasonDetails } from '@/services/tmdb'
import { useContinueWatching } from '@/store/useContinueWatchingStore'
import { useToast } from '@/components/ui/Toast'
import type { TMDBMovieDetails, TMDBTVDetails } from '@/types'

export default function Watch() {
    const { type, id, season, episode } = useParams()
    const navigate = useNavigate()
    const { updateProgress, markAsWatched, getProgress } = useContinueWatching()
    const { success } = useToast()

    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [isMarkedWatched, setIsMarkedWatched] = useState(false)
    const [controlsVisible, setControlsVisible] = useState(true)
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isMovie = type === 'movie'
    const tmdbId = Number(id)
    const seasonNum = season ? Number(season) : undefined
    const episodeNum = episode ? Number(episode) : undefined

    const isInvalidRoute = !tmdbId || tmdbId <= 0 || !Number.isInteger(tmdbId) || (type !== 'movie' && type !== 'tv')

    const { data: details } = useQuery<TMDBMovieDetails | TMDBTVDetails>({
        queryKey: ['details', type, id],
        queryFn: () => isMovie ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
        enabled: !isInvalidRoute && !!id,
    })

    const { data: seasonDetails } = useQuery({
        queryKey: ['season', id, seasonNum],
        queryFn: () => getSeasonDetails(tmdbId, seasonNum!),
        enabled: !isInvalidRoute && !isMovie && !!seasonNum,
    })

    const title = details ? ('title' in details ? details.title : details.name) : ''
    const episodeTitle = seasonDetails?.episodes?.find(
        (ep) => ep.episode_number === episodeNum
    )?.name

    const existingProgress = getProgress(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
    const alreadyCompleted = existingProgress?.completed || false

    // Compute the embed URL ONCE on mount — never recompute after that.
    // Without this, the store updating (e.g. Supabase fetch completing) would
    // change `existingProgress`, recompute the URL, and force an iframe reload
    // mid-playback, which caused TV shows to appear to never start playing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const embedUrl = useMemo(
        () => isMovie
            ? getMovieEmbedUrl(tmdbId, existingProgress?.progress_seconds || undefined)
            : getTVEmbedUrl(tmdbId, seasonNum || 1, episodeNum || 1, existingProgress?.progress_seconds || undefined),
        [] // intentionally empty — see comment above
    )

    // Auto-hide controls logic
    const resetHideTimer = useCallback(() => {
        setControlsVisible(true)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
    }, [])

    useEffect(() => {
        resetHideTimer()
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        }
    }, [resetHideTimer])

    // Create/update the "started watching" entry when details load.
    // Preserves existing progress — never overwrites with 0.
    useEffect(() => {
        if (!details) return
        const currentProgress = getProgress(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
        updateProgress({
            tmdb_id: tmdbId,
            type: isMovie ? 'movie' : 'tv',
            season: seasonNum,
            episode: episodeNum,
            progress_seconds: currentProgress?.progress_seconds ?? 0,
            duration_seconds: currentProgress?.duration_seconds ?? 0,
            title: 'title' in details ? details.title : details.name,
            poster_path: details.poster_path || undefined,
            backdrop_path: details.backdrop_path || undefined,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [details, tmdbId])

    // Track real playback progress via vixsrc.to postMessage events.
    // Throttled to one Supabase write every 10 s.
    const lastProgressSave = useRef(0)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type !== 'PLAYER_EVENT') return
            const { event: playerEvent, currentTime, duration } = (event.data.data ?? {}) as {
                event?: string
                currentTime?: number
                duration?: number
            }

            if (playerEvent === 'timeupdate' && currentTime && currentTime > 10 && duration && duration > 0) {
                const now = Date.now()
                if (now - lastProgressSave.current > 10_000) {
                    lastProgressSave.current = now
                    updateProgress({
                        tmdb_id: tmdbId,
                        type: isMovie ? 'movie' : 'tv',
                        season: seasonNum,
                        episode: episodeNum,
                        progress_seconds: Math.floor(currentTime),
                        duration_seconds: Math.floor(duration),
                        title: title || undefined,
                        poster_path: details?.poster_path || undefined,
                        backdrop_path: details?.backdrop_path || undefined,
                    })
                }
            }

            if (playerEvent === 'ended') {
                markAsWatched(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
                if (!isMarkedWatched && !alreadyCompleted) {
                    setIsMarkedWatched(true)
                    success(isMovie ? `${title} marked as watched!` : `S${seasonNum}:E${episodeNum} marked as watched!`)
                }
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [tmdbId, isMovie, seasonNum, episodeNum, updateProgress, markAsWatched, title, details, isMarkedWatched, alreadyCompleted, success])

    const hasNextEpisode = useMemo(() => {
        if (isMovie || !seasonDetails?.episodes || !episodeNum) return false
        return episodeNum < seasonDetails.episodes.length
    }, [isMovie, seasonDetails?.episodes, episodeNum])

    const handleNextEpisode = useCallback(() => {
        if (hasNextEpisode && seasonNum && episodeNum) {
            navigate(`/watch/tv/${id}/${seasonNum}/${episodeNum + 1}`)
        }
    }, [hasNextEpisode, id, seasonNum, episodeNum, navigate])

    if (isInvalidRoute) return <Navigate to="/" replace />

    const handleMarkAsWatched = () => {
        markAsWatched(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
            .then(() => {
                setIsMarkedWatched(true)
                success(isMovie ? `${title} marked as watched!` : `S${seasonNum}:E${episodeNum} marked as watched!`)
            })
            .catch((err) => {
                if (import.meta.env.DEV) console.error('Error marking as watched:', err)
            })
    }

    return (
        <div
            className="fixed inset-0 bg-black z-[60] flex flex-col cursor-pointer"
            onClick={resetHideTimer}
            onMouseMove={resetHideTimer}
            onTouchStart={resetHideTimer}
        >
            {/* Top controls — fade out after inactivity */}
            <div
                className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(-1) }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition-colors flex-shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-white text-sm md:text-lg font-semibold truncate">
                                {title}
                            </h1>
                            {!isMovie && seasonNum && episodeNum && (
                                <p className="text-white/60 text-xs md:text-sm truncate">
                                    Season {seasonNum}, Episode {episodeNum}
                                    {episodeTitle && ` — ${episodeTitle}`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleMarkAsWatched() }}
                            disabled={isMarkedWatched || alreadyCompleted}
                            className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${isMarkedWatched || alreadyCompleted
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                }`}
                        >
                            {isMarkedWatched || alreadyCompleted ? (
                                <><Check className="w-4 h-4" /><span className="hidden sm:inline">Watched</span></>
                            ) : (
                                <><Flag className="w-4 h-4" /><span className="hidden sm:inline">Mark Watched</span></>
                            )}
                        </button>

                        {hasNextEpisode && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextEpisode() }}
                                className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs md:text-sm font-medium transition-colors border border-white/20"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <SkipForward className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                    <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                    <p className="text-white/60 text-sm">Loading player...</p>
                </div>
            )}

            {/* Video iframe */}
            <iframe
                src={embedUrl}
                title={title ? `Watch ${title}` : 'Video player'}
                className="w-full h-full border-0"
                referrerPolicy="origin"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
                onLoad={() => setIframeLoaded(true)}
            />
        </div>
    )
}