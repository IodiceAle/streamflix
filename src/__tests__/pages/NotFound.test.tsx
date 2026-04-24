import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '@/pages/NotFound';

describe('NotFound Page', () => {
    it('renders the 404 message', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });

    it('renders a button to go back home', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );
        const homeButton = screen.getByRole('button', { name: /Go Home/i });
        expect(homeButton).toBeInTheDocument();
    });
});
