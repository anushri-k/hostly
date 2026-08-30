import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-faint focus-visible:border-emerald focus-visible:ring-2 focus-visible:ring-emerald/20 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-faint focus-visible:border-emerald focus-visible:ring-2 focus-visible:ring-emerald/20 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
