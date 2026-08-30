'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef, type RowSelectionState, type VisibilityState } from '@tanstack/react-table'
import { SlidersHorizontal, ScrollText, Bookmark, Printer, ChefHat, Ban } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/components/avatar'
import { DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderDrawer } from '@/features/orders/order-drawer'
import { useSetOrderStatus } from '@/features/orders/hooks'
import { useConfirm } from '@/components/confirm-dialog'
import { useOrders } from '@/lib/queries'
import { useSearch } from '@/features/shell/use-search'
import { money0 } from '@/lib/format'
import { cn } from '@/lib/utils'
import { statusStyle, payStyle, channelStyle, isAggregator, avatarColor } from '@/lib/domain-styles'
import type { Channel, Order } from '@/types'
import { toast } from 'sonner'

type Tab = 'all' | 'active' | 'unpaid' | 'done'
const TAB_FILTER: Record<Tab, (o: Order) => boolean> = {
  all: () => true,
  active: (o) => ['New', 'Preparing', 'Ready'].includes(o.status),
  unpaid: (o) => o.payment === 'Unpaid',
  done: (o) => o.status === 'Completed',
}
const CHANNELS: (Channel | 'all')[] = ['all', 'Dine-in', 'Takeaway', 'Zomato', 'Swiggy']

const COLUMN_LABELS: Record<string, string> = {
  customer: 'Customer',
  items: 'Items',
  staff: 'Staff',
  payment: 'Payment',
  time: 'Time',
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const { query } = useSearch()
  const confirm = useConfirm()
  const setStatus = useSetOrderStatus()

  const [tab, setTab] = useState<Tab>('all')
  const [channel, setChannel] = useState<Channel | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [savedFilters, setSavedFilters] = useState<{ name: string; tab: Tab; channel: Channel | 'all' }[]>([])

  const all = orders ?? []
  const counts = {
    all: all.length,
    active: all.filter(TAB_FILTER.active).length,
    unpaid: all.filter(TAB_FILTER.unpaid).length,
    done: all.filter(TAB_FILTER.done).length,
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter(TAB_FILTER[tab])
      .filter((o) => channel === 'all' || o.channel === channel)
      .filter(
        (o) =>
          !q ||
          o.id.toLowerCase().includes(q) ||
          o.table.toLowerCase().includes(q) ||
          (o.ext || '').includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q)),
      )
  }, [all, tab, channel, query])

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns: ColumnDef<Order, unknown>[] = [
    {
      id: 'select',
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
        </div>
      ),
    },
    { accessorKey: 'id', header: 'Order', cell: ({ row }) => <span className="font-semibold text-ink">{row.original.id}</span> },
    { accessorKey: 'table', header: 'Table', cell: ({ row }) => <span className="text-ink-muted">{row.original.table}</span> },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const o = row.original
        return <span className="text-ink">{isAggregator(o.channel) ? `${o.channel} · ${o.customer}` : o.customer}</span>
      },
    },
    {
      accessorKey: 'channel',
      header: 'Type',
      cell: ({ row }) => {
        const cs = channelStyle(row.original.channel)
        return (
          <Badge bg={cs.bg} fg={cs.fg} dot={cs.dot}>
            {row.original.channel}
          </Badge>
        )
      },
    },
    {
      id: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-ink-muted">{row.original.items.reduce((a, i) => a + i.qty, 0)}</span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      accessorFn: (o) => o.items.reduce((a, i) => a + i.price * i.qty, 0) * 1.15 - (o.discount || 0),
      cell: ({ getValue }) => <span className="font-semibold text-ink">{money0(getValue() as number)}</span>,
    },
    {
      accessorKey: 'staff',
      header: 'Staff',
      cell: ({ row }) => {
        const o = row.original
        if (isAggregator(o.channel)) return <span className="text-ink-faint">Auto</span>
        return (
          <div className="flex items-center gap-2">
            <Avatar name={o.staff} color={avatarColor(o.staff)} size={24} />
            <span className="text-ink">{o.staff.split(' ')[0]}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const ss = statusStyle(row.original.status)
        return (
          <Badge bg={ss.bg} fg={ss.fg} dot={ss.dot}>
            {row.original.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      cell: ({ row }) => {
        const ps = payStyle(row.original.payment)
        return (
          <Badge bg={ps.bg} fg={ps.fg}>
            {row.original.payment}
          </Badge>
        )
      },
    },
    { accessorKey: 'time', header: 'Time', cell: ({ row }) => <span className="text-ink-muted">{row.original.time}</span> },
  ]

  const openOrder = openId ? all.find((o) => o.id === openId) ?? null : null

  function bulkMark() {
    selectedIds.forEach((id) => setStatus.mutate({ id, status: 'Preparing' }))
    setRowSelection({})
  }
  function bulkCancel() {
    confirm({
      title: `Cancel ${selectedIds.length} orders?`,
      body: 'The selected orders will be voided and the kitchen notified. This cannot be undone.',
      confirmLabel: 'Cancel orders',
      tone: 'danger',
      onConfirm: async () => {
        await Promise.all(selectedIds.map((id) => setStatus.mutateAsync({ id, status: 'Cancelled' })))
        setRowSelection({})
      },
    })
  }

  return (
    <PageBody className="max-w-[1320px]">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-line-soft p-1">
          {(['all', 'active', 'unpaid', 'done'] as Tab[]).map((t) => {
            const label = { all: 'All', active: 'Active', unpaid: 'Unpaid', done: 'Completed' }[t]
            const on = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                  on ? 'bg-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
                )}
              >
                {label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] font-bold',
                    on ? 'bg-emerald text-white' : 'bg-line-strong text-ink-muted',
                  )}
                >
                  {counts[t]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Saved filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4" /> Saved
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Saved filters</DropdownMenuLabel>
              {savedFilters.length === 0 && <div className="px-3 py-2 text-[12.5px] text-ink-faint">None yet</div>}
              {savedFilters.map((f, i) => (
                <DropdownMenuItem
                  key={i}
                  onSelect={() => {
                    setTab(f.tab)
                    setChannel(f.channel)
                  }}
                >
                  {f.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onSelect={() => {
                  const name = `${tab} · ${channel}`
                  setSavedFilters((s) => [...s.filter((x) => x.name !== name), { name, tab, channel }])
                  toast.success('Filter saved')
                }}
              >
                + Save current
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onSelect={(e) => {
                    e.preventDefault()
                    setColumnVisibility((v) => ({ ...v, [key]: v[key] === false ? true : false }))
                  }}
                >
                  <Checkbox checked={columnVisibility[key] !== false} className="pointer-events-none" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Channel chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CHANNELS.map((c) => {
          const on = channel === c
          const cs = c === 'all' ? null : channelStyle(c)
          return (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                on ? 'border-transparent text-white' : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
              )}
              style={on ? { background: cs ? cs.dot : '#1D1F24' } : undefined}
            >
              {cs && <span className="h-2 w-2 rounded-full" style={{ background: on ? '#fff' : cs.dot }} />}
              {c === 'all' ? 'All channels' : c}
            </button>
          )
        })}
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald-tint px-4 py-2.5 animate-ho-rise">
          <span className="text-[13px] font-semibold text-emerald-dark">{selectedIds.length} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={bulkMark}>
              <ChefHat className="h-4 w-4" /> Mark preparing
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success(`${selectedIds.length} tickets printed`)}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button size="sm" variant="dangerSoft" onClick={bulkCancel}>
              <Ban className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(o) => o.id}
            onRowClick={(o) => setOpenId(o.id)}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSize={9}
            emptyState={
              <EmptyState icon={ScrollText} title="No orders here" body="Try a different tab, channel or search." />
            }
          />
        )}
      </Card>

      <OrderDrawer order={openOrder} onClose={() => setOpenId(null)} />
    </PageBody>
  )
}
