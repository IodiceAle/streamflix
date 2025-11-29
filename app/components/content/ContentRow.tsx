import { useRef } from 'react'
import { Link } from 'react-router'
import { ContentCard } from './ContentCard'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'
import { cn } from '@/lib/utils'

interface ContentRowProps {
    title: string
    items: (TMDBMovie | TMDBTVShow)[]
    showSeeAll?: boolean
    onSeeAll?: () => void
    seeAllLink?: string
    showProgress?: boolean
    progressData?: Record<number, number>
    onAddToList?: (item: TMDBMovie | TMDBTVShow) => void
    isInList?: (id: number) => boolean
}

export function ContentRow({
    title,
    items,
    showSeeAll = false,
    onSeeAll,
    seeAllLink,
    showProgress = false,
    progressData,
    onAddToList,
    isInList,
}: ContentRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return

        const scrollAmount = scrollRef.current.clientWidth * 0.8
        const targetScroll =
            direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount

        scrollRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
        })
    }

    if (!items || items.length === 0) return null

    return (
        <div className="group relative">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between px-4 md:px-8">
                <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                {showSeeAll && (
                    <div>
                        {seeAllLink ? (
                            <Link
                                to={seeAllLink}
                                className="text-sm text-text-secondary hover:text-white transition-colors"
                            >
                                See All →
                            </Link>
                        ) : (
                            <button
                                onClick={onSeeAll}
                                className="text-sm text-text-secondary hover:text-white transition-colors"
                            >
                                See All →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Row with Navigation */}
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className={cn(
                        'absolute left-0 top-0 bottom-0 z-10 hidden md:flex items-center justify-center w-12 bg-gradient-to-r from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
                        'hover:from-dark/90'
                    )}
                    aria-label="Scroll left"
                >
                    <HiChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-8 pb-4 hide-scrollbar scroll-smooth snap-x snap-mandatory"
                >
                    {items.map((item) => (
                        <div key={item.id} className="w-[150px] md:w-[185px] lg:w-[200px] flex-shrink-0 snap-start">
                            <ContentCard
                                item={item}
                                showProgress={showProgress}
                                progress={progressData?.[item.id]}
                                onAddToList={() => onAddToList?.(item)}
                                isInList={isInList?.(item.id)}
                            />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className={cn(
                        'absolute right-0 top-0 bottom-0 z-10 hidden md:flex items-center justify-center w-12 bg-gradient-to-l from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
                        'hover:from-dark/90'
                    )}
                    aria-label="Scroll right"
                >
                    <HiChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    )
}
