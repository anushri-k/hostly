'use client'

import { toast } from 'sonner'
import { ChevronRight, Printer, UserPlus, PackageOpen, Ban } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/components/confirm-dialog'
import { money, money0 } from '@/lib/format'
import { statusStyle, payStyle, channelStyle, isAggregator, avatarColor } from '@/lib/domain-styles'
import { orderTotals } from '@/server/services'
import { staff as staffSeed } from '@/server/seed'
import type { Order, OrderStatus } from '@/types'
import { useAdvanceOrder, useAssignStaff, useConvertTakeaway, useSetOrderStatus } from './hooks'

const FLOW: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Served', 'Completed']
const TIMELINE: [OrderStatus, string][] = [
  ['New', 'Order received'],
  ['Preparing', 'Kitchen started'],
  ['Ready', 'Plated up'],
  ['Served', 'Delivered to table'],
  ['Completed', 'Closed out'],
]
const TIMES = ['12:04', '12:07', '12:18', '12:24', '12:40']

export function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const confirm = useConfirm()
  const advance = useAdvanceOrder()
  const setStatus = useSetOrderStatus()
  const convert = useConvertTakeaway()
  const assign = useAssignStaff()

  if (!order) return <Sheet open={false} onOpenChange={(o) => !o && onClose()} />

  const o = order
  const ss = statusStyle(o.status)
  const ps = payStyle(o.payment)
  const cs = channelStyle(o.channel)
  const agg = isAggregator(o.channel)
  const totals = orderTotals(o)
  const fi = FLOW.indexOf(o.status)
  const cancelled = o.status === 'Cancelled'
  const advanceLabel = fi >= 0 && fi < FLOW.length - 1 ? `Mark ${FLOW[fi + 1]}` : cancelled ? 'Order cancelled' : 'Completed'
  const canAdvance = fi >= 0 && fi < FLOW.length - 1 && !cancelled
  const commissionAmt = agg ? totals.total * (o.commission || 0.18) : 0

  function handleCancel() {
    confirm({
      title: 'Cancel this order?',
      body: `This will void ${o.id} and notify the kitchen. This cannot be undone.`,
      confirmLabel: 'Cancel order',
      tone: 'danger',
      icon: 'alert',
      onConfirm: async () => {
        await setStatus.mutateAsync({ id: o.id, status: 'Cancelled' })
        onClose()
      },
    })
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent width={460}>
        <SheetHeader>
          <div>
            <div className="flex items-center gap-2.5">
              <SheetTitle>{o.id}</SheetTitle>
              <Badge bg={ss.bg} fg={ss.fg} dot={ss.dot}>
                {o.status}
              </Badge>
            </div>
            <SheetDescription>
              {agg ? `${o.channel} delivery` : `${o.table} · ${o.type}`} · {o.time}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <MetaCard label={agg ? 'FULFILMENT' : 'SERVER'}>
              <div className="flex items-center gap-2">
                <Avatar name={agg ? o.channel : o.staff} color={agg ? cs.dot : avatarColor(o.staff)} size={26} />
                <span className="text-[13px] font-semibold text-ink">{agg ? 'Auto-accept' : o.staff}</span>
              </div>
            </MetaCard>
            <MetaCard label="PAYMENT">
              <Badge bg={ps.bg} fg={ps.fg}>
                {o.payment}
              </Badge>
            </MetaCard>
          </div>

          {/* Items */}
          <div className="mt-5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Items</div>
            <div className="rounded-2xl border border-line">
              {o.items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: i === o.items.length - 1 ? 'none' : '1px solid var(--line-soft)' }}
                >
                  <span className="text-[13px] font-bold text-emerald">{it.qty}×</span>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-ink">{it.name}</div>
                    {it.mods && <div className="text-[12px] text-ink-faint">{it.mods}</div>}
                  </div>
                  <span className="text-[13.5px] font-semibold text-ink">{money0(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill */}
          <div className="mt-4 space-y-2 rounded-2xl border border-line p-4">
            <Row label="Subtotal" value={money(totals.sub)} />
            <Row label="Tax (5%)" value={money(totals.tax)} />
            <Row label="Service (10%)" value={money(totals.service)} />
            {totals.disc > 0 && <Row label="Discount" value={`−${money(totals.disc)}`} />}
            {agg && (
              <Row
                label={`${o.channel} commission (${Math.round((o.commission || 0.18) * 100)}%)`}
                value={`−${money(commissionAmt)}`}
              />
            )}
            <div className="mt-1 border-t border-line pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-ink">{agg ? 'Payout' : 'Total'}</span>
                <span className="text-[18px] font-bold text-ink">
                  {money(agg ? totals.total - commissionAmt : totals.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Timeline</div>
            {TIMELINE.map(([st, label], i) => {
              const done = !cancelled && i <= fi
              const active = i === fi && !cancelled
              const last = i === TIMELINE.length - 1
              return (
                <div key={st} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                      style={{
                        background: done ? '#0EA76B' : 'var(--card)',
                        borderColor: done || active ? '#0EA76B' : '#E5E4E0',
                      }}
                    >
                      {done && <ChevronRight className="hidden" />}
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : active ? (
                        <span className="h-2 w-2 rounded-full bg-emerald" />
                      ) : null}
                    </div>
                    {!last && (
                      <div className="my-0.5 w-0.5 flex-1" style={{ background: done ? '#0EA76B' : '#EDECE8' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div
                      className="text-[13.5px] font-semibold"
                      style={{ color: done || active ? 'var(--ink)' : 'var(--ink-faint)' }}
                    >
                      {label}
                    </div>
                    <div className="text-[12px] text-ink-faint">{done ? TIMES[i] : 'Pending'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-line p-4">
          <div className="mb-2.5 flex gap-2">
            <Button
              className="flex-1"
              disabled={!canAdvance || advance.isPending}
              onClick={() => advance.mutate({ id: o.id })}
            >
              {advanceLabel}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <UserPlus className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Assign staff</DropdownMenuLabel>
                {staffSeed
                  .filter((s) => s.role !== 'Owner')
                  .map((s) => (
                    <DropdownMenuItem key={s.id} onSelect={() => assign.mutate({ id: o.id, staff: s.name })}>
                      <Avatar name={s.name} color={avatarColor(s.name)} size={22} />
                      {s.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success(agg ? 'Kitchen ticket printed' : 'Receipt sent to printer')}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            {!agg && o.type !== 'Takeaway' && !cancelled && (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => convert.mutate({ id: o.id })}>
                <PackageOpen className="h-4 w-4" /> Takeaway
              </Button>
            )}
            {!cancelled && (
              <Button variant="dangerSoft" size="sm" className="flex-1" onClick={handleCancel}>
                <Ban className="h-4 w-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line p-3.5">
      <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">{label}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}
