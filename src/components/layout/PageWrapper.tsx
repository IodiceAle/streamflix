import { ReactNode } from 'react'

interface PageWrapperProps {
    children: ReactNode
    className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
    return (
        <div className={`w-full h-full animate-fade-in-up ${className}`}>
            {children}
        </div>
    )
}
