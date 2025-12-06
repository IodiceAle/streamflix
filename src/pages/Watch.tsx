import { useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, SkipForward } from 'lucide-react'
import { getMovieDetails, getTVDetails, getSeasonDetails } from '@/services/tmdb'
import { getMovieEmbedUrl, getTVEmbedUrl } from '@/services/vidsrc'
import type { TMDBMovieDetails, TMDBTVDetails, TMDBSeasonDetails } from '@/types'

export default function Watch() {
    const { type, id, season, episode } = useParams()
    const navigate = useNavigate()
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const isMovie = type === 'movie' || !season
    const isTVShow = type === 'tv' && season && episode
    const tmdbId = Number(id)
    const seasonNum = season ? Number(season) : 1
    const episodeNum = episode ? Number(episode) : 1

    const { data: details } = useQuery<TMDBMovieDetails | TMDBTVDetails>({
        queryKey: ['details', type, id],
        queryFn: async () => {
            if (isMovie) {
                return getMovieDetails(tmdbId)
            }
            return getTVDetails(tmdbId)
        },
    })

    const { data: seasonDetails } = useQuery<TMDBSeasonDetails>({
        queryKey: ['season', id, seasonNum],
        queryFn: () => getSeasonDetails(tmdbId, seasonNum),
        enabled: Boolean(isTVShow),
    })

    const title = details
        ? 'title' in details
            ? details.title
            : details.name
        : 'Loading...'

    const embedUrl = isMovie
        ? getMovieEmbedUrl(tmdbId)
        : getTVEmbedUrl(tmdbId, seasonNum, episodeNum)

    const hasNextEpisode =
        isTVShow &&
        seasonDetails?.episodes &&
        seasonDetails.episodes.some((ep) => ep.episode_number === episodeNum + 1)

    const goToNextEpisode = useCallback(() => {
        if (hasNextEpisode) {
            navigate(`/watch/tv/${id}/${seasonNum}/${episodeNum + 1}`)
        }
    }, [hasNextEpisode, navigate, id, seasonNum, episodeNum])

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                    <span className="font-medium">Back</span>
                </button>
                <div className="text-center flex-1">
                    <h1 className="font-semibold truncate">{title}</h1>
                    {isTVShow && (
                        <p className="text-sm text-text-secondary">
                            S{seasonNum}:E{episodeNum}
                        </p>
                    )}
                </div>
                {hasNextEpisode ? (
                    <button
                        onClick={goToNextEpisode}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white text-sm font-medium rounded hover:bg-white/30 transition-colors"
                    >
                        <span>Next</span>
                        <SkipForward className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="w-20" />
                )}
            </div>

            <div className="flex-1 relative">
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    title={title}
                    referrerPolicy="origin"
                />
            </div>
        </div>
    )
}
