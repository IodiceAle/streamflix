import { useState } from 'react'
import {
    Play, Bell, Info, ChevronRight, LogOut, User,
    Palette, Volume2, Check, Globe, Subtitles, Moon, Sun, Monitor,
} from 'lucide-react'
import { useAuth } from '@/store/useAuthStore'
import { useAppSettings } from '@/store/useAppSettingsStore'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/switch'
import type { AppSettings } from '@/store/useAppSettingsStore'

type Quality = 'auto' | '1080p' | '720p' | '480p'
type Theme = AppSettings['theme']

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

const themeOptions: { value: Theme; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'dark', label: 'Dark', description: 'Dark backgrounds, easy on the eyes', icon: Moon },
    { value: 'light', label: 'Light', description: 'Light backgrounds, great in daylight', icon: Sun },
    { value: 'system', label: 'System', description: 'Follows your device preference', icon: Monitor },
]

export default function Settings() {
    const { user, signOut } = useAuth()
    const { settings, updateSetting } = useAppSettings()

    const [showQualityModal, setShowQualityModal] = useState(false)
    const [showLanguageModal, setShowLanguageModal] = useState(false)
    const [showSubtitleModal, setShowSubtitleModal] = useState(false)
    const [showThemeModal, setShowThemeModal] = useState(false)

    const qualityLabels: Record<Quality, string> = { auto: 'Auto', '1080p': '1080p HD', '720p': '720p', '480p': '480p' }
    const getLanguageName = (code: string) => languages.find((l) => l.code === code)?.name || code
    const getSubtitleName = (code: string) => subtitleLanguages.find((l) => l.code === code)?.name || code
    const getThemeName = (t: Theme) => themeOptions.find((o) => o.value === t)?.label || t

    return (
        <div className="min-h-screen bg-surface pt-6 pb-24">
            <div className="space-y-8 px-4 md:px-8 max-w-2xl md:mx-auto">

                {/* Account */}
                <Section title="Account">
                    <SettingItem
                        icon={User}
                        iconBg="bg-blue-500/15"
                        iconColor="text-blue-400"
                        label={user ? 'Signed in as' : 'Guest'}
                        description={user?.email || 'Not logged in'}
                    />
                </Section>

                {/* Appearance */}
                <Section title="Appearance">
                    <SettingButton
                        icon={Palette}
                        iconBg="bg-purple-500/15"
                        iconColor="text-purple-400"
                        label="Theme"
                        description={getThemeName(settings.theme)}
                        onClick={() => setShowThemeModal(true)}
                    />
                </Section>

                {/* Language & Audio */}
                <Section title="Language & Audio">
                    <SettingButton
                        icon={Globe}
                        iconBg="bg-cyan-500/15"
                        iconColor="text-cyan-400"
                        label="Audio Language"
                        description={getLanguageName(settings.language)}
                        onClick={() => setShowLanguageModal(true)}
                    />
                    <SettingButton
                        icon={Subtitles}
                        iconBg="bg-orange-500/15"
                        iconColor="text-orange-400"
                        label="Subtitles"
                        description={getSubtitleName(settings.subtitle_language)}
                        onClick={() => setShowSubtitleModal(true)}
                        border
                    />
                </Section>

                {/* Playback */}
                <Section title="Playback">
                    <SettingSwitch
                        icon={Play}
                        iconBg="bg-brand/15"
                        iconColor="text-brand"
                        label="Auto-play"
                        description={settings.auto_play ? 'Videos start automatically' : 'Videos start paused'}
                        checked={settings.auto_play}
                        onCheckedChange={(v) => updateSetting('auto_play', v)}
                    />
                    <SettingButton
                        icon={Volume2}
                        iconBg="bg-green-500/15"
                        iconColor="text-green-400"
                        label="Video Quality"
                        description={qualityLabels[settings.default_quality]}
                        onClick={() => setShowQualityModal(true)}
                        border
                    />
                    <SettingSwitch
                        icon={Bell}
                        iconBg="bg-yellow-500/15"
                        iconColor="text-yellow-400"
                        label="Notifications"
                        description={settings.notifications ? 'Enabled' : 'Disabled'}
                        checked={settings.notifications}
                        onCheckedChange={(v) => updateSetting('notifications', v)}
                        border
                    />
                </Section>

                {/* About */}
                <Section title="About">
                    <SettingItem
                        icon={Info}
                        iconBg="bg-gray-500/15"
                        iconColor="text-gray-400"
                        label="Version"
                        description="1.0.0"
                    />
                </Section>

                {/* Sign out */}
                {user && (
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand/10 hover:bg-brand/20 text-brand font-semibold rounded-2xl transition-colors border border-brand/20 active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                )}
            </div>

            {/* Theme Modal */}
            <Modal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} title="Theme">
                <div className="space-y-2">
                    {themeOptions.map((option) => {
                        const Icon = option.icon
                        const selected = settings.theme === option.value
                        return (
                            <button
                                key={option.value}
                                onClick={() => { updateSetting('theme', option.value); setShowThemeModal(false) }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${selected
                                    ? 'bg-brand text-white'
                                    : 'bg-surface-card hover:bg-surface-hover'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-white/20' : 'bg-surface-hover'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-sm">{option.label}</p>
                                    <p className={`text-xs mt-0.5 ${selected ? 'text-white/70' : 'text-text-muted'}`}>
                                        {option.description}
                                    </p>
                                </div>
                                {selected && <Check className="w-5 h-5 flex-shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            </Modal>

            {/* Quality Modal */}
            <Modal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} title="Video Quality">
                <div className="space-y-2">
                    {(['auto', '1080p', '720p', '480p'] as Quality[]).map((q) => (
                        <ModalOption
                            key={q}
                            label={qualityLabels[q]}
                            selected={settings.default_quality === q}
                            onClick={() => { updateSetting('default_quality', q); setShowQualityModal(false) }}
                        />
                    ))}
                </div>
            </Modal>

            {/* Language Modal */}
            <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="Audio Language">
                <div className="space-y-2">
                    {languages.map((lang) => (
                        <ModalOption
                            key={lang.code}
                            label={lang.name}
                            selected={settings.language === lang.code}
                            onClick={() => { updateSetting('language', lang.code); setShowLanguageModal(false) }}
                        />
                    ))}
                </div>
            </Modal>

            {/* Subtitle Modal */}
            <Modal isOpen={showSubtitleModal} onClose={() => setShowSubtitleModal(false)} title="Subtitles">
                <div className="space-y-2">
                    {subtitleLanguages.map((lang) => (
                        <ModalOption
                            key={lang.code}
                            label={lang.name}
                            selected={settings.subtitle_language === lang.code}
                            onClick={() => { updateSetting('subtitle_language', lang.code); setShowSubtitleModal(false) }}
                        />
                    ))}
                </div>
            </Modal>

            {/* Footer */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-text-secondary text-sm font-medium">StreamFlix v1.0.0</span>
                </div>
                <p className="text-text-muted text-xs">© {new Date().getFullYear()} StreamFlix</p>
            </div>
        </div>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="animate-fade-in-up">
            <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">{title}</h2>
            <div className="premium-card overflow-hidden divide-y divide-white/5">{children}</div>
        </div>
    )
}

function SettingItem({ icon: Icon, iconBg, iconColor, label, description }: {
    icon: React.ComponentType<{ className?: string }>
    iconBg: string; iconColor: string; label: string; description: string
}) {
    return (
        <div className="flex items-center gap-4 px-4 py-4">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-sm text-text-muted truncate">{description}</p>
            </div>
        </div>
    )
}

function SettingButton({ icon: Icon, iconBg, iconColor, label, description, onClick, border }: {
    icon: React.ComponentType<{ className?: string }>
    iconBg: string; iconColor: string; label: string; description: string
    onClick: () => void; border?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors ${border ? 'border-t border-white/5' : ''}`}
        >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        </button>
    )
}

function SettingSwitch({ icon: Icon, iconBg, iconColor, label, description, checked, onCheckedChange, border }: {
    icon: React.ComponentType<{ className?: string }>
    iconBg: string; iconColor: string; label: string; description: string
    checked: boolean; onCheckedChange: (v: boolean) => void; border?: boolean
}) {
    return (
        <div className={`flex items-center gap-4 px-4 py-4 ${border ? 'border-t border-white/5' : ''}`}>
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label={label}
            />
        </div>
    )
}

function ModalOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${selected ? 'bg-brand text-white' : 'bg-surface-card hover:bg-surface-hover'}`}
        >
            <span className="font-medium text-sm">{label}</span>
            {selected && <Check className="w-4 h-4" />}
        </button>
    )
}