import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/services/supabase'
import type { Session, User } from '@supabase/supabase-js'

vi.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
    },
}))

const mockUser = { id: 'user-123', email: 'test@example.com' } as User
const mockSession = { user: mockUser, access_token: 'token' } as Session

beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, session: null, loading: false })
})

describe('useAuthStore — initial state', () => {
    it('starts with no user', () => {
        expect(useAuthStore.getState().user).toBeNull()
    })

    it('starts with no session', () => {
        expect(useAuthStore.getState().session).toBeNull()
    })
})

describe('useAuthStore — signIn', () => {
    it('calls supabase with the provided credentials', async () => {
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: null } as never)

        await useAuthStore.getState().signIn('test@example.com', 'secret')

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'secret',
        })
    })

    it('returns null error on success', async () => {
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: null } as never)

        const result = await useAuthStore.getState().signIn('test@example.com', 'secret')

        expect(result.error).toBeNull()
    })

    it('returns an error when credentials are invalid', async () => {
        const authError = new Error('Invalid login credentials')
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: authError } as never)

        const result = await useAuthStore.getState().signIn('bad@example.com', 'wrong')

        expect(result.error).toBe(authError)
    })
})

describe('useAuthStore — signOut', () => {
    it('calls supabase.auth.signOut', async () => {
        vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

        await useAuthStore.getState().signOut()

        expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    })
})

describe('useAuthStore — state updates', () => {
    it('reflects a logged-in user after setState', () => {
        useAuthStore.setState({ user: mockUser, session: mockSession })

        expect(useAuthStore.getState().user).toEqual(mockUser)
        expect(useAuthStore.getState().session).toEqual(mockSession)
    })

    it('clears user and session after logout setState', () => {
        useAuthStore.setState({ user: mockUser, session: mockSession })
        useAuthStore.setState({ user: null, session: null })

        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().session).toBeNull()
    })
})