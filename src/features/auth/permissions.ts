import type { Role } from '@/types'

/** Granular permission keys, matching the staff permission matrix. */
export type PermKey =
  | 'dash'
  | 'orders'
  | 'menu'
  | 'pay'
  | 'refund'
  | 'tables'
  | 'staff'
  | 'settings'

/** Roles collapse to four permission groups. */
export type RoleGroup = 'Owner' | 'Manager' | 'Cashier' | 'Kitchen'

export function roleGroup(role: Role): RoleGroup {
  if (role === 'Kitchen Supervisor') return 'Kitchen'
  return role
}

export const DEFAULT_PERMISSIONS: Record<RoleGroup, PermKey[]> = {
  Owner: ['dash', 'orders', 'menu', 'pay', 'refund', 'tables', 'staff', 'settings'],
  Manager: ['dash', 'orders', 'menu', 'pay', 'tables', 'staff'],
  Cashier: ['orders', 'pay', 'refund'],
  Kitchen: ['orders'],
}

/** Each nav route requires one permission key. */
export const ROUTE_PERMISSION: Record<string, PermKey> = {
  dashboard: 'dash',
  orders: 'orders',
  pos: 'pay',
  menu: 'menu',
  categories: 'menu',
  ingredients: 'menu',
  payments: 'pay',
  tables: 'tables',
  customers: 'dash',
  staff: 'staff',
  reports: 'dash',
  settings: 'settings',
}

export function permissionsFor(role: Role): PermKey[] {
  return DEFAULT_PERMISSIONS[roleGroup(role)]
}

export function can(role: Role, perm: PermKey): boolean {
  return permissionsFor(role).includes(perm)
}

export function canAccessRoute(role: Role, route: string): boolean {
  const perm = ROUTE_PERMISSION[route]
  if (!perm) return true
  return can(role, perm)
}

/** Demo credentials shown on the login screen. */
export const DEMO_ACCOUNTS: { role: Role; email: string; password: string; name: string }[] = [
  { role: 'Owner', email: 'maya@riverside.co', password: 'plato2026', name: 'Maya Aronsson' },
  { role: 'Manager', email: 'priya@riverside.co', password: 'plato2026', name: 'Priya Shah' },
  { role: 'Cashier', email: 'devin@riverside.co', password: 'plato2026', name: 'Devin Cole' },
  { role: 'Kitchen Supervisor', email: 'tomas@riverside.co', password: 'plato2026', name: 'Tomas Reuben' },
]
