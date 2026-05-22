import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ContentCard } from './ContentCard'
import type { TMDBMovie, TMDBTVShow, TMDBContent } from '@/types'

interface ContentRowProps {
    title: string
    items: (TMDBMovie | TMDBTVShow | TMDBContent)[]
    type?: 'movie' | 'tv' | 'mixed'
    showSeeAll?: boolean
    seeAllPath?: string
}

export function ContentRow({
    title,
    items,
    type = 'mixed',
    showSeeAll = false,
    seeAllPath = '/discover',
}: ContentRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const updateArrows = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 20)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
    }

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.addEventListener('scroll', updateArrows)
        updateArrows()
        return () => el.removeEventListener('scroll', updateArrows)
    }, [items])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.75
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    if (!items || items.length === 0) return null

    return (
        <div className="relative group/row py-4">
            {/* Enhanced Header with better visual hierarchy */}
            <div className="flex items-end justify-between px-4 md:px-8 mb-4">
                <div className="relative z-10">
                    {/* Enhanced category label with better contrast */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 letter-spacing-tight">
                        {type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'Content'}
                    </p>
                    {/* Enhanced title with gradient effect */}
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                        {title}
                    </h2>
                </div>
                {showSeeAll && (
                    <Link
                        to={seeAllPath}
                        className="text-xs text-white/40 hover:text-white transition-all duration-300 font-medium group flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
                    >
                        See all
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                )}
            </div>

            {/* Enhanced Scroll container with better visual design */}
            <div className="relative group/scroll-container">
                {/* Enhanced Left gradient + arrow with better visibility */}
                <div
                    className={`absolute left-0 top-0 bottom-0 z-30 w-20 bg-gradient-to-r from-surface via-surface/90 to-transparent flex items-center justify-start pl-3 transition-all duration-500 ease-out ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('left')}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl flex items-center justify-center hover:from-white/20 hover:to-white/10 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </div>

                {/* Enhanced Items with better spacing and hover effects */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 md:gap-5 lg:gap-6 px-4 md:px-8 py-4 overflow-x-auto hide-scrollbar scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {items.map((item, index) => {
                        const isMovie = 'title' in item
                        const contentType = type === 'mixed' ? (isMovie ? 'movie' : 'tv') : type

                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className="flex-shrink-0 w-[130px] sm:w-[145px] md:w-[160px] lg:w-[180px] 3xl:w-[200px] transition-all duration-300 ease-out"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <ContentCard
                                    id={item.id}
                                    type={contentType}
                                    title={isMovie ? item.title : item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    releaseDate={isMovie ? item.release_date : item.first_air_date}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Enhanced Right gradient + arrow with better visibility */}
                <div
                    className={`absolute right-0 top-0 bottom-0 z-30 w-20 bg-gradient-to-l from-surface via-surface/90 to-transparent flex items-center justify-end pr-3 transition-all duration-500 ease-out ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('right')}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl flex items-center justify-center hover:from-white/20 hover:to-white/10 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
