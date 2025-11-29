import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/common/Button'
import { signOut } from '@/services/authService'
import { ROUTES } from '@/lib/constants'
import { HiUser, HiCog, HiLogout, HiInformationCircle } from 'react-icons/hi'
import type { Route } from './+types/settings'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Settings - StreamFlix' },
        { name: 'description', content: 'Manage your account settings' },
    ]
}

export default function Settings() {
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOut()
            navigate(ROUTES.LOGIN)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Layout>
            <div className="px-4 md:px-8 lg:px-12 py-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-text-secondary">Manage your account and preferences</p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <HiUser className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Profile</h2>
                                <p className="text-text-secondary text-sm">Manage your profile information</p>
                            </div>
                        </div>
                        {/* Profile settings would go here */}
                    </div>

                    {/* Playback Settings */}
                    <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <HiCog className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-white">Playback Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Auto-play next episode</p>
                                    <p className="text-text-secondary text-sm">Automatically play the next episode</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Auto-play previews</p>
                                    <p className="text-text-secondary text-sm">Play trailers automatically while browsing</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Data saver</p>
                                    <p className="text-text-secondary text-sm">Use less data with lower video quality</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <HiInformationCircle className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-white">Account</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-text-secondary text-sm mb-2">App Version</p>
                                <p className="text-white">StreamFlix v1.0.0</p>
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <Button
                                    variant="secondary"
                                    onClick={handleLogout}
                                    isLoading={isLoggingOut}
                                    className="w-full gap-2"
                                >
                                    <HiLogout className="w-5 h-5" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="text-center py-4">
                        <p className="text-text-secondary text-sm">
                            © 2025 StreamFlix. All rights reserved.
                        </p>
                        <p className="text-text-secondary text-xs mt-2">
                            This is a demo application built with React Router v7 and Tailwind CSS v4
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
