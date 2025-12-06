import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, Star, Loader2 } from 'lucide-react'
import { discoverMovies, discoverTVShows, getMovieGenres, getTVGenres } from '@/services/tmdb'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { TMDBMovie, TMDBTVShow } from '@/types'

type ContentType = 'all' | 'movie' | 'tv'
type SortOption = 'popularity.desc' | 'popularity.asc' | 'vote_average.desc' | 'primary_release_date.desc' | 'primary_release_date.asc' | 'revenue.desc'

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest First' },
    { value: 'primary_release_date.asc', label: 'Oldest First' },
    { value: 'revenue.desc', label: 'Highest Revenue' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

const languages = [
    { code: '', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
    { code: 'hi', label: 'Hindi' },
]

const ratingOptions = [
    { value: 0, label: 'Any' },
    { value: 6, label: '6+' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
]

export default function Discover() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [showFilters, setShowFilters] = useState(false)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Get filter state from URL
    const contentType = (searchParams.get('type') as ContentType) || 'movie'
    const selectedGenres = searchParams.get('genres')?.split(',').filter(Boolean) || []
    const sortBy = (searchParams.get('sort') as SortOption) || 'popularity.desc'
    const yearFrom = searchParams.get('yearFrom') || ''
    const yearTo = searchParams.get('yearTo') || ''
    const language = searchParams.get('language') || ''
    const minRating = Number(searchParams.get('rating')) || 0

    // Fetch genres
    const { data: movieGenres } = useQuery({
        queryKey: ['genres', 'movie'],
        queryFn: getMovieGenres,
    })
    const { data: tvGenres } = useQuery({
        queryKey: ['genres', 'tv'],
        queryFn: getTVGenres,
    })

    const genres = useMemo(() => {
        if (contentType === 'movie') return movieGenres?.genres || []
        if (contentType === 'tv') return tvGenres?.genres || []
        const all = [...(movieGenres?.genres || []), ...(tvGenres?.genres || [])]
        return [...new Map(all.map((g) => [g.id, g])).values()]
    }, [contentType, movieGenres, tvGenres])

    // Build query params for API
    const buildApiParams = useCallback((page: number) => {
        const params: Record<string, string | number | undefined> = {
            page,
            sort_by: sortBy,
        }
        if (selectedGenres.length > 0) params.with_genres = selectedGenres.join(',')
        if (language) params.with_original_language = language
        if (minRating > 0) params['vote_average.gte'] = minRating
        if (yearFrom) {
            params[contentType === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte'] = `${yearFrom}-01-01`
        }
        if (yearTo) {
            params[contentType === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = `${yearTo}-12-31`
        }
        return params
    }, [sortBy, selectedGenres, language, minRating, yearFrom, yearTo, contentType])

    // Infinite query for movies
    const {
        data: moviesData,
        fetchNextPage: fetchNextMovies,
        hasNextPage: hasNextMovies,
        isFetchingNextPage: isFetchingNextMovies,
        isLoading: moviesLoading,
    } = useInfiniteQuery({
        queryKey: ['discover', 'movie', sortBy, selectedGenres, language, minRating, yearFrom, yearTo],
        queryFn: ({ pageParam = 1 }) => discoverMovies(buildApiParams(pageParam) as any),
        getNextPageParam: (lastPage, pages) => {
            if (pages.length < lastPage.total_pages) return pages.length + 1
            return undefined
        },
        initialPageParam: 1,
        enabled: contentType === 'movie' || contentType === 'all',
    })

    // Infinite query for TV shows
    const {
        data: tvData,
        fetchNextPage: fetchNextTV,
        hasNextPage: hasNextTV,
        isFetchingNextPage: isFetchingNextTV,
        isLoading: tvLoading,
    } = useInfiniteQuery({
        queryKey: ['discover', 'tv', sortBy, selectedGenres, language, minRating, yearFrom, yearTo],
        queryFn: ({ pageParam = 1 }) => discoverTVShows(buildApiParams(pageParam) as any),
        getNextPageParam: (lastPage, pages) => {
            if (pages.length < lastPage.total_pages) return pages.length + 1
            return undefined
        },
        initialPageParam: 1,
        enabled: contentType === 'tv' || contentType === 'all',
    })

    // Combine results
    const results = useMemo(() => {
        const items: (TMDBMovie | TMDBTVShow)[] = []
        if (contentType !== 'tv' && moviesData?.pages) {
            moviesData.pages.forEach((page) => items.push(...page.results))
        }
        if (contentType !== 'movie' && tvData?.pages) {
            tvData.pages.forEach((page) => items.push(...page.results))
        }
        return contentType === 'all' ? items.sort((a, b) => b.popularity - a.popularity) : items
    }, [contentType, moviesData, tvData])

    const isLoading = moviesLoading || tvLoading
    const isFetchingMore = isFetchingNextMovies || isFetchingNextTV
    const hasMore = contentType === 'movie' ? hasNextMovies : contentType === 'tv' ? hasNextTV : hasNextMovies || hasNextTV

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
                    if (contentType === 'movie') fetchNextMovies()
                    else if (contentType === 'tv') fetchNextTV()
                    else {
                        fetchNextMovies()
                        fetchNextTV()
                    }
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, contentType, fetchNextMovies, fetchNextTV])

    // Update URL params
    const updateParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (value) params.set(key, value)
        else params.delete(key)
        setSearchParams(params)
    }

    const toggleGenre = (genreId: number) => {
        const id = String(genreId)
        const newGenres = selectedGenres.includes(id)
            ? selectedGenres.filter((g) => g !== id)
            : [...selectedGenres, id]
        updateParams('genres', newGenres.length > 0 ? newGenres.join(',') : null)
    }

    const clearFilters = () => setSearchParams({ type: contentType })

    const activeFilterCount = [
        selectedGenres.length > 0,
        sortBy !== 'popularity.desc',
        yearFrom,
        yearTo,
        language,
        minRating > 0,
    ].filter(Boolean).length

    return (
        <div className="min-h-screen bg-surface pt-4 pb-24">
            {/* Header */}
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                        Discover
                    </h1>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters || activeFilterCount > 0
                                ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                : 'bg-surface-card text-white hover:bg-surface-hover'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 flex items-center justify-center bg-white text-brand rounded-full text-xs font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Type tabs */}
                <div className="flex gap-2 p-1 bg-surface-card rounded-xl">
                    {(['movie', 'tv'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => updateParams('type', t)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${contentType === t
                                    ? 'bg-white text-black shadow-md'
                                    : 'text-text-secondary hover:text-white'
                                }`}
                        >
                            {t === 'movie' ? 'Movies' : 'TV Shows'}
                        </button>
                    ))}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 space-y-5 p-5 bg-surface-elevated/50 backdrop-blur-sm rounded-2xl border border-white/5 animate-fade-in">
                        {/* Sort */}
                        <div>
                            <label className="block text-sm text-text-secondary mb-2 font-medium">Sort By</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => updateParams('sort', e.target.value)}
                                    className="w-full appearance-none px-4 py-3 bg-surface-card rounded-xl text-white pr-10 focus:ring-2 focus:ring-brand focus:outline-none"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                            </div>
                        </div>

                        {/* Genres */}
                        <div>
                            <label className="block text-sm text-text-secondary mb-2 font-medium">Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {genres.slice(0, 12).map((genre) => (
                                    <button
                                        key={genre.id}
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGenres.includes(String(genre.id))
                                                ? 'bg-brand text-white shadow-md shadow-brand/25'
                                                : 'bg-surface-card text-text-secondary hover:text-white hover:bg-surface-hover'
                                            }`}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Year & Rating row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-2 font-medium">Year From</label>
                                <select
                                    value={yearFrom}
                                    onChange={(e) => updateParams('yearFrom', e.target.value || null)}
                                    className="w-full appearance-none px-4 py-3 bg-surface-card rounded-xl text-white focus:ring-2 focus:ring-brand focus:outline-none"
                                >
                                    <option value="">Any</option>
                                    {years.slice(0, 30).map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-2 font-medium">Rating</label>
                                <div className="flex gap-1">
                                    {ratingOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updateParams('rating', option.value > 0 ? String(option.value) : null)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-medium transition-all ${minRating === option.value
                                                    ? 'bg-brand text-white'
                                                    : 'bg-surface-card text-text-secondary hover:text-white'
                                                }`}
                                        >
                                            {option.value > 0 && <Star className="w-3 h-3 fill-current" />}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm text-text-secondary mb-2 font-medium">Language</label>
                            <select
                                value={language}
                                onChange={(e) => updateParams('language', e.target.value || null)}
                                className="w-full appearance-none px-4 py-3 bg-surface-card rounded-xl text-white focus:ring-2 focus:ring-brand focus:outline-none"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="w-full flex items-center justify-center gap-2 py-3 text-brand hover:bg-brand/10 rounded-xl transition-colors font-medium"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Results grid */}
            <div className="px-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={i} className="aspect-poster">
                                <Skeleton className="w-full h-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">No results found</p>
                        <button onClick={clearFilters} className="mt-4 px-6 py-3 bg-brand text-white font-medium rounded-xl">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {results.map((item, index) => {
                                const isMovieItem = 'title' in item
                                return (
                                    <ContentCard
                                        key={`${isMovieItem ? 'movie' : 'tv'}-${item.id}-${index}`}
                                        id={item.id}
                                        type={isMovieItem ? 'movie' : 'tv'}
                                        title={isMovieItem ? item.title : item.name}
                                        posterPath={item.poster_path}
                                    />
                                )
                            })}
                        </div>

                        {/* Load more trigger */}
                        <div ref={loadMoreRef} className="flex justify-center py-8">
                            {isFetchingMore && (
                                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
