// Video embed URL builders - using vixsrc.to
// Docs: https://vixsrc.to

import { useAppSettingsStore } from '@/store/useAppSettingsStore'

const VIXSRC_BASE = 'https://vixsrc.to'

const getPlayerOptions = () => {
    const { auto_play, language } = useAppSettingsStore.getState().settings
    return {
        primaryColor: 'E50914',
        secondaryColor: '170000',
        autoplay: String(auto_play),
        lang: language,
    }
}

const buildQueryString = (options: Record<string, string>): string => {
    return Object.entries(options)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
}

export const getMovieEmbedUrl = (tmdbId: number, startAt?: number): string => {
    const params: Record<string, string> = { ...getPlayerOptions() }
    if (startAt) params.startAt = String(startAt)
    return `${VIXSRC_BASE}/movie/${tmdbId}?${buildQueryString(params)}`
}

export const getTVEmbedUrl = (
    tmdbId: number,
    season: number,
    episode: number,
    startAt?: number
): string => {
    const params: Record<string, string> = { ...getPlayerOptions() }
    if (startAt) params.startAt = String(startAt)
    return `${VIXSRC_BASE}/tv/${tmdbId}/${season}/${episode}?${buildQueryString(params)}`
}