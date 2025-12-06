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
            className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[85vh] overflow-hidden"
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
                        className="w-full h-full object-cover object-top"
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Image overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent opacity-90" />
                </div>
            ))}

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

            {/* Left content gradient */}
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-surface/95 via-surface/50 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 pb-32 md:pb-40">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white max-w-4xl leading-tight text-shadow-lg animate-fade-in-up">
                    {title}
                </h1>

                {/* Metadata */}
                <div className="flex items-center flex-wrap gap-3 mt-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <span className="badge badge-brand text-sm px-3 py-1">
                        {Math.round(currentItem.vote_average * 10)}% Match
                    </span>
                    {releaseDate && (
                        <span className="text-white/80 font-semibold text-sm md:text-base">
                            {new Date(releaseDate).getFullYear()}
                        </span>
                    )}
                    <span className="badge badge-outline text-xs uppercase tracking-wider">
                        {type === 'movie' ? 'Movie' : 'Series'}
                    </span>
                </div>

                {/* Overview */}
                <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {currentItem.overview}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <button
                        onClick={handlePlay}
                        className="btn-primary flex items-center gap-2 text-sm md:text-base"
                    >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                        <span>Play Now</span>
                    </button>
                    <button
                        onClick={handleMoreInfo}
                        className="btn-secondary flex items-center gap-2 text-sm md:text-base"
                    >
                        <Info className="w-5 h-5 md:w-6 md:h-6" />
                        <span>More Info</span>
                    </button>
                </div>
            </div>

            {/* Navigation arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 md:opacity-60 hover:opacity-100"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 md:opacity-60 hover:opacity-100"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </>
            )}

            {/* Pagination dots */}
            {items.length > 1 && (
                <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-brand w-8 h-2'
                                    : 'bg-white/30 w-2 h-2 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
