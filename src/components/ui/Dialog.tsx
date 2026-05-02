import * as React from 'react'
import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger {...props} />
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in',
                className
            )}
            {...props}
        />
    )
}

function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                    'w-full max-w-lg',
                    'bg-surface-elevated border border-white/10 rounded-2xl shadow-2xl',
                    'animate-scale-in',
                    'focus:outline-none',
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand">
                        <XIcon className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex items-center justify-between px-5 py-4 border-b border-white/10', className)}
            {...props}
        />
    )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn('text-lg font-semibold text-white', className)}
            {...props}
        />
    )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            className={cn('text-sm text-text-muted', className)}
            {...props}
        />
    )
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('p-5 max-h-[70vh] overflow-y-auto', className)} {...props} />
    )
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
}