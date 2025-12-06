import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                    {title}
                </h2>
                {showSeeAll && (
                    <Link
                        to={seeAllPath}
                        className="group/link flex items-center gap-1 text-sm text-brand hover:text-brand-light transition-colors font-semibold"
                    >
                        <span>See All</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Scroll container */}
            <div className="relative">
                {/* Left gradient + arrow */}
                <div
                    className={`absolute left-0 top-0 bottom-0 z-20 w-16 md:w-24 bg-gradient-to-r from-surface via-surface/80 to-transparent flex items-center justify-start pl-2 transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all border border-white/10 shadow-lg"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Items */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 md:gap-3 px-4 md:px-8 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {items.map((item, index) => {
                        const isMovie = 'title' in item
                        const contentType = type === 'mixed' ? (isMovie ? 'movie' : 'tv') : type

                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className="flex-shrink-0 w-[110px] sm:w-[130px] md:w-[150px] lg:w-[170px]"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <ContentCard
                                    id={item.id}
                                    type={contentType}
                                    title={isMovie ? item.title : item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Right gradient + arrow */}
                <div
                    className={`absolute right-0 top-0 bottom-0 z-20 w-16 md:w-24 bg-gradient-to-l from-surface via-surface/80 to-transparent flex items-center justify-end pr-2 transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all border border-white/10 shadow-lg"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}
