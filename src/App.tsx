import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { HeroSkeleton } from '@/components/ui/Skeleton'

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('@/pages/Home'))
const Discover = lazy(() => import('@/pages/Discover'))
const Search = lazy(() => import('@/pages/Search'))
const MyList = lazy(() => import('@/pages/MyList'))
const Detail = lazy(() => import('@/pages/Detail'))
const Watch = lazy(() => import('@/pages/Watch'))
const Settings = lazy(() => import('@/pages/Settings'))
const Auth = lazy(() => import('@/pages/Auth'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <HeroSkeleton />
        </div>
    )
}


function App() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<PageFallback />}>
                <Routes location={location} key={location.pathname}>
                    {/* Public route - Auth page */}
                    <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />

                    {/* Protected routes - require login */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<PageWrapper><Home /></PageWrapper>} />
                        <Route path="discover" element={<PageWrapper><Discover /></PageWrapper>} />
                        <Route path="search" element={<PageWrapper><Search /></PageWrapper>} />
                        <Route path="mylist" element={<PageWrapper><MyList /></PageWrapper>} />
                        <Route path="detail/:type/:id" element={<PageWrapper><Detail /></PageWrapper>} />
                        <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
                    </Route>

                    <Route
                        path="watch/:type/:id"
                        element={
                            <ProtectedRoute>
                                <PageWrapper><Watch /></PageWrapper>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="watch/:type/:id/:season/:episode"
                        element={
                            <ProtectedRoute>
                                <PageWrapper><Watch /></PageWrapper>
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 catch-all */}
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
            </Suspense>
        </AnimatePresence>
    )
}

export default App
