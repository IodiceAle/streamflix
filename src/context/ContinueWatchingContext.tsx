import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'
import type { WatchProgress } from '@/types'

interface ContinueWatchingContextType {
    continueWatching: WatchProgress[]
    loading: boolean
    updateProgress: (data: Omit<WatchProgress, 'id' | 'user_id' | 'last_watched_at'>) => Promise<void>
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
            setContinueWatching(data || [])
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

        const progressData = {
            user_id: user.id,
            tmdb_id: data.tmdb_id,
            media_type: data.media_type,
            season: data.season,
            episode: data.episode,
            progress_seconds: data.progress_seconds,
            duration_seconds: data.duration_seconds,
            last_watched_at: new Date().toISOString(),
        }

        // Optimistic update
        setContinueWatching((prev) => {
            const existingIndex = prev.findIndex(
                (item) =>
                    item.tmdb_id === data.tmdb_id &&
                    item.media_type === data.media_type &&
                    item.season === data.season &&
                    item.episode === data.episode
            )

            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = { ...updated[existingIndex], ...progressData }
                // Move to front if not already
                const [item] = updated.splice(existingIndex, 1)
                return [item, ...updated]
            }

            return [{ id: crypto.randomUUID(), ...progressData }, ...prev]
        })

        try {
            const { error } = await supabase.from('continue_watching').upsert(progressData, {
                onConflict: 'user_id,tmdb_id,media_type,season,episode',
            })

            if (error) throw error
        } catch (error) {
            console.error('Error updating progress:', error)
            // Refetch on error to sync state
            fetchContinueWatching()
        }
    }

    const clearItem = async (tmdbId: number, mediaType: 'movie' | 'tv') => {
        if (!user) return

        setContinueWatching((prev) =>
            prev.filter((item) => !(item.tmdb_id === tmdbId && item.media_type === mediaType))
        )

        try {
            const { error } = await supabase
                .from('continue_watching')
                .delete()
                .eq('user_id', user.id)
                .eq('tmdb_id', tmdbId)
                .eq('media_type', mediaType)

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
                item.media_type === mediaType &&
                (mediaType === 'movie' || (item.season === season && item.episode === episode))
        )
    }

    return (
        <ContinueWatchingContext.Provider
            value={{ continueWatching, loading, updateProgress, clearItem, getProgress }}
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
