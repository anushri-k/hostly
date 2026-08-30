'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/features/shell/sidebar'
import { Header } from '@/features/shell/header'
import { ConfirmDialogHost } from '@/components/confirm-dialog'
import { useAuth } from '@/features/auth/use-auth'
import { canAccessRoute } from '@/features/auth/permissions'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, hydrated } = useAuth()

  const routeKey = pathname.split('/')[1] || 'dashboard'
  const allowed = user ? canAccessRoute(user.role, routeKey) : false

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace('/login')
    } else if (!allowed) {
      router.replace('/unauthorized')
    }
  }, [hydrated, user, allowed, router])

  // Avoid a flash of protected content before the session is known.
  if (!hydrated || !user || !allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="font-display flex h-12 w-12 animate-ho-pulse items-center justify-center rounded-2xl bg-emerald text-2xl text-white">
          H
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <ConfirmDialogHost />
    </div>
  )
}
