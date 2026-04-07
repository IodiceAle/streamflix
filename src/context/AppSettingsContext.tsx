import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'

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

interface AppSettingsContextType {
    settings: AppSettings
    loading: boolean
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [settings, setSettings] = useState<AppSettings>(() => {
        // Initialize from localStorage
        const theme = (localStorage.getItem('streamflix_theme') as AppSettings['theme']) || 'dark'
        const language = localStorage.getItem('streamflix_language') || 'en'
        const subtitle_language = localStorage.getItem('streamflix_subtitles') || 'en'
        const auto_play = localStorage.getItem('streamflix_autoplay') !== 'false'
        const default_quality = (localStorage.getItem('streamflix_quality') as AppSettings['default_quality']) || 'auto'
        const notifications = localStorage.getItem('streamflix_notifications') === 'true'

        return { ...defaultSettings, theme, language, subtitle_language, auto_play, default_quality, notifications }
    })
    const [loading, setLoading] = useState(true)

    // Fetch from Supabase on mount
    const fetchSettings = useCallback(async () => {
        if (!user) {
            setLoading(false)
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
                    const settingsWithoutEmail = { ...settings }
                    delete (settingsWithoutEmail as Partial<AppSettings>).email
                    await supabase.from('profiles').insert({
                        id: user.id,
                        // DO NOT INSERT EMAIL, profiles table does not have an email column
                        ...settingsWithoutEmail,
                    })
                }
                throw error
            }

            if (data) {
                const merged: AppSettings = {
                    theme: data.theme || settings.theme,
                    language: data.language || settings.language,
                    subtitle_language: data.subtitle_language || settings.subtitle_language,
                    auto_play: data.auto_play ?? settings.auto_play,
                    auto_play_next: data.auto_play_next ?? settings.auto_play_next,
                    auto_play_previews: data.auto_play_previews ?? settings.auto_play_previews,
                    data_saver: data.data_saver ?? settings.data_saver,
                    default_quality: data.default_quality || settings.default_quality,
                    notifications: data.notifications ?? settings.notifications,
                    username: data.username || '',
                    avatar_url: data.avatar_url || null,
                    email: user.email || '',
                }
                setSettings(merged)
                // Sync to localStorage
                syncToLocalStorage(merged)
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    // Apply dark theme to document
    useEffect(() => {
        document.documentElement.classList.add('dark')
    }, [])

    const syncToLocalStorage = (s: AppSettings) => {
        localStorage.setItem('streamflix_theme', s.theme)
        localStorage.setItem('streamflix_language', s.language)
        localStorage.setItem('streamflix_subtitles', s.subtitle_language)
        localStorage.setItem('streamflix_autoplay', String(s.auto_play))
        localStorage.setItem('streamflix_quality', s.default_quality)
        localStorage.setItem('streamflix_notifications', String(s.notifications))
    }

    const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        return updateSettings({ [key]: value })
    }

    const updateSettings = async (updates: Partial<AppSettings>) => {
        // Optimistic update
        const newSettings = { ...settings, ...updates }
        setSettings(newSettings)
        syncToLocalStorage(newSettings)

        // Persist to Supabase
        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id)

                if (error) throw error
            } catch (error) {
                if (import.meta.env.DEV) console.error('Error saving settings:', error)
                // Don't rollback — localStorage still has the value
            }
        }
    }

    return (
        <AppSettingsContext.Provider value={{ settings, loading, updateSetting, updateSettings }}>
            {children}
        </AppSettingsContext.Provider>
    )
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext)
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider')
    }
    return context
}
