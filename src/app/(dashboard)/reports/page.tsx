'use client'

import { useState } from 'react'
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { useAnalytics } from '@/lib/queries'
import { money0 } from '@/lib/format'
import { avatarColor } from '@/lib/domain-styles'
import { cn } from '@/lib/utils'
import { RevenueChart, OrdersByHour, DistributionDonut } from '@/features/dashboard/widgets'
import { toast } from 'sonner'

const RANGES = ['Today', 'This week', 'This month', 'Custom'] as const

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface ReportStat {
  label: string
  value: string
  delta: string
  good: boolean
}

export default function ReportsPage() {
  const { data } = useAnalytics()
  const [range, setRange] = useState<(typeof RANGES)[number]>('Today')

  function exportCsv() {
    if (!data) return
    const rows: (string | number)[][] = [
      ['Report', 'Hostly · ' + range],
      [],
      ['Best sellers', 'Units'],
      ...data.bestSellers.map(([n, v]) => [n, v]),
      [],
      ['Staff', 'Orders', 'Sales'],
      ...data.staffPerf.map((s) => [s.name, s.orders, s.sales]),
    ]
    downloadCsv(`hostly-report-${range.toLowerCase().replace(/\s/g, '-')}.csv`, rows)
    toast.success('Report exported to CSV')
  }

  return (
    <PageBody className="max-w-[1240px]">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-line-soft p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                range === r ? 'bg-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => { window.print(); toast.success('Opening print / PDF…') }}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(data?.reportStats ?? Array.from({ length: 4 }).map(() => null)).map((s: ReportStat | null, i: number) =>
          s ? (
            <Card key={i} className="p-4">
              <div className="text-[12.5px] text-ink-muted">{s.label}</div>
              <div className="mt-1.5 text-[22px] font-bold tracking-tight text-ink">{s.value}</div>
              <div className={cn('mt-1 flex items-center gap-1 text-[12px] font-semibold', s.good ? 'text-emerald-dark' : 'text-danger-dark')}>
                {s.good ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {s.delta}
              </div>
            </Card>
          ) : (
            <Skeleton key={i} className="h-24 w-full" />
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? <Skeleton className="h-[230px] w-full" /> : <RevenueChart values={data.revVals} hours={data.revHours} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <DistributionDonut
                data={data.payMethods.map((d) => ({ label: d.label, value: d.pct, color: d.color }))}
                centerLabel="of sales"
                centerValue="100%"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Peak hours</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? <Skeleton className="h-[230px] w-full" /> : <OrdersByHour data={data.peak} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <div className="space-y-3">
                {data.bestSellers.map(([name, val], i) => {
                  const max = data.bestSellers[0][1]
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-4 text-[12px] font-bold text-ink-faint">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <span className="truncate text-[13px] font-semibold text-ink">{name}</span>
                          <span className="text-[12.5px] text-ink-muted">{val}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-soft">
                          <div className="h-full rounded-full bg-emerald" style={{ width: `${(val / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Slow movers</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <div className="space-y-2.5">
                {data.slowMovers.map(([name, val]) => (
                  <div key={name} className="flex items-center justify-between rounded-xl bg-line-soft px-3.5 py-2.5">
                    <span className="text-[13.5px] font-medium text-ink">{name}</span>
                    <span className="text-[12.5px] text-ink-muted">{val} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff performance</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <div className="space-y-3">
                {data.staffPerf.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <Avatar name={s.name} color={avatarColor(s.name)} size={32} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-semibold text-ink">{s.name}</div>
                      <div className="text-[12px] text-ink-faint">{s.orders} orders</div>
                    </div>
                    <span className="text-[13.5px] font-bold text-ink">{money0(s.sales)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  )
}
