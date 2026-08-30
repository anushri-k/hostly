'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { money0 } from '@/lib/format'

export interface Kpi {
  label: string
  value: string
  delta: string
  note: string
  icon: LucideIcon
  tint: string
  tone?: 'up' | 'neutral' | 'amber'
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const deltaColor =
    kpi.tone === 'amber' ? 'text-amber-dark' : kpi.tone === 'neutral' ? 'text-ink-muted' : 'text-emerald-dark'
  const Icon = kpi.icon
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: kpi.tint + '1a', color: kpi.tint }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <span className={cn('flex items-center gap-0.5 text-[12px] font-semibold', deltaColor)}>
          {kpi.tone !== 'neutral' && kpi.tone !== 'amber' && <ArrowUpRight className="h-3.5 w-3.5" />}
          {kpi.delta}
        </span>
      </div>
      <div className="mt-3 text-[24px] font-bold tracking-tight text-ink">{kpi.value}</div>
      <div className="mt-0.5 text-[12.5px] text-ink-faint">
        {kpi.label} · <span className="text-ink-muted">{kpi.note}</span>
      </div>
    </Card>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string | number
  formatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-[12px] shadow-pop">
      <div className="font-semibold text-ink">{label}</div>
      <div className="text-ink-muted">{formatter ? formatter(payload[0].value) : payload[0].value}</div>
    </div>
  )
}

export function RevenueChart({ values, hours }: { values: number[]; hours: string[] }) {
  const data = values.map((v, i) => ({ hour: hours[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA76B" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0EA76B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          interval={1}
        />
        <Tooltip content={<ChartTooltip formatter={money0} />} cursor={{ stroke: '#E5E4E0' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#0EA76B"
          strokeWidth={2.5}
          fill="url(#revGrad)"
          activeDot={{ r: 5, fill: '#0EA76B', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OrdersByHour({ data }: { data: [string, number][] }) {
  const max = Math.max(...data.map((d) => d[1]))
  const rows = data.map(([hour, value]) => ({ hour, value }))
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={rows} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
        <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} interval={1} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} orders`} />} cursor={{ fill: '#F4F3F0' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.value === max ? '#0EA76B' : r.value > max * 0.6 ? '#7BCBA6' : '#D6EBE0'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistributionDonut({
  data,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[]
  centerLabel: string
  centerValue: string
}) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[20px] font-bold text-ink">{centerValue}</div>
          <div className="text-[11px] text-ink-faint">{centerLabel}</div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5 text-[13px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1 text-ink-muted">{d.label}</span>
            <span className="font-semibold text-ink">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PopularList({ items }: { items: { name: string; sold: number }[] }) {
  const max = Math.max(...items.map((i) => i.sold))
  return (
    <div className="space-y-3.5">
      {items.map((it, i) => (
        <div key={it.name} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-line-soft text-[11px] font-bold text-ink-muted">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="truncate text-[13.5px] font-semibold text-ink">{it.name}</span>
              <span className="text-[12.5px] text-ink-muted">{it.sold} sold</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft">
              <div className="h-full rounded-full bg-emerald" style={{ width: `${(it.sold / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({ items }: { items: { html: string; time: string; tint: string }[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: a.tint }}
          />
          <div className="flex-1">
            <div
              className="text-[13px] leading-snug text-ink [&_b]:font-semibold"
              dangerouslySetInnerHTML={{ __html: a.html }}
            />
            <div className="text-[11.5px] text-ink-faint">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChannelMix({ data }: { data: { label: string; val: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.val, 0)
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {data.map((d) => (
          <div key={d.label} style={{ width: `${(d.val / total) * 100}%`, background: d.color }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1 text-ink-muted">{d.label}</span>
            <span className="font-semibold text-ink">{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
