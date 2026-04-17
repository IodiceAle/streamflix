import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Search, Bell, User, ChevronDown, X, LogOut } from 'lucide-react'
import { useAuth } from '@/store/useAuthStore'

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/discover', label: 'Discover' },
    { path: '/mylist', label: 'My List' },
]

export function TopNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, signOut } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)

    const { scrollY } = useScroll()
    const [hidden, setHidden] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious()!
        if (latest > 100 && latest > previous) {
            setHidden(true)
        } else {
            setHidden(false)
        }
        setScrolled(latest > 20)
    })

    // Hide on watch pages — AFTER all hooks
    if (location.pathname.startsWith('/watch')) return null

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setShowSearch(false)
            setSearchQuery('')
        }
    }

    const handleSignOut = async () => {
        setShowUserMenu(false)
        await signOut()
    }

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" }
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled
                ? 'glass-premium shadow-xl'
                : 'bg-gradient-to-b from-black/80 to-transparent'
                }`}
        >
            <div className="max-w-[1800px] mx-auto flex items-center h-16 px-6 lg:px-12">
                {/* Logo */}
                <NavLink to="/" className="mr-8 flex-shrink-0">
                    <h1 className="text-2xl font-black text-brand tracking-tight">STREAMFLIX</h1>
                </NavLink>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1">
                    {navLinks.map(({ path, label }) => {
                        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 z-10 ${isActive
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="topNavActiveTab"
                                        className="absolute inset-0 bg-white/10 rounded-lg z-[-1]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{label}</span>
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Right section */}
                <div className="ml-auto flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        {showSearch ? (
                            <form onSubmit={handleSearch} className="flex items-center">
                                <div className="flex items-center bg-surface-card/80 backdrop-blur border border-white/20 rounded-lg overflow-hidden animate-scale-in">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search titles..."
                                        className="w-56 lg:w-72 px-4 py-2 bg-transparent text-white text-sm placeholder:text-text-muted focus:outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setShowSearch(false); setSearchQuery('') }}
                                        className="px-3 py-2 text-text-muted hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Notifications placeholder */}
                    <button className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all relative" aria-label="Notifications">
                        <Bell className="w-5 h-5" />
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-red-700 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-elevated/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-scale-in">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2.5 text-sm text-brand hover:bg-white/5 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    )
}
