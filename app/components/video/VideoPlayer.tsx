import { useRef, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { HiPlay, HiPause, HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import { cn, formatTime } from '@/lib/utils'

interface VideoPlayerProps {
    src: string
    poster?: string
    autoPlay?: boolean
    onProgress?: (currentTime: number, duration: number) => void
    startTime?: number
}

export function VideoPlayer({
    src,
    poster,
    autoPlay = false,
    onProgress,
    startTime = 0,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const progressInterval = useRef<NodeJS.Timeout>()

    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)

    // Initialize HLS
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (src.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls()
                hls.loadSource(src)
                hls.attachMedia(video)
                hlsRef.current = hls

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (autoPlay) video.play()
                    if (startTime > 0) video.currentTime = startTime
                })

                return () => {
                    hls.destroy()
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src
                if (autoPlay) video.play()
                if (startTime > 0) video.currentTime = startTime
            }
        } else {
            video.src = src
            if (autoPlay) video.play()
            if (startTime > 0) video.currentTime = startTime
        }
    }, [src, autoPlay, startTime])

    // Track progress
    useEffect(() => {
        if (isPlaying && onProgress) {
            progressInterval.current = setInterval(() => {
                if (videoRef.current) {
                    onProgress(videoRef.current.currentTime, videoRef.current.duration)
                }
            }, 5000)

            return () => {
                if (progressInterval.current) clearInterval(progressInterval.current)
            }
        }
    }, [isPlaying, onProgress])

    // Auto-hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (showControls && isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000)
        }
        return () => clearTimeout(timeout)
    }, [showControls, isPlaying])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div
            className="relative w-full h-full bg-black group"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full"
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
            />

            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black via-transparent to-black transition-opacity duration-300',
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                )}
            >
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                    >
                        <HiPlay className="w-10 h-10 text-white ml-2" />
                    </button>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                        style={{
                            background: `linear-gradient(to right, #E50914 0%, #E50914 ${progress}%, #4B5563 ${progress}%, #4B5563 100%)`,
                        }}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                                {isPlaying ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6" />}
                            </button>

                            <button
                                onClick={() => skip(-10)}
                                className="text-white text-sm hover:text-primary transition-colors"
                            >
                                -10s
                            </button>
                            <button
                                onClick={() => skip(10)}
                                className="text-white text-sm hover:text-primary transition-colors"
                            >
                                +10s
                            </button>

                            <div className="flex items-center gap-2">
                                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                                    {isMuted || volume === 0 ? <HiVolumeOff className="w-6 h-6" /> : <HiVolumeUp className="w-6 h-6" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                                />
                            </div>

                            <span className="text-white text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
