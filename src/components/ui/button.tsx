'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-emerald text-white hover:bg-emerald-dark',
        graphite: 'bg-graphite text-white hover:bg-graphite/90',
        outline:
          'border border-line-strong bg-card text-ink hover:bg-line-soft',
        ghost: 'text-ink-muted hover:bg-line-soft hover:text-ink',
        danger: 'bg-danger text-white hover:bg-danger-dark',
        dangerSoft: 'bg-danger-tint text-danger-dark hover:bg-danger-tint/70',
      },
      size: {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
