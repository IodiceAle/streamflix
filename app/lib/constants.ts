// Application constants

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DISCOVER: '/discover',
    SEARCH: '/search',
    MY_LIST: '/my-list',
    SETTINGS: '/settings',
    DETAIL: (type: 'movie' | 'tv', id: number) => `/detail/${type}/${id}`,
    WATCH: (type: 'movie' | 'tv', id: number, season?: number, episode?: number) =>
        type === 'tv' && season && episode
            ? `/watch/tv/${id}/${season}/${episode}`
            : `/watch/${type}/${id}`,
} as const

// TMDB Genres
export const MOVIE_GENRES: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
}

export const TV_GENRES: Record<number, string> = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western',
}

// Content rating mappings
export const CONTENT_RATINGS: Record<string, string> = {
    G: 'G',
    PG: 'PG',
    'PG-13': 'PG-13',
    R: 'R',
    'NC-17': 'NC-17',
    NR: 'NR',
    'TV-Y': 'TV-Y',
    'TV-Y7': 'TV-Y7',
    'TV-G': 'TV-G',
    'TV-PG': 'TV-PG',
    'TV-14': 'TV-14',
    'TV-MA': 'TV-MA',
}

// Time windows for trending
export const TIME_WINDOWS = {
    DAY: 'day',
    WEEK: 'week',
} as const

// Media types
export const MEDIA_TYPES = {
    MOVIE: 'movie',
    TV: 'tv',
    ALL: 'all',
} as const

// Sort options for discover
export const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Popularity Descending' },
    { value: 'popularity.asc', label: 'Popularity Ascending' },
    { value: 'release_date.desc', label: 'Release Date Descending' },
    { value: 'release_date.asc', label: 'Release Date Ascending' },
    { value: 'vote_average.desc', label: 'Rating Descending' },
    { value: 'title.asc', label: 'Title A-Z' },
] as const

// Video player quality options
export const QUALITY_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: '1080', label: '1080p' },
    { value: '720', label: '720p' },
    { value: '480', label: '480p' },
    { value: '360', label: '360p' },
] as const

// Playback speed options
export const PLAYBACK_SPEEDS = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
] as const

// Default settings
export const DEFAULT_SETTINGS = {
    autoPlayNext: true,
    autoPlayPreviews: false,
    dataSaver: false,
    defaultQuality: 'auto',
} as const

// Skeleton loading counts
export const SKELETON_COUNTS = {
    HERO: 1,
    ROW: 10,
    GRID: 20,
} as const

// Debounce delays (ms)
export const DEBOUNCE_DELAYS = {
    SEARCH: 300,
    FILTER: 500,
} as const
