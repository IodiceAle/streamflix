import type {
    TMDBMovie,
    TMDBTVShow,
    TMDBMovieDetails,
    TMDBTVDetails,
    TMDBSeasonDetails,
    TMDBGenre,
    TMDBContent,
} from '@/types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Image URL helpers
export const getImageUrl = (
    path: string | null,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
    if (!path) return '/placeholder-poster.png'
    return `${IMAGE_BASE_URL}/${size}${path}`
}

export const getBackdropUrl = (
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
): string => {
    if (!path) return '/placeholder-backdrop.png'
    return `${IMAGE_BASE_URL}/${size}${path}`
}

export const getStillUrl = (
    path: string | null,
    size: 'w92' | 'w185' | 'w300' | 'original' = 'w300'
): string => {
    if (!path) return '/placeholder-still.png'
    return `${IMAGE_BASE_URL}/${size}${path}`
}

// API request helper
async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
        api_key: API_KEY,
        ...params,
    })

    const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`)

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`)
    }

    return response.json()
}

export const getTrending = async (
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'day'
): Promise<{ results: TMDBContent[] }> => {
    const data = await fetchTMDB<{ results: TMDBContent[] }>(`/trending/${mediaType}/${timeWindow}`)
    data.results = data.results.filter((item) => item.media_type !== 'person')
    return data
}

// Popular
export const getPopularMovies = async (page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> => {
    return fetchTMDB('/movie/popular', { page: String(page) })
}

export const getPopularTVShows = async (page = 1): Promise<{ results: TMDBTVShow[]; total_pages: number }> => {
    return fetchTMDB('/tv/popular', { page: String(page) })
}

// Top Rated
export const getTopRatedMovies = async (page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> => {
    return fetchTMDB('/movie/top_rated', { page: String(page) })
}

export const getTopRatedTVShows = async (page = 1): Promise<{ results: TMDBTVShow[]; total_pages: number }> => {
    return fetchTMDB('/tv/top_rated', { page: String(page) })
}

// Discover with filters
export const discoverMovies = async (params: {
    page?: number
    with_genres?: string
    sort_by?: string
    'vote_average.gte'?: number
    'vote_average.lte'?: number
    'primary_release_date.gte'?: string
    'primary_release_date.lte'?: string
    with_original_language?: string
}): Promise<{ results: TMDBMovie[]; total_pages: number; total_results: number }> => {
    const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value)
        return acc
    }, {} as Record<string, string>)

    return fetchTMDB('/discover/movie', stringParams)
}

export const discoverTVShows = async (params: {
    page?: number
    with_genres?: string
    sort_by?: string
    'vote_average.gte'?: number
    'vote_average.lte'?: number
    'first_air_date.gte'?: string
    'first_air_date.lte'?: string
    with_original_language?: string
}): Promise<{ results: TMDBTVShow[]; total_pages: number; total_results: number }> => {
    const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value)
        return acc
    }, {} as Record<string, string>)

    return fetchTMDB('/discover/tv', stringParams)
}

// Search
export const searchMulti = async (
    query: string,
    page = 1
): Promise<{ results: TMDBContent[]; total_pages: number; total_results: number }> => {
    const data = await fetchTMDB<{ results: TMDBContent[]; total_pages: number; total_results: number }>(
        '/search/multi',
        { query, page: String(page) }
    )
    // Filter out people from results
    data.results = data.results.filter((item) => item.media_type !== 'person')
    return data
}

// Alias for searchMulti
export const multiSearch = searchMulti

// Details
export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
    return fetchTMDB(`/movie/${movieId}`, { append_to_response: 'videos,similar,credits' })
}

export const getTVDetails = async (tvId: number): Promise<TMDBTVDetails> => {
    return fetchTMDB(`/tv/${tvId}`, { append_to_response: 'videos,similar,credits' })
}

// TV Seasons
export const getSeasonDetails = async (
    tvId: number,
    seasonNumber: number
): Promise<TMDBSeasonDetails> => {
    return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`)
}

// Genres
export const getMovieGenres = async (): Promise<{ genres: TMDBGenre[] }> => {
    return fetchTMDB('/genre/movie/list')
}

export const getTVGenres = async (): Promise<{ genres: TMDBGenre[] }> => {
    return fetchTMDB('/genre/tv/list')
}

// Utility to normalize content
export const normalizeContent = (
    item: TMDBMovie | TMDBTVShow,
    type: 'movie' | 'tv'
): { id: number; type: 'movie' | 'tv'; title: string; posterPath: string | null; backdropPath: string | null; overview: string; voteAverage: number; releaseDate: string; genreIds: number[] } => {
    const isMovie = type === 'movie'
    return {
        id: item.id,
        type,
        title: isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        overview: item.overview,
        voteAverage: item.vote_average,
        releaseDate: isMovie ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date,
        genreIds: item.genre_ids,
    }
}
