import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false)
            setDismissed(false)
        }
        const handleOffline = () => {
            setIsOffline(true)
            setDismissed(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline || dismissed) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-fade-in">
            <div className="bg-amber-500/95 backdrop-blur-sm text-black px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
                <WifiOff className="w-4 h-4 flex-shrink-0" />
                <span>You're offline — showing cached content</span>
                <button
                    onClick={() => setDismissed(true)}
                    className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
