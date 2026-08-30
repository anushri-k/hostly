import Link from 'next/link'
import {
  QrCode,
  CreditCard,
  ScrollText,
  UtensilsCrossed,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Check,
  type LucideIcon,
} from 'lucide-react'

const FEATURES: { icon: LucideIcon; tint: string; color: string; title: string; body: string }[] = [
  { icon: QrCode, tint: '#E7F5EE', color: '#0EA76B', title: 'QR ordering', body: 'Guests scan, browse and order in under three taps — no app, no waiting for a server.' },
  { icon: CreditCard, tint: '#E8F0FE', color: '#1D4ED8', title: 'Billing & split', body: 'Split by item or evenly, accept card, UPI, wallet or cash, and settle in seconds.' },
  { icon: ScrollText, tint: '#FEF6E7', color: '#B45309', title: 'One order queue', body: 'Dine-in, takeaway, Zomato and Swiggy land together — colour-coded and live.' },
  { icon: UtensilsCrossed, tint: '#F5F3FF', color: '#6D28D9', title: 'Menu & inventory', body: 'Edit once and sync everywhere, with ingredient mapping and low-stock alerts.' },
  { icon: BarChart3, tint: '#E7F5EE', color: '#0EA76B', title: 'Live analytics', body: 'Revenue, peak hours, best sellers and staff performance, updated in real time.' },
  { icon: ShieldCheck, tint: '#E8F0FE', color: '#1D4ED8', title: 'Roles & security', body: 'Granular permissions, audit logs and secure sessions for every team member.' },
]

const STATS = [
  { value: '3 tap', label: 'Average time to order' },
  { value: '99.98%', label: 'Uptime during service' },
  { value: '1,200+', label: 'Venues running Hostly' },
  { value: '18 min', label: 'Avg. order turnaround' },
]

const HIGHLIGHTS = [
  'Live order queue across every channel',
  'One menu, synced to QR and aggregators',
  'Payments, refunds and tips in one place',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="font-display flex h-9 w-9 items-center justify-center rounded-xl bg-emerald text-xl text-white">
              H
            </div>
            <div className="text-[17px] font-bold tracking-tight">Hostly</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-[13.5px] font-semibold text-ink-muted transition-colors hover:bg-line-soft"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-graphite px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-graphite/90"
            >
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-muted animate-ho-rise">
          <span className="h-2 w-2 animate-ho-pulse rounded-full bg-emerald" /> Restaurant OS · Scan. Order. Enjoy.
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-[48px] font-bold leading-[1.05] tracking-tight md:text-[60px]">
          Run your restaurant,{' '}
          <span className="font-display font-normal text-emerald">not your software.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink-muted">
          The calm, fast back-of-house for modern hospitality — QR ordering, one live order queue,
          payments, menu and analytics in a single, delightful dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-emerald-dark"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-line-strong bg-card px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft"
          >
            View live demo
          </Link>
        </div>
        <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-center gap-2 text-[13.5px] text-ink-muted">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-tint">
                <Check className="h-2.5 w-2.5 text-emerald" />
              </span>
              {h}
            </li>
          ))}
        </ul>
      </section>

      {/* Product preview */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-line bg-graphite shadow-pop">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 text-[12px] text-white/50">app.hostly.co/dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-3 p-5 sm:grid-cols-6">
            {STATS.map((s) => (
              <div key={s.label} className="col-span-3 rounded-xl bg-white/[0.04] p-4 sm:col-span-3">
                <div className="text-[26px] font-bold text-white">{s.value}</div>
                <div className="text-[12.5px] text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-[32px] font-bold tracking-tight">Everything your floor needs</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-muted">
            From the first scan to the final settlement — one system, beautifully connected.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-2xl border border-line bg-card p-6 shadow-card transition-shadow hover:shadow-pop">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: f.tint, color: f.color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-[17px] font-bold">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl bg-graphite px-8 py-14 text-center text-white">
          <h2 className="font-display text-[36px] leading-tight">Ready when your guests are.</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-white/60">
            Sign in with a demo role and explore the full dashboard — no setup required.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-emerald-dark"
          >
            Sign in to Hostly <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-[12.5px] text-ink-faint">
          <span>© 2026 Hostly · Restaurant OS</span>
          <span>Scan. Order. Enjoy.</span>
        </div>
      </footer>
    </div>
  )
}
