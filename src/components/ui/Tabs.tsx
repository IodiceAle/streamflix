import * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            className={cn(
                'flex gap-1 p-1 bg-surface-card rounded-xl',
                className
            )}
            {...props}
        />
    )
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg',
                'text-sm font-semibold transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface-card',
                'disabled:pointer-events-none disabled:opacity-50',
                'text-text-secondary hover:text-white',
                'data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md',
                className
            )}
            {...props}
        >
            {children}
        </TabsPrimitive.Trigger>
    )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            className={cn('focus-visible:outline-none', className)}
            {...props}
        />
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }