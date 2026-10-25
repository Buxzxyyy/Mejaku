<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { QrCode, ShoppingBag, CheckCircle, Receipt, X, ArrowRight, RefreshCw } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import QrScannerModal from './QrScannerModal.vue'

withDefaults(
  defineProps<{
    isLanding?: boolean
    hidePriceLink?: boolean
  }>(),
  {
    isLanding: false,
    hidePriceLink: false,
  }
)

const router = useRouter()
const orderStore = useOrderStore()
const showScannerModal = ref(false)
const showHistoryModal = ref(false)

// Reorder toast state
const reorderToast = ref<{ show: boolean; orderId: string; itemCount: number }>({
  show: false,
  orderId: '',
  itemCount: 0,
})
let reorderToastTimer: ReturnType<typeof setTimeout> | null = null
const reorderingId = ref<string | null>(null)

// Lock body scrolling when any modal is open
watch([showHistoryModal, showScannerModal], ([hist, scan]) => {
  if (hist || scan) {
    document.body.classList.add('modal-open')
    document.documentElement.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
    document.documentElement.classList.remove('modal-open')
  }
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
  document.documentElement.classList.remove('modal-open')
  if (reorderToastTimer) clearTimeout(reorderToastTimer)
})

function goToOrderStatus(orderId: string) {
  orderStore.loadOrderFromHistory(orderId)
  showHistoryModal.value = false
  router.push(`/orders/${orderId}/confirmation`)
}

function handleReorder(orderId: string) {
  if (reorderingId.value === orderId) return

  reorderingId.value = orderId
  const success = orderStore.reorderFromHistory(orderId)

  if (success) {
    const itemCount = orderStore.cartItems.length
    showHistoryModal.value = false

    // Show reorder toast
    if (reorderToastTimer) clearTimeout(reorderToastTimer)
    reorderToast.value = { show: true, orderId, itemCount }
    reorderToastTimer = setTimeout(() => {
      reorderToast.value.show = false
    }, 3500)

    // Navigate to checkout after brief delay
    setTimeout(() => {
      router.push('/checkout')
    }, 400)
  }

  setTimeout(() => {
    reorderingId.value = null
  }, 1200)
}
</script>

<template>
  <header class="navbar-root" role="banner">
    <div class="container-app navbar-container">
      <!-- Left: Logo & Wordmark -->
      <RouterLink to="/" class="brand-link" aria-label="Beranda MejaKu">
        <div class="logo-box">
          <span class="logo-m font-display">M</span>
        </div>
        <span class="brand-name font-display">MejaKu</span>
      </RouterLink>

      <!-- Right: Meja Terverifikasi, Riwayat Pesanan, Icon Keranjang, & Ganti Meja / Scan QR -->
      <div class="nav-right-actions">
        <!-- 1. Meja Terverifikasi Pill -->
        <div class="table-pill-verified" title="Status Meja Terverifikasi QR">
          <span class="live-pulse-dot" />
          <CheckCircle :size="14" class="verified-icon" />
          <span class="table-pill-text">
            Meja {{ orderStore.table.tableNumber }}<span class="pill-verified-word"> Terverifikasi</span>
          </span>
        </div>

        <!-- 2. Riwayat Pesanan Button -->
        <button
          type="button"
          class="btn-nav-history"
          title="Lihat Riwayat Pesanan Meja"
          aria-label="Lihat Riwayat Pesanan"
          @click="showHistoryModal = true"
        >
          <Receipt :size="18" />
          <span class="nav-history-text">Riwayat</span>
        </button>

        <!-- 3. Icon Keranjang with real badge count -->
        <RouterLink
          to="/checkout"
          class="btn-cart-nav"
          :aria-label="`Keranjang belanja, ${orderStore.totalQuantity} item`"
          title="Buka Keranjang Pesanan"
        >
          <ShoppingBag :size="20" />
          <span v-if="orderStore.totalQuantity > 0" class="cart-badge-count">
            {{ orderStore.totalQuantity }}
          </span>
        </RouterLink>

        <!-- 4. Ganti Meja / Scan QR Button -->
        <button
          type="button"
          class="btn-ganti-meja"
          title="Pindai ulang QR di mejamu atau ganti meja"
          aria-label="Ganti Meja atau Pindai QR"
          @click="showScannerModal = true"
        >
          <QrCode :size="16" />
          <span class="btn-ganti-meja-text">Ganti Meja / Scan QR</span>
        </button>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <QrScannerModal v-model="showScannerModal" />

    <!-- Order History Modal -->
    <Teleport to="body">
      <div v-if="showHistoryModal" class="modal-backdrop" @click.self="showHistoryModal = false">
        <div class="modal-card history-modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <h3 class="font-display modal-title">Riwayat Pesanan</h3>
              <p class="modal-sub">Daftar transaksi pesanan Anda di Warung Bali Dwi</p>
            </div>
            <button type="button" class="close-btn" @click="showHistoryModal = false">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body history-body">
            <div v-if="orderStore.orderHistory.length === 0" class="empty-history">
              <Receipt :size="40" class="empty-hist-icon" />
              <p>Belum ada riwayat pesanan.</p>
            </div>

            <div v-else class="history-list">
              <div
                v-for="ord in orderStore.orderHistory"
                :key="ord.id"
                class="history-card"
              >
                <div class="history-card-top">
                  <div>
                    <strong class="hist-order-num">{{ ord.orderNumber }}</strong>
                    <span class="hist-time">
                      {{ ord.paymentTimestamp || new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                  <span
                    class="badge-pill"
                    :class="{
                      'badge-pill-success': ord.prepStatus === 'completed',
                      'badge-pill-primary': ord.prepStatus === 'ready',
                      'badge-pill-warning': ord.prepStatus === 'preparing',
                    }"
                  >
                    {{
                      ord.prepStatus === 'completed'
                        ? 'Selesai'
                        : ord.prepStatus === 'ready'
                        ? 'Siap Disajikan'
                        : ord.prepStatus === 'preparing'
                        ? 'Sedang Dimasak'
                        : 'Terbayar'
                    }}
                  </span>
                </div>

                <!-- Items list -->
                <div class="hist-items-list">
                  <div
                    v-for="(itm, iIdx) in (ord.items || [ord.item])"
                    :key="iIdx"
                    class="hist-item-row"
                  >
                    <span class="hist-item-qty">{{ itm.quantity }}x</span>
                    <span class="hist-item-name">{{ itm.name }}</span>
                    <span class="hist-item-price">{{ formatRupiah(itm.subtotal) }}</span>
                  </div>
                </div>

                <div class="history-card-footer">
                  <div class="hist-total">
                    <span>Total:</span>
                    <strong>{{ formatRupiah(ord.pricing.total) }}</strong>
                  </div>
                  <div class="hist-action-btns">
                    <!-- Pesan Lagi -->
                    <button
                      type="button"
                      class="btn-reorder"
                      :class="{ 'is-loading': reorderingId === ord.id }"
                      :disabled="reorderingId === ord.id"
                      :aria-label="`Pesan ulang ${ord.orderNumber}`"
                      @click="handleReorder(ord.id)"
                    >
                      <RefreshCw :size="13" />
                      <span>{{ reorderingId === ord.id ? 'Memproses...' : 'Pesan Lagi' }}</span>
                    </button>
                    <!-- Cek Status -->
                    <button
                      type="button"
                      class="btn-view-hist"
                      @click="goToOrderStatus(ord.id)"
                    >
                      <span>Cek Status</span>
                      <ArrowRight :size="14" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reorder Toast Notification -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div v-if="reorderToast.show" class="reorder-toast" role="status" aria-live="polite">
          <div class="reorder-toast-icon">
            <ShoppingBag :size="18" />
          </div>
          <div class="reorder-toast-body">
            <strong>Pesanan ditambahkan ke keranjang!</strong>
            <span>{{ reorderToast.itemCount }} menu dari pesanan sebelumnya siap dipesan.</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.navbar-root {
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100vw;
  overflow-x: clip;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 16px;
}

/* Brand Link */
.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(194, 65, 12, 0.25);
  transition: transform 0.2s var(--ease-spring);
}

.brand-link:hover .logo-box {
  transform: rotate(-6deg) scale(1.05);
}

.logo-m {
  color: #FFFFFF;
  font-weight: 700;
  font-size: 24px;
  line-height: 1;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.5px;
}

/* Right Actions Container */
.nav-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 1. Table Verified Pill */
.table-pill-verified {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--success-soft);
  color: var(--success);
  border: 1px solid rgba(21, 128, 61, 0.25);
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.live-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: #22C55E;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  display: inline-block;
}

.verified-icon {
  color: var(--success);
}

.table-pill-text {
  font-weight: 700;
}

/* 2. Cart Icon Button */
.btn-cart-nav {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  background-color: var(--surface);
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-cart-nav:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.cart-badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(194, 65, 12, 0.4);
}

/* 3. Ganti Meja / Scan QR Button */
.btn-ganti-meja {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--surface);
  border: 1.5px dashed var(--primary);
  color: var(--primary);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-nav-history {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--surface);
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-nav-history:hover {
  background-color: var(--surface-warm);
  border-color: var(--primary);
  color: var(--primary);
}

/* Modal Backdrop & Dialog */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  width: 100vw;
  width: 100dvw;
  height: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: -webkit-fill-available;
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  padding: 16px;
  overscroll-behavior: contain;
  touch-action: none;
}

.modal-card {
  background-color: #ffffff;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 540px;
  max-height: 88vh;
  max-height: 88dvh;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  animation: modalScale 0.25s var(--ease-spring);
  position: relative;
  touch-action: auto;
  overscroll-behavior: contain;
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
}

.close-btn {
  color: var(--text-secondary);
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--surface-warm);
  color: var(--text-primary);
}

.history-modal-card {
  max-width: 540px;
  max-height: 85vh;
  max-height: 85dvh;
  display: flex;
  flex-direction: column;
}

.modal-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.history-body {
  overflow-y: auto;
  max-height: 60vh;
  max-height: 60dvh;
  padding: 4px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-muted);
  gap: 12px;
}

.empty-hist-icon {
  color: var(--border);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-card {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 10px;
}

.hist-order-num {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
}

.hist-time {
  font-size: 11px;
  color: var(--text-muted);
}

.hist-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hist-item-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  gap: 8px;
}

.hist-item-qty {
  font-weight: 700;
  color: var(--primary);
  width: 24px;
}

.hist-item-name {
  flex: 1;
  color: var(--text-primary);
}

.hist-item-price {
  font-weight: 700;
  color: var(--text-secondary);
}

.history-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border);
  padding-top: 10px;
}

.hist-total {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.hist-total strong {
  font-size: 15px;
  color: var(--primary);
}

.btn-view-hist {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--surface);
  border: 1px solid var(--border);
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-view-hist:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}

/* History card action buttons row */
.hist-action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Pesan Lagi button */
.btn-reorder {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
  background-color: var(--primary);
  border: 1px solid var(--primary);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-reorder:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(194, 65, 12, 0.25);
}

.btn-reorder:disabled,
.btn-reorder.is-loading {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Reorder Toast */
.reorder-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  background-color: #1E293B;
  color: #FFFFFF;
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 380px;
  pointer-events: none;
}

.reorder-toast-icon {
  width: 36px;
  height: 36px;
  background: rgba(194, 65, 12, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F97316;
  flex-shrink: 0;
}

.reorder-toast-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.reorder-toast-body strong {
  font-size: 13px;
  color: #FFFFFF;
  display: block;
}

.reorder-toast-body span {
  font-size: 12px;
  color: #94A3B8;
  display: block;
  line-height: 1.4;
}

/* Toast slide animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s var(--ease-spring);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

/* ===================== RESPONSIVE ===================== */

/* Large Tablet / Small Laptop / Mobile Desktop Mode (≤ 1024px) */
@media (max-width: 1024px) {
  .btn-ganti-meja-text {
    display: none;
  }

  .btn-ganti-meja {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    border-radius: var(--radius-full);
  }

  .btn-nav-history .nav-history-text {
    display: none;
  }

  .btn-nav-history {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    border-radius: var(--radius-full);
  }
}

/* Tablet (≤ 900px): hide brand name text, compress spacing */
@media (max-width: 900px) {
  .navbar-container {
    gap: 10px;
  }

  .brand-name {
    display: none;
  }

  .nav-right-actions {
    gap: 8px;
  }

  .table-pill-verified {
    padding: 7px 11px;
    font-size: 12px;
    gap: 6px;
  }

  /* History modal full width on tablet */
  .history-modal-card {
    max-width: 100%;
    width: calc(100vw - 32px);
  }
}

/* Medium mobile / tablet (≤ 768px): shorten table pill text */
@media (max-width: 768px) {
  .pill-verified-word {
    display: none;
  }
}

/* Small tablet / large mobile (≤ 640px) */
@media (max-width: 640px) {
  .navbar-container {
    height: 60px;
    gap: 8px;
  }

  .logo-box {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .logo-m {
    font-size: 20px;
  }

  .nav-right-actions {
    gap: 6px;
  }

  .table-pill-verified {
    padding: 6px 10px;
    font-size: 11px;
    gap: 5px;
  }

  .verified-icon {
    display: none;
  }

  .btn-cart-nav {
    width: 38px;
    height: 38px;
  }

  .btn-nav-history {
    width: 38px;
    height: 38px;
  }

  .btn-ganti-meja {
    width: 38px;
    height: 38px;
  }
}

/* Mobile (≤ 400px): ultra compact */
@media (max-width: 400px) {
  .navbar-container {
    height: 56px;
    gap: 6px;
    padding: 0 12px;
  }

  .table-pill-verified {
    padding: 5px 8px;
    font-size: 10px;
    gap: 4px;
  }

  .live-pulse-dot {
    width: 7px;
    height: 7px;
  }

  .btn-cart-nav,
  .btn-nav-history,
  .btn-ganti-meja {
    width: 36px;
    height: 36px;
  }

  .nav-right-actions {
    gap: 5px;
  }
}
</style>
