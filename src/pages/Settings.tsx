import { useState, useEffect } from 'react'
import { Play, Bell, Shield, Info, ChevronRight, LogOut, User, Palette, Volume2, Check, Globe, Subtitles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type Theme = 'dark' | 'light' | 'system'
type Quality = 'auto' | '1080p' | '720p' | '480p'

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
]

const subtitleLanguages = [
    { code: 'off', name: 'Off' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
]

export default function Settings() {
    const { user, signOut } = useAuth()

    const [theme, setTheme] = useState<Theme>(() =>
        (localStorage.getItem('streamflix_theme') as Theme) || 'dark'
    )
    const [autoPlay, setAutoPlay] = useState(() =>
        localStorage.getItem('streamflix_autoplay') !== 'false'
    )
    const [quality, setQuality] = useState<Quality>(() =>
        (localStorage.getItem('streamflix_quality') as Quality) || 'auto'
    )
    const [notifications, setNotifications] = useState(() =>
        localStorage.getItem('streamflix_notifications') === 'true'
    )
    const [language, setLanguage] = useState(() =>
        localStorage.getItem('streamflix_language') || 'en'
    )
    const [subtitleLang, setSubtitleLang] = useState(() =>
        localStorage.getItem('streamflix_subtitles') || 'en'
    )

    const [showThemeModal, setShowThemeModal] = useState(false)
    const [showQualityModal, setShowQualityModal] = useState(false)
    const [showLanguageModal, setShowLanguageModal] = useState(false)
    const [showSubtitleModal, setShowSubtitleModal] = useState(false)

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement

        if (theme === 'light') {
            root.classList.add('light-theme')
            root.style.setProperty('--surface', '#f5f5f5')
            root.style.setProperty('--surface-elevated', '#ffffff')
            root.style.setProperty('--surface-card', '#e8e8e8')
            root.style.setProperty('--surface-hover', '#d0d0d0')
            document.body.style.backgroundColor = '#f5f5f5'
            document.body.style.color = '#1a1a1a'
        } else {
            root.classList.remove('light-theme')
            root.style.setProperty('--surface', '#0a0a0a')
            root.style.setProperty('--surface-elevated', '#141414')
            root.style.setProperty('--surface-card', '#1a1a1a')
            root.style.setProperty('--surface-hover', '#252525')
            document.body.style.backgroundColor = '#0a0a0a'
            document.body.style.color = '#ffffff'
        }

        localStorage.setItem('streamflix_theme', theme)
    }, [theme])

    useEffect(() => {
        localStorage.setItem('streamflix_autoplay', String(autoPlay))
    }, [autoPlay])

    useEffect(() => {
        localStorage.setItem('streamflix_quality', quality)
    }, [quality])

    useEffect(() => {
        localStorage.setItem('streamflix_notifications', String(notifications))
    }, [notifications])

    useEffect(() => {
        localStorage.setItem('streamflix_language', language)
    }, [language])

    useEffect(() => {
        localStorage.setItem('streamflix_subtitles', subtitleLang)
    }, [subtitleLang])

    const themeLabels: Record<Theme, string> = {
        dark: 'Dark',
        light: 'Light',
        system: 'System'
    }

    const qualityLabels: Record<Quality, string> = {
        auto: 'Auto',
        '1080p': '1080p HD',
        '720p': '720p',
        '480p': '480p'
    }

    const getLanguageName = (code: string) =>
        languages.find(l => l.code === code)?.name || code

    const getSubtitleName = (code: string) =>
        subtitleLanguages.find(l => l.code === code)?.name || code

    return (
        <div className="min-h-screen bg-surface pt-6 pb-24">
            {/* Header */}
            <div className="px-4 md:px-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-black gradient-text">Settings</h1>
            </div>

            <div className="space-y-8 px-4 md:px-8">
                {/* Account */}
                <div className="animate-fade-in-up">
                    <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Account</h2>
                    <div className="premium-card overflow-hidden">
                        <div className="flex items-center gap-4 px-4 py-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{user ? 'Signed in as' : 'Guest'}</p>
                                <p className="text-sm text-text-muted">{user?.email || 'Not logged in'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Appearance</h2>
                    <div className="premium-card overflow-hidden">
                        <button onClick={() => setShowThemeModal(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Theme</p>
                                <p className="text-sm text-text-muted">{themeLabels[theme]}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Language */}
                <div className="animate-fade-in-up" style={{ animationDelay: '75ms' }}>
                    <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Language</h2>
                    <div className="premium-card overflow-hidden divide-y divide-white/5">
                        <button onClick={() => setShowLanguageModal(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Audio Language</p>
                                <p className="text-sm text-text-muted">{getLanguageName(language)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                        </button>
                        <button onClick={() => setShowSubtitleModal(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <Subtitles className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Subtitles</p>
                                <p className="text-sm text-text-muted">{getSubtitleName(subtitleLang)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Playback */}
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Playback</h2>
                    <div className="premium-card overflow-hidden divide-y divide-white/5">
                        <button onClick={() => setAutoPlay(!autoPlay)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-brand/20 flex items-center justify-center">
                                <Play className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Auto-play next episode</p>
                                <p className="text-sm text-text-muted">{autoPlay ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div className={`w-12 h-7 rounded-full transition-colors ${autoPlay ? 'bg-brand' : 'bg-surface-hover'} p-1`}>
                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoPlay ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <button onClick={() => setShowQualityModal(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Video Quality</p>
                                <p className="text-sm text-text-muted">{qualityLabels[quality]}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                        </button>

                        <button onClick={() => setNotifications(!notifications)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Notifications</p>
                                <p className="text-sm text-text-muted">{notifications ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div className={`w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-brand' : 'bg-surface-hover'} p-1`}>
                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* About */}
                <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">About</h2>
                    <div className="premium-card overflow-hidden divide-y divide-white/5">
                        <div className="flex items-center gap-4 px-4 py-4">
                            <div className="w-11 h-11 rounded-xl bg-gray-500/20 flex items-center justify-center">
                                <Info className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">Version</p>
                                <p className="text-sm text-text-muted">1.0.0</p>
                            </div>
                        </div>
                        <button onClick={() => window.open('https://www.themoviedb.org/', '_blank')} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-teal-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold">Powered by TMDB</p>
                                <p className="text-sm text-text-muted">Visit themoviedb.org</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Sign out */}
                {user && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <button onClick={signOut} className="w-full flex items-center justify-center gap-3 py-4 bg-brand/10 hover:bg-brand/20 text-brand font-semibold rounded-2xl transition-colors border border-brand/20">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            {/* Theme Modal */}
            {showThemeModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowThemeModal(false)}>
                    <div className="w-full max-w-sm bg-surface-elevated rounded-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Choose Theme</h3>
                        <div className="space-y-2">
                            {(['dark', 'light', 'system'] as Theme[]).map((t) => (
                                <button key={t} onClick={() => { setTheme(t); setShowThemeModal(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${theme === t ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}>
                                    <span className="font-medium">{themeLabels[t]}</span>
                                    {theme === t && <Check className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quality Modal */}
            {showQualityModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowQualityModal(false)}>
                    <div className="w-full max-w-sm bg-surface-elevated rounded-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Video Quality</h3>
                        <div className="space-y-2">
                            {(['auto', '1080p', '720p', '480p'] as Quality[]).map((q) => (
                                <button key={q} onClick={() => { setQuality(q); setShowQualityModal(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${quality === q ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}>
                                    <span className="font-medium">{qualityLabels[q]}</span>
                                    {quality === q && <Check className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Language Modal */}
            {showLanguageModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowLanguageModal(false)}>
                    <div className="w-full max-w-sm bg-surface-elevated rounded-2xl p-4 max-h-[70vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Audio Language</h3>
                        <div className="space-y-2">
                            {languages.map((lang) => (
                                <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLanguageModal(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${language === lang.code ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}>
                                    <span className="font-medium">{lang.name}</span>
                                    {language === lang.code && <Check className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Subtitle Modal */}
            {showSubtitleModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSubtitleModal(false)}>
                    <div className="w-full max-w-sm bg-surface-elevated rounded-2xl p-4 max-h-[70vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Subtitles</h3>
                        <div className="space-y-2">
                            {subtitleLanguages.map((lang) => (
                                <button key={lang.code} onClick={() => { setSubtitleLang(lang.code); setShowSubtitleModal(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${subtitleLang === lang.code ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}>
                                    <span className="font-medium">{lang.name}</span>
                                    {subtitleLang === lang.code && <Check className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-text-secondary text-sm font-medium">StreamFlix v1.0.0</span>
                </div>
                <p className="text-text-muted text-xs">Powered by TMDB • Made with ❤️</p>
            </div>
        </div>
    )
}
