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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-2xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-center justify-around h-16 safe-area-bottom max-w-lg mx-auto px-1">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-colors duration-300 z-10 min-w-0 flex-1 ${isActive
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/80 active:scale-95'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavActiveTab"
                                    className="absolute inset-0 bg-white/10 rounded-2xl z-[-1] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <Icon
                                    className="w-5 h-5"
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    color={isActive ? 'white' : 'rgba(255,255,255,0.4)'}
                                />
                            </div>

                            {/*
                              Labels: hidden on very small phones (< 360px) to prevent
                              crowding. min 12px to meet WCAG text size guidance.
                              Use xs: prefix (475px breakpoint) as the show threshold
                              so labels appear once there's enough room per item.
                            */}
                            <span className={`hidden xs:block text-xs font-medium leading-none transition-all truncate max-w-full ${isActive ? 'font-bold text-white' : ''
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