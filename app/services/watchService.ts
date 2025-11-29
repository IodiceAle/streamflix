import { supabase, type ContinueWatchingItem } from '@/lib/supabase'

/**
 * Get user's continue watching list
 */
export async function getContinueWatching(userId: string): Promise<ContinueWatchingItem[]> {
    const { data, error } = await supabase
        .from('continue_watching')
        .select('*')
        .eq('user_id', userId)
        .order('last_watched_at', { ascending: false })
        .limit(20)

    if (error) throw error
    return data || []
}

/**
 * Update watch progress
 */
export async function updateProgress(
    userId: string,
    progressData: {
        tmdb_id: number
        type: 'movie' | 'tv'
        season?: number
        episode?: number
        progress_seconds: number
        duration_seconds: number
        metadata: {
            title: string
            poster_path: string
            backdrop_path?: string
        }
    }
): Promise<ContinueWatchingItem> {
    const { data, error } = await supabase
        .from('continue_watching')
        .upsert({
            user_id: userId,
            ...progressData,
            ...progressData.metadata,
            last_watched_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,tmdb_id,type,season,episode'
        })
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Remove from continue watching
 */
export async function removeFromContinueWatching(
    userId: string,
    tmdbId: number,
    type: 'movie' | 'tv'
): Promise<void> {
    const { error } = await supabase
        .from('continue_watching')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('type', type)

    if (error) throw error
}

/**
 * Get progress for specific content
 */
export async function getProgress(
    userId: string,
    tmdbId: number,
    type: 'movie' | 'tv',
    season?: number,
    episode?: number
): Promise<ContinueWatchingItem | null> {
    let query = supabase
        .from('continue_watching')
        .select('*')
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('type', type)

    if (type === 'tv' && season && episode) {
        query = query.eq('season', season).eq('episode', episode)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

/**
 * Subscribe to continue watching changes
 */
export function subscribeToContinueWatching(userId: string, callback: (payload: any) => void) {
    return supabase
        .channel('continue_watching_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'continue_watching',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe()
}
