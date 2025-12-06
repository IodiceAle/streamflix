import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Discover from '@/pages/Discover'
import Search from '@/pages/Search'
import MyList from '@/pages/MyList'
import Detail from '@/pages/Detail'
import Watch from '@/pages/Watch'
import Settings from '@/pages/Settings'
import Auth from '@/pages/Auth'

function App() {
    return (
        <Routes>
            {/* Public route - Auth page */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes - require login */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />
                <Route path="discover" element={<Discover />} />
                <Route path="search" element={<Search />} />
                <Route path="mylist" element={<MyList />} />
                <Route path="detail/:type/:id" element={<Detail />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route
                path="watch/:type/:id"
                element={
                    <ProtectedRoute>
                        <Watch />
                    </ProtectedRoute>
                }
            />
            <Route
                path="watch/tv/:id/:season/:episode"
                element={
                    <ProtectedRoute>
                        <Watch />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
