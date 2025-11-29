import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { HiPlay, HiInformationCircle } from 'react-icons/hi'
import { getBackdropUrl } from '@/lib/tmdb'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'

interface HeroCarouselProps {
    items: (TMDBMovie | TMDBTVShow)[]
    autoPlay?: boolean
    interval?: number
}

export function HeroCarousel({ items, autoPlay = true, interval = 5000 }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (!autoPlay || isHovered || items.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, interval)

        return () => clearInterval(timer)
    }, [autoPlay, interval, isHovered, items.length])

    if (!items || items.length === 0) return null

    const currentItem = items[currentIndex]
    const isMovie = 'title' in currentItem
    const title = isMovie ? currentItem.title : currentItem.name
    const overview = currentItem.overview
    const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'original')
    const type = isMovie ? 'movie' : 'tv'

    return (
        <div
            className="relative h-[56.25vw] max-h-[600px] md:max-h-[700px] lg:max-h-[800px] w-full overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                {items.map((item, index) => {
                    const itemBackdrop = getBackdropUrl(item.backdrop_path, 'original')
                    return (
                        <div
                            key={item.id}
                            className={cn(
                                'absolute inset-0 transition-opacity duration-1000',
                                index === currentIndex ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <img
                                src={itemBackdrop}
                                alt={isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                                className="h-full w-full object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
                        </div>
                    )
                })}
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
                <div className="w-full px-4 pb-12 md:px-8 lg:px-12 md:pb-20 lg:pb-24 max-w-2xl">
                    <div className="animate-slide-up">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                            {title}
                        </h1>

                        {overview && (
                            <p className="text-sm md:text-base lg:text-lg text-white/90 mb-6 line-clamp-3 md:line-clamp-4 drop-shadow-lg max-w-xl">
                                {overview}
                            </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-sm md:text-base mb-6 text-white/80">
                            {currentItem.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    {currentItem.vote_average.toFixed(1)}
                                </span>
                            )}
                            {isMovie && (currentItem as TMDBMovie).release_date && (
                                <span>
                                    {new Date((currentItem as TMDBMovie).release_date).getFullYear()}
                                </span>
                            )}
                            {!isMovie && (currentItem as TMDBTVShow).first_air_date && (
                                <span>
                                    {new Date((currentItem as TMDBTVShow).first_air_date).getFullYear()}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <Link to={ROUTES.DETAIL(type, currentItem.id)}>
                                <Button variant="primary" size="lg" className="gap-2">
                                    <HiPlay className="w-5 h-5" />
                                    Play
                                </Button>
                            </Link>
                            <Link to={ROUTES.DETAIL(type, currentItem.id)}>
                                <Button variant="secondary" size="lg" className="gap-2">
                                    <HiInformationCircle className="w-5 h-5" />
                                    More Info
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Dots */}
            {items.length > 1 && (
                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                'h-1 rounded-full transition-all',
                                index === currentIndex
                                    ? 'w-8 bg-white'
                                    : 'w-6 bg-white/50 hover:bg-white/75'
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
