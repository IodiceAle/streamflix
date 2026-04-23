import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'StreamFlix',
                short_name: 'StreamFlix',
                description: 'Your personal streaming platform',
                theme_color: '#141414',
                background_color: '#141414',
                display: 'standalone',
                orientation: 'any',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                navigationPreload: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'tmdb-api-cache',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tmdb-image-cache',
                            expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-rest-cache',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-auth-cache',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
                            cacheableResponse: { statuses: [200] }
                        }
                    }
                ]
            }
        }),

        // Upload source maps to Sentry at build time so production errors have
        // readable stack traces. Only runs when SENTRY_AUTH_TOKEN is present —
        // local dev and CI builds without the token skip this step silently.
        sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            telemetry: false,
            silent: !process.env.SENTRY_AUTH_TOKEN,
        }),
    ],

    build: {
        // Required for Sentry to match source maps to minified bundles
        sourcemap: true,
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})