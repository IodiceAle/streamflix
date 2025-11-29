import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        tailwindcss(),
        tsconfigPaths(),
        reactRouter(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'StreamFlix',
                short_name: 'StreamFlix',
                description: 'Watch your favorite movies and TV shows',
                theme_color: '#E50914',
                background_color: '#141414',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
                screenshots: [
                    {
                        src: '/screenshot-wide.png',
                        sizes: '1280x720',
                        type: 'image/png',
                        form_factor: 'wide',
                    },
                    {
                        src: '/screenshot-narrow.png',
                        sizes: '750x1334',
                        type: 'image/png',
                        form_factor: 'narrow',
                    },
                ],
                categories: ['entertainment', 'video'],
                shortcuts: [
                    {
                        name: 'Search',
                        short_name: 'Search',
                        description: 'Search for movies and TV shows',
                        url: '/search',
                        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'My List',
                        short_name: 'My List',
                        description: 'View your saved content',
                        url: '/my-list',
                        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'tmdb-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24, // 1 day
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tmdb-images-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
})
