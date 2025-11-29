import { Link } from 'react-router'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/lib/constants'
import type { Route } from './+types/_404'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: '404 - Page Not Found | StreamFlix' },
        { name: 'description', content: 'Page not found' },
    ]
}

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #E50914 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Content */}
            <div className="relative text-center max-w-2xl">
                <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Lost in the Stream?
                </h2>
                <p className="text-lg text-text-secondary mb-8">
                    The page you're looking for doesn't exist. Maybe it's watching a movie somewhere.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to={ROUTES.HOME}>
                        <Button variant="primary" size="lg">
                            Go Home
                        </Button>
                    </Link>
                    <Link to={ROUTES.SEARCH}>
                        <Button variant="secondary" size="lg">
                            Search Content
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
