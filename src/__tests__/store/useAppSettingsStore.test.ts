import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

vi.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: null, error: null })
                }))
            })),
            insert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({ error: null })
            }))
        }))
    }
}));

describe('useAppSettingsStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset state
        useAppSettingsStore.setState({
            settings: {
                theme: 'system',
                language: 'en',
                subtitle_language: 'en',
                auto_play: true,
                auto_play_next: true,
                auto_play_previews: true,
                data_saver: false,
                default_quality: 'auto',
                notifications: false,
                username: '',
                avatar_url: null,
                email: '',
            },
            loading: false
        });
    });

    it('should have initial settings', () => {
        const { settings } = useAppSettingsStore.getState();
        expect(settings.theme).toBe('system');
        expect(settings.language).toBe('en');
    });

    it('should update a setting locally if user is not logged in', async () => {
        const state = useAppSettingsStore.getState();
        await state.updateSetting('theme', 'dark');

        const { settings } = useAppSettingsStore.getState();
        expect(settings.theme).toBe('dark');
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should update settings locally and in supabase if user is logged in', async () => {
        useAuthStore.setState({ user: { id: 'user-id', email: 'test@test.com' } as User });

        const state = useAppSettingsStore.getState();
        await state.updateSettings({ theme: 'light' });

        const { settings } = useAppSettingsStore.getState();
        expect(settings.theme).toBe('light');
        
        expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
});
