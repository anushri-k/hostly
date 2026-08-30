'use client'

import { useForm, useFieldArray, Controller, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { money0 } from '@/lib/format'
import { ALL_TAGS, tagColor } from '@/lib/domain-styles'
import { categories as categorySeed, ingredients as ingredientSeed } from '@/server/seed'
import type { DietaryTag, MenuBadge, MenuItem } from '@/types'
import { useSaveMenuItem } from './hooks'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  desc: z.string().max(200, 'Keep it under 200 characters').optional().or(z.literal('')),
  cat: z.string().min(1),
  price: z.coerce.number().min(0, 'Price must be positive'),
  sku: z.string().min(1, 'SKU is required'),
  prep: z.coerce.number().int().min(0).max(120),
  badge: z.enum(['Chef Special', 'Recommended', 'None']),
  avail: z.boolean(),
  featured: z.boolean(),
  tags: z.array(z.string()),
  sizes: z.array(z.object({ name: z.string().min(1, 'Name required'), price: z.coerce.number().min(0) })),
  addons: z.array(z.object({ name: z.string().min(1), price: z.coerce.number().min(0) })),
  ingredients: z.array(z.object({ id: z.string(), qty: z.coerce.number().min(0) })),
})
type FormValues = z.infer<typeof schema>

const LABEL = 'mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-faint'

export function MenuEditor({ item, onClose }: { item: MenuItem | null | 'new'; onClose: () => void }) {
  const isNew = item === 'new'
  const base = isNew || !item ? null : (item as MenuItem)
  const save = useSaveMenuItem()

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: base?.name ?? '',
      desc: base?.desc ?? '',
      cat: base?.cat ?? 'Mains',
      price: base?.price ?? 0,
      sku: base?.sku ?? '',
      prep: base?.prep ?? 10,
      badge: (base?.badge ?? 'None') as 'Chef Special' | 'Recommended' | 'None',
      avail: base?.avail ?? true,
      featured: base?.featured ?? false,
      tags: base?.tags ?? [],
      sizes: base?.sizes ?? [],
      addons: [],
      ingredients: [],
    },
  })

  const sizes = useFieldArray({ control, name: 'sizes' })
  const addons = useFieldArray({ control, name: 'addons' })
  const ingredients = useFieldArray({ control, name: 'ingredients' })
  const w = watch()

  async function onSubmit(values: FormValues) {
    const payload: MenuItem = {
      id: base?.id ?? 'new',
      name: values.name,
      desc: values.desc ?? '',
      cat: values.cat,
      price: values.price,
      sku: values.sku,
      prep: values.prep,
      badge: (values.badge === 'None' ? null : values.badge) as MenuBadge,
      avail: values.avail,
      featured: values.featured,
      tags: values.tags as DietaryTag[],
      sizes: values.sizes.length ? values.sizes : undefined,
    }
    await save.mutateAsync(payload)
    onClose()
  }

  function toggleTag(tag: string, current: string[], onChange: (v: string[]) => void) {
    onChange(current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag])
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent width={560}>
        <SheetHeader>
          <div>
            <SheetTitle>{isNew ? 'New menu item' : 'Edit item'}</SheetTitle>
            <SheetDescription>Changes sync to every channel instantly.</SheetDescription>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Live preview */}
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-[19px] text-ink">{w.name || 'New item'}</div>
                  <div className="mt-1 max-w-sm text-[13px] text-ink-muted">
                    {w.desc || 'Add a short, appetizing description so guests know what to expect.'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-bold text-ink">{money0(Number(w.price) || 0)}</div>
                  {w.sizes.length > 0 && (
                    <div className="text-[11px] text-ink-faint">
                      {w.sizes.length} size{w.sizes.length > 1 ? 's' : ''} ·{' '}
                      {money0(Math.min(...w.sizes.map((s) => Number(s.price) || 0)))}–
                      {money0(Math.max(...w.sizes.map((s) => Number(s.price) || 0)))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {w.badge !== 'None' && (
                  <Badge
                    bg={w.badge === 'Chef Special' ? '#1D1F24' : '#E7F5EE'}
                    fg={w.badge === 'Chef Special' ? '#fff' : '#0B7A4F'}
                  >
                    {w.badge}
                  </Badge>
                )}
                {w.tags.map((t) => (
                  <Badge key={t} bg={tagColor(t as DietaryTag) + '1a'} fg={tagColor(t as DietaryTag)}>
                    {t}
                  </Badge>
                ))}
                <span className="text-[12px] text-ink-faint">· {w.prep || 0} min</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL}>Name</label>
                <Input {...register('name')} placeholder="e.g. Plato Burger" />
                {errors.name && <p className="mt-1 text-[12px] text-danger">{errors.name.message}</p>}
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Description</label>
                <Textarea {...register('desc')} placeholder="Aged cheddar, house sauce, brioche bun" />
              </div>
              <div>
                <label className={LABEL}>Category</label>
                <select
                  {...register('cat')}
                  className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[13.5px] text-ink outline-none focus-visible:border-emerald"
                >
                  {categorySeed.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Price ($)</label>
                <Input type="number" step="0.5" {...register('price')} />
                {errors.price && <p className="mt-1 text-[12px] text-danger">{errors.price.message}</p>}
              </div>
              <div>
                <label className={LABEL}>SKU</label>
                <Input {...register('sku')} placeholder="MN-014" />
                {errors.sku && <p className="mt-1 text-[12px] text-danger">{errors.sku.message}</p>}
              </div>
              <div>
                <label className={LABEL}>Prep time (min)</label>
                <Input type="number" {...register('prep')} />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Badge</label>
                <div className="flex gap-2">
                  {(['None', 'Recommended', 'Chef Special'] as const).map((b) => (
                    <Controller
                      key={b}
                      control={control}
                      name="badge"
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(b)}
                          className={cn(
                            'flex-1 rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors',
                            field.value === b
                              ? 'border-emerald bg-emerald-tint text-emerald-dark'
                              : 'border-line-strong bg-card text-ink-muted hover:bg-line-soft',
                          )}
                        >
                          {b}
                        </button>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dietary tags */}
            <div>
              <label className={LABEL}>Dietary tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((t) => {
                      const on = field.value.includes(t)
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t, field.value, field.onChange)}
                          className="rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                          style={{
                            background: on ? tagColor(t) + '1a' : 'var(--line-soft)',
                            color: on ? tagColor(t) : 'var(--ink-faint)',
                            borderColor: on ? tagColor(t) : 'transparent',
                          }}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-1 rounded-2xl border border-line">
              <ToggleRow control={control} name="avail" label="Available" sub="Guests can order this item now" />
              <div className="h-px bg-line-soft" />
              <ToggleRow control={control} name="featured" label="Featured" sub="Pin to the top of its category" />
            </div>

            {/* Modifiers: size variants */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={cn(LABEL, 'mb-0')}>Plate sizes</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => sizes.append({ name: '', price: Number(w.price) || 0 })}>
                  <Plus className="h-4 w-4" /> Add size
                </Button>
              </div>
              <div className="space-y-2">
                {sizes.fields.length === 0 && (
                  <p className="text-[12.5px] text-ink-faint">
                    Single size at the base price. Add variants like Regular / Large to charge per portion.
                  </p>
                )}
                {sizes.fields.map((f, i) => (
                  <div key={f.id} className="flex gap-2">
                    <Input placeholder="e.g. Large" {...register(`sizes.${i}.name`)} className="flex-1" />
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">$</span>
                      <Input type="number" step="0.5" placeholder="0" {...register(`sizes.${i}.price`)} className="pl-6" />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => sizes.remove(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.sizes && <p className="text-[12px] text-danger">Every size needs a name and price.</p>}
              </div>
            </div>

            {/* Modifiers: add-ons */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={cn(LABEL, 'mb-0')}>Add-ons (optional)</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addons.append({ name: '', price: 0 })}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {addons.fields.length === 0 && <p className="text-[12.5px] text-ink-faint">No add-ons yet.</p>}
                {addons.fields.map((f, i) => (
                  <div key={f.id} className="flex gap-2">
                    <Input placeholder="Extra cheese" {...register(`addons.${i}.name`)} className="flex-1" />
                    <Input type="number" step="0.5" placeholder="2" {...register(`addons.${i}.price`)} className="w-24" />
                    <Button type="button" variant="outline" size="icon" onClick={() => addons.remove(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredient mapping */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={cn(LABEL, 'mb-0')}>Ingredient mapping</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => ingredients.append({ id: ingredientSeed[0].id, qty: 1 })}>
                  <Plus className="h-4 w-4" /> Attach
                </Button>
              </div>
              <div className="space-y-2">
                {ingredients.fields.length === 0 && <p className="text-[12.5px] text-ink-faint">No ingredients mapped.</p>}
                {ingredients.fields.map((f, i) => (
                  <div key={f.id} className="flex gap-2">
                    <select
                      {...register(`ingredients.${i}.id`)}
                      className="h-10 flex-1 rounded-xl border border-line-strong bg-card px-3 text-[13px] text-ink outline-none focus-visible:border-emerald"
                    >
                      {ingredientSeed.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                    <Input type="number" step="0.1" {...register(`ingredients.${i}.qty`)} className="w-24" />
                    <Button type="button" variant="outline" size="icon" onClick={() => ingredients.remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-line p-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isNew ? 'Create item' : 'Save changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function ToggleRow({
  control,
  name,
  label,
  sub,
}: {
  control: Control<FormValues>
  name: 'avail' | 'featured'
  label: string
  sub: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-[13.5px] font-semibold text-ink">{label}</div>
        <div className="text-[12px] text-ink-faint">{sub}</div>
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
      />
    </div>
  )
}
