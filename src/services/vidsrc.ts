// Video embed URL builders - using vidsrc.to

const VIDSRC_BASE = 'https://vidsrc.to/embed'

export const getMovieEmbedUrl = (tmdbId: number): string => {
    return `${VIDSRC_BASE}/movie/${tmdbId}`
}

export const getTVEmbedUrl = (
    tmdbId: number,
    season: number,
    episode: number
): string => {
    return `${VIDSRC_BASE}/tv/${tmdbId}/${season}/${episode}`
}
