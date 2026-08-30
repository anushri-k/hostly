'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, Printer, FileText, RotateCcw, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useConfirm } from '@/components/confirm-dialog'
import { usePayments, useAnalytics, qk } from '@/lib/queries'
import { paymentsService } from '@/server/services'
import { useSearch } from '@/features/shell/use-search'
import { money } from '@/lib/format'
import { methodStyle } from '@/lib/domain-styles'
import { DistributionDonut } from '@/features/dashboard/widgets'
import type { Transaction } from '@/types'

const PAY_KPIS = [
  { label: 'Total Revenue', value: '$14,280', note: 'today', tint: '#0EA76B' },
  { label: 'Taxes Collected', value: '$714', note: '5% GST', tint: '#3B82F6' },
  { label: 'Tips', value: '$1,180', note: '32 orders', tint: '#8B5CF6' },
  { label: 'Refunds', value: '$34', note: '1 today', tint: '#EF4444' },
  { label: 'Outstanding', value: '$1,240', note: '6 bills', tint: '#6B7280' },
]

export default function PaymentsPage() {
  const { data: txns, isLoading } = usePayments()
  const { data: analytics } = useAnalytics()
  const { query } = useSearch()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [openId, setOpenId] = useState<string | null>(null)

  const refund = useMutation({
    mutationFn: (id: string) => paymentsService.refund(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.payments })
      const prev = qc.getQueryData<Transaction[]>(qk.payments)
      if (prev) qc.setQueryData<Transaction[]>(qk.payments, prev.map((t) => (t.id === id ? { ...t, status: 'Refunded' } : t)))
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.payments, ctx.prev)
      toast.error('Refund failed')
    },
    onSuccess: (t) => toast.success(`Refund issued for ${t.id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.payments }),
  })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (txns ?? []).filter(
      (t) => !q || t.id.toLowerCase().includes(q) || t.order.toLowerCase().includes(q) || t.table.toLowerCase().includes(q),
    )
  }, [txns, query])

  const open = openId ? (txns ?? []).find((t) => t.id === openId) ?? null : null

  function askRefund(id: string) {
    confirm({
      title: 'Issue a refund?',
      body: `The full amount for ${id} will be returned to the original payment method.`,
      confirmLabel: 'Refund',
      tone: 'danger',
      icon: 'money',
      onConfirm: async () => {
        await refund.mutateAsync(id)
        setOpenId(null)
      },
    })
  }

  const columns: ColumnDef<Transaction, unknown>[] = [
    { accessorKey: 'id', header: 'Payment', cell: ({ row }) => <span className="font-semibold text-ink">{row.original.id}</span> },
    { accessorKey: 'order', header: 'Order', cell: ({ row }) => <span className="text-ink-muted">{row.original.order}</span> },
    { accessorKey: 'table', header: 'Table', cell: ({ row }) => <span className="text-ink-muted">{row.original.table}</span> },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const ms = methodStyle(row.original.method)
        return <Badge bg={ms.bg} fg={ms.fg}>{row.original.method}</Badge>
      },
    },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold text-ink">{money(row.original.amount)}</span> },
    { accessorKey: 'tip', header: 'Tips', cell: ({ row }) => <span className="text-ink-muted">{row.original.tip ? money(row.original.tip) : '—'}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const refunded = row.original.status === 'Refunded'
        return <Badge bg={refunded ? '#F3F4F6' : '#E7F5EE'} fg={refunded ? '#6B7280' : '#0B7A4F'}>{row.original.status}</Badge>
      },
    },
    { accessorKey: 'time', header: 'Time', cell: ({ row }) => <span className="text-ink-muted">{row.original.time}</span> },
  ]

  return (
    <PageBody className="max-w-[1320px]">
      {/* KPI summary */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {PAY_KPIS.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.tint }} />
              <span className="text-[12px] font-semibold text-ink-muted">{k.label}</span>
            </div>
            <div className="mt-2 text-[22px] font-bold tracking-tight text-ink">{k.value}</div>
            <div className="text-[12px] text-ink-faint">{k.note}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            {!analytics ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <DistributionDonut
                data={analytics.payMethods.map((d) => ({ label: d.label, value: d.pct, color: d.color }))}
                centerLabel="of sales"
                centerValue="100%"
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => toast.success('Report exported to CSV')}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <div className="px-0 pb-0">
            {isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={rows}
                getRowId={(t) => t.id}
                onRowClick={(t) => setOpenId(t.id)}
                pageSize={7}
                emptyState={<EmptyState icon={CreditCard} title="No transactions" body="Settlements will show up here." />}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Transaction drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent width={440}>
          {open && (
            <TxnDetail txn={open} onRefund={() => askRefund(open.id)} />
          )}
        </SheetContent>
      </Sheet>
    </PageBody>
  )
}

function TxnDetail({ txn, onRefund }: { txn: Transaction; onRefund: () => void }) {
  const ms = methodStyle(txn.method)
  const base = txn.amount - txn.tip
  const tax = (base * 0.05) / 1.05
  const refunded = txn.status === 'Refunded'
  const timeline = [
    { label: 'Payment initiated', time: txn.time },
    { label: 'Authorized', time: txn.time },
    { label: refunded ? 'Refunded' : 'Settled', time: txn.time },
  ]
  return (
    <>
      <SheetHeader>
        <div>
          <SheetTitle>{txn.id}</SheetTitle>
          <SheetDescription>
            {txn.order} · {txn.table} · {txn.time}
          </SheetDescription>
        </div>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl border border-line p-4 text-center">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Amount</div>
          <div className="mt-1 text-[32px] font-bold tracking-tight text-ink">{money(txn.amount)}</div>
          <Badge className="mt-2" bg={ms.bg} fg={ms.fg}>
            {txn.method}
          </Badge>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-line p-4">
          <Row label="Base amount" value={money(base - tax)} />
          <Row label="Tax (5% GST)" value={money(tax)} />
          <Row label="Tip" value={money(txn.tip)} />
          <div className="mt-1 flex items-center justify-between border-t border-line pt-2.5">
            <span className="text-[14px] font-bold text-ink">Total</span>
            <span className="text-[16px] font-bold text-ink">{money(txn.amount)}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Payment timeline</div>
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald" />
                {i < timeline.length - 1 && <span className="my-0.5 w-0.5 flex-1 bg-emerald/30" />}
              </div>
              <div className="pb-3.5">
                <div className="text-[13.5px] font-semibold text-ink">{t.label}</div>
                <div className="text-[12px] text-ink-faint">{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-line p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success(`Receipt reprinted for ${txn.id}`)}>
            <Printer className="h-4 w-4" /> Reprint
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('Invoice downloaded')}>
            <FileText className="h-4 w-4" /> Invoice
          </Button>
        </div>
        {!refunded && (
          <Button variant="dangerSoft" className="w-full" onClick={onRefund}>
            <RotateCcw className="h-4 w-4" /> Refund payment
          </Button>
        )}
      </div>
    </>
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
