import axios from 'axios'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

if (!TMDB_API_KEY) {
    throw new Error('Missing TMDB API key')
}

// Axios instance for TMDB API
export const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
})

// Helper functions
export const getImageUrl = (
    path: string | null,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
    if (!path) return '/placeholder-poster.png'
    return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getBackdropUrl = (
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
): string => {
    if (!path) return '/placeholder-backdrop.png'
    return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
}

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export const getYear = (dateString: string): string => {
    return new Date(dateString).getFullYear().toString()
}

// Types for TMDB API responses
export type TMDBMovie = {
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    release_date: string
    vote_average: number
    vote_count: number
    popularity: number
    genre_ids: number[]
    adult: boolean
    original_language: string
    video: boolean
}

export type TMDBTVShow = {
    id: number
    name: string
    original_name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    first_air_date: string
    vote_average: number
    vote_count: number
    popularity: number
    genre_ids: number[]
    origin_country: string[]
    original_language: string
}

export type TMDBGenre = {
    id: number
    name: string
}

export type TMDBVideo = {
    id: string
    key: string
    name: string
    site: string
    type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette'
    size: number
    official: boolean
}

export type TMDBCast = {
    id: number
    name: string
    character: string
    profile_path: string | null
    order: number
}

export type TMDBCrew = {
    id: number
    name: string
    job: string
    department: string
    profile_path: string | null
}

export type TMDBEpisode = {
    id: number
    name: string
    overview: string
    episode_number: number
    season_number: number
    air_date: string
    runtime: number
    still_path: string | null
    vote_average: number
}

export type TMDBSeason = {
    id: number
    name: string
    overview: string
    season_number: number
    episode_count: number
    air_date: string
    poster_path: string | null
    episodes?: TMDBEpisode[]
}

export type TMDBMovieDetails = TMDBMovie & {
    runtime: number
    genres: TMDBGenre[]
    production_companies: { id: number; name: string; logo_path: string | null }[]
    credits: { cast: TMDBCast[]; crew: TMDBCrew[] }
    videos: { results: TMDBVideo[] }
    similar: { results: TMDBMovie[] }
    belongs_to_collection?: {
        id: number
        name: string
        poster_path: string | null
        backdrop_path: string | null
        parts?: TMDBMovie[]
    }
    status: string
    tagline: string
}

export type TMDBTVDetails = TMDBTVShow & {
    episode_run_time: number[]
    genres: TMDBGenre[]
    production_companies: { id: number; name: string; logo_path: string | null }[]
    credits: { cast: TMDBCast[]; crew: TMDBCrew[] }
    videos: { results: TMDBVideo[] }
    similar: { results: TMDBTVShow[] }
    seasons: TMDBSeason[]
    number_of_seasons: number
    number_of_episodes: number
    status: string
    created_by: { id: number; name: string; profile_path: string | null }[]
}
