import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react'
import { discoverMovies, discoverTVShows, getMovieGenres, getTVGenres } from '@/services/tmdb'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { TMDBMovie, TMDBTVShow } from '@/types'

type ContentType = 'all' | 'movie' | 'tv'
type SortOption =
    | 'popularity.desc'
    | 'popularity.asc'
    | 'vote_average.desc'
    | 'vote_average.asc'
    | 'vote_count.desc'
    | 'primary_release_date.desc'
    | 'primary_release_date.asc'
    | 'revenue.desc'
    | 'original_title.asc'

const sortOptions: { value: SortOption; label: string; movieOnly?: boolean }[] = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'vote_count.desc', label: 'Most Voted' },
    { value: 'primary_release_date.desc', label: 'Newest First' },
    { value: 'primary_release_date.asc', label: 'Oldest First' },
    { value: 'revenue.desc', label: 'Highest Revenue', movieOnly: true },
    { value: 'original_title.asc', label: 'Title A–Z' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 80 }, (_, i) => currentYear - i)
const ratingValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const minVoteOptions = [
    { value: 0, label: 'Any' },
    { value: 50, label: '50+' },
    { value: 200, label: '200+' },
    { value: 500, label: '500+' },
    { value: 1000, label: '1k+' },
    { value: 5000, label: '5k+' },
]
const languages = [
    { code: '', label: 'Any language' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
    { code: 'hi', label: 'Hindi' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'ar', label: 'Arabic' },
    { code: 'tr', label: 'Turkish' },
    { code: 'pl', label: 'Polish' },
    { code: 'nl', label: 'Dutch' },
    { code: 'sv', label: 'Swedish' },
    { code: 'da', label: 'Danish' },
    { code: 'no', label: 'Norwegian' },
    { code: 'th', label: 'Thai' },
]

export default function Discover() {
    const [searchParams, setSearchParams] = useSearchParams()
    // Mobile: sheet toggle. Desktop: always visible as sidebar.
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const contentType = (searchParams.get('type') as ContentType) || 'all'
    const selectedGenresParam = searchParams.get('genres')
    const selectedGenres = useMemo(
        () => selectedGenresParam?.split(',').filter(Boolean) || [],
        [selectedGenresParam]
    )
    const sortBy = (searchParams.get('sort') as SortOption) || 'popularity.desc'
    const yearFrom = searchParams.get('yearFrom') || ''
    const yearTo = searchParams.get('yearTo') || ''
    const language = searchParams.get('language') || ''
    const minRating = Number(searchParams.get('minRating')) || 0
    const maxRating = Number(searchParams.get('maxRating')) || 10
    const minVotes = Number(searchParams.get('minVotes')) || 0

    const { data: movieGenres } = useQuery({ queryKey: ['genres', 'movie'], queryFn: getMovieGenres })
    const { data: tvGenres } = useQuery({ queryKey: ['genres', 'tv'], queryFn: getTVGenres })

    const genres = useMemo(() => {
        if (contentType === 'movie') return movieGenres?.genres || []
        if (contentType === 'tv') return tvGenres?.genres || []
        const all = [...(movieGenres?.genres || []), ...(tvGenres?.genres || [])]
        return [...new Map(all.map((g) => [g.id, g])).values()].sort((a, b) => a.name.localeCompare(b.name))
    }, [contentType, movieGenres, tvGenres])

    const buildApiParams = useCallback(
        (page: number) => {
            const params: Record<string, string | number | undefined> = { page, sort_by: sortBy }
            if (selectedGenres.length > 0) params.with_genres = selectedGenres.join(',')
            if (language) params.with_original_language = language
            if (minRating > 0) params['vote_average.gte'] = minRating
            if (maxRating < 10) params['vote_average.lte'] = maxRating
            if (minVotes > 0) params['vote_count.gte'] = minVotes
            if (yearFrom) params[contentType === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte'] = `${yearFrom}-01-01`
            if (yearTo) params[contentType === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = `${yearTo}-12-31`
            return params
        },
        [sortBy, selectedGenres, language, minRating, maxRating, minVotes, yearFrom, yearTo, contentType]
    )

    const { data: moviesData, fetchNextPage: fetchNextMovies, hasNextPage: hasNextMovies, isFetchingNextPage: isFetchingNextMovies, isLoading: moviesLoading } = useInfiniteQuery({
        queryKey: ['discover', 'movie', sortBy, selectedGenres, language, minRating, maxRating, minVotes, yearFrom, yearTo],
        queryFn: ({ pageParam = 1 }) => discoverMovies(buildApiParams(pageParam) as Parameters<typeof discoverMovies>[0]),
        getNextPageParam: (lastPage, pages) => pages.length < lastPage.total_pages ? pages.length + 1 : undefined,
        initialPageParam: 1,
        enabled: contentType === 'movie' || contentType === 'all',
    })

    const { data: tvData, fetchNextPage: fetchNextTV, hasNextPage: hasNextTV, isFetchingNextPage: isFetchingNextTV, isLoading: tvLoading } = useInfiniteQuery({
        queryKey: ['discover', 'tv', sortBy, selectedGenres, language, minRating, maxRating, minVotes, yearFrom, yearTo],
        queryFn: ({ pageParam = 1 }) => discoverTVShows(buildApiParams(pageParam) as Parameters<typeof discoverTVShows>[0]),
        getNextPageParam: (lastPage, pages) => pages.length < lastPage.total_pages ? pages.length + 1 : undefined,
        initialPageParam: 1,
        enabled: contentType === 'tv' || contentType === 'all',
    })

    const results = useMemo(() => {
        const items: (TMDBMovie | TMDBTVShow)[] = []
        if (contentType !== 'tv' && moviesData?.pages) moviesData.pages.forEach((page) => items.push(...page.results))
        if (contentType !== 'movie' && tvData?.pages) tvData.pages.forEach((page) => items.push(...page.results))
        return contentType === 'all' ? items.sort((a, b) => b.popularity - a.popularity) : items
    }, [contentType, moviesData, tvData])

    const isLoading = moviesLoading || tvLoading
    const isFetchingMore = isFetchingNextMovies || isFetchingNextTV
    const hasMore = contentType === 'movie' ? hasNextMovies : contentType === 'tv' ? hasNextTV : hasNextMovies || hasNextTV

    const [cols, setCols] = useState(2)

    useEffect(() => {
        const updateCols = () => {
            const w = window.innerWidth
            if (w >= 1280) setCols(5)
            else if (w >= 1024) setCols(4)
            else if (w >= 640) setCols(3)
            else setCols(2)
        }
        updateCols()
        window.addEventListener('resize', updateCols)
        return () => window.removeEventListener('resize', updateCols)
    }, [])

    const rowVirtualizer = useWindowVirtualizer({
        count: Math.ceil(results.length / cols),
        // +12px accounts for the gap-3 (12px) between rows so cumulative
        // height matches reality and reduces scroll-position drift.
        estimateSize: () => cols === 2 ? 312 : 392,
        overscan: 4,
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
                    if (contentType === 'movie') fetchNextMovies()
                    else if (contentType === 'tv') fetchNextTV()
                    else { fetchNextMovies(); fetchNextTV() }
                }
            },
            { threshold: 0.1 }
        )
        if (loadMoreRef.current) observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, contentType, fetchNextMovies, fetchNextTV])

    const updateParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (value) params.set(key, value)
        else params.delete(key)
        setSearchParams(params)
    }

    const toggleGenre = (genreId: number) => {
        const id = String(genreId)
        const next = selectedGenres.includes(id) ? selectedGenres.filter((g) => g !== id) : [...selectedGenres, id]
        updateParam('genres', next.length > 0 ? next.join(',') : null)
    }

    const clearFilters = () => setSearchParams(contentType !== 'all' ? { type: contentType } : {})

    const activeChips = useMemo(() => {
        const chips: { label: string; onRemove: () => void }[] = []
        selectedGenres.forEach((id) => {
            const name = genres.find((g) => String(g.id) === id)?.name
            if (name) chips.push({ label: name, onRemove: () => toggleGenre(Number(id)) })
        })
        if (sortBy !== 'popularity.desc') {
            const label = sortOptions.find((s) => s.value === sortBy)?.label || sortBy
            chips.push({ label, onRemove: () => updateParam('sort', null) })
        }
        if (yearFrom) chips.push({ label: `From ${yearFrom}`, onRemove: () => updateParam('yearFrom', null) })
        if (yearTo) chips.push({ label: `To ${yearTo}`, onRemove: () => updateParam('yearTo', null) })
        if (minRating > 0 || maxRating < 10) {
            const label = maxRating < 10 ? `${minRating}–${maxRating} ★` : `${minRating}+ ★`
            chips.push({ label, onRemove: () => { updateParam('minRating', null); updateParam('maxRating', null) } })
        }
        if (minVotes > 0) {
            const label = minVoteOptions.find((o) => o.value === minVotes)?.label || `${minVotes}+`
            chips.push({ label: `${label} votes`, onRemove: () => updateParam('minVotes', null) })
        }
        if (language) {
            const label = languages.find((l) => l.code === language)?.label || language
            chips.push({ label, onRemove: () => updateParam('language', null) })
        }
        return chips
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGenres, genres, sortBy, yearFrom, yearTo, minRating, maxRating, minVotes, language])

    const availableSortOptions = contentType === 'tv' ? sortOptions.filter((s) => !s.movieOnly) : sortOptions

    // Props bundle for the shared filter panel (used in both sidebar and mobile sheet)
    const filterPanelProps: FilterPanelProps = {
        genres,
        selectedGenres,
        toggleGenre,
        sortBy,
        updateParam,
        availableSortOptions,
        yearFrom,
        yearTo,
        minRating,
        maxRating,
        minVotes,
        language,
        activeChips,
        clearFilters,
        contentType,
    }

    return (
        <div className="min-h-screen bg-surface pt-4 pb-24">
            {/* Page header */}
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                        Discover
                    </h1>
                    {/* Mobile-only filter toggle */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showMobileFilters || activeChips.length > 0
                            ? 'bg-brand text-white shadow-lg shadow-brand/25'
                            : 'bg-surface-card text-white hover:bg-surface-hover'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeChips.length > 0 && (
                            <span className="w-5 h-5 flex items-center justify-center bg-white text-brand rounded-full text-xs font-bold">
                                {activeChips.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Type tabs */}
                <div className="flex gap-2 p-1 bg-surface-card rounded-xl">
                    {([['all', 'All'], ['movie', 'Movies'], ['tv', 'TV Shows']] as const).map(([t, label]) => (
                        <button key={t} onClick={() => updateParam('type', t === 'all' ? null : t)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === t || (t === 'all' && !searchParams.get('type'))
                                ? 'bg-white text-black shadow-md' : 'text-text-secondary hover:text-white'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Active chips */}
                {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {activeChips.map((chip) => (
                            <button key={chip.label} onClick={chip.onRemove}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/15 text-red-400 border border-brand/30 rounded-full text-xs font-medium hover:bg-brand/25 transition-colors">
                                {chip.label}<X className="w-3 h-3" />
                            </button>
                        ))}
                        <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-text-muted hover:text-white rounded-full text-xs font-medium transition-colors">
                            Clear all
                        </button>
                    </div>
                )}

                {/* Mobile filter sheet */}
                {showMobileFilters && (
                    <div className="md:hidden mt-4 p-5 bg-surface-elevated/50 backdrop-blur-sm rounded-2xl border border-white/5 animate-fade-in">
                        <FilterPanel {...filterPanelProps} />
                    </div>
                )}
            </div>

            {/*
              Desktop layout: sticky sidebar + scrollable results grid.
              Mobile: no sidebar (filters are in the sheet above).
            */}
            <div className="md:flex md:gap-0 px-4">
                {/* Desktop sidebar — sticky, always visible, no toggle needed */}
                <aside className="hidden md:block w-64 flex-shrink-0 mr-6">
                    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 space-y-1 hide-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </h2>
                            {activeChips.length > 0 && (
                                <span className="w-5 h-5 flex items-center justify-center bg-brand text-white rounded-full text-xs font-bold">
                                    {activeChips.length}
                                </span>
                            )}
                        </div>
                        <FilterPanel {...filterPanelProps} />
                    </div>
                </aside>

                {/* Results grid */}
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {Array.from({ length: 18 }).map((_, i) => (
                                <div key={i} className="aspect-poster">
                                    <Skeleton className="w-full h-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-text-secondary text-lg">No results found</p>
                            <p className="text-text-muted text-sm mt-1 mb-4">Try adjusting your filters</p>
                            <button onClick={clearFilters} className="px-6 py-3 bg-brand text-white font-medium rounded-xl">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const rowItems = results.slice(virtualRow.index * cols, (virtualRow.index + 1) * cols)
                                    return (
                                        <div
                                            key={virtualRow.index}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-3"
                                        >
                                            {rowItems.map((item, index) => {
                                                const isMovieItem = 'title' in item
                                                return (
                                                    <ContentCard
                                                        key={`${isMovieItem ? 'movie' : 'tv'}-${item.id}-${index}`}
                                                        id={item.id}
                                                        type={isMovieItem ? 'movie' : 'tv'}
                                                        title={isMovieItem ? item.title : item.name}
                                                        posterPath={item.poster_path}
                                                        rating={item.vote_average}
                                                        releaseDate={isMovieItem ? item.release_date : item.first_air_date}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                            <div ref={loadMoreRef} className="flex justify-center py-8">
                                {isFetchingMore && <Loader2 className="w-8 h-8 text-brand animate-spin" />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">{title}</h3>
            {children}
        </div>
    )
}

// ─── FilterPanel ─────────────────────────────────────────────────────────────
// Extracted from a JSX variable to a proper component so React can memoize it
// and skip re-renders when none of its props change.

interface FilterPanelProps {
    genres: { id: number; name: string }[]
    selectedGenres: string[]
    toggleGenre: (id: number) => void
    sortBy: SortOption
    updateParam: (key: string, value: string | null) => void
    availableSortOptions: typeof sortOptions
    yearFrom: string
    yearTo: string
    minRating: number
    maxRating: number
    minVotes: number
    language: string
    activeChips: { label: string; onRemove: () => void }[]
    clearFilters: () => void
    contentType: ContentType
}

const FilterPanel = React.memo(function FilterPanel({
    genres,
    selectedGenres,
    toggleGenre,
    sortBy,
    updateParam,
    availableSortOptions,
    yearFrom,
    yearTo,
    minRating,
    maxRating,
    minVotes,
    language,
    activeChips,
    clearFilters,
}: FilterPanelProps) {
    return (
        <div className="space-y-5">
            <FilterSection title="Sort by">
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => updateParam('sort', e.target.value === 'popularity.desc' ? null : e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-surface-card rounded-xl text-white pr-10 focus:ring-2 focus:ring-brand focus:outline-none text-sm"
                    >
                        {availableSortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
            </FilterSection>

            <FilterSection title="Genres">
                <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                selectedGenres.includes(String(genre.id))
                                    ? 'bg-brand/15 text-red-400 border-brand/40'
                                    : 'bg-surface-card text-text-secondary border-white/8 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Release year">
                <div className="grid grid-cols-2 gap-3">
                    {(['yearFrom', 'yearTo'] as const).map((key) => (
                        <div key={key}>
                            <label className="block text-xs text-text-muted mb-1.5">{key === 'yearFrom' ? 'From' : 'To'}</label>
                            <div className="relative">
                                <select
                                    value={key === 'yearFrom' ? yearFrom : yearTo}
                                    onChange={(e) => updateParam(key, e.target.value || null)}
                                    className="w-full appearance-none px-3 py-2.5 bg-surface-card rounded-xl text-white text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                                >
                                    <option value="">Any</option>
                                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Rating">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-text-muted mb-1.5">Min ★</label>
                        <div className="flex flex-wrap gap-1.5">
                            {ratingValues.slice(0, 9).map((v) => (
                                <button key={v} onClick={() => updateParam('minRating', v > 0 ? String(v) : null)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                        minRating === v ? 'bg-brand text-white' : 'bg-surface-card text-text-secondary hover:text-white'
                                    }`}>
                                    {v === 0 ? 'Any' : v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-text-muted mb-1.5">Max ★</label>
                        <div className="flex flex-wrap gap-1.5">
                            {ratingValues.slice(2).map((v) => (
                                <button key={v} onClick={() => updateParam('maxRating', v < 10 ? String(v) : null)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                        maxRating === v ? 'bg-brand text-white' : 'bg-surface-card text-text-secondary hover:text-white'
                                    }`}>
                                    {v === 10 ? 'Any' : v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </FilterSection>

            <FilterSection title="Minimum votes">
                <div className="flex flex-wrap gap-2">
                    {minVoteOptions.map((o) => (
                        <button key={o.value} onClick={() => updateParam('minVotes', o.value > 0 ? String(o.value) : null)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                minVotes === o.value ? 'bg-brand text-white' : 'bg-surface-card text-text-secondary hover:text-white'
                            }`}>
                            {o.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Original language">
                <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => updateParam('language', e.target.value || null)}
                        className="w-full appearance-none px-4 py-3 bg-surface-card rounded-xl text-white pr-10 focus:ring-2 focus:ring-brand focus:outline-none text-sm"
                    >
                        {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
            </FilterSection>

            {activeChips.length > 0 && (
                <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 py-3 text-brand hover:bg-brand/10 rounded-xl transition-colors font-medium text-sm"
                >
                    <X className="w-4 h-4" />
                    Clear all filters
                </button>
            )}
        </div>
    )
})