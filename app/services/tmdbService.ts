import { tmdbApi, type TMDBMovie, type TMDBTVShow, type TMDBMovieDetails, type TMDBTVDetails, type TMDBGenre } from '@/lib/tmdb'

export interface PaginatedResponse<T> {
    page: number
    results: T[]
    total_pages: number
    total_results: number
}

// Trending content
export async function getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'day'
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`)
    return response.data
}

// Popular content
export async function getPopular(
    type: 'movie' | 'tv',
    page: number = 1
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get(`/${type}/popular`, { params: { page } })
    return response.data
}

// Top rated content
export async function getTopRated(
    type: 'movie' | 'tv',
    page: number = 1
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get(`/${type}/top_rated`, { params: { page } })
    return response.data
}

// Discover with filters
export async function discover(
    type: 'movie' | 'tv',
    filters: {
        with_genres?: string
        sort_by?: string
        year?: number
        'vote_average.gte'?: number
        'vote_average.lte'?: number
        page?: number
    } = {}
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get(`/discover/${type}`, { params: filters })
    return response.data
}

// Search
export async function search(
    query: string,
    page: number = 1
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get('/search/multi', {
        params: {
            query,
            page,
            include_adult: false,
        },
    })

    // Filter out people from results
    const filteredResults = response.data.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    )

    return {
        ...response.data,
        results: filteredResults,
    }
}

// Movie details
export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
    const response = await tmdbApi.get(`/movie/${id}`, {
        params: {
            append_to_response: 'videos,similar,credits',
        },
    })
    return response.data
}

// TV show details
export async function getTVDetails(id: number): Promise<TMDBTVDetails> {
    const response = await tmdbApi.get(`/tv/${id}`, {
        params: {
            append_to_response: 'videos,similar,credits',
        },
    })
    return response.data
}

// Movie collection
export async function getMovieCollection(collectionId: number): Promise<{
    id: number
    name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    parts: TMDBMovie[]
}> {
    const response = await tmdbApi.get(`/collection/${collectionId}`)
    return response.data
}

// TV season details
export async function getTVSeason(tvId: number, seasonNumber: number) {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`)
    return response.data
}

// Get similar content
export async function getSimilar(
    type: 'movie' | 'tv',
    id: number,
    page: number = 1
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    const response = await tmdbApi.get(`/${type}/${id}/similar`, { params: { page } })
    return response.data
}

// Get videos (trailers)
export async function getVideos(type: 'movie' | 'tv', id: number) {
    const response = await tmdbApi.get(`/${type}/${id}/videos`)
    return response.data.results
}

// Get genres
export async function getGenres(type: 'movie' | 'tv'): Promise<TMDBGenre[]> {
    const response = await tmdbApi.get(`/genre/${type}/list`)
    return response.data.genres
}

// Get now playing movies
export async function getNowPlaying(page: number = 1): Promise<PaginatedResponse<TMDBMovie>> {
    const response = await tmdbApi.get('/movie/now_playing', { params: { page } })
    return response.data
}

// Get upcoming movies
export async function getUpcoming(page: number = 1): Promise<PaginatedResponse<TMDBMovie>> {
    const response = await tmdbApi.get('/movie/upcoming', { params: { page } })
    return response.data
}

// Get airing today TV shows
export async function getAiringToday(page: number = 1): Promise<PaginatedResponse<TMDBTVShow>> {
    const response = await tmdbApi.get('/tv/airing_today', { params: { page } })
    return response.data
}

// Get on the air TV shows
export async function getOnTheAir(page: number = 1): Promise<PaginatedResponse<TMDBTVShow>> {
    const response = await tmdbApi.get('/tv/on_the_air', { params: { page } })
    return response.data
}

// Get content by genre
export async function getByGenre(
    type: 'movie' | 'tv',
    genreId: number,
    page: number = 1
): Promise<PaginatedResponse<TMDBMovie | TMDBTVShow>> {
    return discover(type, {
        with_genres: genreId.toString(),
        sort_by: 'popularity.desc',
        page,
    })
}
