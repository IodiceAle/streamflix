import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import { MyListProvider } from './context/MyListContext'
import { ContinueWatchingProvider } from './context/ContinueWatchingContext'

import './styles/globals.css'

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#E50914" />
                <Meta />
                <Links />
            </head>
            <body>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <MyListProvider>
                            <ContinueWatchingProvider>
                                {children}
                            </ContinueWatchingProvider>
                        </MyListProvider>
                    </AuthProvider>
                </QueryClientProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function Root() {
    return <Outlet />
}
