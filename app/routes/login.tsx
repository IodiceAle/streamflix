import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { signIn } from '@/services/authService'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { HiMail, HiLockClosed } from 'react-icons/hi'
import { ROUTES } from '@/lib/constants'
import type { Route } from './+types/login'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Login - StreamFlix' },
        { name: 'description', content: 'Sign in to your StreamFlix account' },
    ]
}

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const { error } = await signIn(email, password)

            if (error) {
                setError(error.message)
            } else {
                navigate(ROUTES.HOME)
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #E50914 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-dark-card rounded-lg shadow-2xl p-8 md:p-10 border border-gray-800">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-2">
                            StreamFlix
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Sign in to continue watching
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 rounded-md p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            icon={<HiMail className="w-5 h-5" />}
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={<HiLockClosed className="w-5 h-5" />}
                            required
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 text-center text-sm text-text-secondary">
                        <p>Need help accessing your account?</p>
                        <p className="mt-2">Contact your administrator</p>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="mt-6 text-center text-xs text-text-secondary">
                    This is a demo application. Use your Supabase credentials to sign in.
                </p>
            </div>
        </div>
    )
}
