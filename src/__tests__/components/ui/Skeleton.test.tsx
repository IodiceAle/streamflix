import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
    Skeleton,
    ContentCardSkeleton,
    ContentRowSkeleton,
    HeroSkeleton,
    DetailSkeleton,
} from '@/components/ui/Skeleton'

describe('Skeleton', () => {
    it('renders with the base skeleton class', () => {
        const { container } = render(<Skeleton />)
        expect(container.firstChild).toHaveClass('skeleton')
    })

    it('merges additional classNames', () => {
        const { container } = render(<Skeleton className="rounded-xl w-full" />)
        expect(container.firstChild).toHaveClass('skeleton', 'rounded-xl', 'w-full')
    })

    it('renders a div element', () => {
        const { container } = render(<Skeleton />)
        expect(container.firstChild?.nodeName).toBe('DIV')
    })
})

describe('ContentCardSkeleton', () => {
    it('renders without crashing', () => {
        const { container } = render(<ContentCardSkeleton />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('contains at least one skeleton shimmer', () => {
        const { container } = render(<ContentCardSkeleton />)
        expect(container.querySelector('.skeleton')).toBeInTheDocument()
    })
})

describe('ContentRowSkeleton', () => {
    it('renders without crashing', () => {
        const { container } = render(<ContentRowSkeleton />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('renders multiple card skeletons', () => {
        const { container } = render(<ContentRowSkeleton />)
        const skeletons = container.querySelectorAll('.skeleton')
        expect(skeletons.length).toBeGreaterThan(1)
    })

    it('renders title skeletons when a title is provided', () => {
        const { container } = render(<ContentRowSkeleton title="Trending Now" />)
        // Title + cards — more skeletons than without a title
        const withTitle = container.querySelectorAll('.skeleton').length

        const { container: noTitle } = render(<ContentRowSkeleton />)
        const withoutTitle = noTitle.querySelectorAll('.skeleton').length

        expect(withTitle).toBeGreaterThan(withoutTitle)
    })
})

describe('HeroSkeleton', () => {
    it('renders without crashing', () => {
        const { container } = render(<HeroSkeleton />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('contains skeleton shimmers', () => {
        const { container } = render(<HeroSkeleton />)
        expect(container.querySelector('.skeleton')).toBeInTheDocument()
    })
})

describe('DetailSkeleton', () => {
    it('renders without crashing', () => {
        const { container } = render(<DetailSkeleton />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('contains skeleton shimmers', () => {
        const { container } = render(<DetailSkeleton />)
        expect(container.querySelector('.skeleton')).toBeInTheDocument()
    })
})