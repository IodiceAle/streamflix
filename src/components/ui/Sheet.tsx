import * as React from 'react'
import { XIcon } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close {...props} />
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
                'data-[state=open]:animate-fade-in data-[state=closed]:opacity-0 transition-opacity duration-300',
                className
            )}
            {...props}
        />
    )
}

const sideStyles: Record<string, string> = {
    top: 'inset-x-0 top-0 border-b rounded-b-2xl data-[state=open]:animate-slide-down',
    bottom: 'inset-x-0 bottom-0 border-t rounded-t-2xl data-[state=open]:animate-slide-up',
    left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r rounded-r-2xl data-[state=open]:animate-slide-in-right',
    right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l rounded-l-2xl data-[state=open]:animate-slide-in-right',
}

function SheetContent({
    className,
    children,
    side = 'bottom',
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
    side?: 'top' | 'right' | 'bottom' | 'left'
    showCloseButton?: boolean
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                className={cn(
                    'fixed z-50 flex flex-col',
                    'bg-surface-elevated border-white/10',
                    'shadow-2xl transition ease-in-out duration-300',
                    'focus:outline-none',
                    sideStyles[side],
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <SheetPrimitive.Close className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand">
                        <XIcon className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </SheetPrimitive.Close>
                )}
            </SheetPrimitive.Content>
        </SheetPortal>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0', className)}
            {...props}
        />
    )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            className={cn('text-base font-semibold text-white', className)}
            {...props}
        />
    )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
    return (
        <SheetPrimitive.Description
            className={cn('text-sm text-text-muted px-5', className)}
            {...props}
        />
    )
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex-1 overflow-y-auto px-5 py-4', className)} {...props} />
    )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex flex-col gap-2 px-5 py-4 border-t border-white/10 flex-shrink-0', className)} {...props} />
    )
}

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetBody,
    SheetFooter,
}