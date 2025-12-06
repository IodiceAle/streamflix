import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark, Settings, Compass } from 'lucide-react'

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/mylist', icon: Bookmark, label: 'My List' },
    { path: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
    const location = useLocation()

    if (location.pathname.startsWith('/watch')) {
        return null
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Background with blur */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-2xl" />

            {/* Top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Content */}
            <div className="relative flex items-center justify-around h-16 md:h-18 safe-area-bottom max-w-lg mx-auto">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/70 active:scale-95'
                                }`}
                        >
                            {/* Active indicator glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-brand/20 rounded-2xl blur-xl" />
                            )}

                            {/* Icon container */}
                            <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <Icon
                                    className="w-5 h-5 md:w-6 md:h-6"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <div className="absolute -inset-1 bg-brand/30 rounded-full blur-md -z-10 animate-pulse-slow" />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] md:text-xs font-medium transition-all ${isActive ? 'font-bold text-brand' : ''
                                }`}>
                                {label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />
                            )}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
