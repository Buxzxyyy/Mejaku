import type {
  MenuItem,
  PortionOption,
  AddonOption,
  SpiceOption,
  Order,
  CartItem,
  SelectedItemConfig,
  PrepStatus,
  PaymentStatus,
} from '@/types'

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'

function formatWibTime(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const time = date.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${time.replace('.', ':')} WIB`
}

function mapPaymentMethod(rawMethod?: string | null): 'qris' | 'bank_va' | 'cashier' {
  switch (rawMethod) {
    case 'bank_transfer':
      return 'bank_va'
    case 'cashier':
      return 'cashier'
    case 'qris':
    case 'midtrans':
    case 'e_wallet':
    default:
      return 'qris'
  }
}

function paymentMethodLabel(rawMethod?: string | null, fallbackLabel?: string | null): string {
  if (fallbackLabel) return fallbackLabel
  switch (rawMethod) {
    case 'bank_transfer':
      return 'Transfer Bank / VA'
    case 'cashier':
      return 'Kasir'
    case 'qris':
      return 'QRIS'
    case 'e_wallet':
      return 'Dompet Digital'
    case 'midtrans':
      return 'Midtrans'
    default:
      return 'QRIS'
  }
}

export function transformBackendMenuItem(raw: any): MenuItem {
  const portions: PortionOption[] = Array.isArray(raw.portions) && raw.portions.length > 0
    ? raw.portions.map((p: any) => ({
        id: String(p.id),
        name: p.name || 'Porsi Biasa',
        description: p.description || (p.name?.toLowerCase().includes('jumbo') ? 'Ukuran porsi lebih besar' : 'Ukuran porsi standar'),
        price: Number(p.surcharge ?? p.price ?? 0),
      }))
    : [
        {
          id: '1',
          name: 'Porsi Biasa',
          description: 'Ukuran porsi standar',
          price: 0,
        },
      ]

  const spices: SpiceOption[] = Array.isArray(raw.spice_levels) && raw.spice_levels.length > 0
    ? raw.spice_levels.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        badge: s.level === 1 ? 'Direkomendasikan' : undefined,
      }))
    : (raw.has_spice_option ? [
        { id: '1', name: 'Tidak Pedas' },
        { id: '2', name: 'Sedang', badge: 'Direkomendasikan' },
        { id: '3', name: 'Pedas' },
        { id: '4', name: 'Sangat Pedas' },
      ] : [
        { id: '1', name: 'Standar' },
      ])

  const addons: AddonOption[] = Array.isArray(raw.addons)
    ? raw.addons.map((a: any) => ({
        id: String(a.id),
        name: a.name,
        price: Number(a.price ?? 0),
      }))
    : []

  const merchantName = typeof raw.merchant === 'object' && raw.merchant !== null
    ? raw.merchant.name
    : (typeof raw.merchant === 'string' ? raw.merchant : 'Mitra Pujasera')

  const img = raw.image || DEFAULT_FOOD_IMAGE
  const gallery = Array.isArray(raw.gallery) && raw.gallery.length > 0
    ? raw.gallery
    : [img]

  return {
    id: String(raw.id),
    slug: raw.slug || `menu-${raw.id}`,
    name: raw.name,
    merchant: merchantName,
    merchantBadge: raw.merchant_badge || 'Pujasera',
    rating: raw.rating !== undefined ? Number(raw.rating) : 5.0,
    reviewsCount: raw.rating_count !== undefined ? Number(raw.rating_count) : 0,
    basePrice: Number(raw.base_price ?? raw.price ?? 0),
    description: raw.description || 'Hidangan lezat disajikan hangat langsung ke meja Anda.',
    badge: raw.badge || (raw.rating && Number(raw.rating) >= 4.8 ? 'POPULER' : undefined),
    image: img,
    gallery,
    portions,
    spices,
    addons,
    category: raw.category || 'makanan-utama',
  }
}

export function transformBackendOrder(raw: any): Order {
  const orderNum = raw.order_number || String(raw.id || '')
  const orderItems: CartItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: any, idx: number) => {
        const menuItem = it.menu_item || {}
        const portion: PortionOption = it.portion
          ? {
              id: String(it.portion.id),
              name: it.portion.name,
              description: it.portion.description || 'Ukuran porsi standar',
              price: Number(it.portion.surcharge || it.portion.price || 0),
            }
          : { id: '1', name: 'Porsi Biasa', description: 'Ukuran porsi standar', price: 0 }
        const spice: SpiceOption = it.spice_level
          ? { id: String(it.spice_level.id), name: it.spice_level.name }
          : { id: '1', name: 'Standar' }
        const addons: AddonOption[] = Array.isArray(it.addons)
          ? it.addons.map((a: any) => ({ id: String(a.id), name: a.name, price: Number(a.price || 0) }))
          : []
        const quantity = Number(it.quantity || 1)
        const unitPrice = Number(it.unit_price ?? it.price ?? 0)
        const lineTotal = Number(it.line_total ?? (unitPrice * quantity))

        return {
          cartId: `server-${menuItem.id || idx}-${idx}`,
          itemId: String(menuItem.id || idx + 1),
          slug: menuItem.slug || `menu-${menuItem.id || idx + 1}`,
          name: menuItem.name || 'Menu Pujasera',
          merchant: menuItem.merchant?.name || 'Warung Bali Dwi',
          image: menuItem.image || DEFAULT_FOOD_IMAGE,
          basePrice: unitPrice,
          portion,
          spice,
          addons,
          quantity,
          unitPrice,
          subtotal: lineTotal,
          customerNote: it.notes || '',
        }
      })
    : []

  const firstItem: SelectedItemConfig = orderItems.length > 0
    ? {
        itemId: orderItems[0].itemId,
        name: orderItems[0].name,
        merchant: orderItems[0].merchant,
        image: orderItems[0].image,
        basePrice: orderItems[0].basePrice,
        portion: orderItems[0].portion,
        spice: orderItems[0].spice,
        addons: orderItems[0].addons,
        quantity: orderItems[0].quantity,
        unitPrice: orderItems[0].unitPrice,
        subtotal: orderItems[0].subtotal,
      }
    : {
        itemId: '1',
        name: 'Menu Pujasera',
        merchant: 'Warung Bali Dwi',
        image: DEFAULT_FOOD_IMAGE,
        basePrice: 0,
        portion: { id: '1', name: 'Porsi Biasa', description: 'Ukuran porsi standar', price: 0 },
        spice: { id: '1', name: 'Standar' },
        addons: [],
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      }

  const tableCode = raw.table?.code || 'A12'
  const floorNum = parseInt(String(raw.table?.floor || '1').replace(/\D/g, ''), 10) || 1
  const payment = raw.payment || {}
  const rawPaymentMethod = payment.method || raw.payment_method

  return {
    id: orderNum,
    orderNumber: `#${orderNum}`,
    paymentCode: payment.payment_code || orderNum.replace(/-/g, ''),
    createdAt: raw.created_at || new Date().toISOString(),
    expiresAt: payment.expires_at || raw.expires_at || new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    merchant: orderItems[0]?.merchant || 'Warung Bali Dwi',
    table: {
      tableNumber: tableCode,
      floor: floorNum,
      isVerified: true,
    },
    fulfillment: raw.delivery_type === 'delivery' ? 'delivery' : 'dine_in',
    item: firstItem,
    items: orderItems,
    customerNote: raw.notes || '',
    promoCode: raw.promo_code || undefined,
    pricing: {
      subtotal: Number(raw.subtotal || 0),
      serviceFee: Number(raw.service_fee || 0),
      taxRate: 0.1,
      tax: Number(raw.tax || 0),
      discount: Number(raw.discount || 0),
      total: Number(raw.total || 0),
    },
    paymentMethod: mapPaymentMethod(rawPaymentMethod),
    paymentMethodLabel: paymentMethodLabel(rawPaymentMethod, payment.method_label),
    paymentStatus: (raw.payment_status as PaymentStatus) || 'pending',
    prepStatus: (raw.preparation_status as PrepStatus) || 'received',
    paymentTimestamp: formatWibTime(payment.paid_at),
  }
}

