import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export default function Layout() {
    return (
        <div className="min-h-screen bg-surface text-white">
            {/* Main content area with bottom padding for nav */}
            <main className="pb-20">
                <Outlet />
            </main>

            {/* Bottom navigation */}
            <BottomNav />
        </div>
    )
}
