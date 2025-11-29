import { Header } from './Header'
import { BottomNav } from './BottomNav'
import type { ReactNode } from 'react'

interface LayoutProps {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />
      <main className="pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
