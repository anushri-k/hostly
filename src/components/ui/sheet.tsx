'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Right-side drawer built on Radix Dialog — used for order / payment / table detail. */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { width?: number }
>(({ className, children, width = 460, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-graphite/40 backdrop-blur-[1px] data-[state=open]:animate-ho-fade" />
    <DialogPrimitive.Content
      ref={ref}
      style={{ width }}
      className={cn(
        'fixed right-0 top-0 z-50 flex h-full max-w-[calc(100vw-24px)] flex-col bg-card shadow-drawer transition-transform data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 data-[state=open]:duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export function SheetHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-3 border-b border-line p-5', className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink">
        <X className="h-4.5 w-4.5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </div>
  )
}

export function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-[18px] font-bold text-ink', className)} {...props} />
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-[12.5px] text-ink-muted', className)} {...props} />
}
