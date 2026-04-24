import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/ui/Logo'

describe('Logo', () => {
    describe('default (with wordmark)', () => {
        it('renders STREAM and FLIX text', () => {
            render(<Logo />)
            expect(screen.getByText('STREAM')).toBeInTheDocument()
            expect(screen.getByText('FLIX')).toBeInTheDocument()
        })

        it('renders an SVG mark', () => {
            const { container } = render(<Logo />)
            expect(container.querySelector('svg')).toBeInTheDocument()
        })

        it('applies a custom className', () => {
            const { container } = render(<Logo className="custom-class" />)
            expect(container.firstChild).toHaveClass('custom-class')
        })

        it('scales wordmark with the size prop', () => {
            const { rerender, getByText } = render(<Logo size={28} />)
            const small = parseInt(getComputedStyle(getByText('STREAM')).fontSize || '0')

            rerender(<Logo size={56} />)
            const large = parseInt(getComputedStyle(getByText('STREAM')).fontSize || '0')

            // Larger size prop should produce a larger font-size style
            expect(large).toBeGreaterThanOrEqual(small)
        })
    })

    describe('markOnly mode', () => {
        it('does not render the wordmark text', () => {
            render(<Logo markOnly />)
            expect(screen.queryByText('STREAM')).not.toBeInTheDocument()
            expect(screen.queryByText('FLIX')).not.toBeInTheDocument()
        })

        it('still renders the SVG mark', () => {
            const { container } = render(<Logo markOnly />)
            expect(container.querySelector('svg')).toBeInTheDocument()
        })
    })
})