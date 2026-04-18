interface LogoProps {
    /** Show only the square mark, no wordmark */
    markOnly?: boolean
    /** Height of the mark in px. Wordmark scales proportionally. */
    size?: number
    className?: string
}

export function Logo({ markOnly = false, size = 28, className = '' }: LogoProps) {
    const mark = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="flex-shrink-0"
        >
            {/* Background */}
            <rect width="64" height="64" rx="14" fill="#0D0D16" />

            {/* Film strip perforations — top */}
            <rect x="11" y="4" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="24" y="4" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="37" y="4" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="50" y="4" width="6" height="9" rx="2" fill="#1C1C2C" />

            {/* Film strip perforations — bottom */}
            <rect x="11" y="51" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="24" y="51" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="37" y="51" width="6" height="9" rx="2" fill="#1C1C2C" />
            <rect x="50" y="51" width="6" height="9" rx="2" fill="#1C1C2C" />

            {/* Red disc */}
            <circle cx="32" cy="34" r="20" fill="#E50914" />
            <circle cx="32" cy="34" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* White play triangle */}
            <path d="M26 24 L26 44 L46 34 Z" fill="white" />
        </svg>
    )

    if (markOnly) return <span className={className}>{mark}</span>

    const wordmarkSize = Math.round(size * 0.64)

    return (
        <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            {mark}
            <span
                className="font-black tracking-tight leading-none"
                style={{ fontSize: wordmarkSize }}
            >
                <span className="text-white">STREAM</span>
                <span className="text-[#E50914]">FLIX</span>
            </span>
        </span>
    )
}