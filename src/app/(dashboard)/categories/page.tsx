'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GripVertical, Eye, EyeOff, Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { PageBody } from '@/components/page'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useConfirm } from '@/components/confirm-dialog'
import { useCategories, qk } from '@/lib/queries'
import { categoriesService } from '@/server/services'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

export default function CategoriesPage() {
  const { data, isLoading } = useCategories()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [items, setItems] = useState<Category[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  useEffect(() => {
    if (data) setItems(data)
  }, [data])

  const reorder = useMutation({
    mutationFn: (ids: string[]) => categoriesService.reorder(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories })
      toast.success('Order updated')
    },
  })
  const save = useMutation({
    mutationFn: (cat: Category) => categoriesService.upsert(cat),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.categories })
      toast.success(vars.id.startsWith('c_') && data?.some((c) => c.id === vars.id) ? 'Category saved' : 'Category created')
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories })
      toast.success('Category deleted')
    },
  })

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return
    const next = [...items]
    const from = next.findIndex((c) => c.id === dragId)
    const to = next.findIndex((c) => c.id === targetId)
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
    setDragId(null)
    reorder.mutate(next.map((c) => c.id))
  }

  function toggleVisible(c: Category) {
    setItems((s) => s.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)))
    save.mutate({ ...c, visible: !c.visible })
  }

  function askDelete(c: Category) {
    confirm({
      title: `Delete ${c.name}?`,
      body: 'Items in this category will become uncategorized. This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      onConfirm: () => remove.mutateAsync(c.id),
    })
  }

  return (
    <PageBody className="max-w-[760px]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13.5px] text-ink-muted">Drag to reorder how categories appear to guests.</p>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={LayoutGrid} title="No categories" body="Group your menu so guests can find dishes faster." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card
              key={c.id}
              draggable
              onDragStart={() => setDragId(c.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(c.id)}
              className={cn(
                'flex items-center gap-3 p-3.5 transition-shadow',
                dragId === c.id && 'opacity-50',
                'cursor-grab active:cursor-grabbing',
              )}
            >
              <GripVertical className="h-5 w-5 shrink-0 text-ink-faint" />
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
                style={{ background: c.visible ? '#E7F5EE' : '#F3F2EF', color: c.visible ? '#0B7A4F' : '#9CA3AF' }}
              >
                {c.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">{c.name}</div>
                <div className="text-[12.5px] text-ink-faint">{c.count} items</div>
              </div>
              <button
                onClick={() => toggleVisible(c)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-line-soft"
                title={c.visible ? 'Hide from menu' : 'Show on menu'}
              >
                {c.visible ? <Eye className="h-4.5 w-4.5 text-emerald" /> : <EyeOff className="h-4.5 w-4.5" />}
              </button>
              <button
                onClick={() => setEditing(c)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-line-soft"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => askDelete(c)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger-dark"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <CategoryDialog
        category={editing}
        nextSort={items.length}
        onClose={() => setEditing(null)}
        onSave={(c) => {
          save.mutate(c)
          setEditing(null)
        }}
      />
    </PageBody>
  )
}

function CategoryDialog({
  category,
  nextSort,
  onClose,
  onSave,
}: {
  category: Category | 'new' | null
  nextSort: number
  onClose: () => void
  onSave: (c: Category) => void
}) {
  const isNew = category === 'new'
  const base = isNew || !category ? null : category
  const [name, setName] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setName(base?.name ?? '')
    setVisible(base?.visible ?? true)
  }, [category])

  return (
    <Dialog open={!!category} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>{isNew ? 'New category' : 'Edit category'}</DialogTitle>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Specials" autoFocus />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <div>
              <div className="text-[13.5px] font-semibold text-ink">Visible on menu</div>
              <div className="text-[12px] text-ink-faint">Guests can see this category</div>
            </div>
            <Switch checked={visible} onCheckedChange={setVisible} />
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
                id: base?.id ?? 'new',
                name: name.trim(),
                visible,
                count: base?.count ?? 0,
                sort: base?.sort ?? nextSort,
              })
            }
          >
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
