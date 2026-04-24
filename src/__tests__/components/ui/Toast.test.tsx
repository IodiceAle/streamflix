import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useEffect } from 'react';

// A helper component to trigger toasts
function ToastTestComponent({ type, message }: { type: 'success' | 'error' | 'info', message: string }) {
    const toastContext = useToast();
    
    useEffect(() => {
        if (type === 'success') toastContext.success(message);
        if (type === 'error') toastContext.error(message);
        if (type === 'info') toastContext.info(message);
    }, [type, message, toastContext]);

    return <div>Test Component</div>;
}

describe('ToastProvider and useToast', () => {
    it('throws error if useToast is used outside provider', () => {
        // Prevent console.error from cluttering the test output
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => render(<ToastTestComponent type="info" message="Test" />)).toThrow('useToast must be used within a ToastProvider');
        
        consoleError.mockRestore();
    });

    it('renders a success toast', async () => {
        render(
            <ToastProvider>
                <ToastTestComponent type="success" message="Success Message" />
            </ToastProvider>
        );
        
        expect(await screen.findByText('Success Message')).toBeInTheDocument();
    });

    it('renders an error toast', async () => {
        render(
            <ToastProvider>
                <ToastTestComponent type="error" message="Error Message" />
            </ToastProvider>
        );
        
        expect(await screen.findByText('Error Message')).toBeInTheDocument();
    });

    it('removes toast when close button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <ToastProvider>
                <ToastTestComponent type="info" message="Close Me" />
            </ToastProvider>
        );
        
        const toastMessage = await screen.findByText('Close Me');
        expect(toastMessage).toBeInTheDocument();
        
        // Find close button - it's the button inside the toast container
        const closeButton = toastMessage.parentElement?.querySelector('button');
        expect(closeButton).toBeInTheDocument();
        
        await user.click(closeButton!);
        
        // Should be removed
        expect(screen.queryByText('Close Me')).not.toBeInTheDocument();
    });
});
