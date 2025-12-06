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

    // Apply theme
    useEffect(() => {
        const root = document.documentElement
        if (theme === 'light') {
            root.style.setProperty('--surface', '#f5f5f5')
            root.style.setProperty('--surface-elevated', '#ffffff')
            root.style.setProperty('--surface-card', '#e8e8e8')
            root.style.setProperty('--surface-hover', '#d0d0d0')
            document.body.style.backgroundColor = '#f5f5f5'
            document.body.style.color = '#1a1a1a'
        } else {
            root.style.setProperty('--surface', '#0a0a0a')
            root.style.setProperty('--surface-elevated', '#141414')
            root.style.setProperty('--surface-card', '#1a1a1a')
            root.style.setProperty('--surface-hover', '#252525')
            document.body.style.backgroundColor = '#0a0a0a'
            document.body.style.color = '#ffffff'
        }
        localStorage.setItem('streamflix_theme', theme)
    }, [theme])

    // Save all settings to localStorage (used by player)
    useEffect(() => { localStorage.setItem('streamflix_autoplay', String(autoPlay)) }, [autoPlay])
    useEffect(() => { localStorage.setItem('streamflix_quality', quality) }, [quality])
    useEffect(() => { localStorage.setItem('streamflix_notifications', String(notifications)) }, [notifications])
    useEffect(() => { localStorage.setItem('streamflix_language', language) }, [language])
    useEffect(() => { localStorage.setItem('streamflix_subtitles', subtitleLang) }, [subtitleLang])

    const themeLabels: Record<Theme, string> = { dark: 'Dark', light: 'Light', system: 'System' }
    const qualityLabels: Record<Quality, string> = { auto: 'Auto', '1080p': '1080p HD', '720p': '720p', '480p': '480p' }
    const getLanguageName = (code: string) => languages.find(l => l.code === code)?.name || code
    const getSubtitleName = (code: string) => subtitleLanguages.find(l => l.code === code)?.name || code

    return (
        <div className="min-h-screen bg-surface pt-6 pb-24">
            <div className="px-4 md:px-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-black gradient-text">Settings</h1>
                <p className="text-text-muted mt-1 text-sm">Player powered by VixSrc</p>
            </div>

            <div className="space-y-8 px-4 md:px-8">
                {/* Account */}
                <Section title="Account">
                    <SettingItem icon={User} iconBg="bg-blue-500/20" iconColor="text-blue-400" label={user ? 'Signed in as' : 'Guest'} description={user?.email || 'Not logged in'} />
                </Section>

                {/* Appearance */}
                <Section title="Appearance">
                    <SettingButton icon={Palette} iconBg="bg-purple-500/20" iconColor="text-purple-400" label="Theme" description={themeLabels[theme]} onClick={() => setShowThemeModal(true)} />
                </Section>

                {/* Language & Audio */}
                <Section title="Language & Audio">
                    <SettingButton icon={Globe} iconBg="bg-cyan-500/20" iconColor="text-cyan-400" label="Audio Language" description={getLanguageName(language)} onClick={() => setShowLanguageModal(true)} />
                    <SettingButton icon={Subtitles} iconBg="bg-orange-500/20" iconColor="text-orange-400" label="Subtitles" description={getSubtitleName(subtitleLang)} onClick={() => setShowSubtitleModal(true)} border />
                </Section>

                {/* Playback */}
                <Section title="Playback">
                    <SettingToggle icon={Play} iconBg="bg-brand/20" iconColor="text-brand" label="Auto-play" description={autoPlay ? 'Videos start automatically' : 'Videos start paused'} value={autoPlay} onChange={setAutoPlay} />
                    <SettingButton icon={Volume2} iconBg="bg-green-500/20" iconColor="text-green-400" label="Video Quality" description={qualityLabels[quality]} onClick={() => setShowQualityModal(true)} border />
                    <SettingToggle icon={Bell} iconBg="bg-yellow-500/20" iconColor="text-yellow-400" label="Notifications" description={notifications ? 'Enabled' : 'Disabled'} value={notifications} onChange={setNotifications} border />
                </Section>

                {/* About */}
                <Section title="About">
                    <SettingItem icon={Info} iconBg="bg-gray-500/20" iconColor="text-gray-400" label="Version" description="1.0.0" />
                    <SettingButton icon={Shield} iconBg="bg-teal-500/20" iconColor="text-teal-400" label="Powered by TMDB & VixSrc" description="Video streaming API" onClick={() => window.open('https://vixsrc.to', '_blank')} border />
                </Section>

                {/* Sign out */}
                {user && (
                    <button onClick={signOut} className="w-full flex items-center justify-center gap-3 py-4 bg-brand/10 hover:bg-brand/20 text-brand font-semibold rounded-2xl transition-colors border border-brand/20">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                )}
            </div>

            {/* Modals */}
            <Modal open={showThemeModal} onClose={() => setShowThemeModal(false)} title="Choose Theme">
                {(['dark', 'light', 'system'] as Theme[]).map(t => (
                    <ModalOption key={t} label={themeLabels[t]} selected={theme === t} onClick={() => { setTheme(t); setShowThemeModal(false) }} />
                ))}
            </Modal>

            <Modal open={showQualityModal} onClose={() => setShowQualityModal(false)} title="Video Quality">
                {(['auto', '1080p', '720p', '480p'] as Quality[]).map(q => (
                    <ModalOption key={q} label={qualityLabels[q]} selected={quality === q} onClick={() => { setQuality(q); setShowQualityModal(false) }} />
                ))}
            </Modal>

            <Modal open={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="Audio Language" scroll>
                {languages.map(lang => (
                    <ModalOption key={lang.code} label={lang.name} selected={language === lang.code} onClick={() => { setLanguage(lang.code); setShowLanguageModal(false) }} />
                ))}
            </Modal>

            <Modal open={showSubtitleModal} onClose={() => setShowSubtitleModal(false)} title="Subtitles" scroll>
                {subtitleLanguages.map(lang => (
                    <ModalOption key={lang.code} label={lang.name} selected={subtitleLang === lang.code} onClick={() => { setSubtitleLang(lang.code); setShowSubtitleModal(false) }} />
                ))}
            </Modal>

            {/* Footer */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-text-secondary text-sm font-medium">StreamFlix v1.0.0</span>
                </div>
                <p className="text-text-muted text-xs">Powered by TMDB & VixSrc</p>
            </div>
        </div>
    )
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="animate-fade-in-up">
            <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">{title}</h2>
            <div className="premium-card overflow-hidden divide-y divide-white/5">{children}</div>
        </div>
    )
}

function SettingItem({ icon: Icon, iconBg, iconColor, label, description }: { icon: any; iconBg: string; iconColor: string; label: string; description: string }) {
    return (
        <div className="flex items-center gap-4 px-4 py-4">
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
            <div className="flex-1"><p className="font-semibold">{label}</p><p className="text-sm text-text-muted">{description}</p></div>
        </div>
    )
}

function SettingButton({ icon: Icon, iconBg, iconColor, label, description, onClick, border }: { icon: any; iconBg: string; iconColor: string; label: string; description: string; onClick: () => void; border?: boolean }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors ${border ? 'border-t border-white/5' : ''}`}>
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
            <div className="flex-1 text-left"><p className="font-semibold">{label}</p><p className="text-sm text-text-muted">{description}</p></div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
        </button>
    )
}

function SettingToggle({ icon: Icon, iconBg, iconColor, label, description, value, onChange, border }: { icon: any; iconBg: string; iconColor: string; label: string; description: string; value: boolean; onChange: (v: boolean) => void; border?: boolean }) {
    return (
        <button onClick={() => onChange(!value)} className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors ${border ? 'border-t border-white/5' : ''}`}>
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
            <div className="flex-1 text-left"><p className="font-semibold">{label}</p><p className="text-sm text-text-muted">{description}</p></div>
            <div className={`w-12 h-7 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-surface-hover'} p-1`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </button>
    )
}

function Modal({ open, onClose, title, children, scroll }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; scroll?: boolean }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className={`w-full max-w-sm bg-surface-elevated rounded-2xl p-4 animate-slide-up ${scroll ? 'max-h-[70vh] overflow-y-auto' : ''}`} onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <div className="space-y-2">{children}</div>
            </div>
        </div>
    )
}

function ModalOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${selected ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}>
            <span className="font-medium">{label}</span>
            {selected && <Check className="w-5 h-5" />}
        </button>
    )
}
