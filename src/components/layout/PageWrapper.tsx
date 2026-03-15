import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageWrapperProps {
    children: ReactNode
    className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    )
}
