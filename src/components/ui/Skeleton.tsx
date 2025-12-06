interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton rounded ${className}`} />
}

export function ContentCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] xl:w-[250px]">
            <div className="aspect-poster">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
        </div>
    )
}

export function ContentRowSkeleton({ title = '' }: { title?: string }) {
    return (
        <div className="mb-8">
            {title && (
                <div className="px-4 mb-3">
                    <Skeleton className="h-6 w-48" />
                </div>
            )}
            <div className="flex gap-2 sm:gap-3 md:gap-4 px-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export function HeroSkeleton() {
    return (
        <div className="relative w-full aspect-[16/9] max-h-[70vh]">
            <Skeleton className="absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-4 w-3/4 max-w-lg" />
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-12 w-32 rounded-md" />
                    <Skeleton className="h-12 w-32 rounded-md" />
                </div>
            </div>
        </div>
    )
}

export function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-surface">
            <HeroSkeleton />
            <div className="p-4 space-y-6">
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <Skeleton className="h-12 w-12 rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
            </div>
        </div>
    )
}
