import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Inline colors from the domain style maps. */
  bg?: string
  fg?: string
  dot?: string
}

/** A pill badge driven by explicit colors (the design uses many tinted states). */
export function Badge({ className, bg, fg, dot, style, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
        className,
      )}
      style={{ background: bg, color: fg, ...style }}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dot }}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}
