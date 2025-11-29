import { HeroCarousel } from '@/components/content/HeroCarousel'
import { ContentRow } from '@/components/content/ContentRow'
import { Layout } from '@/components/layout/Layout'
import { Spinner } from '@/components/common/Spinner'
import { useTrending, usePopular, useByGenre } from '@/lib/queryClient'
import type { Route } from './+types/home'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'StreamFlix - Watch Movies & TV Shows' },
        { name: 'description', content: 'Stream your favorite movies and TV shows' },
    ]
}

export default function Home() {
    const { data: trending, isLoading: trendingLoading } = useTrending('all', 'day')
    const { data: popularMovies, isLoading: popularMoviesLoading } = usePopular('movie')
    const { data: popularTV, isLoading: popularTVLoading } = usePopular('tv')
    const { data: actionMovies } = useByGenre('movie', 28) // Action
    const { data: comedyMovies } = useByGenre('movie', 35) // Comedy
    const { data: dramaMovies } = useByGenre('movie', 18) // Drama

    const isLoading = trendingLoading || popularMoviesLoading || popularTVLoading

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            </Layout>
        )
    }

    // Use trending content for hero carousel
    const heroItems = trending?.results?.slice(0, 5) || []

    return (
        <Layout>
            <div className="space-y-8 md:space-y-12">
                {/* Hero Section */}
                {heroItems.length > 0 && (
                    <HeroCarousel items={heroItems} autoPlay interval={6000} />
                )}

                {/* Content Rows */}
                <div className="space-y-8">
                    {trending && trending.results.length > 0 && (
                        <ContentRow
                            title="Trending Now"
                            items={trending.results}
                            showSeeAll
                        />
                    )}

                    {popularMovies && popularMovies.results.length > 0 && (
                        <ContentRow
                            title="Popular Movies"
                            items={popularMovies.results}
                            showSeeAll
                        />
                    )}

                    {popularTV && popularTV.results.length > 0 && (
                        <ContentRow
                            title="Popular TV Shows"
                            items={popularTV.results}
                            showSeeAll
                        />
                    )}

                    {actionMovies && actionMovies.results.length > 0 && (
                        <ContentRow
                            title="Action & Adventure"
                            items={actionMovies.results}
                            showSeeAll
                        />
                    )}

                    {comedyMovies && comedyMovies.results.length > 0 && (
                        <ContentRow
                            title="Comedy"
                            items={comedyMovies.results}
                            showSeeAll
                        />
                    )}

                    {dramaMovies && dramaMovies.results.length > 0 && (
                        <ContentRow
                            title="Drama"
                            items={dramaMovies.results}
                            showSeeAll
                        />
                    )}
                </div>
            </div>
        </Layout>
    )
}
