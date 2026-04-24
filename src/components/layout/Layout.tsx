import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'

export default function Layout() {
    return (
        <div className="min-h-screen bg-surface text-white dark:text-white">
            {/* Skip-to-content for keyboard / AT users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
            >
                Skip to content
            </a>

            {/* Desktop top navigation */}
            <TopNav />

            {/* Main content area */}
            <main id="main-content" className="pb-20 md:pb-4 md:pt-16">
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <BottomNav />
        </div>
    )
}
