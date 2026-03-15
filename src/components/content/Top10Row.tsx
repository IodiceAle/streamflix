import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/services/tmdb'
import type { TMDBMovie, TMDBTVShow, TMDBContent } from '@/types'

interface Top10RowProps {
    title: string
    items: (TMDBMovie | TMDBTVShow | TMDBContent)[]
    type?: 'movie' | 'tv' | 'mixed'
}

export function Top10Row({ title, items, type = 'mixed' }: Top10RowProps) {
    const navigate = useNavigate()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const updateArrows = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 20)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
    }

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.75
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    if (!items || items.length === 0) return null

    const top10Items = items.slice(0, 10)

    return (
        <div className="relative group/row py-4">
            <div className="flex items-center px-4 md:px-8 mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                    {title}
                </h2>
            </div>

            <div className="relative">
                {/* Left arrow */}
                <div
                    className={`absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-surface to-transparent flex items-center pl-2 transition-opacity ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all border border-white/10"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-1 px-4 md:px-8 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
                    onScroll={updateArrows}
                >
                    {top10Items.map((item, index) => {
                        const isMovie = 'title' in item
                        const contentType = type === 'mixed' ? (isMovie ? 'movie' : 'tv') : type
                        const itemTitle = isMovie ? item.title : item.name

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(`/detail/${contentType}/${item.id}`)}
                                className="flex-shrink-0 relative flex items-end group cursor-pointer"
                                style={{ width: '180px', height: '200px' }}
                            >
                                {/* Large rank number */}
                                <span
                                    className="absolute left-0 bottom-0 font-black text-[120px] leading-none select-none"
                                    style={{
                                        WebkitTextStroke: '3px rgba(255,255,255,0.3)',
                                        color: 'transparent',
                                        zIndex: 1,
                                    }}
                                >
                                    {index + 1}
                                </span>

                                {/* Poster */}
                                <div className="absolute right-0 top-0 w-[110px] h-[165px] rounded-lg overflow-hidden shadow-xl group-hover:scale-105 transition-transform z-10">
                                    <img
                                        src={getImageUrl(item.poster_path, 'w342')}
                                        alt={itemTitle}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Right arrow */}
                <div
                    className={`absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-surface to-transparent flex items-center justify-end pr-2 transition-opacity ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all border border-white/10"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
