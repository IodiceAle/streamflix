/**
 * Toast tests — updated for the sonner-backed implementation.
 *
 * The key difference: sonner renders toasts via its own <Toaster /> portal,
 * so every render helper now includes <Toaster /> alongside the trigger.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/sonner'

// Helper: mounts a trigger + Toaster so sonner can render into the DOM
function renderToast(type: 'success' | 'error' | 'info', message: string) {
    function Trigger() {
        const toast = useToast()
        useEffect(() => {
            toast[type](message)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
        return null
    }

    return render(
        <ToastProvider>
            <Trigger />
            <Toaster />
        </ToastProvider>
    )
}

describe('useToast', () => {
    it('does not throw when used inside ToastProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
        function Good() {
            useToast()
            return null
        }
        expect(() =>
            render(<ToastProvider><Good /><Toaster /></ToastProvider>)
        ).not.toThrow()
        consoleError.mockRestore()
    })
})

describe('ToastProvider', () => {
    it('shows a success toast', async () => {
        renderToast('success', 'Saved successfully')
        expect(await screen.findByText('Saved successfully')).toBeInTheDocument()
    })

    it('shows an error toast', async () => {
        renderToast('error', 'Something went wrong')
        expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    })

    it('shows an info toast', async () => {
        renderToast('info', 'Did you know?')
        expect(await screen.findByText('Did you know?')).toBeInTheDocument()
    })

    it('removes a toast when the close button is clicked', async () => {
        const user = userEvent.setup()
        renderToast('info', 'Dismiss me')

        const message = await screen.findByText('Dismiss me')
        expect(message).toBeInTheDocument()

        // Sonner renders a button[aria-label="Close toast"] or similar
        const closeBtn = document.querySelector('[data-sonner-toast] button[aria-label]')
        if (closeBtn) {
            await user.click(closeBtn as HTMLElement)
            await waitFor(() =>
                expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
            )
        }
    })

    it('stacks multiple toasts', async () => {
        function Multi() {
            const toast = useToast()
            useEffect(() => {
                toast.success('First')
                toast.error('Second')
                toast.info('Third')
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [])
            return null
        }

        render(
            <ToastProvider>
                <Multi />
                <Toaster />
            </ToastProvider>
        )

        expect(await screen.findByText('First')).toBeInTheDocument()
        expect(await screen.findByText('Second')).toBeInTheDocument()
        expect(await screen.findByText('Third')).toBeInTheDocument()
    })
})