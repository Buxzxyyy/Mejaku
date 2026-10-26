<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { api } from '@/api/client'
import {
  CheckCircle2,
  QrCode,
  MapPin,
  Compass,
  ArrowLeft,
  Share2,
  Sparkles,
  Flame,
  RefreshCw,
} from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import PriceBreakdown from '@/components/common/PriceBreakdown.vue'
import OrderTimeline from '@/components/common/OrderTimeline.vue'
import HelpCallout from '@/components/common/HelpCallout.vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import { handleMenuImgError } from '@/utils/adapters'
import type { PrepStatus } from '@/types'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const routeOrderId = computed(() => (route.params.orderId as string) || '')

const currentOrderNumber = computed(() => {
  return orderStore.currentOrder?.orderNumber || (route.params.orderId ? '#' + String(route.params.orderId) : 'Pesanan Meja')
})

const orderTable = computed(() => orderStore.currentOrder?.table || orderStore.table)

const paymentMethodDisplay = computed(() => {
  const order = activeOrder.value || orderStore.currentOrder
  if (order?.paymentMethodLabel) return order.paymentMethodLabel
  switch (order?.paymentMethod) {
    case 'bank_va':
      return 'Transfer Bank / Virtual Account'
    case 'cashier':
      return 'Kasir'
    default:
      return 'QRIS'
  }
})

// Active order matching this confirmation view
const activeOrder = computed(() => {
  if (routeOrderId.value) {
    const found = orderStore.orderHistory.find((o) => o.id === routeOrderId.value)
    if (found) return found
  }
  if (orderStore.currentOrder) {
    return orderStore.currentOrder
  }
  if (orderStore.orderHistory.length > 0) {
    return orderStore.orderHistory[0]
  }
  return null
})

const breadcrumbItems = computed(() => [
  { label: 'Beranda', to: '/' },
  { label: activeOrder.value?.merchant || orderStore.currentItemConfig.merchant, to: '/' },
  { label: 'Pesanan Berhasil' },
])

const currentPrepStatus = ref<PrepStatus>(activeOrder.value?.prepStatus || 'preparing')

const orderItems = computed(() => {
  if (activeOrder.value?.items && activeOrder.value.items.length > 0) {
    return activeOrder.value.items
  }
  if (orderStore.currentOrder?.items && orderStore.currentOrder.items.length > 0) {
    return orderStore.currentOrder.items
  }
  if (routeOrderId.value) {
    const historicalOrder = orderStore.orderHistory.find((o) => o.id === routeOrderId.value)
    if (historicalOrder?.items && historicalOrder.items.length > 0) {
      return historicalOrder.items
    }
  }
  if (orderStore.orderHistory.length > 0 && (orderStore.orderHistory[0]?.items?.length ?? 0) > 0) {
    return orderStore.orderHistory[0].items!
  }
  if (orderStore.cartItems.length > 0) {
    return orderStore.cartItems
  }
  return []
})

const confirmedPricing = computed(() => {
  if (activeOrder.value?.pricing && activeOrder.value.pricing.subtotal > 0) {
    return activeOrder.value.pricing
  }
  if (orderStore.currentOrder?.pricing && orderStore.currentOrder.pricing.subtotal > 0) {
    return orderStore.currentOrder.pricing
  }
  if (orderStore.orderHistory.length > 0 && (orderStore.orderHistory[0]?.pricing?.subtotal ?? 0) > 0) {
    return orderStore.orderHistory[0].pricing
  }
  return orderStore.pricing
})

const orderItemsFoodNames = computed(() => {
  return orderItems.value.map((i) => i.name).join(' & ')
})

const paymentTimeDisplay = computed(() => {
  if (activeOrder.value?.paymentTimestamp) {
    return activeOrder.value.paymentTimestamp
  }
  if (orderStore.currentOrder?.paymentTimestamp) {
    return orderStore.currentOrder.paymentTimestamp
  }
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
})

let pollTimer: any = null

function mapBackendStatus(backendStatus: string): PrepStatus {
  switch (backendStatus) {
    case 'ready':
      return 'ready'
    case 'completed':
      return 'completed'
    case 'preparing':
      return 'preparing'
    case 'paid':
    case 'pending':
    default:
      return 'received'
  }
}

async function checkLiveOrderStatus() {
  const currentId = (route.params.orderId as string) || orderStore.currentOrder?.id
  if (!currentId) return

  if (!orderStore.currentOrder || orderStore.currentOrder.id !== currentId) {
    await orderStore.fetchOrder(currentId)
  }

  try {
    const res = await api.getOrder(currentId)
    if (res.data) {
      const backendPrep = res.data.preparation_status || res.data.status
      if (backendPrep) {
        const mapped = mapBackendStatus(backendPrep)
        currentPrepStatus.value = mapped
        orderStore.setPrepStatus(mapped)
        if (backendPrep === 'completed' && pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
      }
    }
  } catch {
    // Abaikan error polling
  }
}

onMounted(() => {
  if (routeOrderId.value) {
    orderStore.loadOrderFromHistory(routeOrderId.value)
  } else if (!orderStore.currentOrder && orderStore.orderHistory.length > 0) {
    orderStore.currentOrder = orderStore.orderHistory[0]
  }

  if (activeOrder.value?.prepStatus) {
    currentPrepStatus.value = activeOrder.value.prepStatus
  }

  // Fire celebration confetti!
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C2410C', '#F97316', '#15803D', '#F59E0B'],
    })
  } catch {
    // Ignore confetti errors if canvas unavailable
  }

  checkLiveOrderStatus()
  pollTimer = setInterval(checkLiveOrderStatus, 4000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

function handleStatusUpdate(_newStatus: PrepStatus) {
  // Timeline bersifat read-only: status dapur hanya boleh berubah dari
  // backend (polling 4 detik menimpanya). Minta status terbaru sekarang.
  void checkLiveOrderStatus()
}

function scrollToTimeline() {
  const el = document.getElementById('live-timeline-card')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    el.classList.add('pulse-highlight')
    setTimeout(() => {
      el.classList.remove('pulse-highlight')
    }, 1500)
  }
}

function handleReorderThisOrder() {
  const ord = activeOrder.value
  if (!ord) return
  const success = orderStore.reorderFromHistory(ord.id)
  if (success) {
    router.push('/checkout')
  }
}
</script>

<template>
  <div class="confirmation-page">
    <AppNavbar :hide-price-link="true" />

    <main class="container-app confirm-main">
      <AppBreadcrumb :items="breadcrumbItems" />

      <!-- Page Heading -->
      <div class="confirm-header-row">
        <div>
          <div class="success-banner-pill">
            <CheckCircle2 :size="16" class="check-pill-icon" />
            <span>PEMBAYARAN TERVERIFIKASI</span>
          </div>

          <h1 class="font-display confirm-h1">Makananmu Sedang Disiapkan!</h1>
          <p class="confirm-desc">
            Terima kasih! Pembayaran berhasil diverifikasi. Koki di {{ orderStore.currentItemConfig.merchant }} telah menerima pesananmu dan sedang mulai meracik hidangan segar.
          </p>
        </div>
      </div>

      <!-- Main Two-Column Layout (800px Left, 432px Right) -->
      <div class="confirm-grid">
        <!-- LEFT COLUMN: Timeline & Delivery Details -->
        <div class="confirm-left-col">
          <!-- 1. Status Pesanan Langsung -->
          <div id="live-timeline-card" class="timeline-card card-surface">
            <div class="card-head-between">
              <div>
                <h2 class="card-section-title">Status Pesanan Langsung</h2>
                <span class="card-section-sub">
                  Estimasi siap saji dalam 20–25 menit · Diperbarui otomatis
                </span>
              </div>
              <div class="badge-pill badge-pill-primary">
                <Flame :size="13" />
                <span>Live Dapur</span>
              </div>
            </div>

            <!-- Vertical Timeline -->
            <OrderTimeline
              :status="currentPrepStatus"
              :payment-timestamp="paymentTimeDisplay"
              :food-name="orderItemsFoodNames"
              :table-number="orderTable.tableNumber"
              @update:status="handleStatusUpdate"
            />
          </div>

          <!-- 2. Detail Pengantaran Meja Card -->
          <div class="table-card card-surface">
            <div class="card-head-between">
              <div>
                <h3 class="card-section-title">Detail Pengantaran Meja</h3>
                <span class="card-section-sub">
                  Pastikan Anda tetap duduk di meja yang sesuai dengan sistem QR kami.
                </span>
              </div>
              <div class="badge-pill badge-pill-success">
                <CheckCircle2 :size="13" />
                <span>Sesuai QR Meja</span>
              </div>
            </div>

            <!-- Warm Location Card -->
            <div class="table-location-box">
              <div class="qr-round-icon">
                <QrCode :size="24" />
              </div>
              <div class="table-location-meta">
                <span class="meta-sub">Meja Terpilih Anda</span>
                <strong class="meta-title">
                  Meja {{ orderTable.tableNumber }} · Lantai {{ orderTable.floor }}
                </strong>
                <p class="meta-desc">
                  Pesanan akan diantar langsung ke meja ini oleh pramusaji.
                </p>
              </div>
            </div>
          </div>

          <!-- 3. Help Callout -->
          <HelpCallout
            title="Ada kendala atau instruksi tambahan untuk dapur?"
            description="Hubungi bantuan langsung mitra atau pramusaji melalui fitur Bantuan MejaKu."
            action-text="Hubungi Bantuan"
          />
        </div>

        <!-- RIGHT COLUMN: CTA & Ringkasan Hidangan -->
        <aside class="confirm-right-col">
          <!-- Actions: Order Number, Lacak & Kembali -->
          <div class="confirm-actions-wrap">
            <div class="order-number-card">
              <div class="ord-card-row">
                <div>
                  <span class="ord-tag">NO. PESANAN</span>
                  <strong class="ord-code font-sans">
                    {{ currentOrderNumber }}
                  </strong>
                </div>
                <div class="ord-badge-live">
                  <span class="pulse-dot"></span>
                  <span>Terverifikasi</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="btn-primary btn-track"
              @click="scrollToTimeline"
            >
              <Compass :size="18" />
              <span>Lacak Pesanan Langsung</span>
            </button>

            <button
              type="button"
              class="btn-outline btn-reorder-confirm"
              @click="handleReorderThisOrder"
            >
              <RefreshCw :size="18" />
              <span>Pesan Lagi Menu Ini</span>
            </button>

            <RouterLink to="/" class="btn-outline btn-back-home">
              <ArrowLeft :size="18" />
              <span>Kembali ke Beranda Kuliner</span>
            </RouterLink>
          </div>

          <!-- Ringkasan Hidangan Card -->
          <div class="summary-card card-surface">
            <div class="summary-card-header">
              <h2 class="font-display summary-title">Ringkasan Hidangan</h2>
              <span class="badge-pill badge-pill-primary">{{ orderItems.length }} Menu</span>
            </div>

            <!-- Dish Items List (all ordered items) -->
            <div class="dish-items-list">
              <div
                v-for="item in orderItems"
                :key="item.cartId || item.itemId"
                class="dish-item-recap"
              >
                <img
                  :src="item.image || orderStore.currentItemConfig.image"
                  :alt="item.name"
                  class="dish-mini-img"
                  @error="handleMenuImgError"
                />
                <div class="dish-mini-meta">
                  <span class="dish-merchant">{{ item.merchant || 'Warung Bali Dwi' }}</span>
                  <strong class="dish-name">{{ item.name }}</strong>
                  <span class="dish-sub">
                    {{ item.quantity }} × {{ item.portion?.name || 'Porsi Standar' }}
                    <template v-if="item.spice"> · {{ item.spice.name }}</template>
                    <template v-if="item.addons && item.addons.length > 0">
                      · {{ item.addons.map(a => a.name).join(', ') }}
                    </template>
                  </span>
                </div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <PriceBreakdown :pricing="confirmedPricing" mode="confirmation" />

            <!-- Card Bottom Method Info -->
            <div class="summary-card-footer">
              <span class="footer-method-label">Metode Pembayaran:</span>
              <strong class="footer-method-val">
                {{ paymentMethodDisplay }}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.confirmation-page {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.confirm-main {
  padding-bottom: 96px;
}

.confirm-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.success-banner-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--success-soft);
  color: var(--success);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
  border: 1px solid rgba(21, 128, 61, 0.2);
}

.check-pill-icon {
  color: var(--success);
}

.confirm-h1 {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 8px;
}

.confirm-desc {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 680px;
}

.order-number-card {
  width: 100%;
  background-color: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.ord-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.ord-tag {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.ord-code {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 0.5px;
}

.ord-badge-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--success-soft);
  color: var(--success);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--success);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

/* Two-column layout (800px Left, 432px Right) */
.confirm-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
}

@media (min-width: 1080px) {
  .confirm-grid {
    grid-template-columns: 1fr 432px;
    gap: 48px;
  }
}

.confirm-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-card,
.table-card {
  padding: 28px;
  transition: box-shadow 0.3s ease;
}

.pulse-highlight {
  box-shadow: 0 0 0 4px var(--primary-soft), 0 16px 36px rgba(194, 65, 12, 0.15) !important;
}

.card-head-between {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.card-section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-section-sub {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Table location warm box */
.table-location-box {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.qr-round-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.table-location-meta {
  display: flex;
  flex-direction: column;
}

.meta-sub {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.meta-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.meta-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* Right Column */
.confirm-right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.confirm-actions-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-track {
  width: 100%;
  padding: 16px;
  font-size: 16px;
}

.btn-back-home {
  width: 100%;
  padding: 14px;
  font-size: 15px;
}

.btn-reorder-confirm {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  color: var(--primary);
  border: 1.5px solid var(--primary);
  background-color: var(--primary-soft);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-reorder-confirm:hover {
  background-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(194, 65, 12, 0.25);
  transform: translateY(-1px);
}

.summary-card {
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.summary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.summary-title {
  font-size: 26px;
  color: var(--text-primary);
}

.dish-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.dish-item-recap {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 0;
}

.dish-mini-img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.dish-mini-meta {
  display: flex;
  flex-direction: column;
}

.dish-merchant {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.dish-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.dish-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.summary-card-footer {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.footer-method-label {
  color: var(--text-secondary);
}

.footer-method-val {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
