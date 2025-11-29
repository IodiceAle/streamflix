import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Types for Supabase tables
export type Profile = {
    id: string
    email: string
    avatar_url?: string
    username?: string
    auto_play_next: boolean
    auto_play_previews: boolean
    data_saver: boolean
    default_quality: 'auto' | 'high' | 'medium' | 'low'
    created_at: string
    updated_at: string
}

export type MyListItem = {
    id: string
    user_id: string
    tmdb_id: number
    type: 'movie' | 'tv'
    title: string
    poster_path: string
    backdrop_path?: string
    added_at: string
}

export type ContinueWatchingItem = {
    id: string
    user_id: string
    tmdb_id: number
    type: 'movie' | 'tv'
    season?: number
    episode?: number
    progress_seconds: number
    duration_seconds: number
    title: string
    poster_path: string
    backdrop_path?: string
    last_watched_at: string
    created_at: string
}
