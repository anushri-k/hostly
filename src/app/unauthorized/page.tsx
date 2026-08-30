'use client'

import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'

export default function UnauthorizedPage() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-1 bg-canvas px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-tint">
        <ShieldX className="h-8 w-8 text-danger" />
      </div>
      <h1 className="text-[22px] font-bold text-ink">Access restricted</h1>
      <p className="max-w-sm text-[14px] leading-relaxed text-ink-muted">
        Your role{user ? ` (${user.role})` : ''} doesn&apos;t have permission to view this page. Ask an
        owner or manager to grant access.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => { logout(); router.replace('/login') }}>
          Switch account
        </Button>
        <Button onClick={() => router.replace('/dashboard')}>Back to dashboard</Button>
      </div>
    </div>
  )
}
