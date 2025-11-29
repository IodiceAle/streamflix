import { Link, NavLink } from 'react-router'
import { ROUTES } from '@/lib/constants'
import { HiSearch, HiUser } from 'react-icons/hi'
import { cn } from '@/lib/utils'

const navLinks = [
    { to: ROUTES.HOME, label: 'Home' },
    { to: ROUTES.DISCOVER, label: 'Discover' },
    { to: ROUTES.MY_LIST, label: 'My List' },
]

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-dark to-transparent transition-all">
            <div className="px-4 md:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-primary">
                            StreamFlix
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    cn(
                                        'text-sm font-medium transition-colors hover:text-white',
                                        isActive ? 'text-white' : 'text-gray-400'
                                    )
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            to={ROUTES.SEARCH}
                            className="text-white hover:text-gray-300 transition-colors"
                            aria-label="Search"
                        >
                            <HiSearch className="w-6 h-6" />
                        </Link>

                        <Link
                            to={ROUTES.SETTINGS}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                            aria-label="Profile"
                        >
                            <HiUser className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
