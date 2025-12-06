import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBackdropUrl } from '@/services/tmdb'
import type { TMDBContent } from '@/types'

interface HeroCarouselProps {
    items: TMDBContent[]
    autoPlay?: boolean
    interval?: number
}

export function HeroCarousel({
    items,
    autoPlay = true,
    interval = 7000,
}: HeroCarouselProps) {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const goToSlide = useCallback(
        (index: number) => {
            if (isTransitioning) return
            setIsTransitioning(true)
            setCurrentIndex(index)
            setTimeout(() => setIsTransitioning(false), 700)
        },
        [isTransitioning]
    )

    const goNext = useCallback(() => {
        goToSlide((currentIndex + 1) % items.length)
    }, [currentIndex, items.length, goToSlide])

    const goPrev = useCallback(() => {
        goToSlide((currentIndex - 1 + items.length) % items.length)
    }, [currentIndex, items.length, goToSlide])

    useEffect(() => {
        if (!autoPlay || isPaused || items.length <= 1) return
        const timer = setInterval(goNext, interval)
        return () => clearInterval(timer)
    }, [autoPlay, isPaused, interval, items.length, goNext])

    if (!items || items.length === 0) return null

    const currentItem = items[currentIndex]
    const title = 'title' in currentItem ? currentItem.title : currentItem.name
    const type = 'title' in currentItem ? 'movie' : 'tv'
    const releaseDate = 'release_date' in currentItem ? currentItem.release_date : currentItem.first_air_date

    const handlePlay = () => navigate(type === 'movie' ? `/watch/movie/${currentItem.id}` : `/watch/tv/${currentItem.id}/1/1`)
    const handleMoreInfo = () => navigate(`/detail/${type}/${currentItem.id}`)

    return (
        <div
            className="relative w-full min-h-[70vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Backdrop images */}
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                >
                    <img
                        src={getBackdropUrl(item.backdrop_path, 'original')}
                        alt=""
                        className="w-full h-full object-cover object-center"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Image overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent opacity-90" />
                </div>
            ))}

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

            {/* Left content gradient */}
            <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 bg-gradient-to-r from-surface/95 via-surface/50 to-transparent" />

            {/* Top gradient for status bar */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-surface/80 to-transparent" />

            {/* Content - positioned at bottom with safe padding */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 lg:p-16 pb-8 sm:pb-12 md:pb-16">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white max-w-3xl leading-tight text-shadow-lg animate-fade-in-up">
                    {title}
                </h1>

                {/* Metadata */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <span className="badge badge-brand text-xs sm:text-sm px-2 sm:px-3 py-1">
                        {Math.round(currentItem.vote_average * 10)}% Match
                    </span>
                    {releaseDate && (
                        <span className="text-white/80 font-semibold text-xs sm:text-sm md:text-base">
                            {new Date(releaseDate).getFullYear()}
                        </span>
                    )}
                    <span className="badge badge-outline text-xs uppercase tracking-wider">
                        {type === 'movie' ? 'Movie' : 'Series'}
                    </span>
                </div>

                {/* Overview - hidden on very small screens */}
                <p className="hidden sm:block mt-4 md:mt-5 text-sm md:text-base lg:text-lg text-white/80 line-clamp-2 md:line-clamp-3 max-w-xl lg:max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {currentItem.overview}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <button
                        onClick={handlePlay}
                        className="btn-primary flex items-center gap-2 text-sm md:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                    >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-white" />
                        <span>Play</span>
                    </button>
                    <button
                        onClick={handleMoreInfo}
                        className="btn-secondary flex items-center gap-2 text-sm md:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                    >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        <span>Info</span>
                    </button>
                </div>
            </div>

            {/* Navigation arrows - hidden on mobile */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-60 hover:opacity-100"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                    <button
                        onClick={goNext}
                        className="hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-60 hover:opacity-100"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </>
            )}

            {/* Pagination dots */}
            {items.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-12 flex gap-1.5 sm:gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-brand w-6 sm:w-8 h-1.5 sm:h-2'
                                    : 'bg-white/30 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
