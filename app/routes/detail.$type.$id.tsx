import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { HiPlay, HiPlus, HiCheck, HiChevronLeft, HiX } from 'react-icons/hi'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { ContentRow } from '@/components/content/ContentRow'
import { Modal } from '@/components/common/Modal'
import { useMovieDetails, useTVDetails } from '@/lib/queryClient'
import { getBackdropUrl, getImageUrl, formatRuntime, getYear } from '@/lib/tmdb'
import { ROUTES, MOVIE_GENRES, TV_GENRES } from '@/lib/constants'
import type { Route } from './+types/detail.$type.$id'

export function meta({ params }: Route.MetaArgs) {
    return [
        { title: `Details - StreamFlix` },
        { name: 'description', content: 'View content details' },
    ]
}

export default function Detail() {
    const { type, id } = useParams()
    const navigate = useNavigate()
    const [showTrailer, setShowTrailer] = useState(false)
    const [selectedSeason, setSelectedSeason] = useState(1)

    const isMovie = type === 'movie'
    const contentId = Number(id)

    const { data: movieData, isLoading: movieLoading } = useMovieDetails(contentId, {
        enabled: isMovie,
    })
    const { data: tvData, isLoading: tvLoading } = useTVDetails(contentId, {
        enabled: !isMovie,
    })

    const data = isMovie ? movieData : tvData
    const isLoading = movieLoading || tvLoading

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            </Layout>
        )
    }

    if (!data) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <p className="text-xl text-text-secondary mb-4">Content not found</p>
                    <Button onClick={() => navigate(ROUTES.HOME)}>Go Home</Button>
                </div>
            </Layout>
        )
    }

    const title = isMovie ? (data as any).title : (data as any).name
    const backdropUrl = getBackdropUrl(data.backdrop_path, 'original')
    const posterUrl = getImageUrl(data.poster_path, 'w500')
    const releaseYear = isMovie
        ? getYear((data as any).release_date)
        : getYear((data as any).first_air_date)

    const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    const genres = data.genres || []
    const similar = data.similar?.results || []
    const cast = data.credits?.cast?.slice(0, 10) || []

    // Collection for movies
    const collection = isMovie ? (data as any).belongs_to_collection : null

    // Seasons for TV shows
    const seasons = !isMovie ? (data as any).seasons : []

    return (
        <Layout>
            <div className="relative">
                {/* Hero Section */}
                <div className="relative h-[70vh] md:h-[80vh] w-full">
                    {/* Backdrop Image */}
                    <div className="absolute inset-0">
                        <img
                            src={backdropUrl}
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 z-10 p-2 bg-dark/80 hover:bg-dark rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <HiChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full px-4 pb-12 md:px-8 lg:px-12 md:pb-16">
                            <div className="max-w-4xl">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                                    {title}
                                </h1>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-sm md:text-base mb-6 text-white/90">
                                    {data.vote_average > 0 && (
                                        <span className="flex items-center gap-1 font-semibold">
                                            <span className="text-yellow-500">★</span>
                                            {data.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                    <span>{releaseYear}</span>
                                    {isMovie && (data as any).runtime && (
                                        <span>{formatRuntime((data as any).runtime)}</span>
                                    )}
                                    {!isMovie && (data as any).number_of_seasons && (
                                        <span>{(data as any).number_of_seasons} Seasons</span>
                                    )}
                                </div>

                                {/* Genres */}
                                {genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {genres.map((genre: any) => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 bg-dark-card/80 rounded-full text-sm text-white/90"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link to={ROUTES.WATCH(type as 'movie' | 'tv', contentId)}>
                                        <Button variant="primary" size="lg" className="gap-2">
                                            <HiPlay className="w-5 h-5" />
                                            Play
                                        </Button>
                                    </Link>

                                    {trailer && (
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={() => setShowTrailer(true)}
                                        >
                                            Watch Trailer
                                        </Button>
                                    )}

                                    <Button variant="icon" className="!p-3">
                                        <HiPlus className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="px-4 md:px-8 lg:px-12 py-8 space-y-12">
                    {/* Overview */}
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            {data.overview || 'No overview available.'}
                        </p>

                        {/* Cast */}
                        {cast.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Cast</h3>
                                <div className="flex flex-wrap gap-2">
                                    {cast.map((actor: any) => (
                                        <span key={actor.id} className="text-text-secondary">
                                            {actor.name}
                                            {actor !== cast[cast.length - 1] && ','}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Saga/Collection Section for Movies */}
                    {collection && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {collection.name}
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                {/* Note: Would need to fetch collection details to show all parts */}
                                <div className="w-48 flex-shrink-0">
                                    <img
                                        src={getImageUrl(collection.poster_path, 'w342')}
                                        alt={collection.name}
                                        className="w-full rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Episodes Section for TV Shows */}
                    {!isMovie && seasons.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Episodes</h2>
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white"
                                >
                                    {seasons.map((season: any) => (
                                        <option key={season.id} value={season.season_number}>
                                            Season {season.season_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Note: Would need to fetch season details to show episodes */}
                            <p className="text-text-secondary">
                                {seasons.find((s: any) => s.season_number === selectedSeason)?.episode_count || 0} episodes
                            </p>
                        </div>
                    )}

                    {/* Similar Content */}
                    {similar.length > 0 && (
                        <ContentRow
                            title="More Like This"
                            items={similar}
                            showSeeAll={false}
                        />
                    )}
                </div>

                {/* Trailer Modal */}
                {trailer && (
                    <Modal
                        isOpen={showTrailer}
                        onClose={() => setShowTrailer(false)}
                        size="xl"
                        showCloseButton={false}
                    >
                        <div className="relative pt-[56.25%]">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                                title={trailer.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </Modal>
                )}
            </div>
        </Layout>
    )
}
