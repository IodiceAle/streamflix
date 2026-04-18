import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
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
                // FIX 1: Activate updated SW immediately — without these two flags,
                // a new service worker sits in "waiting" state until the user closes
                // every open tab. Users on the app indefinitely never get updates.
                skipWaiting: true,
                clientsClaim: true,

                // FIX 2: Delete caches from old SW versions on activation.
                // Without this, stale caches accumulate indefinitely in storage.
                cleanupOutdatedCaches: true,

                // FIX 3: Serve the app shell for any navigation request while offline.
                // Without this, a hard-refresh or direct URL visit offline shows a
                // browser "no internet" error instead of the app.
                navigateFallback: '/index.html',

                // FIX 4: Raise the per-file precache limit.
                // Default is 2 MB. Large lazy-loaded JS chunks (e.g. the Watch page)
                // are silently skipped if they exceed it — the app partially works
                // offline but some pages fail to load.
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

                navigationPreload: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'tmdb-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24
                            },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tmdb-image-cache',
                            expiration: {
                                maxEntries: 500,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            },
                            cacheableResponse: { statuses: [200] }
                        }
                    },

                    // FIX 5: Cache Supabase REST and Auth reads with NetworkFirst.
                    // Without this, any DB or auth call made while offline throws a
                    // network error and the app's data stores return empty/broken state.
                    // NetworkFirst tries the network and falls back to cache — reads
                    // work offline, writes fail gracefully (stores already handle this
                    // with their own optimistic-update + rollback pattern).
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-rest-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24
                            },
                            cacheableResponse: { statuses: [200] }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-auth-cache',
                            networkTimeoutSeconds: 5,
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 // 1 hour — auth tokens rotate
                            },
                            cacheableResponse: { statuses: [200] }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})