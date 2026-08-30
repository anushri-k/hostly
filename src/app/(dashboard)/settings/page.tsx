'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, ImageUp, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBody } from '@/components/page'
import { useSettings, qk } from '@/lib/queries'
import { settingsService } from '@/server/services'
import { integrations, menu as menuSeed } from '@/server/seed'
import { money0 } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RestaurantSettings } from '@/types'

const TABS = ['General', 'Integrations', 'Taxes', 'Payments', 'Ordering', 'Notifications', 'Security', 'Audit'] as const
type Tab = (typeof TABS)[number]

const AUDIT_LOG = [
  { who: 'Maya Aronsson', action: 'updated Seared Salmon price', time: '14 min ago', tint: '#3B82F6' },
  { who: 'System', action: 'auto-accepted Zomato order #8821049', time: '22 min ago', tint: '#E23744' },
  { who: 'Devin Cole', action: 'issued refund for PAY-7738', time: '1 hr ago', tint: '#EF4444' },
  { who: 'Priya Shah', action: 'changed Cashier permissions', time: '2 hr ago', tint: '#8B5CF6' },
  { who: 'Maya Aronsson', action: 'signed in from a new device', time: '3 hr ago', tint: '#6B7280' },
]

export default function SettingsPage() {
  const { data, isLoading } = useSettings()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('General')
  const [form, setForm] = useState<RestaurantSettings | null>(null)
  const [passwordPolicy, setPasswordPolicy] = useState({ minLength: true, mfa: false, rotate: false })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const save = useMutation({
    mutationFn: (patch: Partial<RestaurantSettings>) => settingsService.update(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.settings })
      toast.success('Settings saved')
    },
  })

  if (isLoading || !form) {
    return (
      <PageBody className="max-w-[900px]">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-80 w-full" />
      </PageBody>
    )
  }

  const set = (patch: Partial<RestaurantSettings>) => setForm((f) => ({ ...f!, ...patch }))
  const field = 'mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint'

  return (
    <PageBody className="max-w-[900px]">
      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors',
              tab === t ? 'bg-graphite text-white' : 'text-ink-muted hover:bg-line-soft',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {tab === 'General' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="font-display flex h-16 w-16 items-center justify-center rounded-2xl bg-graphite text-3xl text-emerald">
                {form.name[0]}
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Logo upload — choose a file')}>
                <ImageUp className="h-4 w-4" /> Change logo
              </Button>
            </div>
            <div>
              <label className={field}>Restaurant name</label>
              <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={field}>Contact email</label>
                <Input type="email" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
              </div>
              <div>
                <label className={field}>Contact phone</label>
                <Input value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {tab === 'Integrations' && (
          <div className="space-y-4">
            <p className="text-[13.5px] text-ink-muted">
              Connect delivery aggregators to pull their orders into one queue. Orders are colour-coded
              by channel across the dashboard.
            </p>
            {integrations.map((it) => {
              const connected = form[it.acceptKey as keyof RestaurantSettings] as boolean
              return (
                <div key={it.key} className="rounded-2xl border border-line p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-[20px] font-bold text-white"
                      style={{ background: it.color }}
                    >
                      {it.letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-ink">{it.name}</span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
                          style={{
                            background: connected ? '#E7F5EE' : '#FEF6E7',
                            color: connected ? '#0B7A4F' : '#B45309',
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: connected ? '#0EA76B' : '#F59E0B' }}
                          />
                          {connected ? 'Connected' : 'Paused'}
                        </span>
                      </div>
                      <div className="text-[12.5px] text-ink-faint">Last synced {it.sync}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(`${it.name} menu synced · ${menuSeed.length} items`)}
                    >
                      <RefreshCw className="h-4 w-4" /> Sync menu
                    </Button>
                  </div>

                  {/* Live stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <Stat label="Orders today" value={String(it.orders)} />
                    <Stat label="Revenue" value={money0(it.revenue)} />
                    <Stat label="Commission" value={`${it.commission}%`} />
                  </div>

                  {/* Toggles */}
                  <div className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
                    <ToggleRow
                      label="Accept orders"
                      sub="Receive new orders from this channel"
                      checked={form[it.acceptKey as keyof RestaurantSettings] as boolean}
                      onChange={(v) => set({ [it.acceptKey]: v } as Partial<RestaurantSettings>)}
                    />
                    <ToggleRow
                      label="Auto-accept"
                      sub="Send orders straight to the kitchen"
                      checked={form[it.autoKey as keyof RestaurantSettings] as boolean}
                      onChange={(v) => set({ [it.autoKey]: v } as Partial<RestaurantSettings>)}
                    />
                    <ToggleRow
                      label="Menu sync"
                      sub="Push menu and price changes automatically"
                      checked={form[it.syncKey as keyof RestaurantSettings] as boolean}
                      onChange={(v) => set({ [it.syncKey]: v } as Partial<RestaurantSettings>)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'Taxes' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={field}>GST / VAT (%)</label>
              <Input type="number" value={form.gst} onChange={(e) => set({ gst: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={field}>Service charge (%)</label>
              <Input type="number" value={form.service} onChange={(e) => set({ service: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={field}>Packaging fee ($)</label>
              <Input type="number" step="0.5" value={form.packaging} onChange={(e) => set({ packaging: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        )}

        {tab === 'Payments' && (
          <div className="divide-y divide-line-soft">
            <ToggleRow label="Credit / Debit card" sub="Accept Visa, Mastercard, Amex" checked={form.card} onChange={(v) => set({ card: v })} />
            <ToggleRow label="UPI" sub="Pay by any UPI app" checked={form.upi} onChange={(v) => set({ upi: v })} />
            <ToggleRow label="Wallet" sub="In-app stored balance" checked={form.wallet} onChange={(v) => set({ wallet: v })} />
            <ToggleRow label="Cash" sub="Settle with a server" checked={form.cash} onChange={(v) => set({ cash: v })} />
          </div>
        )}

        {tab === 'Ordering' && (
          <div className="divide-y divide-line-soft">
            <ToggleRow label="Allow takeaway conversion" sub="Guests can switch dine-in to takeaway" checked={form.takeaway} onChange={(v) => set({ takeaway: v })} />
            <ToggleRow label="Auto-close tables" sub="Close the session 10 min after payment" checked={form.autoClose} onChange={(v) => set({ autoClose: v })} />
            <ToggleRow label="Require payment before serving" sub="Hold orders until the bill is settled" checked={form.requirePay} onChange={(v) => set({ requirePay: v })} />
          </div>
        )}

        {tab === 'Notifications' && (
          <div className="divide-y divide-line-soft">
            <ToggleRow label="Staff alerts" sub="Push assistance + new orders to servers" checked={form.staffAlerts} onChange={(v) => set({ staffAlerts: v })} />
            <ToggleRow label="Payment notifications" sub="Notify cashier on every settlement" checked={form.payNotif} onChange={(v) => set({ payNotif: v })} />
            <ToggleRow label="Email receipts" sub="Send guests a copy by email" checked={form.emailReceipts} onChange={(v) => set({ emailReceipts: v })} />
          </div>
        )}

        {tab === 'Security' && (
          <div className="space-y-5">
            <div>
              <label className={field}>Session timeout</label>
              <select
                value={form.sessionTimeout}
                onChange={(e) => set({ sessionTimeout: parseInt(e.target.value) })}
                className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[13.5px] text-ink outline-none focus-visible:border-emerald"
              >
                {[15, 30, 60, 120].map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>
            <div className="divide-y divide-line-soft rounded-2xl border border-line">
              <ToggleRow label="Minimum 8-character passwords" sub="Enforce password length" checked={passwordPolicy.minLength} onChange={(v) => setPasswordPolicy((p) => ({ ...p, minLength: v }))} />
              <ToggleRow label="Require MFA" sub="Two-factor for all staff" checked={passwordPolicy.mfa} onChange={(v) => setPasswordPolicy((p) => ({ ...p, mfa: v }))} />
              <ToggleRow label="Rotate passwords every 90 days" sub="Prompt staff to reset" checked={passwordPolicy.rotate} onChange={(v) => setPasswordPolicy((p) => ({ ...p, rotate: v }))} />
            </div>
          </div>
        )}

        {tab === 'Audit' && (
          <div className="space-y-1">
            {AUDIT_LOG.map((l, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-2 py-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: l.tint }} />
                <div className="flex-1">
                  <div className="text-[13.5px] text-ink">
                    <span className="font-semibold">{l.who}</span> {l.action}
                  </div>
                  <div className="text-[12px] text-ink-faint">{l.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab !== 'Audit' && tab !== 'Security' && (
          <div className="mt-6 flex justify-end border-t border-line pt-5">
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        )}
        {tab === 'Security' && (
          <div className="mt-6 flex justify-end border-t border-line pt-5">
            <Button onClick={() => save.mutate({ sessionTimeout: form.sessionTimeout })} disabled={save.isPending}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        )}
      </Card>
    </PageBody>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-line-soft px-3.5 py-2.5">
      <div className="text-[16px] font-bold text-ink">{value}</div>
      <div className="text-[11.5px] text-ink-faint">{label}</div>
    </div>
  )
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-1 py-3.5">
      <div>
        <div className="text-[13.5px] font-semibold text-ink">{label}</div>
        <div className="text-[12px] text-ink-faint">{sub}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
