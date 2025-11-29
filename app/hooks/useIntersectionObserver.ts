import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
    freezeOnceVisible?: boolean
}

/**
 * useIntersectionObserver hook for lazy loading and infinite scroll
 */
export function useIntersectionObserver(
    options: UseIntersectionObserverOptions = {}
): [(node: Element | null) => void, boolean, IntersectionObserverEntry | undefined] {
    const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options

    const [entry, setEntry] = useState<IntersectionObserverEntry>()
    const [node, setNode] = useState<Element | null>(null)

    const frozen = entry?.isIntersecting && freezeOnceVisible
    const isIntersecting = entry?.isIntersecting ?? false

    const observer = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        if (!node || frozen || !window.IntersectionObserver) return

        // Disconnect previous observer
        if (observer.current) observer.current.disconnect()

        // Create new observer
        observer.current = new IntersectionObserver(
            ([entry]) => setEntry(entry),
            { threshold, root, rootMargin }
        )

        // Observe the node
        observer.current.observe(node)

        // Cleanup
        return () => {
            if (observer.current) {
                observer.current.disconnect()
                observer.current = null
            }
        }
    }, [node, frozen, threshold, root, rootMargin])

    return [setNode, isIntersecting, entry]
}
