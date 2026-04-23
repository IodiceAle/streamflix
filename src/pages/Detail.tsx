import { useState } from 'react'
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Play, Plus, Check, Share2, ChevronDown, ChevronUp, ExternalLink, Film } from 'lucide-react'
import {
    getMovieDetails,
    getTVDetails,
    getSeasonDetails,
    getCollection,
    getBackdropUrl,
    getImageUrl,
    getStillUrl,
} from '@/services/tmdb'
import { useMyList } from '@/store/useMyListStore'
import { ContentRow } from '@/components/content/ContentRow'
import { Modal } from '@/components/ui/Modal'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import type { TMDBMovieDetails, TMDBTVDetails } from '@/types'

export default function Detail() {
    const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>()
    const navigate = useNavigate()
    const { isInList, addToList, removeFromList } = useMyList()
    const [searchParams, setSearchParams] = useSearchParams()
    const selectedSeason = Number(searchParams.get('season')) || 1
    const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null)
    const [showTrailerModal, setShowTrailerModal] = useState(false)

    const isMovie = type === 'movie'
    const numericId = Number(id)

    const isInvalidRoute = !numericId || numericId <= 0 || !Number.isInteger(numericId) || (type !== 'movie' && type !== 'tv')

    const inList = !isInvalidRoute && type ? isInList(numericId, type) : false

    const { data: details, isLoading } = useQuery({
        queryKey: ['details', type, id],
        queryFn: async () => {
            if (isMovie) return getMovieDetails(Number(id))
            else return getTVDetails(Number(id))
        },
        enabled: !isInvalidRoute && !!type && !!id,
    })

    const { data: seasonDetails } = useQuery({
        queryKey: ['season', id, selectedSeason],
        queryFn: () => getSeasonDetails(Number(id), selectedSeason),
        enabled: !isInvalidRoute && !isMovie && !!id,
    })

    const collectionId = isMovie ? (details as TMDBMovieDetails | undefined)?.belongs_to_collection?.id : undefined

    const { data: collection } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: () => getCollection(collectionId!),
        enabled: !!collectionId,
    })

    // Sort collection parts chronologically
    const collectionParts = collection?.parts
        ? [...collection.parts].sort((a, b) =>
            (a.release_date || '').localeCompare(b.release_date || '')
        )
        : []

    if (isInvalidRoute) return <Navigate to="/" replace />
    if (isLoading || !details) return <DetailSkeleton />

    const title = isMovie ? (details as TMDBMovieDetails).title : (details as TMDBTVDetails).name
    const releaseDate = isMovie
        ? (details as TMDBMovieDetails).release_date
        : (details as TMDBTVDetails).first_air_date
    const runtime = isMovie
        ? (details as TMDBMovieDetails).runtime
        : (details as TMDBTVDetails).episode_run_time?.[0]
    const tvDetails = !isMovie ? (details as TMDBTVDetails) : null

    const trailer = details.videos?.results?.find(
        (v) => v.type === 'Trailer' && v.site === 'YouTube'
    )

    const formatRuntime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const handlePlay = () => {
        if (isMovie) navigate(`/watch/movie/${id}`)
        else navigate(`/watch/tv/${id}/1/1`)
    }

    const handleListToggle = () => {
        if (inList) {
            removeFromList(Number(id), type!)
        } else {
            addToList(Number(id), type!, {
                title,
                posterPath: details.poster_path || undefined,
                backdropPath: details.backdrop_path || undefined,
            })
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title,
                text: `Check out ${title} on StreamFlix`,
                url: window.location.href,
            })
        }
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Hero — full bleed, capped height on short viewports */}
            <div className="relative w-full aspect-[16/9] max-h-[50vh] sm:max-h-[60vh]">
                <img
                    src={getBackdropUrl(details.backdrop_path, 'w1280')}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
            </div>

            <div className="relative -mt-32 z-10 max-w-4xl mx-auto px-4 space-y-6 pb-24">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-green-500 font-semibold">
                        {Math.round(details.vote_average * 10)}% Match
                    </span>
                    {releaseDate && <span>{new Date(releaseDate).getFullYear()}</span>}
                    {runtime && <span>{formatRuntime(runtime)}</span>}
                    {tvDetails && (
                        <span>{tvDetails.number_of_seasons} Season{tvDetails.number_of_seasons > 1 ? 's' : ''}</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handlePlay}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors"
                    >
                        <Play className="w-5 h-5 fill-black" />
                        Play
                    </button>
                    <button
                        onClick={handleListToggle}
                        className="w-12 h-12 flex items-center justify-center bg-surface-card rounded-md hover:bg-surface-hover transition-colors"
                        aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                    >
                        {inList ? (
                            <Check className="w-6 h-6 text-brand" />
                        ) : (
                            <Plus className="w-6 h-6" />
                        )}
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-12 h-12 flex items-center justify-center bg-surface-card rounded-md hover:bg-surface-hover transition-colors"
                        aria-label="Share"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Overview */}
                <p className="text-text-secondary leading-relaxed">{details.overview}</p>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                    {details.genres?.map((genre) => (
                        <span
                            key={genre.id}
                            className="px-3 py-1 bg-surface-card rounded-full text-sm text-text-secondary"
                        >
                            {genre.name}
                        </span>
                    ))}
                </div>

                {/* Trailer Button */}
                {trailer && (
                    <button
                        onClick={() => setShowTrailerModal(true)}
                        className="flex items-center gap-2 text-brand hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Watch Trailer
                    </button>
                )}

                {/* Cast */}
                {details.credits?.cast?.length && (
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold">Cast & Crew</h2>
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                            {details.credits.cast.slice(0, 12).map((member) => (
                                <div key={member.id} className="flex-shrink-0 w-20 text-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-card mb-2">
                                        {member.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted text-2xl font-bold">
                                                {member.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-white line-clamp-1">{member.name}</p>
                                    <p className="text-xs text-text-muted line-clamp-1">{member.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Collection / Saga */}
                {collection && collectionParts.length > 1 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Film className="w-5 h-5 text-brand flex-shrink-0" />
                            <h2 className="text-xl font-semibold">{collection.name}</h2>
                            <span className="text-sm text-text-muted">
                                {collectionParts.length} films
                            </span>
                        </div>

                        {collection.overview && (
                            <p className="text-sm text-text-muted leading-relaxed">
                                {collection.overview}
                            </p>
                        )}

                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                            {collectionParts.map((film, index) => {
                                const isCurrent = film.id === numericId
                                return (
                                    <button
                                        key={film.id}
                                        onClick={() => !isCurrent && navigate(`/detail/movie/${film.id}`)}
                                        className={`flex-shrink-0 w-28 text-left group ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                                    >
                                        <div className={`relative aspect-poster rounded-lg overflow-hidden bg-surface-card ring-2 transition-all ${isCurrent ? 'ring-brand' : 'ring-transparent group-hover:ring-white/30'}`}>
                                            <img
                                                src={getImageUrl(film.poster_path, 'w185')}
                                                alt={film.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            {isCurrent && (
                                                <div className="absolute inset-0 bg-brand/20 flex items-end justify-center pb-2">
                                                    <span className="text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded-full">
                                                        Watching
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1.5 text-xs font-medium text-white line-clamp-2 leading-tight">
                                            {index + 1}. {film.title}
                                        </p>
                                        {film.release_date && (
                                            <p className="text-[11px] text-text-muted mt-0.5">
                                                {new Date(film.release_date).getFullYear()}
                                            </p>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Episodes (TV Only) */}
                {tvDetails?.seasons && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Episodes</h2>
                            <select
                                value={selectedSeason}
                                onChange={(e) => {
                                    const next = new URLSearchParams(searchParams)
                                    next.set('season', e.target.value)
                                    setSearchParams(next, { replace: true })
                                }}
                                className="px-3 py-2 bg-surface-card rounded text-white text-sm"
                            >
                                {tvDetails.seasons
                                    .filter((s) => s.season_number > 0)
                                    .map((season) => (
                                        <option key={season.id} value={season.season_number}>
                                            Season {season.season_number}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {seasonDetails?.episodes?.map((episode) => (
                                <div
                                    key={episode.id}
                                    className="bg-surface-card rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            navigate(`/watch/tv/${id}/${selectedSeason}/${episode.episode_number}`)
                                        }
                                        className="w-full flex items-start gap-3 p-3 hover:bg-surface-hover transition-colors"
                                    >
                                        <div className="relative flex-shrink-0 w-28 aspect-video rounded overflow-hidden">
                                            <img
                                                src={getStillUrl(episode.still_path, 'w300')}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <span>Episode {episode.episode_number}</span>
                                                {episode.runtime && <span>• {episode.runtime}m</span>}
                                            </div>
                                            <h3 className="font-medium mt-1">{episode.name}</h3>
                                        </div>
                                    </button>

                                    {episode.overview && (
                                        <div className="px-3 pb-3">
                                            <button
                                                onClick={() =>
                                                    setExpandedEpisode(
                                                        expandedEpisode === episode.id ? null : episode.id
                                                    )
                                                }
                                                className="flex items-center gap-1 text-xs text-text-muted hover:text-white"
                                            >
                                                {expandedEpisode === episode.id ? (
                                                    <><ChevronUp className="w-4 h-4" />Hide Overview</>
                                                ) : (
                                                    <><ChevronDown className="w-4 h-4" />Show Overview</>
                                                )}
                                            </button>
                                            {expandedEpisode === episode.id && (
                                                <p className="mt-2 text-sm text-text-secondary">
                                                    {episode.overview}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Similar / More Like This — full-width outside the constrained container */}
            {details.similar?.results?.length > 0 && (
                <ContentRow
                    title="More Like This"
                    items={details.similar.results}
                    type={type!}
                />
            )}

            {/* Trailer Modal */}
            <Modal
                isOpen={showTrailerModal}
                onClose={() => setShowTrailerModal(false)}
                size="xl"
            >
                {trailer && (
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                            className="w-full h-full rounded"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
                            referrerPolicy="origin"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        />
                    </div>
                )}
            </Modal>
        </div>
    )
}