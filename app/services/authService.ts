import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResponse {
    user: User | null
    session: Session | null
    error: AuthError | null
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    return {
        user: data.user,
        session: data.session,
        error,
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })
    return { error }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ error: Error | null }> {
    try {
        // First get the current user
        const user = await getCurrentUser()
        if (!user) {
            return { error: new Error('No user logged in') }
        }

        // Delete user data from custom tables
        await supabase.from('my_list').delete().eq('user_id', user.id)
        await supabase.from('continue_watching').delete().eq('user_id', user.id)
        await supabase.from('profiles').delete().eq('id', user.id)

        // Sign out
        await signOut()

        return { error: null }
    } catch (error) {
        return { error: error as Error }
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null)
    })

    return subscription
}
