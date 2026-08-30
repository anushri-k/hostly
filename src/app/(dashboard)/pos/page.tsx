'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Plus, Minus, X, Receipt, Tag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useMenu, useCategories, useTables, useSettings, qk } from '@/lib/queries'
import { posService, type PosLine } from '@/server/services'
import { useAuth } from '@/features/auth/use-auth'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import { tagColor } from '@/lib/domain-styles'
import type { MenuItem, PayMethod } from '@/types'

const PAY_METHODS: PayMethod[] = ['Card', 'UPI', 'Cash', 'Wallet', 'Split']
const TIP_PRESETS = [
  { label: 'None', pct: 0 },
  { label: '10%', pct: 0.1 },
  { label: '15%', pct: 0.15 },
  { label: '20%', pct: 0.2 },
]

const lineKey = (id: string, size?: string) => `${id}__${size ?? 'base'}`

// Categories served in plate portions by default (matches the design).
const PORTION_CATS = ['Starters', 'Mains']

interface Portion {
  key: string
  label: string
  short: string
  frac: string
  price: number
  desc: string
}

/**
 * Plate sizes for an item, or null if it's sold as a single portion.
 * An item with explicit `sizes` (set in Menu Management) uses those; otherwise
 * Starters & Mains get ¼ / ½ / Full plates priced from the base.
 */
function portionsFor(item: MenuItem): Portion[] | null {
  if (item.sizes?.length) {
    return item.sizes.map((s) => ({
      key: s.name,
      label: s.name,
      short: s.name,
      frac: s.name[0]?.toUpperCase() ?? '•',
      price: s.price,
      desc: '',
    }))
  }
  if (PORTION_CATS.includes(item.cat)) {
    const b = item.price
    return [
      { key: 'quarter', label: 'Quarter plate', short: 'Quarter', frac: '¼', price: Math.max(1, Math.round(b * 0.35)), desc: 'Light bite · serves 1' },
      { key: 'half', label: 'Half plate', short: 'Half', frac: '½', price: Math.max(1, Math.round(b * 0.6)), desc: 'For sharing · serves 1–2' },
      { key: 'full', label: 'Full plate', short: 'Full', frac: '1', price: b, desc: 'Hearty · serves 2–3' },
    ]
  }
  return null
}

export default function PosPage() {
  const { data: menu, isLoading } = useMenu()
  const { data: categories } = useCategories()
  const { data: tables } = useTables()
  const { data: settings } = useSettings()
  const qc = useQueryClient()
  const staff = useAuth((s) => s.user?.name ?? 'Front desk')

  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [ticket, setTicket] = useState<PosLine[]>([])
  const [takeaway, setTakeaway] = useState(false)
  const [tableId, setTableId] = useState<string | null>(null)
  const [customer, setCustomer] = useState('')
  const [discount, setDiscount] = useState(0)
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState<PayMethod>('Card')
  const [tipPct, setTipPct] = useState(0)
  const [portionFor, setPortionFor] = useState<MenuItem | null>(null)

  const gst = (settings?.gst ?? 5) / 100
  const serviceRate = (settings?.service ?? 10) / 100

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (menu ?? [])
      .filter((m) => m.avail && !m.archived)
      .filter((m) => cat === 'All' || m.cat === cat)
      .filter((m) => !q || m.name.toLowerCase().includes(q))
  }, [menu, cat, search])

  const catNames = ['All', ...(categories ?? []).filter((c) => c.visible).map((c) => c.name)]

  // ---- ticket math ----
  const sub = ticket.reduce((a, l) => a + l.price * l.qty, 0)
  const tax = sub * gst
  const service = takeaway ? 0 : sub * serviceRate
  const total = Math.max(0, sub + tax + service - discount)
  const tip = sub * tipPct
  const grand = total + tip
  const count = ticket.reduce((a, l) => a + l.qty, 0)

  /** Tap an item: open the plate-size picker if it has portions, else add it. */
  function onItemTap(item: MenuItem) {
    if (portionsFor(item)) setPortionFor(item)
    else addLine(item)
  }

  function addLine(item: MenuItem, portion?: Portion) {
    const key = lineKey(item.id, portion?.short)
    setTicket((prev) => {
      const i = prev.findIndex((l) => lineKey(l.id, l.size) === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + 1 }
        return next
      }
      return [...prev, { id: item.id, name: item.name, price: portion?.price ?? item.price, qty: 1, size: portion?.short }]
    })
    if (portion) {
      setPortionFor(null)
      toast.success(`${portion.label} added`)
    }
  }
  function changeQty(key: string, delta: number) {
    setTicket((prev) =>
      prev.flatMap((l) => {
        if (lineKey(l.id, l.size) !== key) return [l]
        const qty = l.qty + delta
        return qty <= 0 ? [] : [{ ...l, qty }]
      }),
    )
  }
  function clearTicket() {
    setTicket([])
    setDiscount(0)
    setCustomer('')
    setTipPct(0)
  }

  const checkout = useMutation({
    mutationFn: () =>
      posService.checkout({
        tableId: takeaway ? null : tableId,
        takeaway,
        customer,
        items: ticket,
        staff,
        discount,
        method,
        tip,
      }),
    onSuccess: ({ order, transaction }) => {
      qc.invalidateQueries({ queryKey: qk.orders })
      qc.invalidateQueries({ queryKey: qk.payments })
      qc.invalidateQueries({ queryKey: qk.tables })
      toast.success(`${order.id} charged · ${money(transaction.amount)} · ${method}`)
      setPayOpen(false)
      clearTicket()
    },
    onError: () => toast.error('Could not complete the sale'),
  })

  const canCharge = ticket.length > 0 && (takeaway || tableId)

  return (
    <div className="flex h-full">
      {/* Catalog */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-6 py-3.5">
          <div className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-transparent bg-card px-3.5 focus-within:border-emerald/50">
            <Search className="h-[17px] w-[17px] text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-line bg-surface px-6 py-3">
          {catNames.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                cat === c ? 'border-graphite bg-graphite text-white' : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={Search} title="No items" body="Try a different category or search." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((m) => {
                const portions = portionsFor(m)
                const fromPrice = portions ? Math.min(...portions.map((p) => p.price)) : m.price
                const derived = !m.sizes?.length
                return (
                  <button
                    key={m.id}
                    onClick={() => onItemTap(m)}
                    className="group flex flex-col rounded-2xl border border-line bg-card p-3 text-left shadow-card transition-shadow hover:shadow-pop"
                  >
                    <div className="flex h-16 items-end rounded-xl bg-[repeating-linear-gradient(45deg,#EFEEEA,#EFEEEA_7px,#E7E6E1_7px,#E7E6E1_14px)] p-2">
                      {m.tags[0] && (
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: tagColor(m.tags[0]) + '22', color: tagColor(m.tags[0]) }}>
                          {m.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 line-clamp-1 text-[13.5px] font-semibold text-ink">{m.name}</div>

                    {portions && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="rounded-md bg-emerald-tint px-1.5 py-0.5 text-[10px] font-bold text-emerald-dark">
                          {derived ? portions.map((p) => p.frac).join(' ') : `${portions.length}×`}
                        </span>
                        <span className="text-[10px] font-semibold text-ink-faint">plate sizes</span>
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-ink">
                        {portions ? `from ${money(fromPrice)}` : money(m.price)}
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-tint text-emerald-dark transition-colors group-hover:bg-emerald group-hover:text-white">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ticket */}
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-line bg-card">
        <div className="border-b border-line p-4">
          <div className="mb-3 flex gap-1 rounded-xl bg-line-soft p-1">
            <button
              onClick={() => setTakeaway(false)}
              className={cn('flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors', !takeaway ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')}
            >
              Dine-in
            </button>
            <button
              onClick={() => setTakeaway(true)}
              className={cn('flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors', takeaway ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')}
            >
              Takeaway
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={tableId ?? ''}
              onChange={(e) => setTableId(e.target.value || null)}
              disabled={takeaway}
              className="h-10 rounded-xl border border-line-strong bg-card px-3 text-[13px] text-ink outline-none focus-visible:border-emerald disabled:opacity-50"
            >
              <option value="">{takeaway ? 'Takeaway' : 'Select table'}</option>
              {(tables ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.cap} seats
                </option>
              ))}
            </select>
            <Input placeholder="Customer (optional)" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto p-4">
          {ticket.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-line-soft text-ink-faint">
                <Receipt className="h-6 w-6" />
              </div>
              <div className="text-[14px] font-semibold text-ink">Empty ticket</div>
              <div className="max-w-[200px] text-[12.5px] text-ink-muted">Tap items on the left to start an order.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ticket.map((l) => {
                const key = lineKey(l.id, l.size)
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold text-ink">
                        {l.name}
                        {l.size ? <span className="text-emerald-dark"> · {l.size}</span> : null}
                      </div>
                      <div className="text-[12px] text-ink-faint">{money(l.price)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-line-soft p-1">
                      <button onClick={() => changeQty(key, -1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-ink">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[16px] text-center text-[13px] font-semibold">{l.qty}</span>
                      <button onClick={() => changeQty(key, 1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="w-14 text-right text-[13.5px] font-bold text-ink">{money(l.price * l.qty)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Totals + actions */}
        <div className="border-t border-line p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-card px-3">
              <Tag className="h-4 w-4 text-ink-faint" />
              <input
                type="number"
                min={0}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="Discount $"
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
            {ticket.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearTicket}>
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Row label={`Subtotal · ${count} items`} value={money(sub)} />
            <Row label={`Tax (${settings?.gst ?? 5}%)`} value={money(tax)} />
            {!takeaway && <Row label={`Service (${settings?.service ?? 10}%)`} value={money(service)} />}
            {discount > 0 && <Row label="Discount" value={`−${money(discount)}`} />}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="text-[15px] font-bold text-ink">Total</span>
              <span className="text-[20px] font-bold text-ink">{money(total)}</span>
            </div>
          </div>

          <Button className="mt-3 w-full" size="lg" disabled={!canCharge} onClick={() => setPayOpen(true)}>
            Charge {money(total)}
          </Button>
          {!canCharge && ticket.length > 0 && !takeaway && (
            <p className="mt-2 text-center text-[12px] text-amber-dark">Select a table to charge.</p>
          )}
        </div>
      </aside>

      {/* Plate-size picker */}
      <Dialog open={!!portionFor} onOpenChange={(o) => !o && setPortionFor(null)}>
        <DialogContent className="w-[440px]">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Choose plate size</div>
          <DialogTitle className="mt-1 text-[18px]">{portionFor?.name}</DialogTitle>
          <div className="mt-4 flex flex-col gap-2.5">
            {(portionFor ? portionsFor(portionFor) ?? [] : []).map((p) => (
              <button
                key={p.key}
                onClick={() => portionFor && addLine(portionFor, p)}
                className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-line bg-card px-3.5 py-3 text-left transition-colors hover:border-emerald hover:bg-emerald-tint/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-line-soft text-[19px] font-bold text-ink">
                  {p.frac}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">{p.label}</span>
                  {p.desc && <span className="block text-[12px] text-ink-faint">{p.desc}</span>}
                </span>
                <span className="text-[17px] font-bold text-ink">{money(p.price)}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" className="mt-3.5 w-full" onClick={() => setPortionFor(null)}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={(o) => !o && setPayOpen(false)}>
        <DialogContent className="w-[440px]">
          <DialogTitle>Take payment</DialogTitle>
          <div className="mt-4 rounded-2xl border border-line p-4 text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Amount due</div>
            <div className="mt-1 text-[32px] font-bold tracking-tight text-ink">{money(grand)}</div>
            {tip > 0 && <div className="text-[12.5px] text-emerald-dark">includes {money(tip)} tip</div>}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">Add a tip</div>
            <div className="flex gap-2">
              {TIP_PRESETS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTipPct(t.pct)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-[13px] font-semibold transition-colors',
                    tipPct === t.pct ? 'border-graphite bg-graphite text-white' : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">Method</div>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    'rounded-xl border py-2.5 text-[13px] font-semibold transition-colors',
                    method === m ? 'border-emerald bg-emerald-tint text-emerald-dark' : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPayOpen(false)} disabled={checkout.isPending}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => checkout.mutate()} disabled={checkout.isPending}>
              {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Charge {money(grand)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
