import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

// Import stores so their Supabase subscriptions are set up before any component renders.
// Auth bootstraps itself; MyList, ContinueWatching, and AppSettings subscribe to auth changes.
import '@/store/useAuthStore'
import '@/store/useMyListStore'
import '@/store/useContinueWatchingStore'
import '@/store/useAppSettingsStore'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutes
            gcTime: 1000 * 60 * 30,      // 30 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
})

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ToastProvider>
                        <ScrollToTop />
                        <OfflineBanner />
                        {children}
                    </ToastProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}