import { type LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-line-soft text-ink-faint">
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-[15px] font-bold text-ink">{title}</div>
      {body && <div className="max-w-xs text-[13.5px] leading-relaxed text-ink-muted">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
