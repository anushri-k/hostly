'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Users, Repeat, Wallet, Heart, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/input'
import { PageBody } from '@/components/page'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useCustomers, useOrders } from '@/lib/queries'
import { useSearch } from '@/features/shell/use-search'
import { money, money0 } from '@/lib/format'
import { tierStyle, avatarColor } from '@/lib/domain-styles'
import { cn } from '@/lib/utils'
import type { Customer, CustomerTier, Order } from '@/types'
import { toast } from 'sonner'

const TIERS: (CustomerTier | 'All')[] = ['All', 'Gold', 'Silver', 'Member']

export default function CustomersPage() {
  const { data, isLoading } = useCustomers()
  const { data: orders } = useOrders()
  const { query } = useSearch()
  const [tier, setTier] = useState<CustomerTier | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? [])
      .filter((c) => tier === 'All' || c.tier === tier)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  }, [data, tier, query])

  const open = openId ? (data ?? []).find((c) => c.id === openId) ?? null : null

  const columns: ColumnDef<Customer, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} color={avatarColor(row.original.name)} size={32} />
          <div>
            <div className="font-semibold text-ink">{row.original.name}</div>
            <div className="text-[12px] text-ink-faint">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: 'visits', header: 'Visits', cell: ({ row }) => <span className="text-ink-muted">{row.original.visits}</span> },
    { accessorKey: 'spend', header: 'Lifetime spend', cell: ({ row }) => <span className="font-semibold text-ink">{money0(row.original.spend)}</span> },
    { accessorKey: 'last', header: 'Last visit', cell: ({ row }) => <span className="text-ink-muted">{row.original.last}</span> },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) => {
        const ts = tierStyle[row.original.tier]
        return <Badge bg={ts.bg} fg={ts.fg}>{row.original.tier}</Badge>
      },
    },
  ]

  return (
    <PageBody>
      <div className="mb-4 flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
              tier === t ? 'border-graphite bg-graphite text-white' : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(c) => c.id}
            onRowClick={(c) => setOpenId(c.id)}
            pageSize={8}
            emptyState={<EmptyState icon={Users} title="No customers" body="Guests appear here once they place an order." />}
          />
        )}
      </Card>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent width={460}>{open && <CustomerDetail customer={open} orders={orders ?? []} />}</SheetContent>
      </Sheet>
    </PageBody>
  )
}

function CustomerDetail({ customer, orders }: { customer: Customer; orders: Order[] }) {
  const ts = tierStyle[customer.tier]
  // Match a few orders to this customer by name fragment for the demo history.
  const history = orders.filter((o) => {
    const last = customer.name.split(' ')[1]?.[0]
    return o.customer.includes(customer.name.split(' ')[0]) || (last && o.customer.includes(last + '.'))
  })
  const favourites = ['Plato Burger', 'Truffle Fries', 'Flat White']

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} color={avatarColor(customer.name)} size={44} />
          <div>
            <SheetTitle>{customer.name}</SheetTitle>
            <SheetDescription>{customer.email}</SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={Repeat} label="Visits" value={String(customer.visits)} />
          <MiniStat icon={Wallet} label="Spend" value={money0(customer.spend)} />
          <MiniStat icon={Heart} label="Tier" value={customer.tier} tint={ts.fg} />
        </div>

        <Section title="Favourite items">
          <div className="flex flex-wrap gap-2">
            {favourites.map((f) => (
              <span key={f} className="rounded-full bg-line-soft px-3 py-1.5 text-[12.5px] font-medium text-ink">
                {f}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Recent orders">
          {history.length === 0 ? (
            <p className="text-[13px] text-ink-faint">No recent orders on file.</p>
          ) : (
            <div className="rounded-2xl border border-line">
              {history.map((o, i) => (
                <div key={o.id} className={cn('flex items-center justify-between px-4 py-3', i !== history.length - 1 && 'border-b border-line-soft')}>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{o.id}</div>
                    <div className="text-[12px] text-ink-faint">{o.time} · {o.items.length} items</div>
                  </div>
                  <span className="text-[13.5px] font-semibold text-ink">
                    {money(o.items.reduce((a, it) => a + it.price * it.qty, 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Notes">
          <Textarea placeholder="Add a private note about this guest…" />
        </Section>
      </div>
      <div className="border-t border-line p-4">
        <Button className="w-full" onClick={() => toast.success('Note saved')}>
          Save note
        </Button>
      </div>
    </>
  )
}

function MiniStat({ icon: Icon, label, value, tint }: { icon: LucideIcon; label: string; value: string; tint?: string }) {
  return (
    <div className="rounded-2xl border border-line p-3">
      <Icon className="h-4 w-4 text-ink-faint" />
      <div className="mt-2 text-[15px] font-bold" style={{ color: tint ?? 'var(--ink)' }}>
        {value}
      </div>
      <div className="text-[11px] text-ink-faint">{label}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">{title}</div>
      {children}
    </div>
  )
}
