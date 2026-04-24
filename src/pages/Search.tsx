import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search as SearchIcon, X, Clock, Loader2, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { multiSearch, getTrending } from '@/services/tmdb'
import type { TMDBMovie, TMDBTVShow } from '@/types'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'

const RECENT_SEARCHES_KEY = 'streamflix_recent_searches'
const MAX_RECENT_SEARCHES = 8

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQuery = searchParams.get('q') || ''

    const [query, setQuery] = useState(initialQuery)
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) setRecentSearches(parsed)
            }
        } catch { /* ignore corrupt localStorage data */ }
    }, [])

    // Only auto-focus on desktop (pointer: fine = mouse) to avoid keyboard-on-load on mobile.
    // Also focus if a query is already present (user came from the TopNav search bar).
    useEffect(() => {
        const isDesktop = window.matchMedia('(pointer: fine)').matches
        if (isDesktop || initialQuery) {
            inputRef.current?.focus()
        }
    }, [initialQuery])

    // Sync state when URL params change (e.g., from TopNav)
    useEffect(() => {
        const q = searchParams.get('q') || ''
        if (q !== query && q !== debouncedQuery) {
            setQuery(q)
            setDebouncedQuery(q)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    // Update debounced value and sync URL when typing
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = query.trim()
            setDebouncedQuery(trimmed)

            if (trimmed !== (searchParams.get('q') || '')) {
                if (trimmed) {
                    setSearchParams({ q: trimmed }, { replace: true })
                } else {
                    setSearchParams({}, { replace: true })
                }
            }
        }, 350)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, setSearchParams])

    const { data: searchResults, isLoading: searchLoading } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => multiSearch(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    })

    const { data: trending } = useQuery({
        queryKey: ['trending', 'all', 'week'],
        queryFn: () => getTrending('all', 'week'),
    })

    const saveSearch = useCallback((term: string) => {
        const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(updated)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    }, [recentSearches])

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem(RECENT_SEARCHES_KEY)
    }

    const removeRecentSearch = (term: string) => {
        const updated = recentSearches.filter((s) => s !== term)
        setRecentSearches(updated)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    }

    const handleSearchSelect = (term: string) => {
        setQuery(term)
        saveSearch(term)
    }

    const handleResultClick = () => {
        if (debouncedQuery) saveSearch(debouncedQuery)
    }

    const results = useMemo(() => {
        if (!searchResults?.results) return { movies: [], tv: [] }
        const movies = searchResults.results.filter((r): r is TMDBMovie & { media_type: 'movie' } => r.media_type === 'movie')
        const tv = searchResults.results.filter((r): r is TMDBTVShow & { media_type: 'tv' } => r.media_type === 'tv')
        return { movies, tv }
    }, [searchResults])

    const hasResults = results.movies.length > 0 || results.tv.length > 0
    const showResults = debouncedQuery.length >= 2

    return (
        <div className="min-h-screen bg-surface pt-6 pb-24">
            {/* Search input */}
            <div className="px-4 md:px-8 mb-8">
                <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-0 bg-brand/20 rounded-2xl blur-xl transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="relative">
                        <SearchIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFocused ? 'text-brand' : 'text-text-muted'}`} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search movies & TV shows..."
                            aria-label="Search movies and TV shows"
                            className="w-full pl-14 pr-14 py-5 glass rounded-2xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand text-lg font-medium"
                            maxLength={200}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {searchLoading && (
                            <Loader2 className="absolute right-14 top-1/2 -translate-y-1/2 w-5 h-5 text-brand animate-spin" />
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {showResults ? (
                <div className="px-4 md:px-8 space-y-10 animate-fade-in">
                    {searchLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-poster rounded-xl" />
                            ))}
                        </div>
                    ) : hasResults ? (
                        <>
                            {results.movies.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                                        <span>Movies</span>
                                        <span className="text-sm font-medium text-text-muted bg-surface-card px-3 py-1 rounded-full">
                                            {results.movies.length} results
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                        {results.movies.slice(0, 12).map((item) => (
                                            <div key={item.id} onClick={handleResultClick}>
                                                <ContentCard
                                                    id={item.id}
                                                    type="movie"
                                                    title={item.title}
                                                    posterPath={item.poster_path}
                                                    rating={item.vote_average}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results.tv.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                                        <span>TV Shows</span>
                                        <span className="text-sm font-medium text-text-muted bg-surface-card px-3 py-1 rounded-full">
                                            {results.tv.length} results
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                        {results.tv.slice(0, 12).map((item) => (
                                            <div key={item.id} onClick={handleResultClick}>
                                                <ContentCard
                                                    id={item.id}
                                                    type="tv"
                                                    title={item.name}
                                                    posterPath={item.poster_path}
                                                    rating={item.vote_average}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-card flex items-center justify-center">
                                <SearchIcon className="w-10 h-10 text-text-muted" />
                            </div>
                            <p className="text-text-secondary text-xl font-medium">No results found</p>
                            <p className="text-text-muted mt-2">Try a different search term</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-10 animate-fade-in">
                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                        <div className="px-4 md:px-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-text-muted" />
                                    Recent Searches
                                </h2>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-sm text-brand hover:underline font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term) => (
                                    <div key={term} className="flex items-center gap-1 px-4 py-2.5 glass rounded-full text-sm font-medium">
                                        <button
                                            onClick={() => handleSearchSelect(term)}
                                            className="hover:text-white transition-colors"
                                        >
                                            {term}
                                        </button>
                                        {/* Per-item removal */}
                                        <button
                                            onClick={() => removeRecentSearch(term)}
                                            className="ml-1 text-text-muted hover:text-white transition-colors"
                                            aria-label={`Remove "${term}" from recent searches`}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending */}
                    <div className="px-4 md:px-8">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand" />
                            Trending This Week
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {trending?.results?.slice(0, 12).map((item, index) => {
                                const isMovie = 'title' in item
                                return (
                                    <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <ContentCard
                                            id={item.id}
                                            type={isMovie ? 'movie' : 'tv'}
                                            title={isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                                            posterPath={item.poster_path}
                                            rating={item.vote_average}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}