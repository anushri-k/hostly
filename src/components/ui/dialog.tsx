'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

function Overlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-graphite/40 backdrop-blur-[1px] data-[state=open]:animate-ho-fade',
        className,
      )}
      {...props}
    />
  )
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <Overlay />
    {/* Flex wrapper centers the modal; the content's scale animation can't
        clobber positioning (translate-based centering would). */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'relative w-[440px] max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-card p-6 shadow-pop data-[state=open]:animate-ho-pop',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </div>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-[17px] font-bold text-ink', className)} {...props} />
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('mt-1.5 text-[13.5px] leading-relaxed text-ink-muted', className)} {...props} />
}
