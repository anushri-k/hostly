// ---------- Auth & people ----------
export type Role = 'Owner' | 'Manager' | 'Cashier' | 'Kitchen Supervisor'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  initials: string
}

export interface SessionRestaurant {
  id: string
  name: string
  tagline: string
  email: string
  phone: string
}

export interface SessionBranch {
  id: string
  name: string
  meta: string
}

export interface Branch {
  id: string
  name: string
  meta: string
}

// ---------- Orders ----------
export type OrderStatus =
  | 'New'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Completed'
  | 'Cancelled'

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded' | 'Prepaid'

export type Channel = 'Dine-in' | 'Takeaway' | 'Zomato' | 'Swiggy'

export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery'

export interface OrderItem {
  name: string
  qty: number
  price: number
  mods?: string
}

export interface Order {
  id: string
  channel: Channel
  type: OrderType
  table: string
  customer: string
  ext?: string
  items: OrderItem[]
  time: string
  staff: string
  status: OrderStatus
  payment: PaymentStatus
  commission?: number
  discount?: number
}

// ---------- Menu ----------
export type DietaryTag =
  | 'Vegetarian'
  | 'Vegan'
  | 'Jain'
  | 'Gluten Free'
  | 'Spicy'
  | 'Contains Nuts'
  | 'Dairy Free'

export type MenuBadge = 'Chef Special' | 'Recommended' | null

/** A plate size / portion option with its own price, e.g. Regular / Large. */
export interface SizeVariant {
  name: string
  price: number
}

export interface MenuItem {
  id: string
  name: string
  cat: string
  price: number
  prep: number
  sku: string
  desc: string
  tags: DietaryTag[]
  avail: boolean
  badge: MenuBadge
  featured?: boolean
  archived?: boolean
  /** Optional size variants. When present, `price` is the base/default size. */
  sizes?: SizeVariant[]
}

export interface Category {
  id: string
  name: string
  count: number
  visible: boolean
  sort: number
  archived?: boolean
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  stock: number
  min: number
  cost: number
  supplier: string
  linked: number
}

// ---------- Payments ----------
export type PayMethod = 'Card' | 'UPI' | 'Cash' | 'Wallet' | 'Split'

export interface Transaction {
  id: string
  order: string
  table: string
  method: PayMethod
  amount: number
  tip: number
  time: string
  status: 'Paid' | 'Refunded'
}

// ---------- Tables ----------
export type TableStatus =
  | 'Available'
  | 'Occupied'
  | 'Assist'
  | 'Payment'
  | 'Cleaning'

export interface RestaurantTable {
  id: string
  num: number
  status: TableStatus
  cap: number
  guests: number
  seated: string
  scans: number
}

// ---------- Customers ----------
export type CustomerTier = 'Gold' | 'Silver' | 'Member'

export interface Customer {
  id: string
  name: string
  email: string
  visits: number
  spend: number
  last: string
  tier: CustomerTier
}

// ---------- Staff ----------
export interface StaffMember {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Off shift' | 'Suspended'
  last: string
}

// ---------- Settings ----------
export interface RestaurantSettings {
  name: string
  contactEmail: string
  contactPhone: string
  gst: number
  service: number
  packaging: number
  card: boolean
  upi: boolean
  wallet: boolean
  cash: boolean
  takeaway: boolean
  autoClose: boolean
  requirePay: boolean
  staffAlerts: boolean
  payNotif: boolean
  emailReceipts: boolean
  sessionTimeout: number
  // Aggregator integrations (Zomato / Swiggy)
  zomatoAccept: boolean
  zomatoAuto: boolean
  zomatoSync: boolean
  swiggyAccept: boolean
  swiggyAuto: boolean
  swiggySync: boolean
}
