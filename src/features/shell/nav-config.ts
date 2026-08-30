import {
  LayoutDashboard,
  ScrollText,
  UtensilsCrossed,
  LayoutGrid,
  Carrot,
  CreditCard,
  QrCode,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  Calculator,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  header: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    header: 'OVERVIEW',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { key: 'orders', label: 'Orders', href: '/orders', icon: ScrollText, badge: '8' },
    ],
  },
  {
    header: 'MENU',
    items: [
      { key: 'menu', label: 'Menu Management', href: '/menu', icon: UtensilsCrossed },
      { key: 'categories', label: 'Categories', href: '/categories', icon: LayoutGrid },
      { key: 'ingredients', label: 'Ingredients', href: '/ingredients', icon: Carrot, badge: '3' },
    ],
  },
  {
    header: 'OPERATIONS',
    items: [
      { key: 'pos', label: 'Point of Sale', href: '/pos', icon: Calculator },
      { key: 'payments', label: 'Payments', href: '/payments', icon: CreditCard },
      { key: 'tables', label: 'Tables & QR', href: '/tables', icon: QrCode },
    ],
  },
  {
    header: 'PEOPLE & INSIGHT',
    items: [
      { key: 'customers', label: 'Customers', href: '/customers', icon: Users },
      { key: 'staff', label: 'Staff & Roles', href: '/staff', icon: ShieldCheck },
      { key: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
      { key: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: "Here's how your restaurant is doing today" },
  orders: { title: 'Orders', subtitle: 'Live order queue and history' },
  menu: { title: 'Menu Management', subtitle: 'Items across your categories' },
  categories: { title: 'Categories', subtitle: 'Organize how the menu is grouped' },
  ingredients: { title: 'Ingredients', subtitle: 'Stock levels and supplier tracking' },
  payments: { title: 'Payments', subtitle: "Today's transactions and settlements" },
  pos: { title: 'Point of Sale', subtitle: 'Ring up an order and take payment' },
  tables: { title: 'Tables & QR', subtitle: '24 tables · 14 active sessions' },
  customers: { title: 'Customers', subtitle: 'Guests and loyalty' },
  staff: { title: 'Staff & Roles', subtitle: 'Team members and permissions' },
  reports: { title: 'Reports & Analytics', subtitle: 'Performance across your venue' },
  settings: { title: 'Settings', subtitle: 'Configure Hostly for your restaurant' },
}
