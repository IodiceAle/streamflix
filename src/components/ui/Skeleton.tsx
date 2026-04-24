interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    // Note: the base .skeleton class provides the shimmer background.
    // Specific border radiuses are added via className.
    return <div className={`skeleton ${className}`} />
}

export function ContentCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[130px] sm:w-[145px] md:w-[160px] lg:w-[180px] 3xl:w-[200px]">
            <div className="aspect-poster relative overflow-hidden rounded-xl border border-white/5">
                <Skeleton className="absolute inset-0 w-full h-full" />
            </div>
        </div>
    )
}

export function ContentRowSkeleton({ title = '' }: { title?: string }) {
    return (
        <div className="relative group/row py-4 mb-4">
            {title && (
                <div className="flex items-end justify-between px-4 md:px-8 mb-4">
                    <div>
                        <Skeleton className="h-2.5 sm:h-3 w-16 mb-2 rounded" />
                        <Skeleton className="h-6 sm:h-7 md:h-8 w-48 sm:w-64 rounded-lg" />
                    </div>
                </div>
            )}
            <div className="flex gap-3 md:gap-4 lg:gap-5 px-4 md:px-8 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export function HeroSkeleton() {
    return (
        <div className="relative w-full min-h-[50vh] sm:min-h-[55vh] md:min-h-[70vh] lg:min-h-[80vh] bg-black overflow-hidden group">
            <Skeleton className="absolute inset-0" />
            
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface via-surface/60 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 bg-gradient-to-r from-surface/95 via-surface/50 to-transparent pointer-events-none z-10" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 lg:p-16 pb-8 sm:pb-12 md:pb-16 pointer-events-none z-20">
                <Skeleton className="h-10 sm:h-14 md:h-16 lg:h-20 w-3/4 max-w-2xl rounded-xl mb-4 sm:mb-5" />
                
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <Skeleton className="h-5 sm:h-6 w-16 rounded-md" />
                    <Skeleton className="h-5 sm:h-6 w-12 rounded-md" />
                    <Skeleton className="h-5 sm:h-6 w-20 rounded-md" />
                </div>
                
                <div className="space-y-3 mb-6 sm:mb-8 hidden sm:block">
                    <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                    <Skeleton className="h-4 w-11/12 max-w-lg rounded-full" />
                    <Skeleton className="h-4 w-4/5 max-w-md rounded-full" />
                </div>
                
                <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Skeleton className="h-10 sm:h-12 w-28 sm:w-32 rounded-full" />
                    <Skeleton className="h-10 sm:h-12 w-32 sm:w-36 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-surface pb-24">
            {/* Hero Section */}
            <div className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-[3/1] max-h-[70vh] bg-black overflow-hidden">
                <Skeleton className="absolute inset-0" />
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10" />
            </div>

            {/* Content Container */}
            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto -mt-32 md:-mt-48 relative z-20">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12">
                    {/* Poster */}
                    <div className="hidden md:block w-48 md:w-64 lg:w-72 flex-shrink-0">
                        <div className="aspect-poster rounded-2xl overflow-hidden shadow-2xl bg-surface-card border border-white/5">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 pt-4 md:pt-12">
                        <Skeleton className="h-8 md:h-12 w-3/4 max-w-lg rounded-xl mb-4" />
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <Skeleton className="h-6 w-20 rounded-md" />
                            <Skeleton className="h-6 w-24 rounded-md" />
                        </div>

                        <div className="flex gap-3 mb-8">
                            <Skeleton className="h-12 md:h-14 w-32 md:w-36 rounded-full" />
                            <Skeleton className="h-12 md:h-14 w-12 md:w-14 rounded-full" />
                            <Skeleton className="h-12 md:h-14 w-12 md:w-14 rounded-full" />
                        </div>

                        <div className="space-y-3 mb-8">
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-11/12 rounded-full" />
                            <Skeleton className="h-4 w-4/5 rounded-full" />
                            <Skeleton className="h-4 w-2/3 rounded-full" />
                        </div>
                    </div>
                </div>
                
                {/* Episodes / Cast row */}
                <div className="mt-12">
                    <Skeleton className="h-6 md:h-8 w-32 md:w-48 rounded-lg mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="aspect-poster rounded-xl overflow-hidden border border-white/5">
                                <Skeleton className="w-full h-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
