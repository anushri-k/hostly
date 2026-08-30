'use client'

import { create } from 'zustand'
import { AlertTriangle, Trash2, RefreshCw, CircleDollarSign, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type ConfirmTone = 'danger' | 'warning' | 'emerald'
type ConfirmIcon = 'alert' | 'trash' | 'refresh' | 'money'

export interface ConfirmOptions {
  title: string
  body: string
  confirmLabel?: string
  tone?: ConfirmTone
  icon?: ConfirmIcon
  onConfirm: () => void | Promise<void>
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions | null
  pending: boolean
  confirm: (options: ConfirmOptions) => void
  close: () => void
  setPending: (pending: boolean) => void
}

const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  options: null,
  pending: false,
  confirm: (options) => set({ open: true, options, pending: false }),
  close: () => set({ open: false, pending: false }),
  setPending: (pending) => set({ pending }),
}))

/** Imperative confirm — call `confirm({...})` from anywhere. */
export function useConfirm() {
  return useConfirmStore((s) => s.confirm)
}

const ICONS: Record<ConfirmIcon, LucideIcon> = {
  alert: AlertTriangle,
  trash: Trash2,
  refresh: RefreshCw,
  money: CircleDollarSign,
}

const TONES: Record<ConfirmTone, { iconBg: string; iconFg: string }> = {
  danger: { iconBg: 'var(--danger-tint)', iconFg: '#EF4444' },
  warning: { iconBg: 'var(--amber-tint)', iconFg: '#F59E0B' },
  emerald: { iconBg: 'var(--emerald-tint)', iconFg: '#0EA76B' },
}

export function ConfirmDialogHost() {
  const { open, options, pending, close, setPending } = useConfirmStore()
  if (!options) return <Dialog open={open} onOpenChange={(o) => !o && close()} />

  const tone = options.tone ?? 'danger'
  const Icon = ICONS[options.icon ?? 'alert']
  const toneStyle = TONES[tone]

  async function handleConfirm() {
    try {
      setPending(true)
      await options!.onConfirm()
      close()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent hideClose className="w-[420px]">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: toneStyle.iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: toneStyle.iconFg }} />
        </div>
        <h2 className="text-[17px] font-bold text-ink">{options.title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{options.body}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={tone === 'emerald' ? 'primary' : 'danger'}
            className="flex-1"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? 'Working…' : options.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
