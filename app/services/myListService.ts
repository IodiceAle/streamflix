import { supabase, type MyListItem } from '@/lib/supabase'

/**
 * Get user's my list
 */
export async function getMyList(userId: string): Promise<MyListItem[]> {
    const { data, error } = await supabase
        .from('my_list')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })

    if (error) throw error
    return data || []
}

/**
 * Add item to my list
 */
export async function addToList(
    userId: string,
    tmdbId: number,
    type: 'movie' | 'tv',
    metadata: {
        title: string
        poster_path: string
        backdrop_path?: string
    }
): Promise<MyListItem> {
    const { data, error } = await supabase
        .from('my_list')
        .insert({
            user_id: userId,
            tmdb_id: tmdbId,
            type,
            ...metadata,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Remove item from my list
 */
export async function removeFromList(
    userId: string,
    tmdbId: number,
    type: 'movie' | 'tv'
): Promise<void> {
    const { error } = await supabase
        .from('my_list')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('type', type)

    if (error) throw error
}

/**
 * Check if item is in my list
 */
export async function isInList(
    userId: string,
    tmdbId: number,
    type: 'movie' | 'tv'
): Promise<boolean> {
    const { data, error } = await supabase
        .from('my_list')
        .select('id')
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('type', type)
        .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return !!data
}

/**
 * Subscribe to my list changes
 */
export function subscribeToMyList(userId: string, callback: (payload: any) => void) {
    return supabase
        .channel('my_list_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'my_list',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe()
}
