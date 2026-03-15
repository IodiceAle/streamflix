import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import { PageWrapper } from '@/components/layout/PageWrapper'
import Home from '@/pages/Home'
import Discover from '@/pages/Discover'
import Search from '@/pages/Search'
import MyList from '@/pages/MyList'
import Detail from '@/pages/Detail'
import Watch from '@/pages/Watch'
import Settings from '@/pages/Settings'
import Auth from '@/pages/Auth'

function App() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
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
                    path="watch/tv/:id/:season/:episode"
                    element={
                        <ProtectedRoute>
                            <PageWrapper><Watch /></PageWrapper>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    )
}

export default App
