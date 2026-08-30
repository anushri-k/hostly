'use client'

import { useState } from 'react'
import {
  DollarSign,
  ScrollText,
  ShoppingCart,
  LayoutGrid,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { cn } from '@/lib/utils'
import { money0 } from '@/lib/format'
import { useAnalytics } from '@/lib/queries'
import {
  ActivityFeed,
  ChannelMix,
  DistributionDonut,
  KpiCard,
  OrdersByHour,
  PopularList,
  RevenueChart,
  type Kpi,
} from '@/features/dashboard/widgets'

const RANGES = [
  { key: 'today', label: 'Today', mult: 1 },
  { key: '7d', label: '7 days', mult: 6.6 },
  { key: '30d', label: '30 days', mult: 27.4 },
] as const

function buildKpis(mult: number): Kpi[] {
  const revenue = Math.round(14280 * mult)
  const orders = Math.round(182 * mult)
  return [
    { label: 'Revenue', value: money0(revenue), delta: '+12.4%', note: 'vs. prev', icon: DollarSign, tint: '#0EA76B', tone: 'up' },
    { label: 'Orders', value: String(orders), delta: '+8.1%', note: 'vs. prev', icon: ScrollText, tint: '#0EA76B', tone: 'up' },
    { label: 'Avg order value', value: '$78.40', delta: '+3.2%', note: 'per table', icon: ShoppingCart, tint: '#0EA76B', tone: 'up' },
    { label: 'Active tables', value: '14/24', delta: '58%', note: 'occupancy', icon: LayoutGrid, tint: '#3B82F6', tone: 'neutral' },
    { label: 'Pending payments', value: '6', delta: '$1,240', note: 'awaiting', icon: Clock, tint: '#F59E0B', tone: 'amber' },
    { label: 'Assistance', value: '3', delta: 'live', note: 'requests', icon: AlertTriangle, tint: '#F59E0B', tone: 'amber' },
  ]
}

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics()
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('today')
  const mult = RANGES.find((r) => r.key === range)!.mult
  const kpis = buildKpis(mult)

  const totalOrders = data?.statusMix.reduce((a, d) => a + d.val, 0) ?? 0

  return (
    <PageBody>
      {/* Date range */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[15px] font-bold text-ink">Overview</h1>
        <div className="flex gap-1 rounded-xl bg-line-soft p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                range === r.key ? 'bg-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <span className="text-[12.5px] text-ink-muted">{money0(Math.round(14280 * mult))} total</span>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[230px] w-full" />
            ) : (
              <RevenueChart values={data.revVals.map((v) => Math.round(v * mult))} hours={data.revHours} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <DistributionDonut
                data={data.statusMix.map((d) => ({ label: d.label, value: d.val, color: d.color }))}
                centerLabel="orders"
                centerValue={String(totalOrders)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders by hour</CardTitle>
            <span className="text-[12.5px] text-ink-muted">Peak 7–8pm</span>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[230px] w-full" /> : <OrdersByHour data={data.peak} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
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

      {/* Lists row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Popular items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[180px] w-full" /> : <PopularList items={data.popular} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel mix</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[180px] w-full" /> : <ChannelMix data={data.channelMix} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[180px] w-full" /> : <ActivityFeed items={data.activity} />}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  )
}
