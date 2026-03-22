import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Plus, Check, Star } from 'lucide-react'
import { getImageUrl } from '@/services/tmdb'
import { useMyList } from '@/context/MyListContext'

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

    const isNew = releaseDate ? (Date.now() - new Date(releaseDate).getTime()) < 60 * 24 * 60 * 60 * 1000 : false

    const inList = isInList(id, type)

    const handleClick = () => navigate(`/detail/${type}/${id}`)

    const handleListToggle = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (inList) {
                removeFromList(id, type)
            } else {
                addToList(id, type)
            }
        },
        [inList, id, type, addToList, removeFromList]
    )

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigate(type === 'movie' ? `/watch/movie/${id}` : `/watch/tv/${id}/1/1`)
    }

    return (
        <motion.div
            className="relative cursor-pointer w-full h-full"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Glowing Shadow Background */}
            <motion.div 
                className="absolute -inset-2 bg-brand/40 rounded-xl blur-xl z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 0.6 : 0 }}
                transition={{ duration: 0.3 }}
            />

            <div className="relative aspect-poster overflow-hidden rounded-xl z-10 bg-surface-card border border-white/5">
                {/* Skeleton */}
                {!imageLoaded && <div className="absolute inset-0 skeleton rounded-xl" />}

                {/* Poster */}
                <img
                    src={getImageUrl(posterPath, 'w500')}
                    alt={title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
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

                {/* New badge */}
                {isNew && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        New
                    </div>
                )}

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'
                    }`} />

                {/* Hover overlay */}
                {showOverlay && (
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Play button */}
                        <button
                            onClick={handlePlayClick}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95 shadow-xl"
                            aria-label={`Play ${title}`}
                        >
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-black fill-black ml-0.5" />
                        </button>

                        {/* Add to list */}
                        <button
                            onClick={handleListToggle}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110"
                            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                        >
                            {inList ? (
                                <Check className="w-4 h-4 text-brand" />
                            ) : (
                                <Plus className="w-4 h-4 text-white" />
                            )}
                        </button>
                    </div>
                )}

                {/* Title at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <p className="text-white text-xs md:text-sm font-semibold line-clamp-2 text-shadow">
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
        </motion.div>
    )
}
