import { Play, Bell, Shield, Info, ChevronRight, LogOut, User, Palette, Volume2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Settings() {

    const { user, signOut } = useAuth()

    const settingSections = [
        {
            title: 'Account',
            items: [
                {
                    icon: User,
                    label: user ? 'Signed in as' : 'Account',
                    description: user?.email || 'Manage your account',
                    onClick: () => { },
                    iconBg: 'bg-blue-500/20',
                    iconColor: 'text-blue-400',
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Palette,
                    label: 'Appearance',
                    description: 'Dark theme',
                    onClick: () => { },
                    iconBg: 'bg-purple-500/20',
                    iconColor: 'text-purple-400',
                },
                {
                    icon: Volume2,
                    label: 'Audio & Subtitles',
                    description: 'English',
                    onClick: () => { },
                    iconBg: 'bg-green-500/20',
                    iconColor: 'text-green-400',
                },
            ],
        },
        {
            title: 'Playback',
            items: [
                {
                    icon: Play,
                    label: 'Auto-play',
                    description: 'Enabled',
                    onClick: () => { },
                    iconBg: 'bg-brand/20',
                    iconColor: 'text-brand',
                },
                {
                    icon: Bell,
                    label: 'Notifications',
                    description: 'Off',
                    onClick: () => { },
                    iconBg: 'bg-yellow-500/20',
                    iconColor: 'text-yellow-400',
                },
            ],
        },
        {
            title: 'About',
            items: [
                {
                    icon: Info,
                    label: 'Version',
                    description: '1.0.0',
                    onClick: () => { },
                    iconBg: 'bg-gray-500/20',
                    iconColor: 'text-gray-400',
                },
                {
                    icon: Shield,
                    label: 'Privacy Policy',
                    description: '',
                    onClick: () => { },
                    iconBg: 'bg-teal-500/20',
                    iconColor: 'text-teal-400',
                },
            ],
        },
    ]

    return (
        <div className="min-h-screen bg-surface pt-6 pb-24">
            {/* Header */}
            <div className="px-4 md:px-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-black gradient-text">Settings</h1>
            </div>

            {/* Settings sections */}
            <div className="space-y-8 px-4 md:px-8">
                {settingSections.map((section, sectionIndex) => (
                    <div key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 50}ms` }}>
                        <h2 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">
                            {section.title}
                        </h2>
                        <div className="premium-card overflow-hidden divide-y divide-white/5">
                            {section.items.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-white">{item.label}</p>
                                        {item.description && (
                                            <p className="text-sm text-text-muted">{item.description}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Sign out */}
                {user && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-brand/10 hover:bg-brand/20 text-brand font-semibold rounded-2xl transition-colors border border-brand/20"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            {/* App info */}
            <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-text-secondary text-sm font-medium">StreamFlix v1.0.0</span>
                </div>
                <p className="text-text-muted text-xs">
                    Powered by TMDB • Made with ❤️
                </p>
            </div>
        </div>
    )
}
