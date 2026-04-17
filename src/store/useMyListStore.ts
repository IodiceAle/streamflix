import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './useAuthStore'
import type { MyListItem } from '@/types'

interface MyListState {
    myList: MyListItem[]
    loading: boolean
    fetchMyList: () => Promise<void>
    addToList: (
        tmdbId: number,
        mediaType: 'movie' | 'tv',
        meta?: { title?: string; posterPath?: string; backdropPath?: string }
    ) => Promise<void>
    removeFromList: (tmdbId: number, mediaType: 'movie' | 'tv') => Promise<void>
    isInList: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean
    clear: () => void
}

export const useMyListStore = create<MyListState>()((set, get) => ({
    myList: [],
    loading: true,

    fetchMyList: async () => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) {
            set({ myList: [], loading: false })
            return
        }
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('my_list')
                .select('*')
                .eq('user_id', userId)
                .order('added_at', { ascending: false })
            if (error) throw error
            set({ myList: data || [] })
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error fetching my list:', error)
        } finally {
            set({ loading: false })
        }
    },

    addToList: async (tmdbId, mediaType, meta) => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) return

        const newItem: MyListItem = {
            id: crypto.randomUUID(),
            user_id: userId,
            tmdb_id: tmdbId,
            type: mediaType,
            title: meta?.title,
            poster_path: meta?.posterPath,
            backdrop_path: meta?.backdropPath,
            added_at: new Date().toISOString(),
        }

        // Optimistic update
        set((s) => ({ myList: [newItem, ...s.myList] }))

        try {
            const { error } = await supabase.from('my_list').insert({
                user_id: userId,
                tmdb_id: tmdbId,
                type: mediaType,
                title: meta?.title,
                poster_path: meta?.posterPath,
                backdrop_path: meta?.backdropPath,
            })
            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error adding to list:', error)
            // Rollback
            set((s) => ({ myList: s.myList.filter((item) => item.id !== newItem.id) }))
        }
    },

    removeFromList: async (tmdbId, mediaType) => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) return

        const removed = get().myList.find(
            (item) => item.tmdb_id === tmdbId && item.type === mediaType
        )

        // Optimistic update
        set((s) => ({
            myList: s.myList.filter(
                (item) => !(item.tmdb_id === tmdbId && item.type === mediaType)
            ),
        }))

        try {
            const { error } = await supabase
                .from('my_list')
                .delete()
                .eq('user_id', userId)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)
            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error removing from list:', error)
            // Rollback
            if (removed) set((s) => ({ myList: [...s.myList, removed] }))
        }
    },

    isInList: (tmdbId, mediaType) =>
        get().myList.some((item) => item.tmdb_id === tmdbId && item.type === mediaType),

    clear: () => set({ myList: [], loading: false }),
}))

// React to auth changes: fetch on sign-in, clear on sign-out.
// Subscribes to user?.id so it only fires on actual user transitions.
useAuthStore.subscribe(
    (state) => state.user?.id,
    (userId) => {
        if (userId) {
            useMyListStore.getState().fetchMyList()
        } else {
            useMyListStore.getState().clear()
        }
    }
)

// Drop-in replacement for the old context hook — no component changes needed.
export const useMyList = useMyListStore