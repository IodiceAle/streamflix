/**
 * Toast — backed by `sonner` but exposes the same `useToast` API as before,
 * so no call-sites need to change.
 *
 * NOTE: The `<Toaster />` is now rendered in Providers.tsx via the sonner
 * component at src/components/ui/sonner.tsx. This file only exports the hook.
 */
import { toast as sonnerToast } from 'sonner'
import type { ReactNode } from 'react'

// ── Public API ──────────────────────────────────────────────────────────────

export interface ToastContextType {
    toast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
}

export function useToast(): ToastContextType {
    return {
        toast: (message, type = 'info', duration = 3000) => {
            if (type === 'success') sonnerToast.success(message, { duration })
            else if (type === 'error') sonnerToast.error(message, { duration })
            else sonnerToast(message, { duration })
        },
        success: (message) => sonnerToast.success(message),
        error: (message) => sonnerToast.error(message),
        info: (message) => sonnerToast(message),
    }
}

// ── ToastProvider ────────────────────────────────────────────────────────────
// Kept for backwards compatibility — Toaster is now in Providers.tsx.
// Wrapping children is a no-op; the real <Toaster /> lives in Providers.
export function ToastProvider({ children }: { children: ReactNode }) {
    return <>{children}</>
}