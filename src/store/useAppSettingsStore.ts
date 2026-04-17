import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './useAuthStore'

export interface AppSettings {
    theme: 'dark'
    language: string
    subtitle_language: string
    auto_play: boolean
    auto_play_next: boolean
    auto_play_previews: boolean
    data_saver: boolean
    default_quality: 'auto' | '1080p' | '720p' | '480p'
    notifications: boolean
    username: string
    avatar_url: string | null
    email: string
}

const defaultSettings: AppSettings = {
    theme: 'dark',
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
}

interface AppSettingsState {
    settings: AppSettings
    loading: boolean
    fetchSettings: () => Promise<void>
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>
}

export const useAppSettingsStore = create<AppSettingsState>()(
    persist(
        (set, get) => ({
            settings: defaultSettings,
            loading: true,

            fetchSettings: async () => {
                const user = useAuthStore.getState().user
                if (!user) {
                    set({ loading: false })
                    return
                }
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (error) {
                        if (error.code === 'PGRST116') {
                            // No profile yet — create one from current settings
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { email: _, ...settingsWithoutEmail } = get().settings
                            await supabase.from('profiles').insert({
                                id: user.id,
                                ...settingsWithoutEmail,
                            })
                        }
                        throw error
                    }

                    if (data) {
                        const merged: AppSettings = {
                            theme: data.theme || get().settings.theme,
                            language: data.language || get().settings.language,
                            subtitle_language: data.subtitle_language || get().settings.subtitle_language,
                            auto_play: data.auto_play ?? get().settings.auto_play,
                            auto_play_next: data.auto_play_next ?? get().settings.auto_play_next,
                            auto_play_previews: data.auto_play_previews ?? get().settings.auto_play_previews,
                            data_saver: data.data_saver ?? get().settings.data_saver,
                            default_quality: data.default_quality || get().settings.default_quality,
                            notifications: data.notifications ?? get().settings.notifications,
                            username: data.username || '',
                            avatar_url: data.avatar_url || null,
                            email: user.email || '',
                        }
                        set({ settings: merged })
                    }
                } catch (error) {
                    if (import.meta.env.DEV) console.error('Error fetching settings:', error)
                } finally {
                    set({ loading: false })
                }
            },

            updateSetting: async (key, value) => {
                return get().updateSettings({ [key]: value } as Partial<AppSettings>)
            },

            updateSettings: async (updates) => {
                // Optimistic update — persist middleware writes to localStorage automatically
                set((s) => ({ settings: { ...s.settings, ...updates } }))

                const user = useAuthStore.getState().user
                if (user) {
                    try {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ ...updates, updated_at: new Date().toISOString() })
                            .eq('id', user.id)
                        if (error) throw error
                    } catch (error) {
                        if (import.meta.env.DEV) console.error('Error saving settings:', error)
                    }
                }
            },
        }),
        {
            name: 'streamflix-settings',
            // Only persist the settings object, not loading state
            partialize: (state) => ({ settings: state.settings }),
        }
    )
)

// Apply dark theme to document on store initialization
document.documentElement.classList.add('dark')

// React to auth changes
useAuthStore.subscribe(
    (state) => state.user?.id,
    (userId) => {
        if (userId) {
            useAppSettingsStore.getState().fetchSettings()
        } else {
            useAppSettingsStore.setState({ settings: defaultSettings, loading: false })
        }
    }
)

// Drop-in replacement for the old context hook — no component changes needed.
export const useAppSettings = useAppSettingsStore