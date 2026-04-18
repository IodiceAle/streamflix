import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    // Track where the pointer went down so we can tell a tap-on-backdrop
    // apart from a scroll that happens to end over the backdrop.
    const pointerDownOnBackdrop = useRef(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        if (isOpen) document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop — only closes if the pointer-down also started on the backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onPointerDown={() => { pointerDownOnBackdrop.current = true }}
                onPointerUp={() => {
                    if (pointerDownOnBackdrop.current) onClose()
                    pointerDownOnBackdrop.current = false
                }}
                onPointerMove={() => { pointerDownOnBackdrop.current = false }}
            />

            {/* Modal content — stop propagation so taps inside never hit the backdrop */}
            <div
                className={`relative w-full ${sizeClasses[size]} bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-scale-in`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}

                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                )}

                <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    )
}