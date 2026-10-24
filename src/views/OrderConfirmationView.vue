<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  CheckCircle2,
  QrCode,
  MapPin,
  Compass,
  ArrowLeft,
  Share2,
  Sparkles,
  Flame,
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
import type { PrepStatus } from '@/types'

const router = useRouter()
const orderStore = useOrderStore()

const breadcrumbItems = [
  { label: 'Beranda', to: '/' },
  { label: orderStore.currentItemConfig.merchant, to: '/' },
  { label: 'Pesanan Berhasil' },
]

const currentPrepStatus = ref<PrepStatus>(orderStore.currentOrder?.prepStatus || 'preparing')

const orderItems = computed(() => {
  if (orderStore.currentOrder?.items && orderStore.currentOrder.items.length > 0) {
    return orderStore.currentOrder.items
  }
  if (orderStore.cartItems.length > 0) {
    return orderStore.cartItems
  }
  return [
    {
      cartId: 'fallback-1',
      itemId: '1',
      name: orderStore.currentItemConfig.name,
      merchant: orderStore.currentItemConfig.merchant,
      image: orderStore.currentItemConfig.image,
      quantity: orderStore.quantity,
      portion: orderStore.currentPortion,
      spice: orderStore.currentSpice,
      addons: orderStore.currentAddons,
      subtotal: orderStore.pricing.subtotal,
    }
  ]
})

const orderItemsFoodNames = computed(() => {
  return orderItems.value.map((i) => i.name).join(' & ')
})

const paymentTimeDisplay = computed(() => {
  if (orderStore.currentOrder?.paymentTimestamp) {
    return orderStore.currentOrder.paymentTimestamp
  }
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
})

onMounted(() => {
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
})

function handleStatusUpdate(newStatus: PrepStatus) {
  currentPrepStatus.value = newStatus
  orderStore.setPrepStatus(newStatus)
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
              :table-number="orderStore.table.tableNumber"
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
                  Meja {{ orderStore.table.tableNumber }} · Lantai {{ orderStore.table.floor }}
                </strong>
                <p class="meta-desc">
                  {{ orderStore.table.venue }}, {{ orderStore.table.area }}
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
                    {{ orderStore.currentOrder?.orderNumber || '#MJK-72600-BA' }}
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
            <PriceBreakdown :pricing="orderStore.pricing" mode="confirmation" />

            <!-- Card Bottom Method Info -->
            <div class="summary-card-footer">
              <span class="footer-method-label">Metode Pembayaran:</span>
              <strong class="footer-method-val">
                {{ orderStore.currentOrder?.paymentMethod === 'bank_va' ? 'Transfer Bank Virtual Account' : orderStore.currentOrder?.paymentMethod === 'ewallet' ? 'E-Wallet' : 'QRIS Otomatis' }}
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
