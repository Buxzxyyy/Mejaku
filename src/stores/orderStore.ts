import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PortionOption,
  SpiceOption,
  AddonOption,
  SelectedItemConfig,
  CartItem,
  Order,
  TableInfo,
  PaymentMethodType,
  PaymentStatus,
  PrepStatus,
  MenuItem,
} from '@/types'
import { MAIN_MENU_ITEM, DEFAULT_TABLE } from '@/data/mockData'
import { calculateUnitPrice, calculateOrderPricing } from '@/utils/pricing'

export const useOrderStore = defineStore('order', () => {
  // Table context
  const table = ref<TableInfo>({ ...DEFAULT_TABLE })

  // Cart items (starts EMPTY!)
  const cartItems = ref<CartItem[]>([])

  // Active item configuration (when viewing/customizing an item)
  const currentItem = ref<MenuItem>(MAIN_MENU_ITEM)
  const currentPortion = ref<PortionOption>(MAIN_MENU_ITEM.portions[0])
  const currentSpice = ref<SpiceOption>(MAIN_MENU_ITEM.spices[0])
  const currentAddons = ref<AddonOption[]>([])
  const quantity = ref<number>(1) // quantity for the item currently being customized
  const customerNote = ref<string>('')

  // Promo code & discounts
  const promoCode = ref<string>('')
  const appliedDiscount = ref<number>(0)
  const promoStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const promoMessage = ref<string>('')

  // Active Order state
  const currentOrder = ref<Order | null>(null)
  const paymentDeadline = ref<number>(Date.now() + (18 * 60 + 42) * 1000)
  const isCheckingPayment = ref<boolean>(false)

  // Order History state
  const orderHistory = ref<Order[]>([
    {
      id: 'MJK-51204-BA',
      orderNumber: '#MJK-51204-BA',
      paymentCode: 'MJK51204BA',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
      merchant: 'Warung Bali Dwi',
      table: { ...DEFAULT_TABLE },
      fulfillment: 'dine_in',
      customerNote: 'Tolong sambal dipisah sedikit ya, terima kasih',
      item: {
        ...MAIN_MENU_ITEM,
        itemId: MAIN_MENU_ITEM.id,
        portion: MAIN_MENU_ITEM.portions[0],
        spice: MAIN_MENU_ITEM.spices[0],
        addons: [],
        quantity: 1,
        unitPrice: 32000,
        subtotal: 32000,
      },
      items: [
        {
          cartId: 'hist-1',
          itemId: 'menu-sate-01',
          slug: 'sate-ayam-bumbu-bali',
          name: 'Sate Ayam Bumbu Bali',
          merchant: 'Warung Bali Dwi',
          image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=600&q=80',
          basePrice: 32000,
          portion: { id: 'regular', name: 'Porsi Biasa (10 Tusuk)', description: 'Standar dengan lontong', price: 0 },
          spice: { id: 'medium', name: 'Sedang 🌶️' },
          addons: [],
          quantity: 1,
          unitPrice: 32000,
          subtotal: 32000,
        },
        {
          cartId: 'hist-2',
          itemId: 'menu-cendol-01',
          slug: 'es-cendol-durian-gula-kelapa',
          name: 'Es Cendol Durian Gula Kelapa',
          merchant: 'Warung Bali Dwi',
          image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
          basePrice: 22000,
          portion: { id: 'regular', name: 'Gelas Reguler', description: '', price: 0 },
          spice: { id: 'normal-sweet', name: 'Manis Sedang' },
          addons: [],
          quantity: 1,
          unitPrice: 22000,
          subtotal: 22000,
        },
      ],
      pricing: {
        subtotal: 54000,
        serviceFee: 2000,
        taxRate: 0.1,
        tax: 5400,
        discount: 0,
        total: 61400,
      },
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      prepStatus: 'completed',
      paymentTimestamp: '16:20 WIB',
    },
  ])

  // Calculations for active item being customized
  const unitPrice = computed(() => {
    return calculateUnitPrice(
      currentItem.value.basePrice,
      currentPortion.value,
      currentAddons.value
    )
  })

  // Total quantity in cart
  const totalQuantity = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Total subtotal in cart
  const totalSubtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.subtotal, 0)
  })

  // Pricing computed on the entire cart
  const pricing = computed(() => {
    return calculateOrderPricing(
      totalSubtotal.value,
      1,
      appliedDiscount.value
    )
  })

  // Backwards compatibility for single item views
  const currentItemConfig = computed<SelectedItemConfig>(() => {
    const firstCart = cartItems.value[0]
    if (firstCart) {
      return {
        itemId: firstCart.itemId,
        name: firstCart.name,
        merchant: firstCart.merchant,
        image: firstCart.image,
        basePrice: firstCart.basePrice,
        portion: firstCart.portion,
        spice: firstCart.spice,
        addons: firstCart.addons,
        quantity: firstCart.quantity,
        unitPrice: firstCart.unitPrice,
        subtotal: firstCart.subtotal,
      }
    }
    return {
      itemId: currentItem.value.id,
      name: currentItem.value.name,
      merchant: currentItem.value.merchant,
      image: currentItem.value.image,
      basePrice: currentItem.value.basePrice,
      portion: currentPortion.value,
      spice: currentSpice.value,
      addons: [...currentAddons.value],
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      subtotal: unitPrice.value * quantity.value,
    }
  })

  // Cart Management
  function addItemToCart(
    item: MenuItem = currentItem.value,
    portion: PortionOption = currentPortion.value,
    spice: SpiceOption = currentSpice.value,
    addons: AddonOption[] = currentAddons.value,
    qty: number = quantity.value,
    note: string = customerNote.value
  ): CartItem {
    const itemUnitPrice = calculateUnitPrice(item.basePrice, portion, addons)
    const subtotal = itemUnitPrice * qty

    // Check if identical item configuration already exists in cart
    const existingIndex = cartItems.value.findIndex((ci) => {
      const sameItem = ci.itemId === item.id
      const samePortion = ci.portion.id === portion.id
      const sameSpice = ci.spice.id === spice.id
      const sameAddons =
        ci.addons.length === addons.length &&
        ci.addons.every((a) => addons.some((oa) => oa.id === a.id))
      return sameItem && samePortion && sameSpice && sameAddons
    })

    if (existingIndex > -1) {
      // Increment quantity of existing item
      const existing = cartItems.value[existingIndex]
      existing.quantity += qty
      existing.subtotal = existing.unitPrice * existing.quantity
      if (note) existing.customerNote = note
      syncWithStorage()
      return existing
    }

    // Add new cart item
    const newCartItem: CartItem = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      merchant: item.merchant,
      image: item.image,
      basePrice: item.basePrice,
      portion: { ...portion },
      spice: { ...spice },
      addons: [...addons],
      quantity: qty,
      unitPrice: itemUnitPrice,
      subtotal,
      customerNote: note,
    }

    cartItems.value.push(newCartItem)
    syncWithStorage()
    return newCartItem
  }

  function removeFromCart(cartId: string) {
    const idx = cartItems.value.findIndex((i) => i.cartId === cartId)
    if (idx > -1) {
      cartItems.value.splice(idx, 1)
      syncWithStorage()
    }
  }

  function updateCartItemQuantity(cartId: string, newQty: number) {
    if (newQty <= 0) {
      removeFromCart(cartId)
      return
    }
    const item = cartItems.value.find((i) => i.cartId === cartId)
    if (item) {
      item.quantity = Math.max(1, Math.min(99, newQty))
      item.subtotal = item.unitPrice * item.quantity
      syncWithStorage()
    }
  }

  function clearCart() {
    cartItems.value = []
    currentOrder.value = null
    appliedDiscount.value = 0
    promoCode.value = ''
    syncWithStorage()
  }

  // Active item customization actions
  function setActiveItem(item: MenuItem) {
    currentItem.value = item
    currentPortion.value = item.portions?.[0] || { id: 'reg', name: 'Porsi Biasa', description: 'Standar', price: 0 }
    currentSpice.value = item.spices?.[0] || { id: 'none', name: 'Biasa' }
    currentAddons.value = []
    quantity.value = 1
    customerNote.value = ''
  }

  function setTable(tableInfo: Partial<TableInfo>) {
    table.value = {
      ...table.value,
      ...tableInfo,
      isVerified: true,
    }
    syncWithStorage()
  }

  function setPortion(portion: PortionOption) {
    currentPortion.value = portion
  }

  function setSpice(spice: SpiceOption) {
    currentSpice.value = spice
  }

  function toggleAddon(addon: AddonOption) {
    const index = currentAddons.value.findIndex((item) => item.id === addon.id)
    if (index > -1) {
      currentAddons.value.splice(index, 1)
    } else {
      currentAddons.value.push(addon)
    }
  }

  function setQuantity(val: number) {
    quantity.value = Math.max(1, Math.min(99, val))
  }

  function incrementQuantity() {
    setQuantity(quantity.value + 1)
  }

  function decrementQuantity() {
    if (quantity.value > 1) {
      setQuantity(quantity.value - 1)
    }
  }

  function setCustomerNote(note: string) {
    if (note.length <= 150) {
      customerNote.value = note
    }
  }

  function applyPromo(code: string) {
    const cleanCode = code.trim().toUpperCase()
    promoStatus.value = 'loading'
    promoMessage.value = 'Memvalidasi kode kupon...'

    setTimeout(() => {
      if (cleanCode === 'MEJAKUHEMAT' || cleanCode === 'HEMAT10') {
        appliedDiscount.value = 10000
        promoCode.value = cleanCode
        promoStatus.value = 'success'
        promoMessage.value = 'Kupon berhasil diterapkan! Hemat Rp 10.000'
      } else if (cleanCode === 'WARUNGBALI') {
        appliedDiscount.value = 5000
        promoCode.value = cleanCode
        promoStatus.value = 'success'
        promoMessage.value = 'Kupon Warung Bali Dwi diterapkan! Diskon Rp 5.000'
      } else {
        appliedDiscount.value = 0
        promoCode.value = ''
        promoStatus.value = 'error'
        promoMessage.value = 'Kode promo tidak valid atau telah kedaluwarsa.'
      }
      syncWithStorage()
    }, 500)
  }

  function removePromo() {
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''
    syncWithStorage()
  }

  // Create or update order from cart
  function createOrder(): Order {
    const now = new Date()
    const expiry = new Date(Date.now() + (18 * 60 + 42) * 1000)
    paymentDeadline.value = expiry.getTime()

    // If cart is empty, add the current customized item
    if (cartItems.value.length === 0) {
      addItemToCart()
    }

    const newOrder: Order = {
      id: `MJK-${Date.now().toString().slice(-5)}-BA`,
      orderNumber: `#MJK-${Date.now().toString().slice(-5)}-BA`,
      paymentCode: `MJK${Date.now().toString().slice(-5)}BA`,
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      merchant: 'Warung Bali Dwi',
      table: { ...table.value },
      fulfillment: 'dine_in',
      items: [...cartItems.value],
      item: { ...currentItemConfig.value },
      customerNote: customerNote.value,
      promoCode: promoCode.value || undefined,
      pricing: { ...pricing.value },
      paymentMethod: 'qris',
      paymentStatus: 'pending',
      prepStatus: 'preparing',
    }

    currentOrder.value = newOrder
    // Add to orderHistory
    const existingHistIdx = orderHistory.value.findIndex((o) => o.id === newOrder.id)
    if (existingHistIdx > -1) {
      orderHistory.value[existingHistIdx] = { ...newOrder }
    } else {
      orderHistory.value.unshift({ ...newOrder })
    }

    syncWithStorage()
    return newOrder
  }

  function setPaymentMethod(method: PaymentMethodType) {
    if (currentOrder.value) {
      currentOrder.value.paymentMethod = method
      syncWithStorage()
    }
  }

  function simulatePaymentCheck(): Promise<boolean> {
    isCheckingPayment.value = true
    if (currentOrder.value) {
      currentOrder.value.paymentStatus = 'checking'
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentOrder.value) {
          currentOrder.value.paymentStatus = 'paid'
          const now = new Date()
          currentOrder.value.paymentTimestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
          currentOrder.value.prepStatus = 'preparing'

          // Update in order history
          const histIdx = orderHistory.value.findIndex((o) => o.id === currentOrder.value?.id)
          if (histIdx > -1) {
            orderHistory.value[histIdx] = { ...currentOrder.value }
          }

          // Clear cart items and reset promo after transaction finishes
          cartItems.value = []
          appliedDiscount.value = 0
          promoCode.value = ''
          promoStatus.value = 'idle'
          quantity.value = 1
        }
        isCheckingPayment.value = false
        syncWithStorage()
        resolve(true)
      }, 1200)
    })
  }

  function setPaymentStatusDirect(status: PaymentStatus) {
    if (currentOrder.value) {
      currentOrder.value.paymentStatus = status
      if (status === 'paid') {
        cartItems.value = []
        appliedDiscount.value = 0
        promoCode.value = ''
        promoStatus.value = 'idle'
        quantity.value = 1
      }
      syncWithStorage()
    }
  }

  function setPrepStatus(status: PrepStatus) {
    if (currentOrder.value) {
      currentOrder.value.prepStatus = status
      syncWithStorage()
    }
  }

  // Reset function - starts empty!
  function resetToDefault() {
    cartItems.value = []
    currentOrder.value = null
    quantity.value = 1
    customerNote.value = ''
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''
    table.value = { ...DEFAULT_TABLE }
    syncWithStorage()
  }

  // Load a historical order as the active order (so Cek Status works)
  function loadOrderFromHistory(orderId: string): Order | null {
    const found = orderHistory.value.find((o) => o.id === orderId)
    if (found) {
      currentOrder.value = found
      syncWithStorage()
    }
    return found || null
  }

  // Reorder: add all items from a past order back into the cart
  function reorderFromHistory(orderId: string): boolean {
    const found = orderHistory.value.find((o) => o.id === orderId)
    if (!found) return false

    const itemsToReorder = found.items && found.items.length > 0
      ? found.items
      : found.item
        ? [found.item]
        : []

    if (itemsToReorder.length === 0) return false

    // Reset cart and add all items from the previous order
    cartItems.value = []
    currentOrder.value = null
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''

    for (const item of itemsToReorder) {
      const itemId = 'itemId' in item ? (item as CartItem).itemId : ''
      const slug = 'slug' in item ? (item as CartItem).slug : ''
      const unitPriceCalc = calculateUnitPrice(
        item.basePrice || 0,
        item.portion,
        item.addons || []
      )
      const newCartItem: CartItem = {
        cartId: `cart-reorder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId,
        slug,
        name: item.name,
        merchant: item.merchant || found.merchant,
        image: item.image || '',
        basePrice: item.basePrice || 0,
        portion: { ...item.portion },
        spice: { ...item.spice },
        addons: [...(item.addons || [])],
        quantity: item.quantity,
        unitPrice: unitPriceCalc,
        subtotal: unitPriceCalc * item.quantity,
        customerNote: '',
      }
      cartItems.value.push(newCartItem)
    }

    syncWithStorage()
    return true
  }

  // Storage synchronization
  function syncWithStorage() {
    try {
      const stateToSave = {
        cartItems: cartItems.value,
        appliedDiscount: appliedDiscount.value,
        promoCode: promoCode.value,
        table: table.value,
        order: currentOrder.value,
        paymentDeadline: paymentDeadline.value,
        orderHistory: orderHistory.value,
      }
      localStorage.setItem('mejaku_state_v3', JSON.stringify(stateToSave))
    } catch {
      // Ignore localStorage errors
    }
  }

  function loadFromStorage() {
    try {
      // Clear legacy storage versions
      localStorage.removeItem('mejaku_state_v1')
      localStorage.removeItem('mejaku_state_v2')

      const raw = localStorage.getItem('mejaku_state_v3')
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved.cartItems)) {
          cartItems.value = saved.cartItems
        }
        if (saved.table) table.value = saved.table
        if (saved.appliedDiscount) appliedDiscount.value = Number(saved.appliedDiscount) || 0
        if (saved.promoCode) promoCode.value = saved.promoCode
        if (saved.order) currentOrder.value = saved.order
        if (saved.paymentDeadline) paymentDeadline.value = saved.paymentDeadline

        // Load order history: merge saved entries with default demo so demo always appears
        if (Array.isArray(saved.orderHistory) && saved.orderHistory.length > 0) {
          // Ensure demo entry is always present (add if not found)
          const hasDemoEntry = saved.orderHistory.some((o: Order) => o.id === 'MJK-51204-BA')
          if (hasDemoEntry) {
            orderHistory.value = saved.orderHistory
          } else {
            orderHistory.value = [...saved.orderHistory, ...orderHistory.value]
          }
        }
        // If saved.orderHistory is missing/empty, keep the default demo entries from ref init
      } else {
        // No saved state at all — starts with demo history + empty cart
        cartItems.value = []
      }
    } catch {
      cartItems.value = []
    }
  }

  // Initialize from storage (empty by default)
  loadFromStorage()

  return {
    table,
    setTable,
    cartItems,
    addItemToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    totalQuantity,
    totalSubtotal,
    currentItem,
    setActiveItem,
    currentPortion,
    currentSpice,
    currentAddons,
    quantity,
    customerNote,
    promoCode,
    appliedDiscount,
    promoStatus,
    promoMessage,
    currentOrder,
    orderHistory,
    paymentDeadline,
    isCheckingPayment,
    unitPrice,
    pricing,
    currentItemConfig,
    setPortion,
    setSpice,
    toggleAddon,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    setCustomerNote,
    applyPromo,
    removePromo,
    createOrder,
    setPaymentMethod,
    simulatePaymentCheck,
    setPaymentStatusDirect,
    setPrepStatus,
    resetToDefault,
    loadOrderFromHistory,
    reorderFromHistory,
  }
})
