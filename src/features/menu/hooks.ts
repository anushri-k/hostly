'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuService } from '@/server/services'
import { qk } from '@/lib/queries'
import type { MenuItem } from '@/types'

export function useToggleAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuService.toggleAvailability(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.menu })
      const prev = qc.getQueryData<MenuItem[]>(qk.menu)
      if (prev) qc.setQueryData<MenuItem[]>(qk.menu, prev.map((m) => (m.id === id ? { ...m, avail: !m.avail } : m)))
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.menu, ctx.prev)
      toast.error('Could not update availability')
    },
    onSuccess: (item) => toast.success(item.avail ? 'Item available' : 'Item marked sold out'),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.menu }),
  })
}

export function useSaveMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: MenuItem) => menuService.upsert(item),
    onSuccess: (_item, vars) => {
      qc.invalidateQueries({ queryKey: qk.menu })
      toast.success(vars.id === 'new' ? 'Menu item created' : 'Changes saved')
    },
    onError: () => toast.error('Could not save item'),
  })
}

export function useDuplicateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuService.duplicate(id),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: qk.menu })
      toast.success(`Duplicated "${item.name}"`)
    },
  })
}

export function useArchiveMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => menuService.archive(id, archived),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: qk.menu })
      toast.success(item.archived ? 'Item archived' : 'Item restored')
    },
  })
}

export function useDeleteMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.menu })
      toast.success('Item deleted')
    },
  })
}
