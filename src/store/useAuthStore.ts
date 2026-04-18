import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(subscribeWithSelector((_set) => ({
    user: null,
    session: null,
    loading: true,

    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    },

    signOut: async () => {
        await supabase.auth.signOut()
    },
})))

// Bootstrap: resolve the current session immediately, then track all future changes.
// Both run at module-load time so the store is populated before any component renders.
supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.setState({ user: session?.user ?? null, session, loading: false })
})

supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ user: session?.user ?? null, session, loading: false })
})

// Drop-in replacement for the old context hook — no component changes needed.
export const useAuth = useAuthStore