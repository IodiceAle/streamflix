import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, PanInfo, Variants } from 'framer-motion'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBackdropUrl } from '@/services/tmdb'
import type { TMDBContent } from '@/types'

interface HeroCarouselProps {
    items: TMDBContent[]
    autoPlay?: boolean
    interval?: number
}

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 1.05
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.95
    })
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
}

export function HeroCarousel({
    items,
    autoPlay = true,
    interval = 7000,
}: HeroCarouselProps) {
    const navigate = useNavigate()
    const [[page, direction], setPage] = useState([0, 0])
    const [isPaused, setIsPaused] = useState(false)

    const currentIndex = ((page % items.length) + items.length) % items.length

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection])
    }, [page])

    const goToSlide = useCallback((index: number) => {
        setPage([index, index > currentIndex ? 1 : -1])
    }, [currentIndex])

    const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
        const swipe = offset.x
        if (swipe < -50 || velocity.x < -500) {
            paginate(1)
        } else if (swipe > 50 || velocity.x > 500) {
            paginate(-1)
        }
    }

    useEffect(() => {
        if (!autoPlay || isPaused || items.length <= 1) return
        const timer = setInterval(() => paginate(1), interval)
        return () => clearInterval(timer)
    }, [autoPlay, isPaused, interval, items.length, paginate])

    if (!items || items.length === 0) return null

    const currentItem = items[currentIndex]
    const title = 'title' in currentItem ? currentItem.title : currentItem.name
    const type = 'title' in currentItem ? 'movie' : 'tv'
    const releaseDate = 'release_date' in currentItem ? currentItem.release_date : currentItem.first_air_date

    const handlePlayClick = () => navigate(type === 'movie' ? `/watch/movie/${currentItem.id}` : `/watch/tv/${currentItem.id}/1/1`)
    const handleMoreInfo = () => navigate(`/detail/${type}/${currentItem.id}`)

    return (
        // Added `group` so the `group-hover:opacity-100` on the nav arrows works
        <motion.div
            className="group relative w-full min-h-[50vh] sm:min-h-[55vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden bg-black"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {/* Backdrop images */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.8 }
                    }}
                    className="absolute inset-0"
                >
                    <motion.img
                        src={getBackdropUrl(currentItem.backdrop_path, 'w1280')}
                        alt=""
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                        fetchPriority="high"
                        width={1280}
                        height={720}
                        draggable="false"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1.15 }}
                        transition={{ duration: 15, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent opacity-90" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface via-surface/60 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 bg-gradient-to-r from-surface/95 via-surface/50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none z-10" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 lg:p-16 pb-8 sm:pb-12 md:pb-16 pointer-events-none z-20">
                <motion.div
                    key={currentIndex}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
               font-black text-white max-w-4xl leading-[1.0] tracking-[-0.03em] text-shadow-lg"
                    >
                        {title}
                    </motion.h1>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5"
                    >
                        <span className="badge badge-brand text-xs sm:text-sm px-2 sm:px-3 py-1 bg-brand/90 backdrop-blur-sm border-none shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                            {Math.round(currentItem.vote_average * 10)}% Match
                        </span>
                        {releaseDate && (
                            <span className="text-white/90 font-bold text-xs sm:text-sm md:text-base">
                                {new Date(releaseDate).getFullYear()}
                            </span>
                        )}
                        <span className="px-2 py-0.5 border border-white/20 text-white/80 rounded text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                            {type === 'movie' ? 'Movie' : 'Series'}
                        </span>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="hidden sm:block mt-4 md:mt-5 text-sm md:text-base lg:text-lg text-white/70 line-clamp-2 md:line-clamp-3 max-w-xl lg:max-w-2xl leading-relaxed font-medium"
                    >
                        {currentItem.overview}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8 pointer-events-auto"
                    >
                        <button
                            onClick={handlePlayClick}
                            className="flex items-center gap-2 text-sm md:text-base px-6 sm:px-8 py-3 bg-white text-black rounded-full font-bold transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-[0_4px_24px_rgba(255,255,255,0.3)] group/play"
                        >
                            <Play className="w-5 h-5 md:w-6 md:h-6 fill-black transition-transform group-hover/play:scale-110" />
                            <span>Play</span>
                        </button>
                        <button
                            onClick={handleMoreInfo}
                            className="flex items-center gap-2 text-sm md:text-base px-6 sm:px-8 py-3 bg-white/10 text-white rounded-full font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md border border-white/10"
                        >
                            <Info className="w-5 h-5 md:w-6 md:h-6" />
                            <span>More Info</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Navigation arrows — now work because parent has `group` class */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={() => paginate(-1)}
                        className="hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 z-30"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark items-center justify-center transition-all hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 z-30"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </>
            )}

            {/* Pagination dots */}
            {items.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-12 flex gap-1.5 sm:gap-2 z-30 pointer-events-auto">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`rounded-full transition-all duration-300 p-2 -m-1 ${index === currentIndex ? 'sm:p-2.5 sm:-m-1.5' : ''}`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span className={`block rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-white w-6 sm:w-8 h-1.5 sm:h-2 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                : 'bg-white/30 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-white/50'
                                }`} />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    )
}