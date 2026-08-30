import { delay } from '@/lib/utils'
import { db } from './store'
import { analytics } from './seed'
import type {
  Category,
  Customer,
  Ingredient,
  MenuItem,
  Order,
  OrderStatus,
  RestaurantSettings,
  RestaurantTable,
  StaffMember,
  Transaction,
} from '@/types'

/**
 * Service layer — the single boundary between the UI and the data source.
 * Every method is async and returns plain data, so each can later be swapped
 * for a `fetch()` to a real API without touching any component or hook.
 */

const ORDER_FLOW: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Served', 'Completed']

export function orderTotals(o: Order) {
  const sub = o.items.reduce((a, i) => a + i.price * i.qty, 0)
  const tax = sub * 0.05
  const service = sub * 0.1
  const disc = o.discount || 0
  return { sub, tax, service, disc, total: sub + tax + service - disc }
}

export const ordersService = {
  async list(): Promise<Order[]> {
    await delay()
    return [...db.orders]
  },
  async get(id: string): Promise<Order | undefined> {
    await delay(120)
    return db.orders.find((o) => o.id === id)
  },
  async advance(id: string): Promise<Order> {
    await delay(150)
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    const i = ORDER_FLOW.indexOf(o.status)
    if (i >= 0 && i < ORDER_FLOW.length - 1) o.status = ORDER_FLOW[i + 1]
    return { ...o }
  },
  async setStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay(150)
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    o.status = status
    if (status === 'Cancelled') o.payment = 'Refunded'
    return { ...o }
  },
  async convertToTakeaway(id: string): Promise<Order> {
    await delay(150)
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    o.channel = 'Takeaway'
    o.type = 'Takeaway'
    o.table = 'TA'
    return { ...o }
  },
  async assignStaff(id: string, staff: string): Promise<Order> {
    await delay(150)
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    o.staff = staff
    return { ...o }
  },
}

export const menuService = {
  async list(): Promise<MenuItem[]> {
    await delay()
    return [...db.menu]
  },
  async upsert(item: MenuItem): Promise<MenuItem> {
    await delay(200)
    const idx = db.menu.findIndex((m) => m.id === item.id)
    if (idx >= 0) db.menu[idx] = item
    else db.menu.push({ ...item, id: 'm_' + Date.now().toString(36) })
    return item
  },
  async toggleAvailability(id: string): Promise<MenuItem> {
    await delay(120)
    const m = db.menu.find((x) => x.id === id)
    if (!m) throw new Error('Item not found')
    m.avail = !m.avail
    return { ...m }
  },
  async duplicate(id: string): Promise<MenuItem> {
    await delay(150)
    const m = db.menu.find((x) => x.id === id)
    if (!m) throw new Error('Item not found')
    const copy: MenuItem = { ...m, id: 'm_' + Date.now().toString(36), name: m.name + ' (copy)', badge: null, featured: false }
    db.menu.push(copy)
    return copy
  },
  async archive(id: string, archived: boolean): Promise<MenuItem> {
    await delay(120)
    const m = db.menu.find((x) => x.id === id)
    if (!m) throw new Error('Item not found')
    m.archived = archived
    return { ...m }
  },
  async remove(id: string): Promise<void> {
    await delay(150)
    db.menu = db.menu.filter((m) => m.id !== id)
  },
}

export const categoriesService = {
  async list(): Promise<Category[]> {
    await delay()
    return [...db.categories].sort((a, b) => a.sort - b.sort)
  },
  async upsert(cat: Category): Promise<Category> {
    await delay(180)
    const idx = db.categories.findIndex((c) => c.id === cat.id)
    if (idx >= 0) db.categories[idx] = cat
    else db.categories.push({ ...cat, id: 'c_' + Date.now().toString(36) })
    return cat
  },
  async reorder(ids: string[]): Promise<Category[]> {
    await delay(120)
    ids.forEach((id, i) => {
      const c = db.categories.find((x) => x.id === id)
      if (c) c.sort = i
    })
    return [...db.categories].sort((a, b) => a.sort - b.sort)
  },
  async remove(id: string): Promise<void> {
    await delay(150)
    db.categories = db.categories.filter((c) => c.id !== id)
  },
}

export const ingredientsService = {
  async list(): Promise<Ingredient[]> {
    await delay()
    return [...db.ingredients]
  },
  async upsert(ing: Ingredient): Promise<Ingredient> {
    await delay(180)
    const idx = db.ingredients.findIndex((i) => i.id === ing.id)
    if (idx >= 0) db.ingredients[idx] = ing
    else db.ingredients.push({ ...ing, id: 'i_' + Date.now().toString(36) })
    return ing
  },
  async remove(id: string): Promise<void> {
    await delay(150)
    db.ingredients = db.ingredients.filter((i) => i.id !== id)
  },
}

export const paymentsService = {
  async list(): Promise<Transaction[]> {
    await delay()
    return [...db.transactions]
  },
  async get(id: string): Promise<Transaction | undefined> {
    await delay(120)
    return db.transactions.find((t) => t.id === id)
  },
  async refund(id: string): Promise<Transaction> {
    await delay(200)
    const t = db.transactions.find((x) => x.id === id)
    if (!t) throw new Error('Transaction not found')
    t.status = 'Refunded'
    return { ...t }
  },
}

// ---------- Point of Sale ----------
export interface PosLine {
  id: string
  name: string
  price: number
  qty: number
  size?: string
}

export interface PosCheckout {
  tableId: string | null
  takeaway: boolean
  customer?: string
  items: PosLine[]
  staff: string
  discount: number
  method: Transaction['method']
  tip: number
}

function clock() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function nextOrderId() {
  const nums = db.orders
    .map((o) => (/^#\d+$/.test(o.id) ? parseInt(o.id.slice(1), 10) : 0))
    .filter((n) => n > 0)
  const max = nums.length ? Math.max(...nums) : 1289
  return '#' + (max + 1)
}

function nextPaymentId() {
  const nums = db.transactions.map((t) => parseInt(t.id.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n))
  const max = nums.length ? Math.max(...nums) : 7741
  return 'PAY-' + (max + 1)
}

export const posService = {
  /** Ring up a ticket: creates a live order + its payment, returns both. */
  async checkout(input: PosCheckout): Promise<{ order: Order; transaction: Transaction }> {
    await delay(400)
    const sub = input.items.reduce((a, i) => a + i.price * i.qty, 0)
    const tax = sub * 0.05
    const service = input.takeaway ? 0 : sub * 0.1
    const total = sub + tax + service - input.discount

    const order: Order = {
      id: nextOrderId(),
      channel: input.takeaway ? 'Takeaway' : 'Dine-in',
      type: input.takeaway ? 'Takeaway' : 'Dine-in',
      table: input.takeaway ? 'TA' : input.tableId ?? '—',
      customer: input.customer?.trim() || 'Walk-in',
      items: input.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, mods: i.size })),
      time: clock(),
      staff: input.staff,
      status: 'New',
      payment: 'Paid',
      discount: input.discount || undefined,
    }
    db.orders.unshift(order)

    const transaction: Transaction = {
      id: nextPaymentId(),
      order: order.id,
      table: order.table,
      method: input.method,
      amount: total + input.tip,
      tip: input.tip,
      time: order.time,
      status: 'Paid',
    }
    db.transactions.unshift(transaction)

    // Mark the seated table occupied.
    if (!input.takeaway && input.tableId) {
      const t = db.tables.find((x) => x.id === input.tableId)
      if (t) t.status = 'Occupied'
    }

    return { order, transaction }
  },
}

export const tablesService = {
  async list(): Promise<RestaurantTable[]> {
    await delay()
    return [...db.tables]
  },
  async upsert(table: RestaurantTable): Promise<RestaurantTable> {
    await delay(180)
    const idx = db.tables.findIndex((t) => t.id === table.id)
    if (idx >= 0) db.tables[idx] = table
    else db.tables.push(table)
    return table
  },
  async setStatus(id: string, status: RestaurantTable['status']): Promise<RestaurantTable> {
    await delay(120)
    const t = db.tables.find((x) => x.id === id)
    if (!t) throw new Error('Table not found')
    t.status = status
    return { ...t }
  },
  async remove(id: string): Promise<void> {
    await delay(150)
    db.tables = db.tables.filter((t) => t.id !== id)
  },
  async regenerateQR(id: string): Promise<{ tableId: string; token: string }> {
    await delay(200)
    return { tableId: id, token: 'qr_' + Math.random().toString(36).slice(2, 10) }
  },
}

export const customersService = {
  async list(): Promise<Customer[]> {
    await delay()
    return [...db.customers]
  },
  async get(id: string): Promise<Customer | undefined> {
    await delay(120)
    return db.customers.find((c) => c.id === id)
  },
}

export const staffService = {
  async list(): Promise<StaffMember[]> {
    await delay()
    return [...db.staff]
  },
  async invite(member: Omit<StaffMember, 'id' | 'last'>): Promise<StaffMember> {
    await delay(200)
    const created: StaffMember = { ...member, id: 'st_' + Date.now().toString(36), last: 'Invited' }
    db.staff.push(created)
    return created
  },
  async update(id: string, patch: Partial<StaffMember>): Promise<StaffMember> {
    await delay(150)
    const m = db.staff.find((x) => x.id === id)
    if (!m) throw new Error('Staff not found')
    Object.assign(m, patch)
    return { ...m }
  },
  async remove(id: string): Promise<void> {
    await delay(150)
    db.staff = db.staff.filter((m) => m.id !== id)
  },
  async getPermissions(): Promise<Record<string, string[]>> {
    await delay(120)
    return JSON.parse(JSON.stringify(db.permissions))
  },
  async setPermissions(perms: Record<string, string[]>): Promise<Record<string, string[]>> {
    await delay(150)
    db.permissions = perms
    return JSON.parse(JSON.stringify(perms))
  },
}

export const settingsService = {
  async get(): Promise<RestaurantSettings> {
    await delay(150)
    return { ...db.settings }
  },
  async update(patch: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    await delay(180)
    Object.assign(db.settings, patch)
    return { ...db.settings }
  },
}

export const analyticsService = {
  async overview() {
    await delay()
    return analytics
  },
}
