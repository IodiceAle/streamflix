import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, Play } from 'lucide-react'
import { useAuth } from '@/store/useAuthStore'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

export default function Auth() {
    const navigate = useNavigate()
    const location = useLocation()
    const { signIn, user } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [failedAttempts, setFailedAttempts] = useState(0)
    const [lockedUntil, setLockedUntil] = useState<number | null>(null)

    // Validate redirect path to prevent open redirects
    const rawFrom = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    const from = rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/'

    // Redirect if already authenticated
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true })
        }
    }, [user, from, navigate])

    if (user) return null

    const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Check rate limiting
        if (isLockedOut) {
            const secondsLeft = Math.ceil((lockedUntil! - Date.now()) / 1000)
            setError(`Too many failed attempts. Please wait ${secondsLeft} seconds.`)
            return
        }

        setLoading(true)

        try {
            const { error: authError } = await signIn(email, password)
            if (authError) throw authError
            setFailedAttempts(0)
            navigate(from, { replace: true })
        } catch (err) {
            const newAttempts = failedAttempts + 1
            setFailedAttempts(newAttempts)

            if (newAttempts >= MAX_ATTEMPTS) {
                setLockedUntil(Date.now() + LOCKOUT_MS)
                setError(`Too many failed attempts. Please wait 30 seconds.`)
                setTimeout(() => {
                    setLockedUntil(null)
                    setFailedAttempts(0)
                }, LOCKOUT_MS)
            } else {
                const msg = err instanceof Error ? err.message : 'Invalid credentials'
                const friendlyErrors: Record<string, string> = {
                    'missing email or phone': 'Please enter your email address.',
                    'Invalid login credentials': 'Incorrect email or password.',
                    'Email not confirmed': 'Please verify your email before signing in.',
                    'User not found': 'No account found with this email.',
                }
                setError(friendlyErrors[msg] || msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Logo */}
            <div className="relative mb-12 text-center animate-fade-in-up">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-glow">
                        <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black gradient-text-brand">
                        StreamFlix
                    </h1>
                </div>
                <p className="text-text-secondary text-lg">Your personal streaming platform</p>
            </div>

            {/* Auth Card */}
            <div className="relative w-full max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent rounded-3xl blur-xl" />
                <div className="relative glass rounded-3xl p-8 md:p-10 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                    <p className="text-text-muted mb-8">Sign in to continue watching</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-text-secondary mb-2 font-medium">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-12"
                                    maxLength={254}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-text-secondary mb-2 font-medium">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    maxLength={128}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || isLockedOut}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isLockedOut ? 'Temporarily Locked' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-text-muted text-sm">
                        Don't have an account? Contact your administrator.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <p className="relative mt-12 text-text-muted text-xs animate-fade-in" style={{ animationDelay: '300ms' }}>
                © {new Date().getFullYear()} StreamFlix. All rights reserved.
            </p>
        </div>
    )
}
