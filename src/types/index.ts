export interface PortionOption {
  id: string
  name: string
  description: string
  price: number // surcharge
}

export interface SpiceOption {
  id: string
  name: string
  emoji?: string
  badge?: string
}

export interface AddonOption {
  id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  slug: string
  name: string
  merchant: string
  merchantBadge?: string
  rating?: number
  reviewsCount?: number
  basePrice: number
  description: string
  badge?: string
  image: string
  gallery?: string[]
  portions: PortionOption[]
  spices: SpiceOption[]
  addons: AddonOption[]
  dietaryNotes?: string
  category?: string
}

export interface SelectedItemConfig {
  itemId: string
  name: string
  merchant: string
  image: string
  basePrice: number
  portion: PortionOption
  spice: SpiceOption
  addons: AddonOption[]
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CartItem {
  cartId: string
  itemId: string
  slug: string
  name: string
  merchant: string
  image: string
  basePrice: number
  portion: PortionOption
  spice: SpiceOption
  addons: AddonOption[]
  quantity: number
  unitPrice: number
  subtotal: number
  customerNote?: string
}

export interface TableInfo {
  tableNumber: string
  floor: number
  venue: string
  area: string
  isVerified: boolean
}

export type PaymentMethodType = 'qris' | 'bank_va' | 'ewallet'
export type PaymentStatus = 'pending' | 'checking' | 'paid' | 'failed' | 'expired'
export type PrepStatus = 'received' | 'preparing' | 'ready' | 'completed'

export interface OrderPricing {
  subtotal: number
  serviceFee: number
  taxRate: number
  tax: number
  discount: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  paymentCode: string
  createdAt: string
  expiresAt: string
  merchant: string
  table: TableInfo
  fulfillment: 'dine_in' | 'delivery'
  item: SelectedItemConfig
  items?: CartItem[]
  customerNote: string
  promoCode?: string
  pricing: OrderPricing
  paymentMethod: PaymentMethodType
  paymentStatus: PaymentStatus
  prepStatus: PrepStatus
  paymentTimestamp?: string
}
