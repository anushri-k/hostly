'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, LayoutGrid, List, Download, Printer, RefreshCw, Users, Trash2, Ban } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useConfirm } from '@/components/confirm-dialog'
import { useTables, qk } from '@/lib/queries'
import { tablesService } from '@/server/services'
import { tableStatusStyle } from '@/lib/domain-styles'
import { cn } from '@/lib/utils'
import type { RestaurantTable, TableStatus } from '@/types'

const STATUSES: TableStatus[] = ['Available', 'Occupied', 'Assist', 'Payment', 'Cleaning']

export default function TablesPage() {
  const { data, isLoading } = useTables()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [view, setView] = useState<'floor' | 'list'>('floor')
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<RestaurantTable | 'new' | null>(null)

  const save = useMutation({
    mutationFn: (t: RestaurantTable) => tablesService.upsert(t),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tables })
      toast.success('Table saved')
    },
  })
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) => tablesService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tables }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => tablesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tables })
      toast.success('Table removed')
    },
  })

  const tables = data ?? []
  const counts = useMemo(
    () => STATUSES.map((s) => ({ status: s, ...tableStatusStyle[s], count: tables.filter((t) => t.status === s).length })),
    [tables],
  )
  const open = openId ? tables.find((t) => t.id === openId) ?? null : null

  function askRegen(id: string) {
    confirm({
      title: `Regenerate QR for ${id}?`,
      body: 'The current code will stop working immediately. Print and replace the table card after regenerating.',
      confirmLabel: 'Regenerate',
      tone: 'warning',
      icon: 'refresh',
      onConfirm: async () => {
        await tablesService.regenerateQR(id)
        toast.success(`New QR token issued for ${id}`)
      },
    })
  }
  function askDelete(t: RestaurantTable) {
    confirm({
      title: `Delete ${t.id}?`,
      body: 'The table and its QR code will be permanently removed.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        await remove.mutateAsync(t.id)
        setOpenId(null)
      },
    })
  }

  return (
    <PageBody className="max-w-[1240px]">
      {/* Legend + toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {counts.map((c) => (
            <div key={c.status} className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.dot }} />
              <span className="text-[12.5px] font-semibold text-ink">{c.label}</span>
              <span className="text-[12.5px] font-bold text-ink-muted">{c.count}</span>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-line-soft p-1">
            <button onClick={() => setView('floor')} className={cn('rounded-lg p-1.5', view === 'floor' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')} aria-label="Floor view">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('rounded-lg p-1.5', view === 'list' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')} aria-label="List view">
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> Add table
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : view === 'floor' ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {tables.map((t) => {
            const s = tableStatusStyle[t.status]
            return (
              <button
                key={t.id}
                onClick={() => setOpenId(t.id)}
                className="flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-transform hover:-translate-y-0.5"
                style={{ background: s.bg, borderColor: s.dot + '40' }}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[15px] font-bold" style={{ color: s.fg }}>
                    {t.id}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} />
                </div>
                <div className="flex items-center gap-1 text-[12px]" style={{ color: s.fg }}>
                  <Users className="h-3 w-3" /> {t.guests || 0}/{t.cap}
                </div>
                <div className="text-[11px]" style={{ color: s.fg, opacity: 0.8 }}>
                  {t.seated}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {tables.map((t, i) => {
            const s = tableStatusStyle[t.status]
            return (
              <div
                key={t.id}
                onClick={() => setOpenId(t.id)}
                className={cn('flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-line-soft/60', i !== tables.length - 1 && 'border-b border-line-soft')}
              >
                <span className="w-14 text-[14px] font-bold text-ink">{t.id}</span>
                <Badge bg={s.bg} fg={s.fg} dot={s.dot}>
                  {s.label}
                </Badge>
                <span className="text-[13px] text-ink-muted">{t.guests || 0}/{t.cap} seats</span>
                <span className="ml-auto text-[13px] text-ink-muted">{t.seated}</span>
                <span className="text-[12.5px] text-ink-faint">{t.scans} scans</span>
              </div>
            )
          })}
        </Card>
      )}

      {/* Table drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent width={420}>
          {open && (
            <>
              <SheetHeader>
                <div>
                  <SheetTitle>{open.id}</SheetTitle>
                  <SheetDescription>Capacity {open.cap} · {open.scans} QR scans</SheetDescription>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-5">
                <Badge bg={tableStatusStyle[open.status].bg} fg={tableStatusStyle[open.status].fg} dot={tableStatusStyle[open.status].dot}>
                  {tableStatusStyle[open.status].label}
                </Badge>

                {/* Decorative QR */}
                <div className="mt-4 flex flex-col items-center rounded-2xl border border-line p-6">
                  <QrMatrix />
                  <div className="mt-3 text-[12.5px] text-ink-muted">Scan to open Table {open.num}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Stat label="Guests" value={`${open.guests || 0}`} />
                  <Stat label="Seated" value={open.seated} />
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Set status</div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((st) => {
                      const cfg = tableStatusStyle[st]
                      const on = open.status === st
                      return (
                        <button
                          key={st}
                          onClick={() => setStatus.mutate({ id: open.id, status: st })}
                          className="rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors"
                          style={{
                            background: on ? cfg.dot : 'var(--card)',
                            color: on ? '#fff' : 'var(--ink-muted)',
                            borderColor: on ? cfg.dot : 'var(--line-strong)',
                          }}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-2 border-t border-line p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success(`QR PDF downloaded for ${open.id}`)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('QR card sent to printer')}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => askRegen(open.id)}>
                    <RefreshCw className="h-4 w-4" /> Regen
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setStatus.mutate({ id: open.id, status: 'Cleaning' }); toast.success(`${open.id} disabled`) }}>
                    <Ban className="h-4 w-4" /> Disable
                  </Button>
                  <Button variant="dangerSoft" size="sm" className="flex-1" onClick={() => askDelete(open)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <TableDialog
        table={editing}
        count={tables.length}
        onClose={() => setEditing(null)}
        onSave={(t) => {
          save.mutate(t)
          setEditing(null)
        }}
      />
    </PageBody>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line p-3.5">
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="mt-1 text-[16px] font-bold text-ink">{value}</div>
    </div>
  )
}

function QrMatrix() {
  const cells = '110101011011010010101101001011010110100101101101011010010110101101001011010010110'.slice(0, 81).split('')
  return (
    <div className="grid h-32 w-32 grid-cols-9 gap-0.5 rounded-xl bg-white p-2">
      {cells.map((c, i) => (
        <div key={i} className="rounded-[1px]" style={{ background: c === '1' || i % 7 === 0 ? '#1D1F24' : 'transparent' }} />
      ))}
    </div>
  )
}

function TableDialog({
  table,
  count,
  onClose,
  onSave,
}: {
  table: RestaurantTable | 'new' | null
  count: number
  onClose: () => void
  onSave: (t: RestaurantTable) => void
}) {
  const isNew = table === 'new'
  const base = isNew || !table ? null : table
  const [name, setName] = useState('')
  const [cap, setCap] = useState(4)

  useEffect(() => {
    setName(base?.id ?? `T-${String(count + 1).padStart(2, '0')}`)
    setCap(base?.cap ?? 4)
  }, [table, count])

  return (
    <Dialog open={!!table} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>{isNew ? 'Add table' : 'Edit table'}</DialogTitle>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Table name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Capacity</label>
            <Input type="number" value={cap} onChange={(e) => setCap(parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!name.trim()}
            onClick={() =>
              onSave({
                id: name.trim(),
                num: base?.num ?? count + 1,
                status: base?.status ?? 'Available',
                cap,
                guests: base?.guests ?? 0,
                seated: base?.seated ?? '—',
                scans: base?.scans ?? 0,
              })
            }
          >
            {isNew ? 'Add' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
