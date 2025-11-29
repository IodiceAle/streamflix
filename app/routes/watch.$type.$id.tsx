import { useParams, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { HiChevronLeft, HiX } from 'react-icons/hi'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { useContinueWatching } from '@/context/ContinueWatchingContext'
import { useMovieDetails, useTVDetails } from '@/lib/queryClient'
import { getBackdropUrl } from '@/lib/tmdb'
import { ROUTES } from '@/lib/constants'
import { Spinner } from '@/components/common/Spinner'
import type { Route } from './+types/watch.$type.$id'

export function meta({ params }: Route.MetaArgs) {
    return [
        { title: `Watch - StreamFlix` },
    ]
}

export default function Watch() {
    const { type, id, season, episode } = useParams()
    const navigate = useNavigate()
    const { updateProgress, getProgress } = useContinueWatching()
    const [streamUrl, setStreamUrl] = useState<string>('')

    const isMovie = type === 'movie'
    const contentId = Number(id)
    const seasonNum = season ? Number(season) : undefined
    const episodeNum = episode ? Number(episode) : undefined

    const { data: movieData, isLoading: movieLoading } = useMovieDetails(contentId, {
        enabled: isMovie,
    })
    const { data: tvData, isLoading: tvLoading } = useTVDetails(contentId, {
        enabled: !isMovie,
    })

    const data = isMovie ? movieData : tvData
    const isLoading = movieLoading || tvLoading

    // Get saved progress
    const progress = getProgress(contentId, type as 'movie' | 'tv', seasonNum, episodeNum)
    const startTime = progress ? progress.progress_seconds : 0

    // TODO: Integrate with VixSrc.to to get actual stream URL
    useEffect(() => {
        // For demo purposes, using a sample HLS stream
        // In production, you would call VixSrc.to API here
        const demoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        setStreamUrl(demoUrl)
    }, [contentId, type, seasonNum, episodeNum])

    const handleProgress = async (currentTime: number, duration: number) => {
        if (!data) return

        const title = isMovie ? (data as any).title : (data as any).name
        const posterPath = data.poster_path || ''
        const backdropPath = data.backdrop_path || undefined

        await updateProgress({
            tmdb_id: contentId,
            type: type as 'movie' | 'tv',
            season: seasonNum,
            episode: episodeNum,
            progress_seconds: currentTime,
            duration_seconds: duration,
            metadata: {
                title,
                poster_path: posterPath,
                backdrop_path: backdropPath,
            },
        })
    }

    const handleBack = () => {
        navigate(ROUTES.DETAIL(type as 'movie' | 'tv', contentId))
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-dark">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!streamUrl) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark">
                <Spinner size="lg" />
                <p className="mt-4 text-text-secondary">Loading stream...</p>
            </div>
        )
    }

    const title = isMovie ? (data as any)?.title : (data as any)?.name
    const backdropUrl = getBackdropUrl(data?.backdrop_path, 'original')

    return (
        <div className="fixed inset-0 bg-black">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                aria-label="Go back"
            >
                <HiChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Video Player */}
            <VideoPlayer
                src={streamUrl}
                poster={backdropUrl}
                autoPlay
                startTime={startTime}
                onProgress={handleProgress}
            />

            {/* Info Overlay (optional, hidden by default) */}
            <div className="absolute top-4 left-16 right-4 z-40 pointer-events-none">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                    {title}
                    {!isMovie && seasonNum && episodeNum && (
                        <span className="text-lg ml-2">
                            S{seasonNum}:E{episodeNum}
                        </span>
                    )}
                </h1>
            </div>
        </div>
    )
}
