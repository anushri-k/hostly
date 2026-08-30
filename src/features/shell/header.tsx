'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { Search, Building2, Bell, ChevronDown, Moon, Sun, LogOut, UserCog, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUI } from './use-ui'
import { useSearch } from './use-search'
import { PAGE_META } from './nav-config'
import { useAuth } from '@/features/auth/use-auth'
import type { Role } from '@/types'

const ROLES: Role[] = ['Owner', 'Manager', 'Cashier', 'Kitchen Supervisor']

const NOTIFICATIONS = [
  { color: '#E23744', text: 'New Zomato order #8821049 · auto-accepted', time: 'Just now' },
  { color: '#F59E0B', text: 'Table 9 requested assistance', time: '2 min ago' },
  { color: '#FC8019', text: 'Swiggy order #5510742 is being prepared', time: '6 min ago' },
  { color: '#EF4444', text: 'Tomato stock below threshold', time: '20 min ago' },
  { color: '#3B82F6', text: 'Devin Cole signed in as Cashier', time: '1 hr ago' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme, branch, setBranch } = useUI()
  const { query, setQuery } = useSearch()
  const user = useAuth((s) => s.user)
  const restaurant = useAuth((s) => s.restaurant)
  const branches = useAuth((s) => s.branches)
  const logout = useAuth((s) => s.logout)
  const loginAs = useAuth((s) => s.loginAs)

  // Fall back to the restaurant's first branch if none is selected yet.
  const activeBranch = branches.some((b) => b.name === branch) ? branch : branches[0]?.name ?? branch

  const meta = useMemo(() => {
    const key = pathname.split('/')[1] || 'dashboard'
    return PAGE_META[key] ?? PAGE_META.dashboard
  }, [pathname])

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  async function handleRole(role: Role) {
    await loginAs(role)
    toast.success(`Viewing as ${role}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center gap-4 border-b border-line bg-card px-6">
      <div className="shrink-0">
        <div className="whitespace-nowrap text-[18px] font-bold tracking-tight text-ink">{meta.title}</div>
        <div className="whitespace-nowrap text-[12.5px] text-ink-faint">{meta.subtitle}</div>
      </div>

      {/* Search */}
      <div className="ml-4 flex h-[42px] w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-transparent bg-line-soft px-3.5 focus-within:border-emerald/50">
        <Search className="h-[17px] w-[17px] text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, items, tables…"
          className="flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
        />
        <span className="rounded-md border border-line-strong px-1.5 py-0.5 text-[11px] text-ink-faint">⌘K</span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Branch selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-[42px] items-center gap-2.5 rounded-xl border border-line-strong bg-card px-3.5 outline-none transition-colors hover:bg-line-soft">
            <Building2 className="h-4 w-4 text-ink-muted" />
            <span className="text-[13px] font-semibold text-ink">{activeBranch}</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{restaurant?.name ?? 'Branches'}</DropdownMenuLabel>
            {branches.map((b) => (
              <DropdownMenuItem
                key={b.id}
                onSelect={() => {
                  setBranch(b.name)
                  toast.success(`Switched to ${b.name}`)
                }}
              >
                <div className="flex-1">
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-[11px] text-ink-faint">{b.meta}</div>
                </div>
                {activeBranch === b.name && <Check className="h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line-strong bg-card outline-none transition-colors hover:bg-line-soft">
            <Bell className="h-[19px] w-[19px] text-ink" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-card bg-amber" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {NOTIFICATIONS.map((n, i) => (
              <DropdownMenuItem key={i} className="items-start">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.color }} />
                <div className="flex-1">
                  <div className="text-[12.5px] leading-snug text-ink">{n.text}</div>
                  <div className="text-[11px] text-ink-faint">{n.time}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line-strong bg-card text-ink transition-colors hover:bg-line-soft"
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-[42px] items-center gap-2.5 rounded-xl border border-line-strong bg-card py-0 pl-3 pr-1.5 outline-none transition-colors hover:bg-line-soft">
            <div className="text-right">
              <div className="text-[12.5px] font-semibold leading-tight text-ink">{user?.name ?? 'Guest'}</div>
              <div className="text-[10.5px] font-semibold text-emerald">{user?.role}</div>
            </div>
            <Avatar name={user?.name ?? 'Guest'} color="#1D1F24" size={32} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>View as role</DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem key={r} onSelect={() => handleRole(r)}>
                <UserCog className="h-4 w-4 text-ink-muted" />
                <span className="flex-1">{r}</span>
                {user?.role === r && <Check className="h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
