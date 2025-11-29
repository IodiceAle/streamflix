import { useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/lib/tmdb'
import { ROUTES } from '@/lib/constants'
import { HiPlay, HiPlus, HiCheck } from 'react-icons/hi'
import { useMyList } from '@/context/MyListContext'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'

interface ContentCardProps {
    item: TMDBMovie | TMDBTVShow
    showProgress?: boolean
    progress?: number
    hideListButton?: boolean
}

export function ContentCard({
    item,
    showProgress = false,
    progress = 0,
    hideListButton = false,
}: ContentCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const { addToList, removeFromList, isInList } = useMyList()

    const isMovie = 'title' in item
    const title = isMovie ? item.title : item.name
    const type = isMovie ? 'movie' : 'tv'
    const posterUrl = getImageUrl(item.poster_path, 'w342')
    const inList = isInList(item.id)

    const genres = item.genre_ids?.slice(0, 2) || []

    const handleAddToList = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (inList) {
            await removeFromList(item.id, type)
        } else {
            await addToList(item)
        }
    }

    return (
        <Link
            to={ROUTES.DETAIL(type, item.id)}
            className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-10"
        >
            {/* Poster Image */}
            <div className="relative aspect-poster bg-dark-card">
                {!imageError ? (
                    <>
                        {!imageLoaded && (
                            <div className="absolute inset-0 skeleton" />
                        )}
                        <img
                            src={posterUrl}
                            alt={title}
                            className={cn(
                                'h-full w-full object-cover transition-opacity duration-300',
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-dark-card text-text-secondary">
                        <span className="text-center px-4">{title}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {showProgress && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        {/* Play Button */}
                        <button
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all transform scale-0 group-hover:scale-100"
                            aria-label="Play"
                        >
                            <HiPlay className="h-6 w-6 text-black ml-1" />
                        </button>

                        {/* Add to List Button */}
                        {!hideListButton && (
                            <button
                                onClick={handleAddToList}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-card/80 hover:bg-dark-card border border-gray-600 hover:border-white transition-all transform scale-0 group-hover:scale-100"
                                aria-label={inList ? 'Remove from list' : 'Add to list'}
                            >
                                {inList ? (
                                    <HiCheck className="h-5 w-5 text-white" />
                                ) : (
                                    <HiPlus className="h-5 w-5 text-white" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                            {title}
                        </h3>
                        {item.vote_average > 0 && (
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    {item.vote_average.toFixed(1)}
                                </span>
                                {genres.length > 0 && (
                                    <span>• {genres.length} genres</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
