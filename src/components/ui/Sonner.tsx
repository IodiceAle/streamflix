import { CircleCheckIcon, OctagonXIcon, InfoIcon } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

function Toaster() {
    return (
        <Sonner
            position="top-right"
            theme="dark"
            toastOptions={{
                classNames: {
                    toast: [
                        'group flex items-start gap-3 px-4 py-3',
                        'bg-surface-elevated/95 backdrop-blur-xl border border-white/10',
                        'rounded-xl shadow-2xl text-white',
                        'data-[type=success]:border-green-500/30',
                        'data-[type=error]:border-red-500/30',
                        'data-[type=info]:border-blue-500/30',
                    ].join(' '),
                    title: 'text-sm font-medium text-white',
                    description: 'text-xs text-text-muted',
                    closeButton: [
                        'text-text-muted hover:text-white transition-colors',
                        '!bg-transparent !border-0 !shadow-none',
                    ].join(' '),
                    actionButton: 'bg-brand text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors',
                    cancelButton: 'bg-surface-hover text-text-secondary text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-surface-card transition-colors',
                    icon: 'flex-shrink-0',
                },
            }}
            icons={{
                success: <CircleCheckIcon className="w-4 h-4 text-green-400" />,
                error: <OctagonXIcon className="w-4 h-4 text-red-400" />,
                info: <InfoIcon className="w-4 h-4 text-blue-400" />,
            }}
            style={{ '--offset': '1rem', '--width': '360px' } as React.CSSProperties}
        />
    )
}

export { Toaster }