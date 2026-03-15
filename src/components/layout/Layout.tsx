import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'

export default function Layout() {
    return (
        <div className="min-h-screen bg-surface text-white dark:text-white">
            {/* Desktop top navigation */}
            <TopNav />

            {/* Main content area */}
            <main className="pb-20 md:pb-4 md:pt-16">
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <BottomNav />
        </div>
    )
}
