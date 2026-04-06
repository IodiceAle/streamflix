// TMDB API Types
export interface TMDBMovie {
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    release_date: string
    vote_average: number
    vote_count: number
    genre_ids: number[]
    adult: boolean
    popularity: number
    video: boolean
    original_language: string
}

export interface TMDBTVShow {
    id: number
    name: string
    original_name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    first_air_date: string
    vote_average: number
    vote_count: number
    genre_ids: number[]
    popularity: number
    origin_country: string[]
    original_language: string
}

export type TMDBContent = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' | 'person' }

export interface TMDBGenre {
    id: number
    name: string
}

export interface TMDBVideo {
    id: string
    key: string
    name: string
    site: string
    type: string
    official: boolean
}

export interface TMDBMovieDetails extends TMDBMovie {
    genres: TMDBGenre[]
    runtime: number
    status: string
    tagline: string
    belongs_to_collection: {
        id: number
        name: string
        poster_path: string
        backdrop_path: string
    } | null
    videos: { results: TMDBVideo[] }
    similar: { results: TMDBMovie[] }
    credits?: TMDBCredits
}

export interface TMDBTVDetails extends TMDBTVShow {
    genres: TMDBGenre[]
    episode_run_time: number[]
    status: string
    tagline: string
    number_of_episodes: number
    number_of_seasons: number
    seasons: TMDBSeason[]
    videos: { results: TMDBVideo[] }
    similar: { results: TMDBTVShow[] }
    credits?: TMDBCredits
}

export interface TMDBSeason {
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
    episode_count: number
    air_date: string
}

export interface TMDBEpisode {
    id: number
    name: string
    overview: string
    still_path: string | null
    episode_number: number
    season_number: number
    air_date: string
    runtime: number
    vote_average: number
}

export interface TMDBSeasonDetails {
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
    episodes: TMDBEpisode[]
}

export interface TMDBCastMember {
    id: number
    name: string
    character: string
    profile_path: string | null
    order: number
}

export interface TMDBCrewMember {
    id: number
    name: string
    job: string
    department: string
    profile_path: string | null
}

export interface TMDBCredits {
    cast: TMDBCastMember[]
    crew: TMDBCrewMember[]
}

// App Types
export interface ContentItem {
    id: number
    type: 'movie' | 'tv'
    title: string
    posterPath: string | null
    backdropPath: string | null
    overview: string
    voteAverage: number
    releaseDate: string
    genreIds: number[]
}

export interface WatchProgress {
    id: string
    user_id: string
    tmdb_id: number
    type: 'movie' | 'tv'
    season?: number
    episode?: number
    progress_seconds: number
    duration_seconds: number
    title?: string
    poster_path?: string
    backdrop_path?: string
    completed?: boolean
    last_watched_at: string
}

export interface MyListItem {
    id: string
    user_id: string
    tmdb_id: number
    type: 'movie' | 'tv'
    title?: string
    poster_path?: string
    backdrop_path?: string
    added_at: string
}

export interface UserProfile {
    id: string
    username: string
    avatar_url: string | null
    auto_play_next: boolean
    auto_play_previews: boolean
    data_saver: boolean
    default_quality: 'auto' | 'high' | 'medium' | 'low'
}
