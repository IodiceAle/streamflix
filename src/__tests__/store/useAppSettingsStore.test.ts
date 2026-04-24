import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAppSettingsStore } from '@/store/useAppSettingsStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

vi.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn().mockReturnThis(),
        })),
    },
}))

const defaultSettings = {
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
} as const

beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, session: null, loading: false })
    useAppSettingsStore.setState({ settings: { ...defaultSettings }, loading: false })
})

describe('useAppSettingsStore — initial state', () => {
    it('has the expected default theme', () => {
        expect(useAppSettingsStore.getState().settings.theme).toBe('system')
    })

    it('has the expected default language', () => {
        expect(useAppSettingsStore.getState().settings.language).toBe('en')
    })

    it('has auto_play enabled by default', () => {
        expect(useAppSettingsStore.getState().settings.auto_play).toBe(true)
    })
})

describe('useAppSettingsStore — updateSetting (no user)', () => {
    it('updates a setting locally without touching Supabase', async () => {
        await useAppSettingsStore.getState().updateSetting('theme', 'dark')

        expect(useAppSettingsStore.getState().settings.theme).toBe('dark')
        expect(supabase.from).not.toHaveBeenCalled()
    })

    it('can toggle auto_play off', async () => {
        await useAppSettingsStore.getState().updateSetting('auto_play', false)
        expect(useAppSettingsStore.getState().settings.auto_play).toBe(false)
    })

    it('can update default_quality', async () => {
        await useAppSettingsStore.getState().updateSetting('default_quality', '1080p')
        expect(useAppSettingsStore.getState().settings.default_quality).toBe('1080p')
    })
})

describe('useAppSettingsStore — updateSettings (with user)', () => {
    beforeEach(() => {
        useAuthStore.setState({ user: { id: 'user-123' } as User })
    })

    it('updates the local store', async () => {
        await useAppSettingsStore.getState().updateSettings({ theme: 'light' })
        expect(useAppSettingsStore.getState().settings.theme).toBe('light')
    })

    it('persists to Supabase when a user is logged in', async () => {
        await useAppSettingsStore.getState().updateSettings({ theme: 'light' })
        expect(supabase.from).toHaveBeenCalledWith('profiles')
    })

    it('can update multiple settings at once', async () => {
        await useAppSettingsStore.getState().updateSettings({
            theme: 'dark',
            language: 'fr',
            notifications: true,
        })

        const { settings } = useAppSettingsStore.getState()
        expect(settings.theme).toBe('dark')
        expect(settings.language).toBe('fr')
        expect(settings.notifications).toBe(true)
    })
})