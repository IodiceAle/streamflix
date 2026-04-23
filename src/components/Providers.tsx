import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
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

const persister = createSyncStoragePersister({ storage: window.localStorage })

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60,   // 1 hour
            gcTime: 1000 * 60 * 60 * 24,      // 24 hours
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
})

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}>
                <BrowserRouter>
                    <ToastProvider>
                        <ScrollToTop />
                        <OfflineBanner />
                        {children}
                    </ToastProvider>
                </BrowserRouter>
            </PersistQueryClientProvider>
        </ErrorBoundary>
    )
}