// Video embed URL builders - using vixsrc.to
// Docs: https://vixsrc.to

const VIXSRC_BASE = 'https://vixsrc.to'

// Player customization options
const PLAYER_OPTIONS = {
    primaryColor: 'E50914',    // StreamFlix brand red
    secondaryColor: '170000',  // Darker red for progress bar
    autoplay: 'true',
}

const buildQueryString = (options: Record<string, string>): string => {
    return Object.entries(options)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
}

export const getMovieEmbedUrl = (tmdbId: number, startAt?: number): string => {
    const params = { ...PLAYER_OPTIONS }
    if (startAt) {
        params.startAt = String(startAt)
    }
    // Get language preference from localStorage
    const lang = localStorage.getItem('streamflix_language') || 'en'
    params.lang = lang

    return `${VIXSRC_BASE}/movie/${tmdbId}?${buildQueryString(params)}`
}

export const getTVEmbedUrl = (
    tmdbId: number,
    season: number,
    episode: number,
    startAt?: number
): string => {
    const params = { ...PLAYER_OPTIONS }
    if (startAt) {
        params.startAt = String(startAt)
    }
    // Get language preference from localStorage
    const lang = localStorage.getItem('streamflix_language') || 'en'
    params.lang = lang

    return `${VIXSRC_BASE}/tv/${tmdbId}/${season}/${episode}?${buildQueryString(params)}`
}
