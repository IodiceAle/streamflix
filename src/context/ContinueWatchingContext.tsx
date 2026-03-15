import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'
import type { WatchProgress } from '@/types'

interface ContinueWatchingContextType {
    continueWatching: WatchProgress[]
    loading: boolean
    updateProgress: (data: Omit<WatchProgress, 'id' | 'user_id' | 'last_watched_at'>) => Promise<void>
    markAsWatched: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => Promise<void>
    clearItem: (tmdbId: number, mediaType: 'movie' | 'tv') => Promise<void>
    getProgress: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => WatchProgress | undefined
}

const ContinueWatchingContext = createContext<ContinueWatchingContextType | undefined>(undefined)

export function ContinueWatchingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch watch history
    const fetchContinueWatching = useCallback(async () => {
        if (!user) {
            setContinueWatching([])
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('continue_watching')
                .select('*')
                .eq('user_id', user.id)
                .order('last_watched_at', { ascending: false })

            if (error) throw error

            // Deduplicate items locally in case the db has duplicates due to the postgres null constraint behavior
            const uniqueData = []
            const seen = new Set()
            for (const item of (data || [])) {
                const key = `${item.tmdb_id}-${item.type}-${item.season ?? 'null'}-${item.episode ?? 'null'}`
                if (!seen.has(key)) {
                    seen.add(key)
                    uniqueData.push(item)
                }
            }

            setContinueWatching(uniqueData)
        } catch (error) {
            console.error('Error fetching continue watching:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchContinueWatching()
    }, [fetchContinueWatching])

    const updateProgress = async (data: Omit<WatchProgress, 'id' | 'user_id' | 'last_watched_at'>) => {
        if (!user) return

        const progressData: Omit<WatchProgress, 'id'> = {
            user_id: user.id,
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

        let existingId: string | undefined

        // Optimistic update
        setContinueWatching((prev) => {
            const existingIndex = prev.findIndex(
                (item) =>
                    item.tmdb_id === data.tmdb_id &&
                    item.type === data.type &&
                    (item.season ?? null) === (data.season ?? null) &&
                    (item.episode ?? null) === (data.episode ?? null)
            )

            if (existingIndex >= 0) {
                existingId = prev[existingIndex].id
                const updated = [...prev]
                updated[existingIndex] = { ...updated[existingIndex], ...progressData }
                // Move to front if not already
                const [item] = updated.splice(existingIndex, 1)
                return [item, ...updated]
            }

            return [{ id: crypto.randomUUID(), ...progressData }, ...prev]
        })

        const dbPayload = {
            ...progressData,
            season: progressData.season ?? null,
            episode: progressData.episode ?? null,
        }

        try {
            // Because Postgres unique constraints treat NULL as distinct, upserting rows with NULL season/episode
            // creates duplicates. By explicitly checking if we have an existing ID and using update/insert,
            // we bypass the need for a strict unique constraint.
            if (existingId && existingId.length > 30) { // check > 30 to make sure it's a real UUID, not a temp if we were to generate weird ones
                const { error } = await supabase
                    .from('continue_watching')
                    .update(dbPayload)
                    .eq('id', existingId)
                
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('continue_watching')
                    .insert(dbPayload)
                
                if (error) throw error
            }
        } catch (error) {
            console.error('Error updating progress:', error)
            // Refetch on error to sync state
            fetchContinueWatching()
        }
    }

    const markAsWatched = async (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => {
        if (!user) return

        // Optimistic update - mark as completed
        setContinueWatching((prev) =>
            prev.map((item) => {
                if (
                    item.tmdb_id === tmdbId &&
                    item.type === mediaType &&
                    (mediaType === 'movie' || (item.season === season && item.episode === episode))
                ) {
                    return { ...item, completed: true, progress_seconds: item.duration_seconds || 0 }
                }
                return item
            })
        )

        try {
            let query = supabase
                .from('continue_watching')
                .update({ completed: true, last_watched_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)

            if (season !== undefined) query = query.eq('season', season)
            if (episode !== undefined) query = query.eq('episode', episode)

            const { error } = await query

            if (error) throw error
        } catch (error) {
            console.error('Error marking as watched:', error)
            fetchContinueWatching()
        }
    }

    const clearItem = async (tmdbId: number, mediaType: 'movie' | 'tv') => {
        if (!user) return

        setContinueWatching((prev) =>
            prev.filter((item) => !(item.tmdb_id === tmdbId && item.type === mediaType))
        )

        try {
            const { error } = await supabase
                .from('continue_watching')
                .delete()
                .eq('user_id', user.id)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)

            if (error) throw error
        } catch (error) {
            console.error('Error clearing item:', error)
            fetchContinueWatching()
        }
    }

    const getProgress = (
        tmdbId: number,
        mediaType: 'movie' | 'tv',
        season?: number,
        episode?: number
    ) => {
        return continueWatching.find(
            (item) =>
                item.tmdb_id === tmdbId &&
                item.type === mediaType &&
                (mediaType === 'movie' || (item.season === season && item.episode === episode))
        )
    }

    return (
        <ContinueWatchingContext.Provider
            value={{ continueWatching, loading, updateProgress, markAsWatched, clearItem, getProgress }}
        >
            {children}
        </ContinueWatchingContext.Provider>
    )
}

export function useContinueWatching() {
    const context = useContext(ContinueWatchingContext)
    if (context === undefined) {
        throw new Error('useContinueWatching must be used within a ContinueWatchingProvider')
    }
    return context
}
