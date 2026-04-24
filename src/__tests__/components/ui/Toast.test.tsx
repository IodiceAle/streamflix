import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { ToastProvider, useToast } from '@/components/ui/Toast'

// Helper: mounts a component inside ToastProvider and fires one toast on mount
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
        </ToastProvider>
    )
}

describe('useToast', () => {
    it('throws when used outside ToastProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
        function Bad() {
            useToast()
            return null
        }
        expect(() => render(<Bad />)).toThrow('useToast must be used within a ToastProvider')
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

        const closeBtn = message.closest('div')?.querySelector('button')
        expect(closeBtn).toBeInTheDocument()
        await user.click(closeBtn!)

        await waitFor(() =>
            expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
        )
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
            </ToastProvider>
        )

        expect(await screen.findByText('First')).toBeInTheDocument()
        expect(await screen.findByText('Second')).toBeInTheDocument()
        expect(await screen.findByText('Third')).toBeInTheDocument()
    })
})