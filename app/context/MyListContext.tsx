import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import * as myListService from '@/services/myListService'
import type { MyListItem } from '@/lib/supabase'
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb'

interface MyListContextType {
    myList: MyListItem[]
    loading: boolean
    addToList: (item: TMDBMovie | TMDBTVShow) => Promise<void>
    removeFromList: (tmdbId: number, type: 'movie' | 'tv') => Promise<void>
    isInList: (tmdbId: number) => boolean
}

const MyListContext = createContext<MyListContextType | undefined>(undefined)

export function MyListProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [myList, setMyList] = useState<MyListItem[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch user's list on mount and when user changes
    useEffect(() => {
        if (user) {
            loadMyList()

            // Subscribe to real-time changes
            const subscription = myListService.subscribeToMyList(user.id, () => {
                loadMyList()
            })

            return () => {
                subscription.unsubscribe()
            }
        } else {
            setMyList([])
        }
    }, [user])

    const loadMyList = async () => {
        if (!user) return

        setLoading(true)
        try {
            const list = await myListService.getMyList(user.id)
            setMyList(list)
        } catch (error) {
            console.error('Error loading my list:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToList = async (item: TMDBMovie | TMDBTVShow) => {
        if (!user) return

        const isMovie = 'title' in item
        const type = isMovie ? 'movie' : 'tv'
        const title = isMovie ? item.title : item.name

        try {
            // Optimistic update
            const tempItem: MyListItem = {
                id: `temp-${item.id}`,
                user_id: user.id,
                tmdb_id: item.id,
                type,
                title,
                poster_path: item.poster_path || '',
                backdrop_path: item.backdrop_path || undefined,
                added_at: new Date().toISOString(),
            }
            setMyList((prev) => [tempItem, ...prev])

            await myListService.addToList(user.id, item.id, type, {
                title,
                poster_path: item.poster_path || '',
                backdrop_path: item.backdrop_path || undefined,
            })

            // Reload to get actual data from server
            await loadMyList()
        } catch (error) {
            console.error('Error adding to list:', error)
            // Rollback optimistic update
            setMyList((prev) => prev.filter((i) => i.id !== `temp-${item.id}`))
        }
    }

    const removeFromList = async (tmdbId: number, type: 'movie' | 'tv') => {
        if (!user) return

        try {
            // Optimistic update
            setMyList((prev) => prev.filter((item) => item.tmdb_id !== tmdbId))

            await myListService.removeFromList(user.id, tmdbId, type)
        } catch (error) {
            console.error('Error removing from list:', error)
            // Reload on error
            await loadMyList()
        }
    }

    const isInList = (tmdbId: number) => {
        return myList.some((item) => item.tmdb_id === tmdbId)
    }

    const value = {
        myList,
        loading,
        addToList,
        removeFromList,
        isInList,
    }

    return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>
}

export function useMyList() {
    const context = useContext(MyListContext)
    if (context === undefined) {
        throw new Error('useMyList must be used within a MyListProvider')
    }
    return context
}
