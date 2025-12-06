import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const location = useLocation()

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto" />
                    <p className="mt-4 text-text-secondary">Loading...</p>
                </div>
            </div>
        )
    }

    // Redirect to auth if not logged in
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />
    }

    return <>{children}</>
}
