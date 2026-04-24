import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, ContentCardSkeleton, DetailSkeleton, ContentRowSkeleton } from '@/components/ui/Skeleton';

describe('Skeleton Components', () => {
    it('renders Skeleton without crashing', () => {
        const { container } = render(<Skeleton className="test-class" />);
        expect(container.firstChild).toHaveClass('skeleton', 'test-class');
    });

    it('renders ContentCardSkeleton without crashing', () => {
        const { container } = render(<ContentCardSkeleton />);
        expect(container.querySelector('.skeleton')).toBeInTheDocument();
    });

    it('renders DetailSkeleton without crashing', () => {
        const { container } = render(<DetailSkeleton />);
        expect(container.querySelector('.skeleton')).toBeInTheDocument();
    });

    it('renders ContentRowSkeleton without crashing', () => {
        const { container } = render(<ContentRowSkeleton />);
        expect(container.querySelector('.skeleton')).toBeInTheDocument();
    });
});
