import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, SkipForward, Check, Loader2, Flag } from 'lucide-react'
import { getMovieEmbedUrl, getTVEmbedUrl } from '@/services/vidsrc'
import { getMovieDetails, getTVDetails, getSeasonDetails } from '@/services/tmdb'
import { useContinueWatching } from '@/context/ContinueWatchingContext'
import { useToast } from '@/components/ui/Toast'
import type { TMDBMovieDetails, TMDBTVDetails } from '@/types'

export default function Watch() {
    const { type, id, season, episode } = useParams()
    const navigate = useNavigate()
    const { updateProgress, markAsWatched, getProgress } = useContinueWatching()
    const { success } = useToast()

    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [isMarkedWatched, setIsMarkedWatched] = useState(false)

    const isMovie = type === 'movie'
    const tmdbId = Number(id)
    const seasonNum = season ? Number(season) : undefined
    const episodeNum = episode ? Number(episode) : undefined

    // Fetch details for title/poster
    const { data: details } = useQuery<TMDBMovieDetails | TMDBTVDetails>({
        queryKey: ['details', type, id],
        queryFn: () => isMovie ? getMovieDetails(tmdbId) : getTVDetails(tmdbId),
        enabled: !!id,
    })

    // Fetch season details for next episode logic
    const { data: seasonDetails } = useQuery({
        queryKey: ['season', id, seasonNum],
        queryFn: () => getSeasonDetails(tmdbId, seasonNum!),
        enabled: !isMovie && !!seasonNum,
    })

    const title = details ? ('title' in details ? details.title : details.name) : ''
    const episodeTitle = seasonDetails?.episodes?.find(
        (ep) => ep.episode_number === episodeNum
    )?.name

    // Check if already marked as watched
    const existingProgress = getProgress(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
    const alreadyCompleted = existingProgress?.completed || false

    // Construct embed URL
    const embedUrl = isMovie
        ? getMovieEmbedUrl(tmdbId)
        : getTVEmbedUrl(tmdbId, seasonNum || 1, episodeNum || 1)

    // Save initial progress when page loads
    useEffect(() => {
        if (!details) return

        updateProgress({
            tmdb_id: tmdbId,
            type: isMovie ? 'movie' : 'tv',
            season: seasonNum,
            episode: episodeNum,
            progress_seconds: existingProgress?.progress_seconds || 0,
            duration_seconds: existingProgress?.duration_seconds || 0,
            title: 'title' in details ? details.title : details.name,
            poster_path: details.poster_path || undefined,
            backdrop_path: details.backdrop_path || undefined,
        })
    }, [details, tmdbId])

    // Determine next episode
    const hasNextEpisode = !isMovie && seasonDetails?.episodes && episodeNum
        ? episodeNum < seasonDetails.episodes.length
        : false

    const handleNextEpisode = useCallback(() => {
        if (hasNextEpisode && seasonNum && episodeNum) {
            navigate(`/watch/tv/${id}/${seasonNum}/${episodeNum + 1}`)
        }
    }, [hasNextEpisode, id, seasonNum, episodeNum, navigate])

    const handleMarkAsWatched = async () => {
        await markAsWatched(tmdbId, isMovie ? 'movie' : 'tv', seasonNum, episodeNum)
        setIsMarkedWatched(true)
        success(isMovie ? `${title} marked as watched!` : `S${seasonNum}:E${episodeNum} marked as watched!`)
    }

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={handleBack}
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Mark as Watched button */}
                        <button
                            onClick={handleMarkAsWatched}
                            disabled={isMarkedWatched || alreadyCompleted}
                            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${isMarkedWatched || alreadyCompleted
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                }`}
                        >
                            {isMarkedWatched || alreadyCompleted ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span className="hidden sm:inline">Watched</span>
                                </>
                            ) : (
                                <>
                                    <Flag className="w-4 h-4" />
                                    <span className="hidden sm:inline">Mark Watched</span>
                                </>
                            )}
                        </button>

                        {/* Next Episode button */}
                        {hasNextEpisode && (
                            <button
                                onClick={handleNextEpisode}
                                className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs md:text-sm font-medium transition-colors border border-white/20"
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
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                onLoad={() => setIframeLoaded(true)}
            />
        </div>
    )
}
