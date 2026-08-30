import type {
  Branch,
  Category,
  Customer,
  Ingredient,
  MenuItem,
  Order,
  RestaurantSettings,
  RestaurantTable,
  StaffMember,
  TableStatus,
  Transaction,
} from '@/types'

export const branches: Branch[] = [
  { id: 'riverside', name: 'Riverside', meta: 'Main · 24 tables' },
  { id: 'harbour', name: 'Harbour Point', meta: '12 tables' },
  { id: 'oldtown', name: 'Old Town', meta: '18 tables' },
]

export const orders: Order[] = [
  { id: '#Z-4471', channel: 'Zomato', ext: '8821049', table: '—', customer: 'Aditya R.', items: [{ name: 'Plato Burger', qty: 1, price: 16, mods: 'No onion' }, { name: 'Truffle Fries', qty: 2, price: 9 }, { name: 'Cold Brew', qty: 1, price: 5 }], time: '12:08', staff: 'Auto-accept', status: 'New', payment: 'Prepaid', type: 'Delivery', commission: 0.18 },
  { id: '#1289', channel: 'Dine-in', table: 'T-07', customer: 'Walk-in', items: [{ name: 'Plato Burger', qty: 2, price: 16, mods: 'No onion · Extra cheese' }, { name: 'Truffle Fries', qty: 1, price: 9 }, { name: 'Cold Brew', qty: 2, price: 5 }], time: '12:04', staff: 'Maya Aronsson', status: 'New', payment: 'Unpaid', type: 'Dine-in' },
  { id: '#S-9920', channel: 'Swiggy', ext: '5510742', table: '—', customer: 'Meera K.', items: [{ name: 'Roast Chicken Bowl', qty: 1, price: 18 }, { name: 'Matcha Latte', qty: 1, price: 6 }], time: '12:01', staff: 'Auto-accept', status: 'Preparing', payment: 'Prepaid', type: 'Delivery', commission: 0.18 },
  { id: '#1288', channel: 'Dine-in', table: 'T-12', customer: 'J. Okafor', items: [{ name: 'Roast Chicken Bowl', qty: 1, price: 18 }, { name: 'Garden Caesar', qty: 1, price: 12 }, { name: 'Matcha Latte', qty: 1, price: 6 }], time: '11:58', staff: 'Devin Cole', status: 'Preparing', payment: 'Unpaid', type: 'Dine-in' },
  { id: '#1287', channel: 'Dine-in', table: 'T-03', customer: 'Walk-in', items: [{ name: 'Wild Mushroom Risotto', qty: 1, price: 17 }, { name: 'Burrata & Heirloom', qty: 1, price: 16 }], time: '11:51', staff: 'Priya Shah', status: 'Ready', payment: 'Unpaid', type: 'Dine-in' },
  { id: '#1286', channel: 'Takeaway', table: 'TA', customer: 'L. Romano', items: [{ name: 'Plato Burger', qty: 1, price: 16 }, { name: 'Truffle Fries', qty: 1, price: 9 }], time: '11:44', staff: 'Devin Cole', status: 'Served', payment: 'Paid', type: 'Takeaway' },
  { id: '#Z-4468', channel: 'Zomato', ext: '8820915', table: '—', customer: 'Sam D.', items: [{ name: 'Seared Salmon', qty: 1, price: 22 }, { name: 'Basque Cheesecake', qty: 1, price: 9 }], time: '11:40', staff: 'Auto-accept', status: 'Completed', payment: 'Prepaid', type: 'Delivery', commission: 0.18 },
  { id: '#1285', channel: 'Dine-in', table: 'T-18', customer: 'Walk-in', items: [{ name: 'Seared Salmon', qty: 2, price: 22 }, { name: 'Flat White', qty: 2, price: 5 }], time: '11:36', staff: 'Maya Aronsson', status: 'Completed', payment: 'Paid', type: 'Dine-in', discount: 6 },
  { id: '#1284', channel: 'Dine-in', table: 'T-05', customer: 'A. Berg', items: [{ name: 'Avocado Toast', qty: 2, price: 11 }, { name: 'Cold Brew', qty: 2, price: 5 }], time: '11:22', staff: 'Priya Shah', status: 'Completed', payment: 'Paid', type: 'Dine-in' },
  { id: '#S-9912', channel: 'Swiggy', ext: '5509988', table: '—', customer: 'Nikhil T.', items: [{ name: 'Plato Burger', qty: 2, price: 16 }, { name: 'Truffle Fries', qty: 1, price: 9 }], time: '11:15', staff: 'Auto-accept', status: 'Completed', payment: 'Prepaid', type: 'Delivery', commission: 0.18 },
  { id: '#1283', channel: 'Dine-in', table: 'T-09', customer: 'Walk-in', items: [{ name: 'Buttermilk Pancakes', qty: 1, price: 12 }, { name: 'Matcha Latte', qty: 1, price: 6 }], time: '11:08', staff: 'Devin Cole', status: 'Completed', payment: 'Paid', type: 'Dine-in' },
  { id: '#1282', channel: 'Dine-in', table: 'T-14', customer: 'M. Lewis', items: [{ name: 'Crispy Calamari', qty: 1, price: 13 }, { name: 'Plato Burger', qty: 1, price: 16 }], time: '10:55', staff: 'Maya Aronsson', status: 'Cancelled', payment: 'Refunded', type: 'Dine-in' },
]

export const menu: MenuItem[] = [
  { id: 'm_burger', name: 'Plato Burger', cat: 'Mains', price: 16, prep: 12, sku: 'MN-014', desc: 'Aged cheddar, house sauce, brioche bun', tags: ['Spicy'], avail: true, badge: 'Chef Special', featured: true },
  { id: 'm_chicken', name: 'Roast Chicken Bowl', cat: 'Mains', price: 18, prep: 14, sku: 'MN-021', desc: 'Ancient grains, greens, pan jus', tags: ['Gluten Free'], avail: true, badge: 'Recommended' },
  { id: 'm_salmon', name: 'Seared Salmon', cat: 'Mains', price: 22, prep: 15, sku: 'MN-022', desc: 'Citrus glaze, shaved fennel salad', tags: ['Gluten Free'], avail: true, badge: null },
  { id: 'm_risotto', name: 'Wild Mushroom Risotto', cat: 'Mains', price: 17, prep: 16, sku: 'MN-019', desc: 'Parmesan, thyme, white wine', tags: ['Vegetarian'], avail: false, badge: null },
  { id: 's_burrata', name: 'Burrata & Heirloom', cat: 'Starters', price: 16, prep: 7, sku: 'ST-006', desc: 'Creamy burrata, basil oil, focaccia', tags: ['Vegetarian'], avail: true, badge: 'Recommended' },
  { id: 's_fries', name: 'Truffle Fries', cat: 'Starters', price: 9, prep: 6, sku: 'ST-002', desc: 'Hand-cut, parmesan, fresh herbs', tags: ['Vegetarian'], avail: true, badge: null, featured: true, sizes: [{ name: 'Regular', price: 9 }, { name: 'Sharing', price: 14 }] },
  { id: 's_calamari', name: 'Crispy Calamari', cat: 'Starters', price: 13, prep: 9, sku: 'ST-004', desc: 'Lightly fried, lemon aioli', tags: ['Contains Nuts'], avail: true, badge: null },
  { id: 'd_cheese', name: 'Basque Cheesecake', cat: 'Desserts', price: 9, prep: 3, sku: 'DS-001', desc: 'Burnt-caramel top, vanilla bean', tags: ['Vegetarian'], avail: true, badge: 'Recommended' },
  { id: 'b_flat', name: 'Flat White', cat: 'Beverages', price: 5, prep: 4, sku: 'BV-001', desc: 'House espresso blend, silky milk', tags: [], avail: true, badge: null, sizes: [{ name: 'Small', price: 4 }, { name: 'Regular', price: 5 }, { name: 'Large', price: 6.5 }] },
  { id: 'b_matcha', name: 'Matcha Latte', cat: 'Beverages', price: 6, prep: 4, sku: 'BV-005', desc: 'Ceremonial grade, oat milk', tags: ['Vegan'], avail: false, badge: null, sizes: [{ name: 'Regular', price: 6 }, { name: 'Large', price: 7.5 }] },
]

export const categories: Category[] = [
  { id: 'c_starters', name: 'Starters', count: 8, visible: true, sort: 0 },
  { id: 'c_mains', name: 'Mains', count: 14, visible: true, sort: 1 },
  { id: 'c_breakfast', name: 'Breakfast', count: 6, visible: true, sort: 2 },
  { id: 'c_desserts', name: 'Desserts', count: 5, visible: true, sort: 3 },
  { id: 'c_beverages', name: 'Beverages', count: 7, visible: true, sort: 4 },
  { id: 'c_specials', name: 'Specials', count: 2, visible: false, sort: 5 },
]

export const ingredients: Ingredient[] = [
  { id: 'i_beef', name: 'Beef Patty', unit: 'kg', stock: 4.2, min: 6, cost: 9.4, supplier: 'Highland Farms', linked: 3 },
  { id: 'i_truffle', name: 'Truffle Oil', unit: 'L', stock: 0.8, min: 1, cost: 48.0, supplier: 'Umbria Imports', linked: 4 },
  { id: 'i_tomato', name: 'Roma Tomatoes', unit: 'kg', stock: 2.1, min: 8, cost: 3.2, supplier: 'Green Valley', linked: 9 },
  { id: 'i_mozz', name: 'Mozzarella', unit: 'kg', stock: 11.5, min: 5, cost: 12.8, supplier: 'Latteria Co.', linked: 6 },
  { id: 'i_salmon', name: 'Atlantic Salmon', unit: 'kg', stock: 7.3, min: 4, cost: 24.5, supplier: 'Nordic Catch', linked: 2 },
  { id: 'i_espresso', name: 'Espresso Beans', unit: 'kg', stock: 9.0, min: 3, cost: 18.0, supplier: 'Drift Roasters', linked: 5 },
  { id: 'i_oat', name: 'Oat Milk', unit: 'L', stock: 14.0, min: 6, cost: 2.1, supplier: 'Plantworks', linked: 4 },
]

export const transactions: Transaction[] = [
  { id: 'PAY-7741', order: '#1285', table: 'T-18', method: 'Card', amount: 60.5, tip: 8, time: '12:02', status: 'Paid' },
  { id: 'PAY-7740', order: '#1284', table: 'T-05', method: 'UPI', amount: 36.96, tip: 4, time: '11:48', status: 'Paid' },
  { id: 'PAY-7739', order: '#1283', table: 'T-09', method: 'Wallet', amount: 21.42, tip: 0, time: '11:31', status: 'Paid' },
  { id: 'PAY-7738', order: '#1282', table: 'T-14', method: 'Card', amount: 34.13, tip: 0, time: '11:10', status: 'Refunded' },
  { id: 'PAY-7737', order: '#1281', table: 'T-02', method: 'Cash', amount: 48.3, tip: 5, time: '10:54', status: 'Paid' },
  { id: 'PAY-7736', order: '#1280', table: 'T-11', method: 'Split', amount: 92.8, tip: 12, time: '10:39', status: 'Paid' },
  { id: 'PAY-7735', order: '#1279', table: 'T-07', method: 'Card', amount: 27.3, tip: 3, time: '10:22', status: 'Paid' },
]

export const tables: RestaurantTable[] = (() => {
  const st: TableStatus[] = ['Occupied', 'Available', 'Assist', 'Occupied', 'Payment', 'Available', 'Occupied', 'Cleaning', 'Occupied', 'Available', 'Occupied', 'Payment', 'Available', 'Occupied', 'Assist', 'Available', 'Occupied', 'Occupied', 'Available', 'Cleaning', 'Occupied', 'Available', 'Occupied', 'Available']
  const seats = [2, 4, 2, 6, 4, 2, 4, 4, 2, 8, 4, 2, 6, 4, 2, 4, 2, 4, 6, 2, 4, 2, 4, 4]
  return st.map((s, i) => ({
    id: 'T-' + String(i + 1).padStart(2, '0'),
    num: i + 1,
    status: s,
    cap: seats[i],
    guests: s === 'Occupied' || s === 'Assist' || s === 'Payment' ? Math.min(seats[i], 2 + (i % 3)) : 0,
    seated: s === 'Available' || s === 'Cleaning' ? '—' : (12 + (i % 5) * 7) + ' min',
    scans: 40 + i * 3,
  }))
})()

export const customers: Customer[] = [
  { id: 'cu_jamie', name: 'Jamie Okafor', email: 'jamie.o@email.com', visits: 24, spend: 1840, last: '2 days ago', tier: 'Gold' },
  { id: 'cu_lucia', name: 'Lucia Romano', email: 'lucia.r@email.com', visits: 18, spend: 1320, last: '5 days ago', tier: 'Gold' },
  { id: 'cu_anders', name: 'Anders Berg', email: 'a.berg@email.com', visits: 12, spend: 890, last: '1 week ago', tier: 'Silver' },
  { id: 'cu_mei', name: 'Mei Lewis', email: 'mei.lewis@email.com', visits: 9, spend: 640, last: '2 weeks ago', tier: 'Silver' },
  { id: 'cu_tom', name: 'Tom Hargreave', email: 't.harg@email.com', visits: 4, spend: 210, last: '3 weeks ago', tier: 'Member' },
  { id: 'cu_sara', name: 'Sara Vinter', email: 'sara.v@email.com', visits: 2, spend: 95, last: 'Last month', tier: 'Member' },
]

export const staff: StaffMember[] = [
  { id: 'st_maya', name: 'Maya Aronsson', role: 'Owner', email: 'maya@riverside.co', status: 'Active', last: 'Now' },
  { id: 'st_devin', name: 'Devin Cole', role: 'Cashier', email: 'devin@riverside.co', status: 'Active', last: '2 min ago' },
  { id: 'st_priya', name: 'Priya Shah', role: 'Manager', email: 'priya@riverside.co', status: 'Active', last: '8 min ago' },
  { id: 'st_tomas', name: 'Tomas Reuben', role: 'Kitchen Supervisor', email: 'tomas@riverside.co', status: 'Active', last: '15 min ago' },
  { id: 'st_lena', name: 'Lena Fischer', role: 'Cashier', email: 'lena@riverside.co', status: 'Off shift', last: 'Yesterday' },
  { id: 'st_omar', name: 'Omar Haddad', role: 'Manager', email: 'omar@riverside.co', status: 'Off shift', last: '2 days ago' },
]

export const settings: RestaurantSettings = {
  name: 'Riverside',
  contactEmail: 'hello@riverside.co',
  contactPhone: '+1 (415) 555-0148',
  gst: 5,
  service: 10,
  packaging: 1.5,
  card: true,
  upi: true,
  wallet: true,
  cash: true,
  takeaway: true,
  autoClose: true,
  requirePay: false,
  staffAlerts: true,
  payNotif: true,
  emailReceipts: false,
  sessionTimeout: 30,
  zomatoAccept: true,
  zomatoAuto: true,
  zomatoSync: true,
  swiggyAccept: true,
  swiggyAuto: false,
  swiggySync: true,
}

/** Aggregator integration metadata (static; live counts come from orders). */
export const integrations = [
  { key: 'zomato', name: 'Zomato', letter: 'Z', color: '#E23744', tint: '#FDECEE', orders: 19, revenue: 1284, commission: 18, sync: '2 min ago', acceptKey: 'zomatoAccept', autoKey: 'zomatoAuto', syncKey: 'zomatoSync' },
  { key: 'swiggy', name: 'Swiggy', letter: 'S', color: '#FC8019', tint: '#FFF1E6', orders: 11, revenue: 742, commission: 18, sync: '5 min ago', acceptKey: 'swiggyAccept', autoKey: 'swiggyAuto', syncKey: 'swiggySync' },
] as const

// ---- Analytics (dashboard + reports) ----
export const analytics = {
  revVals: [320, 540, 1240, 1680, 980, 620, 540, 880, 1520, 1980, 1740, 1120],
  revHours: ['10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'],
  statusMix: [
    { label: 'New', val: 8, color: '#3B82F6' },
    { label: 'Preparing', val: 12, color: '#F59E0B' },
    { label: 'Ready', val: 5, color: '#8B5CF6' },
    { label: 'Served', val: 9, color: '#0EA76B' },
    { label: 'Completed', val: 41, color: '#1D1F24' },
    { label: 'Cancelled', val: 2, color: '#EF4444' },
  ],
  popular: [
    { name: 'Plato Burger', sold: 38 },
    { name: 'Truffle Fries', sold: 31 },
    { name: 'Roast Chicken Bowl', sold: 27 },
    { name: 'Flat White', sold: 24 },
    { name: 'Basque Cheesecake', sold: 19 },
  ],
  activity: [
    { icon: 'check', tint: '#0EA76B', html: '<b>Table 12</b> paid $86.40 · Card', time: '2 min ago' },
    { icon: 'edit', tint: '#3B82F6', html: '<b>Maya</b> updated <b>Seared Salmon</b> price', time: '14 min ago' },
    { icon: 'cart', tint: '#0EA76B', html: 'New order <b>#1289</b> from Table 7', time: '18 min ago' },
    { icon: 'x', tint: '#EF4444', html: 'Order <b>#1276</b> was cancelled', time: '32 min ago' },
    { icon: 'alert', tint: '#F59E0B', html: '<b>Table 9</b> requested assistance', time: '41 min ago' },
    { icon: 'user', tint: '#6B7280', html: '<b>Devin</b> (Cashier) signed in', time: '1 hr ago' },
  ],
  channelMix: [
    { label: 'Dine-in', val: 118, color: '#9CA3AF' },
    { label: 'Takeaway', val: 34, color: '#6366F1' },
    { label: 'Zomato', val: 19, color: '#E23744' },
    { label: 'Swiggy', val: 11, color: '#FC8019' },
  ],
  payMethods: [
    { label: 'Card', pct: 42, color: '#1D1F24', amount: 5997 },
    { label: 'UPI', pct: 28, color: '#0EA76B', amount: 3998 },
    { label: 'Cash', pct: 14, color: '#F59E0B', amount: 1999 },
    { label: 'Wallet', pct: 12, color: '#3B82F6', amount: 1714 },
    { label: 'Split', pct: 4, color: '#8B5CF6', amount: 571 },
  ],
  peak: [['10a', 32], ['11a', 48], ['12p', 88], ['1p', 96], ['2p', 61], ['3p', 38], ['4p', 34], ['5p', 52], ['6p', 79], ['7p', 100], ['8p', 86], ['9p', 58]] as [string, number][],
  bestSellers: [['Plato Burger', 38], ['Truffle Fries', 31], ['Roast Chicken Bowl', 27], ['Flat White', 24], ['Basque Cheesecake', 19]] as [string, number][],
  slowMovers: [['Wild Mushroom Risotto', 4], ['Matcha Latte', 6], ['Crispy Calamari', 8]] as [string, number][],
  staffPerf: [
    { name: 'Maya Aronsson', orders: 48, sales: 3760 },
    { name: 'Priya Shah', orders: 41, sales: 3210 },
    { name: 'Devin Cole', orders: 39, sales: 2980 },
    { name: 'Tomas Reuben', orders: 33, sales: 2540 },
  ],
  reportStats: [
    { label: 'Avg. completion time', value: '18.4 min', delta: '−2.1 min', good: true },
    { label: 'Table turnover', value: '3.2×', delta: '+0.4', good: true },
    { label: 'Avg. order value', value: '$78.40', delta: '+3.2%', good: true },
    { label: 'Order accuracy', value: '98.1%', delta: '+0.6%', good: true },
  ],
}
