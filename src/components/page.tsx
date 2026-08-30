import { cn } from '@/lib/utils'

/** Standard page padding + max width. */
export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto max-w-[1180px] p-6', className)} {...props} />
}

/** A section heading inside a page. */
export function SectionTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[11px] font-bold uppercase tracking-wide text-ink-faint', className)}
      {...props}
    />
  )
}
