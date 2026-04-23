import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Plus, Check, Star } from 'lucide-react'
import { getImageUrl } from '@/services/tmdb'
import { useMyList } from '@/store/useMyListStore'

interface ContentCardProps {
    id: number
    type: 'movie' | 'tv'
    title: string
    posterPath: string | null
    progress?: number
    rating?: number
    releaseDate?: string
    showOverlay?: boolean
}

export function ContentCard({
    id,
    type,
    title,
    posterPath,
    progress,
    rating,
    releaseDate,
    showOverlay = true,
}: ContentCardProps) {
    const navigate = useNavigate()
    const { isInList, addToList, removeFromList } = useMyList()
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const isNew = releaseDate
        ? (Date.now() - new Date(releaseDate).getTime()) < 14 * 24 * 60 * 60 * 1000
        : false

    const inList = isInList(id, type)

    const handleClick = () => navigate(`/detail/${type}/${id}`)

    const handleListToggle = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (inList) {
                removeFromList(id, type)
            } else {
                addToList(id, type, { title, posterPath: posterPath ?? undefined })
            }
        },
        [inList, id, type, addToList, removeFromList, title]
    )

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigate(type === 'movie' ? `/watch/movie/${id}` : `/watch/tv/${id}/1/1`)
    }

    return (
        <div
            className="group/card relative cursor-pointer w-full h-full rounded-xl transition-transform duration-200 hover:-translate-y-2"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            {/* Glow — desktop hover only */}
            <div
                className={`absolute -inset-2 bg-brand/40 rounded-xl blur-xl z-0 transition-opacity duration-300 ${isHovered ? 'opacity-60' : 'opacity-0'}`}
            />

            <div className="relative aspect-poster overflow-hidden rounded-xl z-10 bg-surface-card border border-white/5">
                {!imageLoaded && <div className="absolute inset-0 skeleton rounded-xl" />}

                <img
                    src={getImageUrl(posterPath, 'w342')}
                    srcSet={`${getImageUrl(posterPath, 'w185')} 185w, ${getImageUrl(posterPath, 'w342')} 342w, ${getImageUrl(posterPath, 'w500')} 500w`}
                    sizes="(max-width: 640px) 130px, (max-width: 768px) 145px, 180px"
                    alt={title}
                    loading="lazy"
                    width={342}
                    height={513}
                    className={`w-full h-full object-cover origin-center transition-all duration-700 ease-smooth ${imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'
                        } group-hover/card:scale-105`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                />

                {/* Rating badge */}
                {rating && rating > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-xs font-bold">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}

                {/* New badge — only on desktop (mobile shows the + button here) */}
                {isNew && (
                    <div className="hidden md:block absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        New
                    </div>
                )}

                {/* Mobile-only list button — always visible since the hover overlay is hidden on mobile */}
                <button
                    onClick={handleListToggle}
                    className="md:hidden absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                >
                    {inList ? (
                        <Check className="w-4 h-4 text-brand" />
                    ) : (
                        <Plus className="w-4 h-4 text-white" />
                    )}
                </button>

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Desktop hover overlay */}
                {showOverlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-300 opacity-0 md:group-hover/card:opacity-100">
                        <button
                            onClick={handlePlayClick}
                            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full glass-premium flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-brand group/play active:scale-95 shadow-glow"
                            aria-label={`Play ${title}`}
                        >
                            <Play className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white fill-white ml-1 transition-transform group-hover/play:scale-110" />
                        </button>

                        <button
                            onClick={handleListToggle}
                            className="absolute top-2 right-2 w-9 h-9 rounded-full glass-dark flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 shadow-lg"
                            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                        >
                            {inList ? (
                                <Check className="w-5 h-5 text-brand" />
                            ) : (
                                <Plus className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>
                )}

                {/* Title strip */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100">
                    <p className="text-white text-[11px] md:text-xs lg:text-sm font-semibold line-clamp-2 text-shadow">
                        {title}
                    </p>
                </div>

                {/* Progress bar */}
                {progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                            className="h-full bg-brand rounded-r"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
