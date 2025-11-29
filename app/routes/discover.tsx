import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ContentCard } from '@/components/content/ContentCard'
import { Spinner } from '@/components/common/Spinner'
import { useDiscover, useGenres } from '@/lib/queryClient'
import { SORT_OPTIONS } from '@/lib/constants'
import type { Route } from './+types/discover'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Discover - StreamFlix' },
        { name: 'description', content: 'Discover movies and TV shows' },
    ]
}

export default function Discover() {
    const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie')
    const [selectedGenres, setSelectedGenres] = useState<number[]>([])
    const [sortBy, setSortBy] = useState('popularity.desc')

    const { data: genresData } = useGenres(mediaType)
    const { data: discoverData, isLoading } = useDiscover(mediaType, {
        with_genres: selectedGenres.join(','),
        sort_by: sortBy,
    })

    const genres = genresData || []
    const results = discoverData?.results || []

    const toggleGenre = (genreId: number) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        )
    }

    const clearFilters = () => {
        setSelectedGenres([])
        setSortBy('popularity.desc')
    }

    return (
        <Layout>
            <div className="px-4 md:px-8 lg:px-12 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Discover</h1>

                    {/* Filters */}
                    <div className="space-y-6">
                        {/* Media Type Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMediaType('movie')}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${mediaType === 'movie'
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-card text-text-secondary hover:text-white'
                                    }`}
                            >
                                Movies
                            </button>
                            <button
                                onClick={() => setMediaType('tv')}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${mediaType === 'tv'
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-card text-text-secondary hover:text-white'
                                    }`}
                            >
                                TV Shows
                            </button>
                        </div>

                        {/* Genre Chips */}
                        {genres.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-3">
                                    Genres
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre: any) => (
                                        <button
                                            key={genre.id}
                                            onClick={() => toggleGenre(genre.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedGenres.includes(genre.id)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-dark-card text-white hover:bg-dark-lighter'
                                                }`}
                                        >
                                            {genre.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sort and Clear */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-text-secondary">
                                    Sort by:
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(selectedGenres.length > 0 || sortBy !== 'popularity.desc') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Results Count */}
                        {results.length > 0 && (
                            <p className="text-text-secondary text-sm">
                                Showing {results.length} results
                            </p>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Results Grid */}
                {!isLoading && results.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {results.map((item: any) => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && results.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-text-secondary mb-2">No results found</p>
                        <p className="text-sm text-text-secondary">
                            Try adjusting your filters
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    )
}
