<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  ShieldCheck,
  Lock,
  QrCode,
  Tag,
  Check,
  Trash2,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-vue-next'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import PriceBreakdown from '@/components/common/PriceBreakdown.vue'
import NoticeBox from '@/components/common/NoticeBox.vue'
import HelpCallout from '@/components/common/HelpCallout.vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import { api } from '@/api/client'

const router = useRouter()
const orderStore = useOrderStore()

const breadcrumbItems = computed(() => [
  { label: 'Beranda', to: '/' },
  { label: orderStore.cartItems[0]?.merchant || orderStore.currentItemConfig?.merchant || 'Pujasera', to: '/menu' },
  { label: 'Keranjang Pesanan' },
])

const promoInput = ref('')
const isSubmitting = ref(false)
const orderError = ref('')
const activePromos = ref<any[]>([])
const promosLoading = ref(false)
let promoRevalidateTimer: ReturnType<typeof setTimeout> | null = null

// Confirm delete dialog state
const showDeleteConfirm = ref(false)
const pendingDeleteCartId = ref<string | null>(null)
const pendingDeleteName = ref<string>('')

function confirmRemoveFromCart(cartId: string, itemName: string) {
  pendingDeleteCartId.value = cartId
  pendingDeleteName.value = itemName
  showDeleteConfirm.value = true
}

function doRemoveConfirmed() {
  if (pendingDeleteCartId.value) {
    orderStore.removeFromCart(pendingDeleteCartId.value)
  }
  showDeleteConfirm.value = false
  pendingDeleteCartId.value = null
  pendingDeleteName.value = ''
}

function cancelRemove() {
  showDeleteConfirm.value = false
  pendingDeleteCartId.value = null
  pendingDeleteName.value = ''
}

const noteCharacterCount = computed(() => {
  return orderStore.customerNote.length
})

function handleNoteInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  orderStore.setCustomerNote(target.value)
}

async function handleApplyPromo() {
  if (!promoInput.value.trim()) return
  await orderStore.applyPromoAsync(promoInput.value)
}

function handlePromoPreset(code: string) {
  promoInput.value = code
  orderStore.applyPromoAsync(code)
}

function handleRemovePromo() {
  promoInput.value = ''
  orderStore.removePromo()
}

async function loadActivePromos() {
  promosLoading.value = true
  try {
    const res = await api.getActivePromos()
    activePromos.value = Array.isArray(res.data) ? res.data : []
  } catch {
    activePromos.value = []
  } finally {
    promosLoading.value = false
  }
}

onMounted(loadActivePromos)

onUnmounted(() => {
  if (promoRevalidateTimer) clearTimeout(promoRevalidateTimer)
})

// Diskon harus dihitung ulang setiap subtotal berubah, karena backend
// memvalidasi min_order dan batas maksimal diskon.
watch(
  () => orderStore.totalSubtotal,
  () => {
    if (!orderStore.promoCode) return
    if (promoRevalidateTimer) clearTimeout(promoRevalidateTimer)
    promoRevalidateTimer = setTimeout(() => {
      orderStore.applyPromoAsync(orderStore.promoCode)
    }, 350)
  }
)

async function handleCreateOrder() {
  if (isSubmitting.value || orderStore.cartItems.length === 0) return
  isSubmitting.value = true
  orderError.value = ''

  try {
    const order = await orderStore.createOrderAsync()
    router.push(`/payment/${order.id}`)
  } catch (err: any) {
    orderError.value = err.message || 'Gagal membuat pesanan ke server. Pastikan koneksi backend aktif.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <AppNavbar />

    <main class="container-app checkout-main">
      <AppBreadcrumb :items="breadcrumbItems" />

      <!-- 1. EMPTY CART STATE: Only show clean empty state when cart is 0 -->
      <div v-if="orderStore.cartItems.length === 0" class="empty-cart-full-view">
        <div class="empty-cart-card card-surface">
          <div class="empty-cart-icon-wrap">
            <ShoppingBag :size="48" />
          </div>
          <h2 class="font-display empty-cart-h2">Keranjang Pesananmu Masih Kosong</h2>
          <p class="empty-cart-desc">
            Kamu belum memilih menu dari Warung Bali Dwi. Yuk jelajahi buku menu dan pilih hidangan favoritmu!
          </p>
          <RouterLink to="/" class="btn-primary btn-empty-cta">
            Lihat Buku Menu
          </RouterLink>
        </div>
      </div>

      <!-- 2. ACTIVE CART CONTENT: Only displayed when items exist -->
      <div v-else class="checkout-active-content">
        <!-- Page Heading & Trust Badge -->
        <div class="checkout-header-row">
          <div>
            <span class="checkout-eyebrow">Sedikit Lagi, Pesanan Siap</span>
            <h1 class="font-display checkout-h1">Keranjang & Pembayaran</h1>
            <p class="checkout-desc">
              Periksa pesananmu, konfirmasi meja, lalu bayar dengan aman. Segar dari Warung Bali Dwi.
            </p>
          </div>

          <div class="trust-badge">
            <ShieldCheck :size="18" class="trust-icon" />
            <span>Pembayaran aman</span>
          </div>
        </div>

        <!-- Main Two-Column Grid (800px Left, 432px Right) -->
        <div class="checkout-grid">
          <!-- LEFT: 3 Step Cards -->
          <div class="checkout-steps-col">
            <!-- STEP 1: Periksa pesananmu -->
            <div class="step-card card-surface">
              <div class="step-card-header">
                <div class="step-title-wrap">
                  <span class="step-num font-display">1</span>
                  <div>
                    <h2 class="step-title">Periksa pesananmu</h2>
                    <span class="step-subtitle">
                      Disiapkan Warung Bali Dwi · Estimasi 20–25 menit
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cart Items List -->
              <div class="order-items-list">
                <div
                  v-for="item in orderStore.cartItems"
                  :key="item.cartId"
                  class="order-item-box"
                >
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="item-thumb"
                  />

                  <div class="item-details">
                    <div class="item-merchant">
                      {{ item.merchant }}
                    </div>
                    <h3 class="item-name">{{ item.name }}</h3>

                    <!-- Active Customization Chips -->
                    <div class="item-chips-wrap">
                      <span class="config-chip">
                        {{ item.portion.name }}
                      </span>
                      <span class="config-chip">
                        {{ item.spice.name }}
                      </span>
                      <span
                        v-for="addon in item.addons"
                        :key="addon.id"
                        class="config-chip"
                      >
                        + {{ addon.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Price & Stepper Column with Trash Icon on Left of Stepper -->
                  <div class="item-price-col">
                    <div class="item-price">
                      {{ formatRupiah(item.subtotal) }}
                    </div>
                    <div class="item-stepper-trash-row">
                      <button
                        type="button"
                        class="btn-trash-inline"
                        title="Hapus menu ini dari pesanan"
                        aria-label="Hapus pesanan"
                        @click="confirmRemoveFromCart(item.cartId, item.name)"
                      >
                        <Trash2 :size="16" />
                      </button>
                      <QuantityStepper
                        :model-value="item.quantity"
                        size="sm"
                        @update:model-value="orderStore.updateCartItemQuantity(item.cartId, $event)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Add More Items CTA -->
                <div class="cart-add-more-row">
                  <RouterLink to="/" class="btn-add-more">
                    + Tambah Menu Lain
                  </RouterLink>
                </div>
              </div>
            </div>

            <!-- STEP 2: Lokasi Santap di Meja -->
            <div class="step-card card-surface">
              <div class="step-card-header">
                <div class="step-title-wrap">
                  <span class="step-num font-display">2</span>
                  <div>
                    <h2 class="step-title">Santap di Meja</h2>
                    <span class="step-subtitle">
                      Pesananmu akan langsung diantarkan pramusaji ke meja terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              <!-- Table Block Banner -->
              <div class="table-verified-banner">
                <div class="table-banner-left">
                  <div class="qr-icon-bubble">
                    <QrCode :size="20" />
                  </div>
                  <div>
                    <span class="banner-eyebrow">MEJAMU</span>
                    <div class="banner-table-title">
                      Meja {{ orderStore.table.tableNumber }}
                    </div>
                    <span class="banner-table-sub">
                      Lantai {{ orderStore.table.floor }}
                      <template v-if="!orderStore.table.isVerified"> · Belum terverifikasi</template>
                    </span>
                  </div>
                </div>

                <div class="badge-pill badge-pill-success">
                  <Check :size="13" />
                  <span>Kode QR terverifikasi</span>
                </div>
              </div>
            </div>

            <!-- STEP 3: Tambahkan catatan -->
            <div class="step-card card-surface">
              <div class="step-card-header">
                <div class="step-title-wrap">
                  <span class="step-num font-display">3</span>
                  <div>
                    <h2 class="step-title">Tambahkan catatan</h2>
                    <span class="step-subtitle">
                      Beri tahu dapur tentang preferensi atau kebutuhan diet
                    </span>
                  </div>
                </div>
              </div>

              <!-- Note Textarea -->
              <div class="note-input-container">
                <label for="customer-note" class="sr-only">Catatan untuk dapur penjual</label>
                <textarea
                  id="customer-note"
                  :value="orderStore.customerNote"
                  maxlength="150"
                  rows="3"
                  class="note-textarea"
                  placeholder="Contoh: Sambal dipisah. Tanpa kacang karena alergi."
                  @input="handleNoteInput"
                />
                <div class="note-footer">
                  <span class="note-hint">Maksimal 150 karakter</span>
                  <span
                    class="note-counter"
                    :class="{ 'counter-limit': noteCharacterCount >= 150 }"
                  >
                    {{ noteCharacterCount }} / 150
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Order Summary Card -->
          <aside class="checkout-summary-col">
            <div class="summary-card card-surface">
              <!-- Header -->
              <div class="summary-card-header">
                <h2 class="font-display summary-title">Ringkasan Pesanan</h2>
                <span class="badge-pill badge-pill-primary">
                  {{ orderStore.totalQuantity }} menu
                </span>
              </div>

              <!-- Items List in Summary -->
              <div class="summary-items-scroll">
                <div
                  v-for="item in orderStore.cartItems"
                  :key="item.cartId"
                  class="summary-item-line"
                >
                  <div class="item-line-left">
                    <strong class="line-name">{{ item.name }}</strong>
                    <span class="line-config">
                      {{ item.quantity }} × {{ item.portion.name }} · {{ item.spice.name }}
                      <template v-if="item.addons.length > 0">
                        · {{ item.addons.map(a => a.name).join(', ') }}
                      </template>
                    </span>
                  </div>
                  <span class="line-price">
                    {{ formatRupiah(item.subtotal) }}
                  </span>
                </div>
              </div>

              <!-- Promo Code Input Form -->
              <div class="promo-box">
                <label for="promo-input" class="promo-label">Kode Promo</label>
                <div class="promo-input-row">
                  <div class="promo-field-wrap">
                    <Tag :size="16" class="promo-icon" />
                    <input
                      id="promo-input"
                      v-model="promoInput"
                      type="text"
                      placeholder="Contoh: MEJAKU10"
                      class="promo-input"
                      @keydown.enter.prevent="handleApplyPromo"
                    />
                  </div>
                  <button
                    type="button"
                    class="btn-promo-apply"
                    :disabled="orderStore.promoStatus === 'loading' || !promoInput.trim()"
                    @click="handleApplyPromo"
                  >
                    {{ orderStore.promoStatus === 'loading' ? 'Cek...' : 'Gunakan' }}
                  </button>
                </div>

                <!-- Promo aktif dari database -->
                <div v-if="activePromos.length > 0" class="promo-examples-row">
                  <span class="promo-examples-label">Promo aktif:</span>
                  <div class="promo-chips-list">
                    <button
                      v-for="promo in activePromos"
                      :key="promo.code"
                      type="button"
                      class="promo-chip-btn"
                      @click="handlePromoPreset(promo.code)"
                    >
                      <Tag :size="12" />
                      <span>{{ promo.code }} · {{ promo.description }}</span>
                    </button>
                  </div>
                </div>
                <div v-else-if="promosLoading" class="promo-loading-text">
                  Memuat promo dari database...
                </div>

                <!-- Promo yang sedang aktif -->
                <div v-if="orderStore.promoStatus === 'success'" class="applied-promo-row">
                  <span class="applied-promo-label">
                    <Check :size="14" />
                    {{ orderStore.promoCode }} aktif
                  </span>
                  <button type="button" class="applied-promo-remove" @click="handleRemovePromo">
                    Hapus
                  </button>
                </div>

                <!-- Promo Feedback message -->
                <p
                  v-if="orderStore.promoMessage"
                  class="promo-feedback"
                  :class="{
                    'feedback-success': orderStore.promoStatus === 'success',
                    'feedback-error': orderStore.promoStatus === 'error',
                  }"
                >
                  {{ orderStore.promoMessage }}
                </p>
              </div>

              <!-- Rincian harga dari server/cart -->
              <div class="checkout-price-breakdown">
                <PriceBreakdown :pricing="orderStore.pricing" mode="checkout" />
              </div>

              <!-- Error Message if server order creation fails -->
              <div v-if="orderError" class="checkout-server-error" role="alert">
                <AlertTriangle :size="18" class="error-icon" />
                <span>{{ orderError }}</span>
              </div>

              <!-- Primary CTA: Submit Order -->
              <button
                type="button"
                class="btn-primary btn-checkout-submit"
                :disabled="isSubmitting"
                @click="handleCreateOrder"
              >
                <Lock :size="18" />
                <span>
                  {{ isSubmitting ? 'Memproses Pesanan...' : `Buat Pesanan · ${formatRupiah(orderStore.pricing.total)}` }}
                </span>
              </button>

              <!-- Subtext -->
              <div class="checkout-subtext">
                <ShieldCheck :size="14" class="subtext-shield" />
                <span>Pembayaran aman · Tanpa biaya tersembunyi</span>
              </div>

              <!-- Notice Ready Time -->
              <div class="summary-notice">
                <NoticeBox
                  variant="warm"
                  icon-type="clock"
                  title="Siap dalam 20–25 menit"
                  message="Kami akan memberi tahu saat pesananmu keluar dari dapur."
                />
              </div>

              <!-- Help Callout -->
              <div class="summary-help">
                <HelpCallout
                  title="Butuh bantuan untuk pesananmu?"
                  description="Hubungi bantuan pramusaji atau pusat informasi MejaKu."
                  action-text="Hubungi Bantuan"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <AppFooter />

    <!-- Delete Confirmation Alert Modal -->
    <Teleport to="body">
      <Transition name="confirm-fade">
        <div v-if="showDeleteConfirm" class="confirm-backdrop" @click.self="cancelRemove">
          <div class="confirm-card" role="alertdialog" aria-modal="true">
            <div class="confirm-icon-wrap">
              <AlertTriangle :size="28" />
            </div>
            <div class="confirm-content">
              <h4 class="confirm-title">Hapus dari Keranjang?</h4>
              <p class="confirm-desc">
                <strong>{{ pendingDeleteName }}</strong> akan dihapus dari pesananmu. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div class="confirm-actions">
              <button type="button" class="btn-confirm-cancel" @click="cancelRemove">
                Batal
              </button>
              <button type="button" class="btn-confirm-delete" @click="doRemoveConfirmed">
                <Trash2 :size="15" />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.checkout-page {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.checkout-main {
  padding-bottom: 96px;
  flex: 1;
}

/* Empty Cart Full View */
.empty-cart-full-view {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-cart-card {
  max-width: 580px;
  width: 100%;
  padding: 56px 36px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-card);
}

.empty-cart-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background-color: rgba(194, 65, 12, 0.08);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-cart-h2 {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.empty-cart-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 420px;
  margin-bottom: 32px;
}

.btn-empty-cta {
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 700;
}

/* Header Row */
.checkout-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.checkout-eyebrow {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.checkout-h1 {
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 8px;
}

.checkout-desc {
  font-size: 16px;
  color: var(--text-secondary);
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--success-soft);
  color: var(--success);
  border: 1px solid rgba(21, 128, 61, 0.2);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.trust-icon {
  color: var(--success);
}

/* Two-column layout */
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
}

@media (min-width: 1080px) {
  .checkout-grid {
    grid-template-columns: 1fr 432px;
    gap: 48px;
  }
}

.checkout-steps-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-card {
  padding: 28px;
}

.step-card-header {
  margin-bottom: 24px;
}

.step-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.step-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.step-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Order Items List */
.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item-box {
  display: grid;
  grid-template-columns: 88px 1fr;
  grid-template-rows: auto auto;
  gap: 0 16px;
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.item-thumb {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  min-width: 0;
  align-self: start;
}

.item-merchant {
  font-size: 11px;
  font-weight: 800;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.item-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.item-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.config-chip {
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.item-price-col {
  grid-column: 1 / -1; /* Span full width as 2nd row */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 8px;
}

.item-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-sans);
}

/* Row with Trash icon on the left of QuantityStepper */
.item-stepper-trash-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-trash-inline {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  color: #DC2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-trash-inline:hover {
  background-color: #FEE2E2;
  border-color: #FCA5A5;
  transform: scale(1.05);
}

.cart-add-more-row {
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;
}

.btn-add-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  background-color: var(--primary-soft);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.btn-add-more:hover {
  background-color: #F8D9C8;
  transform: translateY(-1px);
}

/* Table Verified Banner */
.table-verified-banner {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.table-banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.qr-icon-bubble {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: #FFFFFF;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.banner-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.banner-table-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.banner-table-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Note Textarea */
.note-input-container {
  display: flex;
  flex-direction: column;
}

.note-textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--surface);
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.note-textarea:focus {
  border-color: var(--primary);
  outline: none;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.note-counter {
  font-weight: 600;
}

.counter-limit {
  color: var(--warning);
}

/* Right Summary Column */
.checkout-summary-col {
  display: flex;
  flex-direction: column;
}

.summary-card {
  padding: 28px;
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 24px;
}

.summary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.summary-title {
  font-size: 24px;
  color: var(--text-primary);
}

.summary-items-scroll {
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 4px;
}

.summary-item-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.item-line-left {
  display: flex;
  flex-direction: column;
}

.line-name {
  font-size: 14px;
  color: var(--text-primary);
}

.line-config {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.line-price {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
}

/* Promo Box */
.promo-box {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 20px;
}

.promo-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 8px;
}

.promo-input-row {
  display: flex;
  gap: 8px;
}

.promo-field-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.promo-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.promo-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 700;
}

.btn-promo-apply {
  background-color: var(--primary);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 13px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-promo-apply:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-promo-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.promo-feedback {
  font-size: 12px;
  margin-top: 8px;
}

.promo-examples-row {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.promo-examples-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.promo-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.promo-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-full);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.promo-chip-btn:hover {
  background: var(--primary-soft);
  transform: translateY(-1px);
}

.feedback-success {
  color: var(--success);
  font-weight: 600;
}

.feedback-error {
  color: var(--warning);
}

.btn-checkout-submit {
  width: 100%;
  margin-top: 24px;
  font-size: 16px;
  padding: 16px;
}

.btn-checkout-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.checkout-subtext {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 12px;
}

.subtext-shield {
  color: var(--success);
}

.summary-notice {
  margin-top: 24px;
}

.summary-help {
  margin-top: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* === Delete Confirmation Modal === */
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.confirm-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 28px 28px 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.confirm-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FEF3C7;
  color: #D97706;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirm-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.confirm-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.btn-confirm-cancel {
  flex: 1;
  padding: 11px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm-cancel:hover {
  border-color: var(--primary);
  background: var(--surface-warm);
}

.btn-confirm-delete {
  flex: 1;
  padding: 11px 16px;
  border-radius: var(--radius-full);
  background: #DC2626;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-confirm-delete:hover {
  background: #B91C1C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

/* Confirm fade transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: all 0.22s ease;
}

.confirm-fade-enter-active .confirm-card,
.confirm-fade-leave-active .confirm-card {
  transition: all 0.22s var(--ease-spring);
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-from .confirm-card,
.confirm-fade-leave-to .confirm-card {
  opacity: 0;
  transform: scale(0.88) translateY(16px);
}

/* ─── Mobile (≤ 640px) Fixes for Realme 8 ─── */
@media (max-width: 640px) {
  .checkout-main {
    padding-top: 12px;
    padding-bottom: 40px;
  }

  .checkout-header-row {
    margin-bottom: 20px;
    gap: 12px;
  }

  .checkout-h1 {
    font-size: 26px;
  }

  .checkout-desc {
    font-size: 13px;
  }

  .trust-badge {
    font-size: 11px;
    padding: 6px 10px;
  }

  .step-card {
    padding: 16px;
  }

  .step-num {
    font-size: 24px;
  }

  .step-title {
    font-size: 16px;
  }

  /* Cart item box: stack vertically on very small screens */
  .order-item-box {
    gap: 12px;
    padding: 14px;
    flex-wrap: wrap;
  }

  /* Thumbnail: smaller on mobile */
  .item-thumb {
    width: 64px;
    height: 64px;
    border-radius: 10px;
  }

  /* Item details: take remaining space */
  .item-details {
    flex: 1;
    min-width: 120px;
  }

  .item-name {
    font-size: 14px;
    margin-bottom: 6px;
  }

  /* Price & stepper column: full width row at bottom */
  .item-price-col {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    border-top: 1px solid var(--border);
    padding-top: 10px;
  }

  /* Price: smaller on mobile */
  .item-price {
    font-size: 15px;
  }

  /* Stepper row with trash: compact */
  .item-stepper-trash-row {
    gap: 6px;
  }

  .btn-trash-inline {
    width: 30px;
    height: 30px;
  }

  /* Summary card header: fix "N menu" badge not wrapping */
  .summary-card-header {
    flex-wrap: nowrap;
    gap: 8px;
  }

  /* Badge pill: prevent text wrapping */
  .badge-pill {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11px;
    padding: 3px 8px;
  }

  .summary-title {
    font-size: 18px;
  }

  .summary-card {
    padding: 16px;
  }

  /* Table verified banner: stack on mobile */
  .table-verified-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
  }

  .banner-table-title {
    font-size: 14px;
  }
}

.promo-loading-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 10px;
}

.applied-promo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background-color: #F0FDF4;
  border: 1px solid #BBF7D0;
}

.applied-promo-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--success);
}

.applied-promo-remove {
  border: none;
  background: transparent;
  color: #B91C1C;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 4px;
}

.checkout-price-breakdown {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #EBDDCE;
}
</style>
