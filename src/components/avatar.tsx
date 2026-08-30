import { cn } from '@/lib/utils'
import { initials as toInitials } from '@/lib/utils'

export function Avatar({
  name,
  color,
  size = 32,
  className,
}: {
  name: string
  color?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', className)}
      style={{
        width: size,
        height: size,
        background: color ?? '#1D1F24',
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {toInitials(name)}
    </div>
  )
}
