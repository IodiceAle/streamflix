import { useQuery } from '@tanstack/react-query'
import { getTrending, getPopularMovies, getPopularTVShows, getTopRatedMovies, discoverMovies } from '@/services/tmdb'
import { HeroCarousel } from '@/components/content/HeroCarousel'
import { ContentRow } from '@/components/content/ContentRow'
import { Top10Row } from '@/components/content/Top10Row'
import { ContinueWatchingRow } from '@/components/content/ContinueWatchingRow'
import { HeroSkeleton, ContentRowSkeleton } from '@/components/ui/Skeleton'

const GENRES = {
    ACTION: 28,
    COMEDY: 35,
    THRILLER: 53,
    HORROR: 27,
    SCIFI: 878,
    ROMANCE: 10749,
}

export default function Home() {
    const { data: trendingData, isLoading: trendingLoading } = useQuery({
        queryKey: ['trending', 'all', 'day'],
        queryFn: () => getTrending('all', 'day'),
    })

    const { data: popularMovies } = useQuery({
        queryKey: ['movies', 'popular'],
        queryFn: () => getPopularMovies(),
    })

    const { data: popularTV } = useQuery({
        queryKey: ['tv', 'popular'],
        queryFn: () => getPopularTVShows(),
    })

    const { data: topRatedMovies } = useQuery({
        queryKey: ['movies', 'top-rated'],
        queryFn: () => getTopRatedMovies(),
    })

    const { data: actionMovies } = useQuery({
        queryKey: ['movies', 'genre', GENRES.ACTION],
        queryFn: () => discoverMovies({ with_genres: String(GENRES.ACTION), sort_by: 'popularity.desc' }),
    })

    const { data: scifiMovies } = useQuery({
        queryKey: ['movies', 'genre', GENRES.SCIFI],
        queryFn: () => discoverMovies({ with_genres: String(GENRES.SCIFI), sort_by: 'popularity.desc' }),
    })

    const { data: horrorMovies } = useQuery({
        queryKey: ['movies', 'genre', GENRES.HORROR],
        queryFn: () => discoverMovies({ with_genres: String(GENRES.HORROR), sort_by: 'popularity.desc' }),
    })

    const heroItems = trendingData?.results?.slice(0, 5) || []

    return (
        <div className="min-h-screen bg-surface pb-24">
            {/* Hero */}
            {trendingLoading ? (
                <HeroSkeleton />
            ) : (
                <HeroCarousel items={heroItems} />
            )}

            {/* Content Rows */}
            <div className="relative z-10 space-y-1 pt-4">
                {/* Continue Watching */}
                <ContinueWatchingRow />
                {trendingData?.results ? (
                    <ContentRow
                        title="🔥 Trending Now"
                        items={trendingData.results}
                        type="mixed"
                        showSeeAll
                        seeAllPath="/discover"
                    />
                ) : (
                    <ContentRowSkeleton title="Trending Now" />
                )}

                {popularMovies?.results ? (
                    <ContentRow
                        title="Popular Movies"
                        items={popularMovies.results}
                        type="movie"
                        showSeeAll
                        seeAllPath="/discover?type=movie"
                    />
                ) : (
                    <ContentRowSkeleton title="Popular Movies" />
                )}

                {/* Top 10 */}
                {popularMovies?.results && (
                    <Top10Row
                        title="🏆 Top 10 Movies"
                        items={popularMovies.results}
                        type="movie"
                    />
                )}

                {popularTV?.results ? (
                    <ContentRow
                        title="Popular TV Shows"
                        items={popularTV.results}
                        type="tv"
                        showSeeAll
                        seeAllPath="/discover?type=tv"
                    />
                ) : (
                    <ContentRowSkeleton title="Popular TV Shows" />
                )}

                {topRatedMovies?.results ? (
                    <ContentRow
                        title="⭐ Top Rated"
                        items={topRatedMovies.results}
                        type="movie"
                    />
                ) : (
                    <ContentRowSkeleton title="Top Rated" />
                )}

                {actionMovies?.results ? (
                    <ContentRow
                        title="💥 Action & Adventure"
                        items={actionMovies.results}
                        type="movie"
                    />
                ) : (
                    <ContentRowSkeleton title="Action & Adventure" />
                )}

                {scifiMovies?.results ? (
                    <ContentRow
                        title="🚀 Sci-Fi"
                        items={scifiMovies.results}
                        type="movie"
                    />
                ) : (
                    <ContentRowSkeleton title="Sci-Fi" />
                )}

                {horrorMovies?.results ? (
                    <ContentRow
                        title="👻 Horror"
                        items={horrorMovies.results}
                        type="movie"
                    />
                ) : (
                    <ContentRowSkeleton title="Horror" />
                )}
            </div>
        </div>
    )
}
