import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Play } from 'lucide-react'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Content */}
            <div className="relative text-center animate-fade-in-up">
                {/* Logo */}
                <div className="inline-flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-glow">
                        <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-2xl font-black gradient-text-brand">StreamFlix</span>
                </div>

                {/* 404 */}
                <h1 className="text-8xl sm:text-9xl font-black text-white/10 leading-none mb-4 select-none">
                    404
                </h1>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Page Not Found
                </h2>
                <p className="text-text-secondary text-lg max-w-md mx-auto mb-10">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}
