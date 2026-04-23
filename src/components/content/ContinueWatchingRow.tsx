import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getBackdropUrl, getImageUrl } from '@/services/tmdb'
import { useContinueWatching } from '@/store/useContinueWatchingStore'
import { useQuery } from '@tanstack/react-query'
import { getMovieDetails, getTVDetails } from '@/services/tmdb'
import type { TMDBMovieDetails, TMDBTVDetails } from '@/types'

interface ContinueWatchingCardProps {
    tmdbId: number
    mediaType: 'movie' | 'tv'
    season?: number
    episode?: number
    progress: number
    title?: string
    posterPath?: string
    backdropPath?: string
}

function ContinueWatchingCard({
    tmdbId,
    mediaType,
    season,
    episode,
    progress,
    title: propTitle,
    posterPath: propPosterPath,
    backdropPath: propBackdropPath,
}: ContinueWatchingCardProps) {
    const navigate = useNavigate()

    // Only fetch if we're missing both title and backdrop
    const { data: details } = useQuery<TMDBMovieDetails | TMDBTVDetails>({
        queryKey: ['details', mediaType, tmdbId],
        queryFn: async () => {
            if (mediaType === 'movie') return getMovieDetails(tmdbId)
            return getTVDetails(tmdbId)
        },
        enabled: !propTitle,
    })

    const title = propTitle || (details ? ('title' in details ? details.title : details.name) : '')
    // Prefer landscape backdrop for the 16:9 card — fall back to poster only when absent
    const backdropPath = propBackdropPath || details?.backdrop_path || null
    const posterPath = propPosterPath || details?.poster_path || null

    if (!title) return null

    const handleClick = () => {
        if (mediaType === 'movie') {
            navigate(`/watch/movie/${tmdbId}`)
        } else {
            navigate(`/watch/tv/${tmdbId}/${season || 1}/${episode || 1}`)
        }
    }

    return (
        <button
            onClick={handleClick}
            className="flex-shrink-0 w-[160px] sm:w-[200px] group"
        >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-card">
                <img
                    src={backdropPath
                        ? getBackdropUrl(backdropPath, 'w300')
                        : getImageUrl(posterPath, 'w342')}
                    srcSet={backdropPath
                        ? undefined
                        : `${getImageUrl(posterPath, 'w185')} 185w, ${getImageUrl(posterPath, 'w342')} 342w, ${getImageUrl(posterPath, 'w500')} 500w`}
                    sizes={backdropPath
                        ? undefined
                        : "(max-width: 640px) 130px, (max-width: 768px) 145px, 180px"}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div
                        className="h-full bg-brand"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>
            <div className="mt-2 text-left">
                <p className="text-sm font-medium line-clamp-1">{title}</p>
                {mediaType === 'tv' && season && episode && (
                    <p className="text-xs text-text-muted">
                        S{season}:E{episode}
                    </p>
                )}
            </div>
        </button>
    )
}

export function ContinueWatchingRow() {
    const { continueWatching, loading } = useContinueWatching()

    const inProgressItems = continueWatching.filter((item) => !item.completed)

    if (loading || inProgressItems.length === 0) {
        return null
    }

    return (
        <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white px-4 mb-3">
                Continue Watching
            </h2>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {inProgressItems.slice(0, 10).map((item) => {
                    const progress =
                        item.duration_seconds > 0
                            ? (item.progress_seconds / item.duration_seconds) * 100
                            : 0

                    return (
                        <ContinueWatchingCard
                            key={`${item.type}-${item.tmdb_id}-${item.season}-${item.episode}`}
                            tmdbId={item.tmdb_id}
                            mediaType={item.type}
                            season={item.season}
                            episode={item.episode}
                            progress={progress}
                            title={item.title}
                            posterPath={item.poster_path}
                            backdropPath={item.backdrop_path}
                        />
                    )
                })}
            </div>
        </div>
    )
}