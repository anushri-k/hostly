'use client'

import { useQuery } from '@tanstack/react-query'
import {
  analyticsService,
  categoriesService,
  customersService,
  ingredientsService,
  menuService,
  ordersService,
  paymentsService,
  settingsService,
  staffService,
  tablesService,
} from '@/server/services'

/** Centralised query keys so invalidation stays consistent across the app. */
export const qk = {
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  menu: ['menu'] as const,
  categories: ['categories'] as const,
  ingredients: ['ingredients'] as const,
  payments: ['payments'] as const,
  payment: (id: string) => ['payments', id] as const,
  tables: ['tables'] as const,
  customers: ['customers'] as const,
  staff: ['staff'] as const,
  permissions: ['permissions'] as const,
  settings: ['settings'] as const,
  analytics: ['analytics'] as const,
}

export const useOrders = () => useQuery({ queryKey: qk.orders, queryFn: ordersService.list })
export const useMenu = () => useQuery({ queryKey: qk.menu, queryFn: menuService.list })
export const useCategories = () => useQuery({ queryKey: qk.categories, queryFn: categoriesService.list })
export const useIngredients = () => useQuery({ queryKey: qk.ingredients, queryFn: ingredientsService.list })
export const usePayments = () => useQuery({ queryKey: qk.payments, queryFn: paymentsService.list })
export const useTables = () => useQuery({ queryKey: qk.tables, queryFn: tablesService.list })
export const useCustomers = () => useQuery({ queryKey: qk.customers, queryFn: customersService.list })
export const useStaff = () => useQuery({ queryKey: qk.staff, queryFn: staffService.list })
export const usePermissions = () => useQuery({ queryKey: qk.permissions, queryFn: staffService.getPermissions })
export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: settingsService.get })
export const useAnalytics = () => useQuery({ queryKey: qk.analytics, queryFn: analyticsService.overview })
