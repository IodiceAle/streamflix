import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
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
                            className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-colors duration-300 z-10 ${isActive
                                ? 'text-white'
                                : 'text-white/50 hover:text-white/80 active:scale-95'
                                }`}
                        >
                            {/* Animated Background Pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavActiveTab"
                                    className="absolute inset-0 bg-white/10 rounded-2xl z-[-1] border border-white/5"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            {/* Icon container */}
                            <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <Icon
                                    className="w-5 h-5 md:w-6 md:h-6"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] md:text-xs font-medium transition-all ${isActive ? 'font-bold text-white' : ''
                                }`}>
                                {label}
                            </span>
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
