'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUI } from './use-ui'
import { useAuth } from '@/features/auth/use-auth'
import { canAccessRoute } from '@/features/auth/permissions'
import { NAV_SECTIONS } from './nav-config'

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useUI((s) => s.sidebarCollapsed)
  const toggle = useUI((s) => s.toggleSidebar)
  const role = useAuth((s) => s.user?.role)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex shrink-0 flex-col overflow-hidden bg-sidebar text-white"
    >
      {/* Brand */}
      <div className="flex h-[70px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="font-display flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-emerald text-[21px] font-medium text-white">
          H
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[16px] font-bold tracking-tight">Hostly</div>
            <div className="text-[10.5px] tracking-wide text-white/45">RESTAURANT OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((it) => !role || canAccessRoute(role, it.key))
          if (items.length === 0) return null
          return (
            <div key={section.header}>
              {!collapsed && (
                <div className="px-3 pb-1.5 pt-3.5 text-[10px] font-bold tracking-[1.2px] text-white/30">
                  {section.header}
                </div>
              )}
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-[11px] px-3 py-2.5 transition-colors',
                      active ? 'bg-emerald text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                    {!collapsed && (
                      <span className="whitespace-nowrap text-[13.5px] font-semibold">{item.label}</span>
                    )}
                    {item.badge && !collapsed && (
                      <span className="ml-auto flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-amber px-1.5 text-[11px] font-bold text-graphite">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Session + collapse */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-[11px] bg-emerald/15 px-3 py-2.5">
            <span className="h-[7px] w-[7px] shrink-0 animate-ho-pulse rounded-full bg-emerald" />
            <span className="text-[11.5px] text-white/70">Secure session · 23 min</span>
          </div>
        )}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className={cn('h-5 w-5 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="whitespace-nowrap text-[13px] font-medium">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
