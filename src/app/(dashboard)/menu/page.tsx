'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  Trash2,
  UtensilsCrossed,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { PageBody } from '@/components/page'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MenuEditor } from '@/features/menu/menu-editor'
import {
  useToggleAvailability,
  useDuplicateMenuItem,
  useArchiveMenuItem,
  useDeleteMenuItem,
} from '@/features/menu/hooks'
import { useConfirm } from '@/components/confirm-dialog'
import { useMenu, useCategories } from '@/lib/queries'
import { useSearch } from '@/features/shell/use-search'
import { money0 } from '@/lib/format'
import { cn } from '@/lib/utils'
import { tagColor } from '@/lib/domain-styles'
import type { MenuItem } from '@/types'

type Sort = 'name' | 'price-asc' | 'price-desc' | 'prep'

export default function MenuPage() {
  const { data: menu, isLoading } = useMenu()
  const { data: categories } = useCategories()
  const { query } = useSearch()
  const confirm = useConfirm()
  const toggle = useToggleAvailability()
  const duplicate = useDuplicateMenuItem()
  const archive = useArchiveMenuItem()
  const del = useDeleteMenuItem()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState<Sort>('name')
  const [editor, setEditor] = useState<MenuItem | 'new' | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = (menu ?? []).filter((m) => !m.archived)
    if (cat !== 'All') list = list.filter((m) => m.cat === cat)
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'prep') return a.prep - b.prep
      return a.name.localeCompare(b.name)
    })
    return list
  }, [menu, cat, query, sort])

  const catNames = ['All', ...(categories ?? []).map((c) => c.name)]
  const selectedIds = Object.keys(selected).filter((id) => selected[id])

  function askDelete(item: MenuItem) {
    confirm({
      title: `Delete ${item.name}?`,
      body: 'This item will be removed from the menu and any linked combos.',
      confirmLabel: 'Delete',
      tone: 'danger',
      icon: 'trash',
      onConfirm: () => del.mutateAsync(item.id),
    })
  }

  function ItemActions({ item }: { item: MenuItem }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditor(item)}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicate.mutate(item.id)}>
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => archive.mutate({ id: item.id, archived: true })}>
            <Archive className="h-4 w-4" /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => askDelete(item)}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <PageBody>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {catNames.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                cat === c
                  ? 'border-graphite bg-graphite text-white'
                  : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-xl border border-line-strong bg-card px-3 text-[13px] font-medium text-ink outline-none focus-visible:border-emerald"
          >
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="prep">Prep time</option>
          </select>
          <div className="flex gap-1 rounded-xl bg-line-soft p-1">
            <button
              onClick={() => setView('grid')}
              className={cn('rounded-lg p-1.5', view === 'grid' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('rounded-lg p-1.5', view === 'list' ? 'bg-card text-ink shadow-sm' : 'text-ink-muted')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setEditor('new')}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald-tint px-4 py-2.5 animate-ho-rise">
          <span className="text-[13px] font-semibold text-emerald-dark">{selectedIds.length} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { selectedIds.forEach((id) => archive.mutate({ id, archived: true })); setSelected({}) }}>
              <Archive className="h-4 w-4" /> Archive
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={UtensilsCrossed}
            title="No items found"
            body="Adjust your search or category, or add a new dish."
            action={<Button onClick={() => setEditor('new')}><Plus className="h-4 w-4" /> Add item</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <Card
              key={m.id}
              className={cn('cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-pop', !m.avail && 'opacity-60')}
              onClick={() => setEditor(m)}
            >
              <div className="relative flex h-28 items-end bg-[repeating-linear-gradient(45deg,#EFEEEA,#EFEEEA_8px,#E7E6E1_8px,#E7E6E1_16px)] p-3">
                <span className="rounded-md bg-white/70 px-2 py-0.5 font-mono text-[9px] text-[#A8A6A0]">{m.cat}</span>
                {m.badge && (
                  <Badge
                    className="absolute left-3 top-3"
                    bg={m.badge === 'Chef Special' ? '#1D1F24' : '#E7F5EE'}
                    fg={m.badge === 'Chef Special' ? '#fff' : '#0B7A4F'}
                  >
                    {m.badge}
                  </Badge>
                )}
                <div className="absolute right-2.5 top-2.5" onClick={(e) => e.stopPropagation()}>
                  <ItemActions item={m} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[14.5px] font-bold text-ink">{m.name}</div>
                  <div className="text-[15px] font-bold text-ink">{money0(m.price)}</div>
                </div>
                <div className="mt-1 line-clamp-1 text-[12.5px] text-ink-muted">{m.desc}</div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {m.tags.map((t) => (
                    <Badge key={t} bg={tagColor(t) + '1a'} fg={tagColor(t)}>
                      {t}
                    </Badge>
                  ))}
                  <span className="flex items-center gap-1 text-[11.5px] text-ink-faint">
                    <Clock className="h-3 w-3" /> {m.prep}m
                  </span>
                  {m.sizes && m.sizes.length > 0 && (
                    <span className="rounded-full bg-line-soft px-2 py-0.5 text-[10.5px] font-semibold text-ink-muted">
                      {m.sizes.length} sizes
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[12.5px] font-medium text-ink-muted">{m.avail ? 'Available' : 'Sold out'}</span>
                  <Switch checked={m.avail} onCheckedChange={() => toggle.mutate(m.id)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {items.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                'flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-line-soft/60',
                i !== items.length - 1 && 'border-b border-line-soft',
                !m.avail && 'opacity-60',
              )}
              onClick={() => setEditor(m)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={!!selected[m.id]}
                  onCheckedChange={(v) => setSelected((s) => ({ ...s, [m.id]: !!v }))}
                />
              </div>
              <div className="h-11 w-11 shrink-0 rounded-xl bg-[repeating-linear-gradient(45deg,#EFEEEA,#EFEEEA_6px,#E7E6E1_6px,#E7E6E1_12px)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{m.name}</span>
                  {m.badge && (
                    <Badge bg={m.badge === 'Chef Special' ? '#1D1F24' : '#E7F5EE'} fg={m.badge === 'Chef Special' ? '#fff' : '#0B7A4F'}>
                      {m.badge}
                    </Badge>
                  )}
                </div>
                <div className="truncate text-[12.5px] text-ink-muted">
                  {m.sku} · {m.desc}
                </div>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                {m.tags.map((t) => (
                  <Badge key={t} bg={tagColor(t) + '1a'} fg={tagColor(t)}>
                    {t}
                  </Badge>
                ))}
                {m.sizes && m.sizes.length > 0 && (
                  <span className="rounded-full bg-line-soft px-2 py-0.5 text-[10.5px] font-semibold text-ink-muted">
                    {m.sizes.length} sizes
                  </span>
                )}
              </div>
              <div className="w-16 text-right text-[14px] font-bold text-ink">{money0(m.price)}</div>
              <div onClick={(e) => e.stopPropagation()}>
                <Switch checked={m.avail} onCheckedChange={() => toggle.mutate(m.id)} />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ItemActions item={m} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <MenuEditor item={editor} onClose={() => setEditor(null)} />
    </PageBody>
  )
}
