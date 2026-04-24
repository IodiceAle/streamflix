import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/ui/Logo';

describe('Logo', () => {
    it('renders the StreamFlix text', () => {
        render(<Logo />);
        expect(screen.getByText('STREAM')).toBeInTheDocument();
        expect(screen.getByText('FLIX')).toBeInTheDocument();
    });

    it('renders only mark when markOnly is true', () => {
        const { container } = render(<Logo markOnly={true} />);
        expect(screen.queryByText('STREAM')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('displays the play icon (svg)', () => {
        const { container } = render(<Logo />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
