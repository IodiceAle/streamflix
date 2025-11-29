import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import * as watchService from '@/services/watchService'
import type { ContinueWatchingItem } from '@/lib/supabase'

interface ContinueWatchingContextType {
    continueWatching: ContinueWatchingItem[]
    loading: boolean
    updateProgress: (data: {
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
    }) => Promise<void>
    removeFromContinueWatching: (tmdbId: number, type: 'movie' | 'tv') => Promise<void>
    getProgress: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => ContinueWatchingItem | null
}

const ContinueWatchingContext = createContext<ContinueWatchingContextType | undefined>(undefined)

export function ContinueWatchingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch continue watching on mount and when user changes
    useEffect(() => {
        if (user) {
            loadContinueWatching()

            // Subscribe to real-time changes
            const subscription = watchService.subscribeToContinueWatching(user.id, () => {
                loadContinueWatching()
            })

            return () => {
                subscription.unsubscribe()
            }
        } else {
            setContinueWatching([])
        }
    }, [user])

    const loadContinueWatching = async () => {
        if (!user) return

        setLoading(true)
        try {
            const items = await watchService.getContinueWatching(user.id)
            setContinueWatching(items)
        } catch (error) {
            console.error('Error loading continue watching:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateProgress = async (data: {
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
    }) => {
        if (!user) return

        try {
            await watchService.updateProgress(user.id, data)
            // Real-time subscription will update the state
        } catch (error) {
            console.error('Error updating progress:', error)
        }
    }

    const removeFromContinueWatching = async (tmdbId: number, type: 'movie' | 'tv') => {
        if (!user) return

        try {
            // Optimistic update
            setContinueWatching((prev) => prev.filter((item) => item.tmdb_id !== tmdbId))

            await watchService.removeFromContinueWatching(user.id, tmdbId, type)
        } catch (error) {
            console.error('Error removing from continue watching:', error)
            // Reload on error
            await loadContinueWatching()
        }
    }

    const getProgress = (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
        return continueWatching.find((item) => {
            if (item.tmdb_id !== tmdbId || item.type !== type) return false

            if (type === 'tv' && season && episode) {
                return item.season === season && item.episode === episode
            }

            return true
        }) || null
    }

    const value = {
        continueWatching,
        loading,
        updateProgress,
        removeFromContinueWatching,
        getProgress,
    }

    return <ContinueWatchingContext.Provider value={value}>{children}</ContinueWatchingContext.Provider>
}

export function useContinueWatching() {
    const context = useContext(ContinueWatchingContext)
    if (context === undefined) {
        throw new Error('useContinueWatching must be used within a ContinueWatchingProvider')
    }
    return context
}
