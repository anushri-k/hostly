import * as seed from './seed'
import type {
  Category,
  Customer,
  Ingredient,
  MenuItem,
  Order,
  RestaurantSettings,
  RestaurantTable,
  StaffMember,
  Transaction,
} from '@/types'

/**
 * In-memory database for the mock backend.
 *
 * A single mutable copy of the seed data lives on `globalThis` so it survives
 * Next.js HMR and is shared across every service call within a session. When a
 * real backend exists, the service layer (services.ts) is the only thing that
 * needs to change — nothing reaches into this module directly from the UI.
 */
interface DB {
  orders: Order[]
  menu: MenuItem[]
  categories: Category[]
  ingredients: Ingredient[]
  transactions: Transaction[]
  tables: RestaurantTable[]
  customers: Customer[]
  staff: StaffMember[]
  settings: RestaurantSettings
  permissions: Record<string, string[]>
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

function create(): DB {
  return {
    orders: clone(seed.orders),
    menu: clone(seed.menu),
    categories: clone(seed.categories),
    ingredients: clone(seed.ingredients),
    transactions: clone(seed.transactions),
    tables: clone(seed.tables),
    customers: clone(seed.customers),
    staff: clone(seed.staff),
    settings: clone(seed.settings),
    permissions: {
      Owner: ['dash', 'orders', 'menu', 'pay', 'refund', 'tables', 'staff', 'settings'],
      Manager: ['dash', 'orders', 'menu', 'pay', 'tables', 'staff'],
      Cashier: ['orders', 'pay', 'refund'],
      Kitchen: ['orders'],
    },
  }
}

const g = globalThis as unknown as { __hostlyDB?: DB }
export const db: DB = g.__hostlyDB ?? (g.__hostlyDB = create())
