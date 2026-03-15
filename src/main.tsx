import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { AppSettingsProvider } from '@/context/AppSettingsContext'
import { MyListProvider } from '@/context/MyListContext'
import { ContinueWatchingProvider } from '@/context/ContinueWatchingContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <AppSettingsProvider>
                            <MyListProvider>
                                <ContinueWatchingProvider>
                                    <ToastProvider>
                                        <ScrollToTop />
                                        <App />
                                    </ToastProvider>
                                </ContinueWatchingProvider>
                            </MyListProvider>
                        </AppSettingsProvider>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
