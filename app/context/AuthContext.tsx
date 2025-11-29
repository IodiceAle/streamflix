import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, signIn as authSignIn, signOut as authSignOut, onAuthStateChange } from '@/services/authService'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check current user on mount
        getCurrentUser().then((currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        // Subscribe to auth changes
        const subscription = onAuthStateChange((newUser) => {
            setUser(newUser)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleSignIn = async (email: string, password: string) => {
        const { user: newUser, error } = await authSignIn(email, password)
        if (!error && newUser) {
            setUser(newUser)
        }
        return { error }
    }

    const handleSignOut = async () => {
        await authSignOut()
        setUser(null)
    }

    const value = {
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
