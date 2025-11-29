import { NavLink } from 'react-router'
import { HiHome, HiSearch, HiBookmark, HiCog } from 'react-icons/hi'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const navItems = [
    { to: ROUTES.HOME, icon: HiHome, label: 'Home' },
    { to: ROUTES.SEARCH, icon: HiSearch, label: 'Search' },
    { to: ROUTES.MY_LIST, icon: HiBookmark, label: 'My List' },
    { to: ROUTES.SETTINGS, icon: HiCog, label: 'Settings' },
]

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-gray-800 bg-dark/95 backdrop-blur-md pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={cn('w-6 h-6', isActive && 'animate-scale-in')} />
                                <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
