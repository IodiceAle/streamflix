import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ContentCard } from '@/components/content/ContentCard'
import { Spinner } from '@/components/common/Spinner'
import { Button } from '@/components/common/Button'
import { HiPlus } from 'react-icons/hi'
import { Link } from 'react-router'
import { ROUTES } from '@/lib/constants'
import type { Route } from './+types/my-list'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'My List - StreamFlix' },
        { name: 'description', content: 'Your saved movies and TV shows' },
    ]
}

export default function MyList() {
    // TODO: Replace with actual data from Supabase
    const [myList, setMyList] = useState<any[]>([])
    const [sortBy, setSortBy] = useState<'date-added' | 'title' | 'release'>('date-added')
    const isLoading = false

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            </Layout>
        )
    }

    const sortedList = [...myList].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                const titleA = 'title' in a ? a.title : a.name
                const titleB = 'title' in b ? b.title : b.name
                return titleA.localeCompare(titleB)
            case 'release':
                const dateA = 'release_date' in a ? a.release_date : a.first_air_date
                const dateB = 'release_date' in b ? b.release_date : b.first_air_date
                return new Date(dateB).getTime() - new Date(dateA).getTime()
            default:
                return 0 // date-added would be sorted by default from API
        }
    })

    return (
        <Layout>
            <div className="px-4 md:px-8 lg:px-12 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">My List</h1>

                    {/* Sort Options */}
                    {myList.length > 0 && (
                        <div className="flex items-center gap-4">
                            <span className="text-text-secondary">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white"
                            >
                                <option value="date-added">Date Added</option>
                                <option value="title">Title A-Z</option>
                                <option value="release">Release Date</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                {sortedList.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {sortedList.map((item) => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="mb-6 p-6 bg-dark-card rounded-full">
                            <HiPlus className="w-16 h-16 text-text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your list is empty</h2>
                        <p className="text-text-secondary mb-6 text-center max-w-md">
                            Add movies and TV shows to your list to watch them later
                        </p>
                        <Link to={ROUTES.HOME}>
                            <Button variant="primary">Browse Content</Button>
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
}
