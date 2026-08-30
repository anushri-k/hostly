import type {
  Channel,
  CustomerTier,
  DietaryTag,
  OrderStatus,
  PaymentStatus,
  PayMethod,
  TableStatus,
} from '@/types'

export interface Swatch {
  bg: string
  fg: string
  dot?: string
}

export function statusStyle(s: OrderStatus): Swatch {
  const m: Record<string, [string, string, string]> = {
    New: ['#EFF6FF', '#1D4ED8', '#3B82F6'],
    Preparing: ['#FEF6E7', '#B45309', '#F59E0B'],
    Ready: ['#F5F3FF', '#6D28D9', '#8B5CF6'],
    Served: ['#E7F5EE', '#0B7A4F', '#0EA76B'],
    Completed: ['#F3F4F6', '#374151', '#9CA3AF'],
    Cancelled: ['#FEF2F2', '#DC2626', '#EF4444'],
  }
  const x = m[s] || m.Completed
  return { bg: x[0], fg: x[1], dot: x[2] }
}

export function payStyle(p: PaymentStatus): Swatch {
  const m: Record<string, [string, string]> = {
    Paid: ['#E7F5EE', '#0B7A4F'],
    Unpaid: ['#FEF6E7', '#B45309'],
    Refunded: ['#F3F4F6', '#6B7280'],
    Prepaid: ['#E8F0FE', '#1D4ED8'],
  }
  const x = m[p] || m.Unpaid
  return { bg: x[0], fg: x[1] }
}

export function channelStyle(ch: Channel): Swatch {
  const m: Record<string, [string, string, string]> = {
    'Dine-in': ['#F3F4F6', '#374151', '#9CA3AF'],
    Takeaway: ['#EEF2FF', '#3730A3', '#6366F1'],
    Zomato: ['#FDECEE', '#C42333', '#E23744'],
    Swiggy: ['#FFF1E6', '#B65307', '#FC8019'],
  }
  const x = m[ch] || m['Dine-in']
  return { bg: x[0], fg: x[1], dot: x[2] }
}

export function methodStyle(method: PayMethod): Swatch {
  const c =
    ({ Card: '#1D1F24', UPI: '#0EA76B', Cash: '#F59E0B', Wallet: '#3B82F6', Split: '#8B5CF6' } as Record<string, string>)[
      method
    ] || '#6B7280'
  return { bg: c + '1a', fg: c }
}

export function tagColor(t: DietaryTag): string {
  const m: Record<string, string> = {
    Vegetarian: '#0EA76B',
    Vegan: '#16A34A',
    Jain: '#65A30D',
    'Gluten Free': '#0891B2',
    Spicy: '#EF4444',
    'Contains Nuts': '#B45309',
    'Dairy Free': '#7C3AED',
  }
  return m[t] || '#6B7280'
}

export const tableStatusStyle: Record<TableStatus, { bg: string; fg: string; dot: string; label: string }> = {
  Available: { bg: '#E7F5EE', fg: '#0B7A4F', dot: '#0EA76B', label: 'Available' },
  Occupied: { bg: '#EFF6FF', fg: '#1D4ED8', dot: '#3B82F6', label: 'Occupied' },
  Assist: { bg: '#FEF6E7', fg: '#B45309', dot: '#F59E0B', label: 'Needs assistance' },
  Payment: { bg: '#F5F3FF', fg: '#6D28D9', dot: '#8B5CF6', label: 'Payment pending' },
  Cleaning: { bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF', label: 'Cleaning' },
}

export const tierStyle: Record<CustomerTier, Swatch> = {
  Gold: { bg: '#FEF6E7', fg: '#B45309' },
  Silver: { bg: '#F3F4F6', fg: '#6B7280' },
  Member: { bg: '#EFF6FF', fg: '#1D4ED8' },
}

export const ALL_TAGS: DietaryTag[] = ['Vegetarian', 'Vegan', 'Jain', 'Gluten Free', 'Spicy', 'Contains Nuts', 'Dairy Free']

export function isAggregator(ch: Channel) {
  return ch === 'Zomato' || ch === 'Swiggy'
}

/** Deterministic accent colour for an avatar, from a name. */
export function avatarColor(name: string) {
  const known: Record<string, string> = {
    'Maya Aronsson': '#0EA76B',
    'Devin Cole': '#3B82F6',
    'Priya Shah': '#8B5CF6',
  }
  if (known[name]) return known[name]
  const palette = ['#0EA76B', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#0891B2']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length
  return palette[h]
}
