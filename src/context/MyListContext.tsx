import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'
import type { MyListItem } from '@/types'

interface MyListContextType {
    myList: MyListItem[]
    loading: boolean
    addToList: (tmdbId: number, mediaType: 'movie' | 'tv', meta?: { title?: string; posterPath?: string; backdropPath?: string }) => Promise<void>
    removeFromList: (tmdbId: number, mediaType: 'movie' | 'tv') => Promise<void>
    isInList: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean
}

const MyListContext = createContext<MyListContextType | undefined>(undefined)

export function MyListProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [myList, setMyList] = useState<MyListItem[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch list from Supabase
    const fetchMyList = useCallback(async () => {
        if (!user) {
            setMyList([])
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('my_list')
                .select('*')
                .eq('user_id', user.id)
                .order('added_at', { ascending: false })

            if (error) throw error
            setMyList(data || [])
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error fetching my list:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchMyList()
    }, [fetchMyList])

    const addToList = async (tmdbId: number, mediaType: 'movie' | 'tv', meta?: { title?: string; posterPath?: string; backdropPath?: string }) => {
        if (!user) return

        // Optimistic update
        const newItem: MyListItem = {
            id: crypto.randomUUID(),
            user_id: user.id,
            tmdb_id: tmdbId,
            type: mediaType,
            title: meta?.title,
            poster_path: meta?.posterPath,
            backdrop_path: meta?.backdropPath,
            added_at: new Date().toISOString(),
        }
        setMyList((prev) => [newItem, ...prev])

        try {
            const { error } = await supabase.from('my_list').insert({
                user_id: user.id,
                tmdb_id: tmdbId,
                type: mediaType,
                title: meta?.title,
                poster_path: meta?.posterPath,
                backdrop_path: meta?.backdropPath,
            })

            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error adding to list:', error)
            // Rollback on error
            setMyList((prev) => prev.filter((item) => item.id !== newItem.id))
        }
    }

    const removeFromList = async (tmdbId: number, mediaType: 'movie' | 'tv') => {
        if (!user) return

        // Optimistic update
        const itemToRemove = myList.find(
            (item) => item.tmdb_id === tmdbId && item.type === mediaType
        )
        setMyList((prev) =>
            prev.filter((item) => !(item.tmdb_id === tmdbId && item.type === mediaType))
        )

        try {
            const { error } = await supabase
                .from('my_list')
                .delete()
                .eq('user_id', user.id)
                .eq('tmdb_id', tmdbId)
                .eq('type', mediaType)

            if (error) throw error
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error removing from list:', error)
            // Rollback on error
            if (itemToRemove) {
                setMyList((prev) => [...prev, itemToRemove])
            }
        }
    }

    const isInList = (tmdbId: number, mediaType: 'movie' | 'tv') => {
        return myList.some((item) => item.tmdb_id === tmdbId && item.type === mediaType)
    }

    return (
        <MyListContext.Provider value={{ myList, loading, addToList, removeFromList, isInList }}>
            {children}
        </MyListContext.Provider>
    )
}

export function useMyList() {
    const context = useContext(MyListContext)
    if (context === undefined) {
        throw new Error('useMyList must be used within a MyListProvider')
    }
    return context
}
