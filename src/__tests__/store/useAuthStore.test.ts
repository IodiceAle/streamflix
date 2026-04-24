import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';

vi.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn(),
        }
    }
}));

describe('useAuthStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset state
        useAuthStore.setState({ user: null, session: null, loading: false });
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.session).toBeNull();
    });

    it('should sign in', async () => {
        const mockResponse = { error: null };
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as never);

        const state = useAuthStore.getState();
        const result = await state.signIn('test@test.com', 'password');

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
        expect(result).toEqual(mockResponse);
    });

    it('should sign out', async () => {
        vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

        const state = useAuthStore.getState();
        await state.signOut();

        expect(supabase.auth.signOut).toHaveBeenCalled();
    });
});
