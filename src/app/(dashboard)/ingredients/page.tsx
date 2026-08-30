'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Carrot, AlertTriangle, Link2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { PageBody } from '@/components/page'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useConfirm } from '@/components/confirm-dialog'
import { useIngredients, qk } from '@/lib/queries'
import { ingredientsService } from '@/server/services'
import { useSearch } from '@/features/shell/use-search'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Ingredient } from '@/types'

const EMPTY: Ingredient = { id: 'new', name: '', unit: 'kg', stock: 0, min: 0, cost: 0, supplier: '', linked: 0 }

export default function IngredientsPage() {
  const { data, isLoading } = useIngredients()
  const { query } = useSearch()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [editing, setEditing] = useState<Ingredient | null>(null)

  const save = useMutation({
    mutationFn: (ing: Ingredient) => ingredientsService.upsert(ing),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.ingredients })
      toast.success(vars.id === 'new' ? 'Ingredient added' : 'Ingredient updated')
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => ingredientsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ingredients })
      toast.success('Ingredient deleted')
    },
  })

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? []).filter((i) => !q || i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q))
  }, [data, query])

  const lowCount = (data ?? []).filter((i) => i.stock < i.min).length

  function askDelete(ing: Ingredient) {
    confirm({
      title: `Delete ${ing.name}?`,
      body: 'This ingredient and its menu mappings will be removed.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      onConfirm: () => remove.mutateAsync(ing.id),
    })
  }

  return (
    <PageBody>
      {/* Low stock alert */}
      {lowCount > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber/40 bg-amber-tint px-4 py-3 animate-ho-rise">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber" />
          <div className="text-[13.5px] text-amber-dark">
            <span className="font-bold">{lowCount} ingredient{lowCount > 1 ? 's' : ''}</span> below the minimum threshold — reorder soon.
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-ink-muted">{list.length} ingredients tracked</p>
        <Button onClick={() => setEditing(EMPTY)}>
          <Plus className="h-4 w-4" /> Add ingredient
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={Carrot} title="No ingredients" body="Track stock and suppliers to power low-stock alerts." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1.4fr_1fr_1.2fr_auto] gap-4 border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint md:grid">
            <span>Ingredient</span>
            <span>Stock</span>
            <span>Level</span>
            <span>Cost</span>
            <span>Supplier</span>
            <span />
          </div>
          {list.map((ing, i) => {
            const low = ing.stock < ing.min
            const barPct = Math.min(100, Math.round((ing.stock / (ing.min * 1.6)) * 100))
            return (
              <div
                key={ing.id}
                className={cn(
                  'grid grid-cols-2 items-center gap-4 px-5 py-3.5 md:grid-cols-[2fr_1fr_1.4fr_1fr_1.2fr_auto]',
                  i !== list.length - 1 && 'border-b border-line-soft',
                )}
              >
                <div>
                  <div className="text-[14px] font-semibold text-ink">{ing.name}</div>
                  <div className="flex items-center gap-1 text-[12px] text-ink-faint">
                    <Link2 className="h-3 w-3" /> {ing.linked} items
                  </div>
                </div>
                <div className="text-[13.5px] font-semibold" style={{ color: low ? '#DC2626' : 'var(--ink)' }}>
                  {ing.stock} {ing.unit}
                </div>
                <div className="hidden md:block">
                  <div className="h-2 overflow-hidden rounded-full bg-line-soft">
                    <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: low ? '#EF4444' : '#0EA76B' }} />
                  </div>
                  <div className="mt-1 text-[11px] text-ink-faint">min {ing.min} {ing.unit}</div>
                </div>
                <div className="hidden text-[13.5px] text-ink md:block">{money(ing.cost)}</div>
                <div className="hidden text-[13px] text-ink-muted md:block">{ing.supplier}</div>
                <div className="flex items-center justify-end gap-2">
                  <Badge bg={low ? '#FEF2F2' : '#E7F5EE'} fg={low ? '#DC2626' : '#0B7A4F'}>
                    {low ? 'Low stock' : 'In stock'}
                  </Badge>
                  <button onClick={() => setEditing(ing)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-line-soft">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => askDelete(ing)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-danger-tint hover:text-danger-dark">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      <IngredientDialog
        ingredient={editing}
        onClose={() => setEditing(null)}
        onSave={(ing) => {
          save.mutate(ing)
          setEditing(null)
        }}
      />
    </PageBody>
  )
}

function IngredientDialog({
  ingredient,
  onClose,
  onSave,
}: {
  ingredient: Ingredient | null
  onClose: () => void
  onSave: (ing: Ingredient) => void
}) {
  const [form, setForm] = useState<Ingredient>(EMPTY)
  useEffect(() => {
    if (ingredient) setForm(ingredient)
  }, [ingredient])

  const set = (patch: Partial<Ingredient>) => setForm((f) => ({ ...f, ...patch }))
  const field = 'mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint'

  return (
    <Dialog open={!!ingredient} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px]">
        <DialogTitle>{ingredient?.id === 'new' ? 'Add ingredient' : 'Edit ingredient'}</DialogTitle>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={field}>Name</label>
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Beef Patty" autoFocus />
          </div>
          <div>
            <label className={field}>Unit</label>
            <select
              value={form.unit}
              onChange={(e) => set({ unit: e.target.value })}
              className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[13.5px] text-ink outline-none focus-visible:border-emerald"
            >
              {['kg', 'g', 'L', 'ml', 'units'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={field}>Cost ($)</label>
            <Input type="number" step="0.1" value={form.cost} onChange={(e) => set({ cost: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className={field}>Current stock</label>
            <Input type="number" step="0.1" value={form.stock} onChange={(e) => set({ stock: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className={field}>Min threshold</label>
            <Input type="number" step="0.1" value={form.min} onChange={(e) => set({ min: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="col-span-2">
            <label className={field}>Supplier</label>
            <Input value={form.supplier} onChange={(e) => set({ supplier: e.target.value })} placeholder="Highland Farms" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!form.name.trim()} onClick={() => onSave(form)}>
            {ingredient?.id === 'new' ? 'Add' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
