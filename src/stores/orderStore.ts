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
import { calculateUnitPrice, calculateOrderPricing } from '@/utils/pricing'
import { api } from '@/api/client'
import { transformBackendOrder, transformBackendMenuItem, FALLBACK_FOOD_IMAGE } from '@/utils/adapters'

export const INITIAL_DEFAULT_TABLE: TableInfo = {
  tableNumber: 'A12',
  floor: 2,
  isVerified: false,
}

export const DEFAULT_FALLBACK_ITEM: MenuItem = {
  id: '1',
  slug: 'nasi-campur-bali-agung',
  name: 'Nasi Campur Bali Agung',
  merchant: 'Warung Bali Dwi',
  basePrice: 58000,
  description: 'Nasi campur khas Bali dengan lauk lengkap dan bumbu rempah pilihan.',
  image: FALLBACK_FOOD_IMAGE,
  portions: [{ id: '1', name: 'Porsi Biasa', description: 'Ukuran porsi standar', price: 0 }],
  spices: [{ id: '1', name: 'Biasa' }],
  addons: [],
}

export const useOrderStore = defineStore('order', () => {
  // Table context
  const table = ref<TableInfo>({ ...INITIAL_DEFAULT_TABLE })

  // Cart items (starts EMPTY!)
  const cartItems = ref<CartItem[]>([])

  // Active item configuration (when viewing/customizing an item)
  const currentItem = ref<MenuItem>(DEFAULT_FALLBACK_ITEM)
  const currentPortion = ref<PortionOption>(DEFAULT_FALLBACK_ITEM.portions[0])
  const currentSpice = ref<SpiceOption>(DEFAULT_FALLBACK_ITEM.spices[0])
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

  // Order History state (murni kosong secara default)
  const orderHistory = ref<Order[]>([])

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

  // Setelah order dibuat, harga server adalah sumber kebenaran.
  // Jangan memakai cart (yang bisa sudah dikosongkan) untuk halaman
  // pembayaran/konfirmasi.
  const orderPricing = computed(() => {
    return currentOrder.value?.pricing || pricing.value
  })

  function setPaymentDeadline(value?: string | null) {
    if (!value) return
    const timestamp = new Date(value).getTime()
    if (!Number.isNaN(timestamp)) {
      paymentDeadline.value = timestamp
    }
  }

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
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''
    quantity.value = 1
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

  async function setTable(tableInfo: Partial<TableInfo>): Promise<boolean> {
    const code = String(tableInfo.tableNumber || '').trim().toUpperCase()
    if (!code) return false

    try {
      const res = await api.getTableByCode(code)
      if (!res.data) return false

      table.value = {
        tableNumber: String(res.data.code || code).toUpperCase(),
        floor: parseInt(String(res.data.floor).replace(/\D/g, ''), 10) || tableInfo.floor || 1,
        isVerified: true,
      }
      syncWithStorage()
      return true
    } catch {
      // Jangan menandai meja sebagai terverifikasi kalau backend menolak.
      // Biarkan meja valid sebelumnya tetap aktif.
      return false
    }
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

  async function applyPromoAsync(code: string) {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return
    promoStatus.value = 'loading'
    promoMessage.value = 'Memvalidasi kode kupon...'

    try {
      const res = await api.validatePromo(cleanCode, totalSubtotal.value)
      // Backend mengembalikan valid/success di root response, bukan di data.
      if (res.success && res.valid && res.data) {
        appliedDiscount.value = Number(res.data.discount || 0)
        promoCode.value = cleanCode
        promoStatus.value = 'success'
        promoMessage.value = res.data.description || `Diskon Rp ${appliedDiscount.value.toLocaleString('id-ID')} berhasil diterapkan!`
        syncWithStorage()
        return
      } else {
        appliedDiscount.value = 0
        promoCode.value = ''
        promoStatus.value = 'error'
        promoMessage.value = res.message || 'Kode promo tidak valid atau telah kedaluwarsa.'
        syncWithStorage()
        return
      }
    } catch (e: any) {
      appliedDiscount.value = 0
      promoCode.value = ''
      promoStatus.value = 'error'
      promoMessage.value = e.data?.message || e.message || 'Kode promo tidak valid atau telah kedaluwarsa.'
      syncWithStorage()
    }
  }

  function applyPromo(code: string) {
    applyPromoAsync(code)
  }

  function removePromo() {
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''
    syncWithStorage()
  }

  async function createOrderAsync(): Promise<Order> {
    if (cartItems.value.length === 0) {
      throw new Error('Keranjang pesanan masih kosong. Silakan pilih menu terlebih dahulu.')
    }

    const tableCode = table.value.tableNumber || 'A12'
    // Idempotency key stabil per isi keranjang: retry request yang sama
    // (mis. double-klik) tidak membuat order ganda di backend.
    const cartSig = cartItems.value.map((it) => `${it.itemId}x${it.quantity}`).join('|')
    const idempotency_key = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? `mejaku-${tableCode}-${cartSig}-${crypto.randomUUID()}`
      : `mejaku-${tableCode}-${cartSig}-${Date.now()}`
    const payload = {
      table_code: tableCode,
      notes: customerNote.value.trim() || undefined,
      promo_code: promoCode.value || undefined,
      idempotency_key,
      items: cartItems.value.map((it) => {
        const numId = parseInt(it.itemId.replace(/\D/g, ''), 10)
        if (isNaN(numId) || numId <= 0) {
          throw new Error(`ID menu "${it.name}" tidak valid. Muat ulang menu dari server.`)
        }
        const parseOptId = (raw?: string | number | null) => {
          if (raw === undefined || raw === null || raw === '') return undefined
          const n = parseInt(String(raw).replace(/\D/g, ''), 10)
          return isNaN(n) || n <= 0 ? undefined : n
        }
        return {
          menu_item_id: numId,
          quantity: it.quantity,
          portion_id: it.portion?.id ? parseOptId(it.portion.id as any) : undefined,
          spice_level_id: it.spice?.id ? parseOptId(it.spice.id as any) : undefined,
          addon_ids: (it.addons || []).map((a) => parseOptId(a.id as any)).filter((n): n is number => typeof n === 'number'),
        }
      }),
    }

    const res = await api.createOrder(payload)
    if (!res.data || !res.data.order_number) {
      throw new Error((res as any).message || 'Gagal membuat pesanan ke server.')
    }

    const newOrder = transformBackendOrder(res.data)
    currentOrder.value = newOrder
    paymentDeadline.value = new Date(newOrder.expiresAt).getTime()

    const existingHistIdx = orderHistory.value.findIndex((o) => o.id === newOrder.id)
    if (existingHistIdx > -1) {
      orderHistory.value[existingHistIdx] = { ...newOrder }
    } else {
      orderHistory.value.unshift({ ...newOrder })
    }

    syncWithStorage()
    return newOrder
  }

  async function fetchOrder(orderNumber: string): Promise<Order | null> {
    try {
      const res = await api.getOrder(orderNumber)
      if (res.data && res.data.order_number) {
        const order = transformBackendOrder(res.data)
        currentOrder.value = order
        if (order.expiresAt) {
          paymentDeadline.value = new Date(order.expiresAt).getTime()
        }
        const existingHistIdx = orderHistory.value.findIndex((o) => o.id === order.id)
        if (existingHistIdx > -1) {
          orderHistory.value[existingHistIdx] = { ...order }
        } else {
          orderHistory.value.unshift({ ...order })
        }
        syncWithStorage()
        return order
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan backend:', err)
    }
    return null
  }

  function setPaymentMethod(method: PaymentMethodType) {
    if (currentOrder.value) {
      currentOrder.value.paymentMethod = method
      currentOrder.value.paymentMethodLabel =
        method === 'bank_va' ? 'Transfer Bank / VA' : method === 'cashier' ? 'Kasir' : 'QRIS'
      syncWithStorage()
    }
  }

  function currentWibTime(): string {
    return `${new Date()
      .toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace('.', ':')} WIB`
  }

  function finalizePaidOrder(payment?: any) {
    if (!currentOrder.value) return

    currentOrder.value.paymentStatus = 'paid'
    if (currentOrder.value.prepStatus === 'received') {
      currentOrder.value.prepStatus = 'preparing'
    }
    if (!currentOrder.value.paymentTimestamp) {
      currentOrder.value.paymentTimestamp = payment?.paid_at
        ? `${new Date(payment.paid_at)
            .toLocaleTimeString('id-ID', {
              timeZone: 'Asia/Jakarta',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace('.', ':')} WIB`
        : currentWibTime()
    }
    if (payment?.method_label) {
      currentOrder.value.paymentMethodLabel = payment.method_label
    }

    // Kosongkan cart, tetapi JANGAN hapus currentOrder: halaman konfirmasi
    // masih membutuhkan pricing dan item dari server.
    cartItems.value = []
    appliedDiscount.value = 0
    promoCode.value = ''
    promoStatus.value = 'idle'
    promoMessage.value = ''
    quantity.value = 1

    const histIdx = orderHistory.value.findIndex((o) => o.id === currentOrder.value?.id)
    if (histIdx > -1) {
      orderHistory.value[histIdx] = { ...currentOrder.value }
    }

    syncWithStorage()
    // Sinkronkan status riwayat lain di latar (tanpa blokir UI).
    void syncHistoryStatus()
  }

  function applyPaymentStatus(payment: any) {
    if (!currentOrder.value || !payment) return

    if (payment.method) {
      currentOrder.value.paymentMethod =
        payment.method === 'bank_transfer' ? 'bank_va' : payment.method === 'cashier' ? 'cashier' : 'qris'
      currentOrder.value.paymentMethodLabel =
        payment.method_label ||
        (payment.method === 'bank_transfer' ? 'Transfer Bank / VA' : payment.method === 'cashier' ? 'Kasir' : 'QRIS')
    }

    const status = payment.payment_status || payment.status
    if (status) {
      currentOrder.value.paymentStatus = status as PaymentStatus
    }
    if (payment.preparation_status) {
      currentOrder.value.prepStatus = payment.preparation_status as PrepStatus
    }
    if (payment.expires_at) {
      setPaymentDeadline(payment.expires_at)
    }

    if (status === 'paid') {
      finalizePaidOrder(payment)
    } else {
      syncWithStorage()
    }
  }

  async function refreshPaymentStatus(): Promise<any | null> {
    if (!currentOrder.value) return null

    isCheckingPayment.value = true
    try {
      const res = await api.getPaymentStatus(currentOrder.value.id)
      if (res.data) {
        applyPaymentStatus(res.data)
        return res.data
      }
      return null
    } catch {
      return null
    } finally {
      isCheckingPayment.value = false
    }
  }

  function setPaymentStatusDirect(status: PaymentStatus) {
    if (currentOrder.value) {
      currentOrder.value.paymentStatus = status
      if (status === 'paid') {
        finalizePaidOrder()
      } else {
        syncWithStorage()
      }
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
    table.value = { ...INITIAL_DEFAULT_TABLE }
    syncWithStorage()
  }

  // Load a historical order as the active order (so Cek Status works)
  
  async function syncHistoryStatus() {
    for (const ord of orderHistory.value) {
      if (ord.id && ord.id.startsWith("MJK-")) {
        try {
          const res = await api.getOrder(ord.id)
          if (res.data) {
            if (res.data.payment_status) ord.paymentStatus = res.data.payment_status as PaymentStatus
            if (res.data.preparation_status) ord.prepStatus = res.data.preparation_status as PrepStatus
          }
        } catch {
          // offline fallback
        }
      }
    }
    syncWithStorage()
  }

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
      localStorage.setItem('mejaku_state_v4', JSON.stringify(stateToSave))
    } catch {
      // Ignore localStorage errors
    }
  }

  function loadFromStorage() {
    try {
      // Clear legacy storage versions with dummy data
      localStorage.removeItem('mejaku_state_v1')
      localStorage.removeItem('mejaku_state_v2')
      localStorage.removeItem('mejaku_state_v3')

      const raw = localStorage.getItem('mejaku_state_v4')
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

        // Load order history (saring order dummy jika ada)
        if (Array.isArray(saved.orderHistory)) {
          orderHistory.value = saved.orderHistory.filter((o: Order) => o.id !== 'MJK-51204-BA')
        }
      } else {
        cartItems.value = []
        orderHistory.value = []
      }
    } catch {
      cartItems.value = []
      orderHistory.value = []
    }
  }

  async function initAppAsync() {
    // 1. Sinkronisasi meja dari database (tanpa membuat status verified palsu)
    if (table.value.tableNumber) {
      await setTable({ tableNumber: table.value.tableNumber })
    }

    // 2. Sinkronisasi menu awal dari backend jika belum ada item pilihan
    try {
      const menuRes = await api.getMenus()
      if (menuRes.data && Array.isArray(menuRes.data) && menuRes.data.length > 0) {
        const firstBackendItem = transformBackendMenuItem(menuRes.data[0])
        if (currentItem.value.id === '1' && currentItem.value.name === DEFAULT_FALLBACK_ITEM.name) {
          setActiveItem(firstBackendItem)
        }
      }
    } catch {
      // Abaikan jika offline
    }
  }

  // Initialize from storage (empty by default)
  loadFromStorage()
  initAppAsync()

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
    orderPricing,
    setPaymentDeadline,
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
    createOrderAsync,
    fetchOrder,
    applyPromoAsync,
    setPaymentMethod,
    refreshPaymentStatus,
    applyPaymentStatus,
    finalizePaidOrder,
    setPaymentStatusDirect,
    setPrepStatus,
    resetToDefault,
    loadOrderFromHistory,
    reorderFromHistory,
    syncHistoryStatus,
    initAppAsync,
  }
})
