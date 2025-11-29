import { useState, useEffect } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'
import { Layout } from '@/components/layout/Layout'
import { Input } from '@/components/common/Input'
import { ContentCard } from '@/components/content/ContentCard'
import { Spinner } from '@/components/common/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useSearch, useTrending } from '@/lib/queryClient'
import { DEBOUNCE_DELAYS } from '@/lib/constants'
import type { Route } from './+types/search'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Search - StreamFlix' },
        { name: 'description', content: 'Search for movies and TV shows' },
    ]
}

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('')
    const [recentSearches, setRecentSearches, clearRecentSearches] = useLocalStorage<string[]>(
        'streamflix-recent-searches',
        []
    )

    const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH)

    const { data: searchResults, isLoading: searchLoading } = useSearch(debouncedSearch)
    const { data: trendingData } = useTrending('all', 'day')

    const topSearches = trendingData?.results?.slice(0, 10) || []

    useEffect(() => {
        // Add to recent searches when user searches
        if (debouncedSearch && searchResults) {
            setRecentSearches((prev) => {
                const updated = [debouncedSearch, ...prev.filter(s => s !== debouncedSearch)]
                return updated.slice(0, 10) // Keep only last 10
            })
        }
    }, [debouncedSearch, searchResults])

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query)
    }

    const handleRemoveRecentSearch = (query: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setRecentSearches((prev) => prev.filter(s => s !== query))
    }

    const movies = searchResults?.results?.filter((item: any) => 'title' in item) || []
    const tvShows = searchResults?.results?.filter((item: any) => 'name' in item) || []

    const showResults = debouncedSearch && searchResults
    const showEmpty = debouncedSearch && searchResults && searchResults.results.length === 0

    return (
        <Layout>
            <div className="px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">
                {/* Search Input */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for movies and TV shows..."
                            icon={<HiSearch className="w-5 h-5" />}
                            className="text-lg pr-12"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-card rounded-full transition-colors"
                                aria-label="Clear search"
                            >
                                <HiX className="w-5 h-5 text-text-secondary" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {searchLoading && (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Search Results */}
                {showResults && !searchLoading && (
                    <div className="space-y-12">
                        {movies.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    Movies ({movies.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {movies.map((movie: TMDBMovie) => (
                                        <ContentCard key={movie.id} item={movie} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {tvShows.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    TV Shows ({tvShows.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {tvShows.map((show: TMDBTVShow) => (
                                        <ContentCard key={show.id} item={show} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {showEmpty && (
                    <div className="text-center py-12">
                        <p className="text-xl text-text-secondary mb-2">No results found</p>
                        <p className="text-sm text-text-secondary">
                            Try searching for something else
                        </p>
                    </div>
                )}

                {/* Default State - No Search */}
                {!searchQuery && (
                    <div className="space-y-12">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Recent Searches</h2>
                                    <button
                                        onClick={() => clearRecentSearches()}
                                        className="text-sm text-text-secondary hover:text-white transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {recentSearches.map((query, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleRecentSearchClick(query)}
                                            className="flex items-center justify-between p-3 bg-dark-card hover:bg-dark-lighter rounded-lg cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <HiSearch className="w-5 h-5 text-text-secondary" />
                                                <span className="text-white">{query}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleRemoveRecentSearch(query, e)}
                                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark rounded-full transition-all"
                                                aria-label="Remove"
                                            >
                                                <HiX className="w-4 h-4 text-text-secondary" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Searches / Trending */}
                        {topSearches.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    Top Searches Today
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {topSearches.map((item: TMDBMovie | TMDBTVShow, index) => {
                                        const title = 'title' in item ? item.title : item.name
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-4 bg-dark-card hover:bg-dark-lighter rounded-lg transition-colors cursor-pointer"
                                                onClick={() => setSearchQuery(title)}
                                            >
                                                <span className="text-4xl font-bold text-gray-600">
                                                    {index + 1}
                                                </span>
                                                <ContentCard item={item} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}
