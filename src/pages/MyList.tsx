import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, ChevronDown } from 'lucide-react'
import { useMyList } from '@/context/MyListContext'
import { getMovieDetails, getTVDetails } from '@/services/tmdb'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'release'

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-desc', label: 'Date Added (Newest)' },
    { value: 'date-asc', label: 'Date Added (Oldest)' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'release', label: 'Release Date' },
]

export default function MyList() {
    const navigate = useNavigate()
    const { myList, loading: listLoading } = useMyList()
    const [sortBy, setSortBy] = useState<SortOption>('date-desc')

    // Fetch details for each item in the list
    const { data: itemDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ['mylist-details', myList.map((i) => `${i.media_type}-${i.tmdb_id}`)],
        queryFn: async () => {
            const details = await Promise.all(
                myList.map(async (item) => {
                    try {
                        if (item.media_type === 'movie') {
                            const data = await getMovieDetails(item.tmdb_id)
                            return {
                                id: item.tmdb_id,
                                type: 'movie' as const,
                                title: data.title,
                                posterPath: data.poster_path,
                                releaseDate: data.release_date,
                                addedAt: item.added_at,
                            }
                        } else {
                            const data = await getTVDetails(item.tmdb_id)
                            return {
                                id: item.tmdb_id,
                                type: 'tv' as const,
                                title: data.name,
                                posterPath: data.poster_path,
                                releaseDate: data.first_air_date,
                                addedAt: item.added_at,
                            }
                        }
                    } catch {
                        return null
                    }
                })
            )
            return details.filter(Boolean)
        },
        enabled: myList.length > 0,
    })

    // Sort items
    const sortedItems = useMemo(() => {
        if (!itemDetails) return []

        const items = [...itemDetails]
        switch (sortBy) {
            case 'date-desc':
                return items.sort((a, b) => new Date(b!.addedAt).getTime() - new Date(a!.addedAt).getTime())
            case 'date-asc':
                return items.sort((a, b) => new Date(a!.addedAt).getTime() - new Date(b!.addedAt).getTime())
            case 'title-asc':
                return items.sort((a, b) => a!.title.localeCompare(b!.title))
            case 'title-desc':
                return items.sort((a, b) => b!.title.localeCompare(a!.title))
            case 'release':
                return items.sort((a, b) => new Date(b!.releaseDate).getTime() - new Date(a!.releaseDate).getTime())
            default:
                return items
        }
    }, [itemDetails, sortBy])

    const isLoading = listLoading || detailsLoading

    if (!isLoading && myList.length === 0) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
                <Bookmark className="w-16 h-16 text-text-muted mb-4" />
                <h1 className="text-2xl font-bold mb-2">Your List is Empty</h1>
                <p className="text-text-secondary mb-6 max-w-md">
                    Add movies and TV shows to your list to watch them later. Tap the + button on any title to add it.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-brand text-white font-semibold rounded-md hover:bg-brand-dark transition-colors"
                >
                    Browse Content
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface pt-4">
            {/* Header */}
            <div className="px-4 mb-6">
                <h1 className="text-2xl font-bold mb-4">My List</h1>

                {/* Sort dropdown */}
                <div className="relative inline-block">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none pl-4 pr-10 py-2 bg-surface-card rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
            </div>

            {/* Grid */}
            <div className="px-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-poster">
                                <Skeleton className="w-full h-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {sortedItems.map((item) => (
                            <ContentCard
                                key={`${item!.type}-${item!.id}`}
                                id={item!.id}
                                type={item!.type}
                                title={item!.title}
                                posterPath={item!.posterPath}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
