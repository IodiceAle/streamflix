import { Outlet } from 'react-router'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />
      <main className="pt-16 pb-20 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
