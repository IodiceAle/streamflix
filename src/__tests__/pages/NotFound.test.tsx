import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '@/pages/NotFound'

// useNavigate is used inside NotFound; mock it so navigation calls are testable
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return { ...actual, useNavigate: () => mockNavigate }
})

function renderNotFound() {
    return render(
        <MemoryRouter>
            <NotFound />
        </MemoryRouter>
    )
}

describe('NotFound page', () => {
    it('displays the 404 status code', () => {
        renderNotFound()
        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('displays a "Page Not Found" heading', () => {
        renderNotFound()
        expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    })

    it('displays an explanatory description', () => {
        renderNotFound()
        expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument()
    })

    it('renders a "Go Home" button', () => {
        renderNotFound()
        expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })

    it('renders a "Go Back" button', () => {
        renderNotFound()
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })

    it('navigates to "/" when "Go Home" is clicked', async () => {
        const user = userEvent.setup()
        renderNotFound()
        await user.click(screen.getByRole('button', { name: /go home/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('navigates back when "Go Back" is clicked', async () => {
        const user = userEvent.setup()
        renderNotFound()
        await user.click(screen.getByRole('button', { name: /go back/i }))
        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
})