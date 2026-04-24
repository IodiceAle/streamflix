import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './useAuthStore'
import type { WatchProgress } from '@/types'

interface ContinueWatchingState {
    continueWatching: WatchProgress[]
    loading: boolean
    fetchContinueWatching: () => Promise<void>
    updateProgress: (data: Omit<WatchProgress, 'id' | 'user_id' | 'last_watched_at'>) => Promise<void>
    markAsWatched: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => Promise<void>
    clearItem: (tmdbId: number, mediaType: 'movie' | 'tv') => Promise<void>
    getProgress: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => WatchProgress | undefined
    clear: () => void
}

export const useContinueWatchingStore = create<ContinueWatchingState>()((set, get) => ({
    continueWatching: [],
    loading: true,

    fetchContinueWatching: async () => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) {
            set({ continueWatching: [], loading: false })
            return
        }
        try {
            const { data, error } = await supabase
                .from('continue_watching')
                .select('*')
                .eq('user_id', userId)
                .order('last_watched_at', { ascending: false })
            if (error) throw error

            // Deduplicate — Postgres NULL uniqueness can create duplicates
            const seen = new Set<string>()
            const unique = (data || []).filter((item) => {
                const key = `${item.tmdb_id}-${item.type}-${item.season ?? 'null'}-${item.episode ?? 'null'}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
            set({ continueWatching: unique })
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error fetching continue watching:', error)
        } finally {
            set({ loading: false })
        }
    },

    updateProgress: async (data) => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) return

        const progressData: Omit<WatchProgress, 'id'> = {
            user_id: userId,
            tmdb_id: data.tmdb_id,
            type: data.type,
            season: data.season ?? undefined,
            episode: data.episode ?? undefined,
            progress_seconds: data.progress_seconds,
            duration_seconds: data.duration_seconds,
            title: data.title,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            completed: data.completed || false,
            last_watched_at: new Date().toISOString(),
        }

        // Optimistic update — move updated item to front
        set((s) => {
            const idx = s.continueWatching.findIndex(
                (item) =>
                    item.tmdb_id === data.tmdb_id &&
                    item.type === data.type &&
                    (item.season ?? null) === (data.season ?? null) &&
                    (item.episode ?? null) === (data.episode ?? null)
            )
            if (idx >= 0) {
                const updated = [...s.continueWatching]
                updated[idx] = { ...updated[idx], ...progressData }
                const [item] = updated.splice(idx, 1)
                return { continueWatching: [item, ...updated] }
            }
            return { continueWatching: [{ id: crypto.randomUUID(), ...progressData }, ...s.continueWatching] }
        })

        const dbPayload = {
            ...progressData,
            season: progressData.season ?? null,
            episode: progressData.episode ?? null,
        }

        try {
            // Atomic upsert — no fragile insert-vs-update branching
            const { error } = await supabase
                .from('continue_watching')
                .upsert(dbPayload, { onConflict: 'user_id,tmdb_id,type,season,episode' })
            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error updating progress:', error)
            get().fetchContinueWatching()
        }
    },

    markAsWatched: async (tmdbId, mediaType, season, episode) => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) return

        // Optimistic update
        set((s) => ({
            continueWatching: s.continueWatching.map((item) => {
                if (
                    item.tmdb_id === tmdbId &&
                    item.type === mediaType &&
                    (mediaType === 'movie' || (item.season === season && item.episode === episode))
                ) {
                    return { ...item, completed: true, progress_seconds: item.duration_seconds || 0 }
                }
                return item
            }),
        }))

        try {
            let query = supabase
                .from('continue_watching')
                .update({ completed: true, last_watched_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)

            if (season !== undefined) query = query.eq('season', season)
            if (episode !== undefined) query = query.eq('episode', episode)

            const { error } = await query
            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error marking as watched:', error)
            get().fetchContinueWatching()
        }
    },

    clearItem: async (tmdbId, mediaType) => {
        const userId = useAuthStore.getState().user?.id
        if (!userId) return

        set((s) => ({
            continueWatching: s.continueWatching.filter(
                (item) => !(item.tmdb_id === tmdbId && item.type === mediaType)
            ),
        }))

        try {
            const { error } = await supabase
                .from('continue_watching')
                .delete()
                .eq('user_id', userId)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)
            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error clearing item:', error)
            get().fetchContinueWatching()
        }
    },

    getProgress: (tmdbId, mediaType, season, episode) =>
        get().continueWatching.find(
            (item) =>
                item.tmdb_id === tmdbId &&
                item.type === mediaType &&
                (mediaType === 'movie' || (item.season === season && item.episode === episode))
        ),

    clear: () => set({ continueWatching: [], loading: false }),
}))

// React to auth changes
useAuthStore.subscribe(
    (state) => state.user?.id,
    (userId) => {
        if (userId) {
            useContinueWatchingStore.getState().fetchContinueWatching()
        } else {
            useContinueWatchingStore.getState().clear()
        }
    }
)

// Drop-in replacement for the old context hook — no component changes needed.
export const useContinueWatching = useContinueWatchingStore