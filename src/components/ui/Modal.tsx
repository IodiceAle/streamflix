import { type ReactNode } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100%-2rem)]',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent
                className={cn(sizeClasses[size])}
                showCloseButton={!title}
            >
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}
                <DialogBody className={!title ? 'pt-8' : ''}>
                    {children}
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}