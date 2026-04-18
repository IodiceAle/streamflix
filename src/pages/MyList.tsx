import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, ChevronDown } from 'lucide-react'
import { useMyList } from '@/store/useMyListStore'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc'
type TypeFilter = 'all' | 'movie' | 'tv'

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-desc', label: 'Date Added (Newest)' },
    { value: 'date-asc', label: 'Date Added (Oldest)' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
]

export default function MyList() {
    const navigate = useNavigate()
    const { myList, loading: listLoading } = useMyList()
    const [sortBy, setSortBy] = useState<SortOption>('date-desc')
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

    const filteredAndSorted = useMemo(() => {
        let items = [...myList]

        // Type filter
        if (typeFilter !== 'all') {
            items = items.filter((item) => item.type === typeFilter)
        }

        // Sort
        switch (sortBy) {
            case 'date-desc':
                return items.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
            case 'date-asc':
                return items.sort((a, b) => new Date(a.added_at).getTime() - new Date(b.added_at).getTime())
            case 'title-asc':
                return items.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            case 'title-desc':
                return items.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
            default:
                return items
        }
    }, [myList, sortBy, typeFilter])

    // Count per type for tab labels
    const movieCount = myList.filter((i) => i.type === 'movie').length
    const tvCount = myList.filter((i) => i.type === 'tv').length

    if (!listLoading && myList.length === 0) {
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
        <div className="min-h-screen bg-surface pt-4 pb-24">
            <div className="px-4 mb-6 space-y-4">
                <h1 className="text-2xl font-bold">My List</h1>

                {/* Type filter tabs — same pattern as Discover */}
                <div className="flex gap-2 p-1 bg-surface-card rounded-xl">
                    {([
                        ['all', 'All', myList.length],
                        ['movie', 'Movies', movieCount],
                        ['tv', 'TV Shows', tvCount],
                    ] as const).map(([t, label, count]) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${typeFilter === t
                                    ? 'bg-white text-black shadow-md'
                                    : 'text-text-secondary hover:text-white'
                                }`}
                        >
                            {label}
                            {count > 0 && (
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${typeFilter === t ? 'bg-black/10 text-black' : 'bg-surface-hover text-text-muted'
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

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
                {listLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-poster">
                                <Skeleton className="w-full h-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="text-center py-16 text-text-muted">
                        <p>No {typeFilter !== 'all' ? (typeFilter === 'movie' ? 'movies' : 'TV shows') : 'items'} in your list yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredAndSorted.map((item) => (
                            <ContentCard
                                key={`${item.type}-${item.tmdb_id}`}
                                id={item.tmdb_id}
                                type={item.type}
                                title={item.title || 'Untitled'}
                                posterPath={item.poster_path || null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}