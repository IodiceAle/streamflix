import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Switch({
    className,
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            className={cn(
                'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
                'border-2 border-transparent shadow-sm',
                'transition-colors duration-200 ease-in-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-hover',
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
                    'transition-transform duration-200 ease-in-out',
                    'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
                )}
            />
        </SwitchPrimitive.Root>
    )
}

export { Switch }