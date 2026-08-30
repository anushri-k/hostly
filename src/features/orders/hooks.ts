'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ordersService } from '@/server/services'
import { qk } from '@/lib/queries'
import type { Order, OrderStatus } from '@/types'

/**
 * Order mutations with optimistic updates: the table/drawer reflect the new
 * status immediately, and roll back if the service rejects.
 */
function useOptimisticOrder<TArgs>(
  mutationFn: (args: TArgs) => Promise<Order>,
  apply: (order: Order, args: TArgs) => Order,
  successMsg: (args: TArgs, order: Order) => string,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (args: TArgs) => {
      await qc.cancelQueries({ queryKey: qk.orders })
      const prev = qc.getQueryData<Order[]>(qk.orders)
      if (prev) {
        qc.setQueryData<Order[]>(
          qk.orders,
          prev.map((o) => apply(o, args)),
        )
      }
      return { prev }
    },
    onError: (_e, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.orders, ctx.prev)
      toast.error('Could not update order')
    },
    onSuccess: (order, args) => {
      toast.success(successMsg(args, order))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.orders })
    },
  })
}

const FLOW: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Served', 'Completed']
const next = (s: OrderStatus) => {
  const i = FLOW.indexOf(s)
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : s
}

export function useAdvanceOrder() {
  return useOptimisticOrder<{ id: string }>(
    ({ id }) => ordersService.advance(id),
    (o, { id }) => (o.id === id ? { ...o, status: next(o.status) } : o),
    ({ id }, order) => `${id} → ${order.status}`,
  )
}

export function useSetOrderStatus() {
  return useOptimisticOrder<{ id: string; status: OrderStatus }>(
    ({ id, status }) => ordersService.setStatus(id, status),
    (o, { id, status }) =>
      o.id === id ? { ...o, status, payment: status === 'Cancelled' ? 'Refunded' : o.payment } : o,
    ({ id, status }) => (status === 'Cancelled' ? `${id} cancelled` : `${id} marked ${status}`),
  )
}

export function useConvertTakeaway() {
  return useOptimisticOrder<{ id: string }>(
    ({ id }) => ordersService.convertToTakeaway(id),
    (o, { id }) => (o.id === id ? { ...o, channel: 'Takeaway', type: 'Takeaway', table: 'TA' } : o),
    ({ id }) => `${id} converted to takeaway`,
  )
}

export function useAssignStaff() {
  return useOptimisticOrder<{ id: string; staff: string }>(
    ({ id, staff }) => ordersService.assignStaff(id, staff),
    (o, { id, staff }) => (o.id === id ? { ...o, staff } : o),
    ({ staff }) => `Assigned to ${staff}`,
  )
}
