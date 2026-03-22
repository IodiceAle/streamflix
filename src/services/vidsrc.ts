// Video embed URL builders - using vixsrc.to
// Docs: https://vixsrc.to

const VIXSRC_BASE = 'https://vixsrc.to'

// Player customization options matching StreamFlix brand
const getPlayerOptions = () => {
    const autoplay = localStorage.getItem('streamflix_autoplay') !== 'false'
    const lang = localStorage.getItem('streamflix_language') || 'en'

    return {
        primaryColor: 'E50914',    // StreamFlix brand red
        secondaryColor: '170000',  // Darker red for progress bar
        autoplay: String(autoplay),
        lang,
    }
}

const buildQueryString = (options: Record<string, string>): string => {
    return Object.entries(options)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
}

export const getMovieEmbedUrl = (tmdbId: number, startAt?: number): string => {
    const params: Record<string, string> = { ...getPlayerOptions() }
    if (startAt) {
        params.startAt = String(startAt)
    }
    return `${VIXSRC_BASE}/movie/${tmdbId}?${buildQueryString(params)}`
}

export const getTVEmbedUrl = (
    tmdbId: number,
    season: number,
    episode: number,
    startAt?: number
): string => {
    const params: Record<string, string> = { ...getPlayerOptions() }
    if (startAt) {
        params.startAt = String(startAt)
    }
    return `${VIXSRC_BASE}/tv/${tmdbId}/${season}/${episode}?${buildQueryString(params)}`
}
