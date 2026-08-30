'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, MoreVertical, ShieldCheck, Check, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/components/confirm-dialog'
import { useStaff, usePermissions, qk } from '@/lib/queries'
import { staffService } from '@/server/services'
import { avatarColor } from '@/lib/domain-styles'
import { cn } from '@/lib/utils'
import type { Role, StaffMember } from '@/types'

const ROLE_KEYS = ['Owner', 'Manager', 'Cashier', 'Kitchen'] as const
const PERM_ROWS = [
  { key: 'dash', label: 'View dashboard & reports' },
  { key: 'orders', label: 'Manage orders' },
  { key: 'menu', label: 'Edit menu & categories' },
  { key: 'pay', label: 'Process payments' },
  { key: 'refund', label: 'Issue refunds' },
  { key: 'tables', label: 'Manage tables & QR' },
  { key: 'staff', label: 'Manage staff' },
  { key: 'settings', label: 'Restaurant settings' },
]
const ROLES: Role[] = ['Owner', 'Manager', 'Cashier', 'Kitchen Supervisor']

export default function StaffPage() {
  const { data: staff, isLoading } = useStaff()
  const { data: perms } = usePermissions()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [local, setLocal] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (perms) setLocal(perms)
  }, [perms])

  const invite = useMutation({
    mutationFn: (m: Omit<StaffMember, 'id' | 'last'>) => staffService.invite(m),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.staff })
      toast.success('Invitation sent')
    },
  })
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StaffMember> }) => staffService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.staff }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => staffService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.staff })
      toast.success('Staff member removed')
    },
  })
  const savePerms = useMutation({
    mutationFn: (p: Record<string, string[]>) => staffService.setPermissions(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.permissions }),
  })

  function togglePerm(roleKey: string, permKey: string) {
    if (roleKey === 'Owner') {
      toast.message('Owner always has full access')
      return
    }
    setLocal((prev) => {
      const cur = prev[roleKey] ?? []
      const next = cur.includes(permKey) ? cur.filter((x) => x !== permKey) : [...cur, permKey]
      const updated = { ...prev, [roleKey]: next }
      savePerms.mutate(updated)
      return updated
    })
  }

  function askDelete(m: StaffMember) {
    confirm({
      title: `Remove ${m.name}?`,
      body: 'They will lose access to Hostly immediately.',
      confirmLabel: 'Remove',
      tone: 'danger',
      icon: 'trash',
      onConfirm: () => remove.mutateAsync(m.id),
    })
  }

  return (
    <PageBody className="max-w-[1180px]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Staff list */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Team members</CardTitle>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" /> Invite
            </Button>
          </CardHeader>
          <div>
            {isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              (staff ?? []).map((m, i) => {
                const active = m.status === 'Active'
                return (
                  <div key={m.id} className={cn('flex items-center gap-3 px-5 py-3.5', i !== (staff!.length - 1) && 'border-b border-line-soft')}>
                    <Avatar name={m.name} color={avatarColor(m.name)} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-ink">{m.name}</div>
                      <div className="text-[12px] text-ink-faint">{m.email}</div>
                    </div>
                    <span className="hidden text-[12.5px] font-medium text-ink-muted sm:block">{m.role}</span>
                    <Badge
                      bg={active ? '#E7F5EE' : m.status === 'Suspended' ? '#FEF2F2' : '#F3F4F6'}
                      fg={active ? '#0B7A4F' : m.status === 'Suspended' ? '#DC2626' : '#6B7280'}
                    >
                      {m.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-line-soft hover:text-ink">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {active ? (
                          <DropdownMenuItem onSelect={() => { update.mutate({ id: m.id, patch: { status: 'Suspended' } }); toast.success(`${m.name} suspended`) }}>
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => { update.mutate({ id: m.id, patch: { status: 'Active' } }); toast.success(`${m.name} reactivated`) }}>
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem destructive onSelect={() => askDelete(m)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Permission matrix */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald" /> Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[1fr_repeat(4,32px)] items-center gap-y-3 text-[12px]">
              <span />
              {ROLE_KEYS.map((r) => (
                <span key={r} className="text-center text-[10px] font-bold uppercase text-ink-faint">
                  {r[0]}
                </span>
              ))}
              {PERM_ROWS.map((row) => (
                <div key={row.key} className="contents">
                  <span className="pr-2 text-[12.5px] text-ink-muted">{row.label}</span>
                  {ROLE_KEYS.map((rk) => {
                    const locked = rk === 'Owner'
                    const on = locked || (local[rk] ?? []).includes(row.key)
                    return (
                      <button
                        key={rk}
                        onClick={() => togglePerm(rk, row.key)}
                        className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-md border-2 transition-colors"
                        style={{ background: on ? '#0EA76B' : 'var(--card)', borderColor: on ? '#0EA76B' : '#D8D7D2' }}
                        aria-label={`${rk} ${row.label}`}
                      >
                        {locked ? <Lock className="h-3 w-3 text-white" /> : on ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
              O = Owner, M = Manager, C = Cashier, K = Kitchen. Owner always retains full access.
            </p>
          </CardContent>
        </Card>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={(m) => { invite.mutate(m); setInviteOpen(false) }} />
    </PageBody>
  )
}

function InviteDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean
  onClose: () => void
  onInvite: (m: Omit<StaffMember, 'id' | 'last'>) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Cashier')

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setRole('Cashier')
    }
  }, [open])

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>Invite a teammate</DialogTitle>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@restaurant.co" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[13.5px] text-ink outline-none focus-visible:border-emerald"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!valid} onClick={() => onInvite({ name: name.trim(), email: email.trim(), role, status: 'Active' })}>
            Send invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
