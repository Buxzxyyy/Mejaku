<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ShieldCheck,
  Clock,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Wallet,
  Smartphone,
  ChevronRight,
  Info,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-vue-next'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import PriceBreakdown from '@/components/common/PriceBreakdown.vue'
import NoticeBox from '@/components/common/NoticeBox.vue'
import HelpCallout from '@/components/common/HelpCallout.vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import type { PaymentMethodType } from '@/types'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const breadcrumbItems = [
  { label: 'Beranda', to: '/' },
  { label: orderStore.currentItemConfig.merchant, to: '/' },
  { label: 'Pesanan', to: '/checkout' },
  { label: 'Pembayaran' },
]

const selectedMethod = ref<PaymentMethodType>('qris')
const copySuccess = ref(false)
const showManualModal = ref(false)
const manualProofSent = ref(false)

// Bank Virtual Account State
const selectedBank = ref('bca')
const bankList = [
  { id: 'bca', name: 'BCA Virtual Account', code: '8801 2948 2019 4812', logo: 'BCA' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', code: '8910 8294 0192 3841', logo: 'Mandiri' },
  { id: 'bni', name: 'BNI Virtual Account', code: '8271 0938 1029 4819', logo: 'BNI' },
  { id: 'bri', name: 'BRI Virtual Account (BRIVA)', code: '8019 3810 2938 1092', logo: 'BRI' },
  { id: 'permata', name: 'Permata Virtual Account', code: '8412 0948 1029 3847', logo: 'Permata' },
]

const currentBank = computed(() => {
  return bankList.find((b) => b.id === selectedBank.value) || bankList[0]
})

const copyVaSuccess = ref(false)
function handleCopyVaCode() {
  navigator.clipboard.writeText(currentBank.value.code.replace(/\s+/g, '')).then(() => {
    copyVaSuccess.value = true
    setTimeout(() => {
      copyVaSuccess.value = false
    }, 2000)
  })
}

// E-Wallet State
const selectedEwallet = ref('gopay')
const ewalletPhone = ref('0812-3456-7890')
const ewalletList = [
  { id: 'gopay', name: 'GoPay', iconColor: '#00AED6' },
  { id: 'ovo', name: 'OVO', iconColor: '#4C3494' },
  { id: 'dana', name: 'DANA', iconColor: '#118EEA' },
  { id: 'shopeepay', name: 'ShopeePay', iconColor: '#EE4D2D' },
]

// Countdown timer
const timeLeft = ref({ hours: '00', minutes: '18', seconds: '42' })
let timerInterval: any = null

function updateCountdown() {
  const diff = orderStore.paymentDeadline - Date.now()
  if (diff <= 0) {
    timeLeft.value = { hours: '00', minutes: '00', seconds: '00' }
    if (orderStore.currentOrder && orderStore.currentOrder.paymentStatus !== 'paid') {
      orderStore.setPaymentStatusDirect('expired')
    }
    return
  }

  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)

  timeLeft.value = {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  }
}

onMounted(() => {
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function handleCopyPaymentCode() {
  const code = orderStore.currentOrder?.paymentCode || 'MJK72600BA'
  navigator.clipboard.writeText(code).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
}

function handleSelectMethod(method: PaymentMethodType) {
  selectedMethod.value = method
  orderStore.setPaymentMethod(method)
}

async function handleCheckPayment() {
  if (orderStore.isCheckingPayment) return

  await orderStore.simulatePaymentCheck()
  const orderId = orderStore.currentOrder?.id || 'MJK-72600-BA'
  router.push(`/orders/${orderId}/confirmation`)
}

function handleConfirmManual() {
  manualProofSent.value = true
  setTimeout(() => {
    showManualModal.value = false
    handleCheckPayment()
  }, 1000)
}
</script>

<template>
  <div class="payment-page">
    <AppNavbar :hide-price-link="true" />

    <main class="container-app payment-main">
      <AppBreadcrumb :items="breadcrumbItems" />

      <!-- Top Header & Timer Banner Row -->
      <div class="payment-header-row">
        <!-- Left Title -->
        <div class="title-left">
          <h1 class="font-display payment-h1">Selesaikan Pembayaranmu</h1>
          <p class="payment-desc">
            Pilih metode pembayaran yang paling nyaman. Pesanan akan langsung diteruskan ke dapur setelah pembayaran terverifikasi.
          </p>
        </div>

        <!-- Right Deadline Countdown Panel (360x115px in Figma) -->
        <div class="deadline-panel card-surface">
          <div class="deadline-top">
            <span class="deadline-tag">BATAS WAKTU PEMBAYARAN</span>
            <span class="deadline-target">Hari ini, 13:00 WIB</span>
          </div>

          <div class="deadline-timer-row">
            <span class="timer-label">Selesaikan dalam</span>
            <div class="timer-digits font-sans" aria-live="polite">
              <span class="digit-box">{{ timeLeft.hours }}</span>
              <span class="digit-sep">:</span>
              <span class="digit-box">{{ timeLeft.minutes }}</span>
              <span class="digit-sep">:</span>
              <span class="digit-box">{{ timeLeft.seconds }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Two-Column Layout (800px Left, 432px Right) -->
      <div class="payment-grid">
        <!-- LEFT COLUMN: Payment Methods & QRIS Box -->
        <div class="payment-left-col">
          <!-- 1. Select Payment Method Panel -->
          <div class="methods-panel card-surface">
            <div class="panel-header-row">
              <div>
                <h2 class="panel-title">Pilih Metode Pembayaran</h2>
                <p class="panel-sub">
                  Semua transaksi diproses melalui koneksi aman dan terenkripsi.
                </p>
              </div>
              <div class="badge-pill badge-pill-success">
                <ShieldCheck :size="13" />
                <span>Pembayaran Aman</span>
              </div>
            </div>

            <!-- 3 Horizontal Method Cards -->
            <div class="methods-cards-row">
              <!-- QRIS (Active) -->
              <div
                class="method-card"
                :class="{ active: selectedMethod === 'qris' }"
                @click="handleSelectMethod('qris')"
              >
                <div class="method-card-top">
                  <div class="method-icon-wrap">
                    <QrCode :size="20" />
                  </div>
                  <span v-if="selectedMethod === 'qris'" class="badge-pill badge-pill-primary">TERPILIH</span>
                </div>
                <strong class="method-name">QRIS</strong>
                <p class="method-desc">Scan dari semua aplikasi bank & e-wallet</p>
              </div>

              <!-- Virtual Account (Transfer Bank) -->
              <div
                class="method-card"
                :class="{ active: selectedMethod === 'bank_va' }"
                @click="handleSelectMethod('bank_va')"
              >
                <div class="method-card-top">
                  <div class="method-icon-wrap">
                    <CreditCard :size="20" />
                  </div>
                  <span v-if="selectedMethod === 'bank_va'" class="badge-pill badge-pill-primary">TERPILIH</span>
                </div>
                <strong class="method-name">Transfer Bank / VA</strong>
                <p class="method-desc">BCA, Mandiri, BNI, BRI, dan bank lainnya</p>
              </div>

              <!-- E-Wallet -->
              <div
                class="method-card"
                :class="{ active: selectedMethod === 'ewallet' }"
                @click="handleSelectMethod('ewallet')"
              >
                <div class="method-card-top">
                  <div class="method-icon-wrap">
                    <Wallet :size="20" />
                  </div>
                  <span v-if="selectedMethod === 'ewallet'" class="badge-pill badge-pill-primary">TERPILIH</span>
                  <span v-else class="badge-pill badge-pill-warning">INSTAN</span>
                </div>
                <strong class="method-name">Dompet Digital</strong>
                <p class="method-desc">GoPay, OVO, DANA, dan ShopeePay</p>
              </div>
            </div>
          </div>

          <!-- 2A. QRIS Main Payment Panel -->
          <div v-if="selectedMethod === 'qris'" class="qris-panel card-surface">
            <!-- Header -->
            <div class="qris-header-row">
              <div>
                <h3 class="qris-title">Bayar dengan QRIS</h3>
                <p class="qris-subtitle">Pindai kode QR berikut dari aplikasi pilihanmu.</p>
              </div>
              <span class="badge-pill badge-pill-primary">QRIS OTOMATIS</span>
            </div>

            <!-- QR Container & Payment Code Details -->
            <div class="qris-content-grid">
              <!-- Left: QR Graphic Box -->
              <div class="qr-code-box">
                <div class="qr-image-wrapper">
                  <!-- Vector QR Code with MejaKu center badge -->
                  <svg
                    class="qr-vector"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <!-- Background -->
                    <rect width="200" height="200" fill="white" rx="12" />

                    <!-- Corner Finder Patterns -->
                    <!-- Top Left -->
                    <rect x="16" y="16" width="48" height="48" rx="8" stroke="#1E293B" stroke-width="8" />
                    <rect x="28" y="28" width="24" height="24" rx="4" fill="#C2410C" />

                    <!-- Top Right -->
                    <rect x="136" y="16" width="48" height="48" rx="8" stroke="#1E293B" stroke-width="8" />
                    <rect x="148" y="28" width="24" height="24" rx="4" fill="#C2410C" />

                    <!-- Bottom Left -->
                    <rect x="16" y="136" width="48" height="48" rx="8" stroke="#1E293B" stroke-width="8" />
                    <rect x="28" y="148" width="24" height="24" rx="4" fill="#C2410C" />

                    <!-- QR Matrix Blocks -->
                    <rect x="76" y="20" width="12" height="12" rx="2" fill="#1E293B" />
                    <rect x="96" y="20" width="12" height="12" rx="2" fill="#1E293B" />
                    <rect x="116" y="20" width="12" height="12" rx="2" fill="#1E293B" />
                    <rect x="76" y="44" width="24" height="12" rx="2" fill="#1E293B" />
                    <rect x="108" y="44" width="16" height="12" rx="2" fill="#1E293B" />

                    <rect x="20" y="76" width="12" height="24" rx="2" fill="#1E293B" />
                    <rect x="44" y="76" width="16" height="12" rx="2" fill="#1E293B" />
                    <rect x="44" y="96" width="12" height="24" rx="2" fill="#1E293B" />
                    <rect x="20" y="108" width="16" height="12" rx="2" fill="#1E293B" />

                    <!-- Center Logo Badge -->
                    <rect x="76" y="76" width="48" height="48" rx="10" fill="#C2410C" />
                    <text x="100" y="108" font-family="'Lobster Two', cursive" font-size="28" font-weight="bold" fill="white" text-anchor="middle">M</text>

                    <rect x="140" y="76" width="16" height="12" rx="2" fill="#1E293B" />
                    <rect x="164" y="76" width="16" height="24" rx="2" fill="#1E293B" />
                    <rect x="140" y="96" width="16" height="24" rx="2" fill="#1E293B" />

                    <rect x="76" y="136" width="12" height="16" rx="2" fill="#1E293B" />
                    <rect x="96" y="136" width="24" height="12" rx="2" fill="#1E293B" />
                    <rect x="76" y="160" width="24" height="12" rx="2" fill="#1E293B" />
                    <rect x="108" y="160" width="12" height="20" rx="2" fill="#1E293B" />

                    <rect x="136" y="136" width="12" height="12" rx="2" fill="#1E293B" />
                    <rect x="156" y="136" width="24" height="12" rx="2" fill="#1E293B" />
                    <rect x="136" y="156" width="24" height="12" rx="2" fill="#1E293B" />
                    <rect x="168" y="156" width="12" height="24" rx="2" fill="#1E293B" />
                  </svg>
                </div>
                <span class="qr-caption">QR berlaku hingga 13:00 WIB</span>
              </div>

              <!-- Right: Price & Payment Code Box -->
              <div class="qris-meta-box">
                <div class="qris-nominal-group">
                  <span class="nominal-label">Total Pembayaran</span>
                  <div class="nominal-value font-sans">
                    {{ formatRupiah(orderStore.pricing.total) }}
                  </div>
                  <span class="nominal-hint">
                    Pastikan nominal yang tampil di aplikasi sama persis.
                  </span>
                </div>

                <!-- Payment Code Bar with Copy -->
                <div class="payment-code-bar">
                  <div class="code-info">
                    <span class="code-label">KODE PEMBAYARAN</span>
                    <strong class="code-val">{{ orderStore.currentOrder?.paymentCode || 'MJK72600BA' }}</strong>
                  </div>
                  <button
                    type="button"
                    class="btn-copy"
                    :class="{ 'btn-copied': copySuccess }"
                    @click="handleCopyPaymentCode"
                  >
                    <Check v-if="copySuccess" :size="15" />
                    <Copy v-else :size="15" />
                    <span>{{ copySuccess ? 'Tersalin' : 'Salin' }}</span>
                  </button>
                </div>

                <!-- Supported Apps Badges -->
                <div class="supported-apps-row">
                  <span class="apps-label">DAPAT DIBAYAR MELALUI:</span>
                  <div class="apps-chips">
                    <span class="app-chip">BCA mobile</span>
                    <span class="app-chip">Livin' Mandiri</span>
                    <span class="app-chip">BRImo</span>
                    <span class="app-chip">GoPay</span>
                    <span class="app-chip">DANA</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warm Instructions Panel (3 Steps) -->
            <div class="payment-steps-warm">
              <h4 class="warm-title">Langkah Pembayaran</h4>
              <ol class="warm-steps-list">
                <li>
                  <strong>Buka aplikasi bank atau dompet digital</strong>
                  <span>Pilih menu Bayar, Scan, atau QRIS pada halaman utama aplikasi.</span>
                </li>
                <li>
                  <strong>Pindai kode QR dan periksa detail</strong>
                  <span>Pastikan merchant MejaKu dan total {{ formatRupiah(orderStore.pricing.total) }} sesuai.</span>
                </li>
                <li>
                  <strong>Konfirmasi pembayaran</strong>
                  <span>Masukkan PIN, kembali ke halaman ini, lalu cek pembayaran.</span>
                </li>
              </ol>
            </div>

            <!-- Green Auto Verify Notice -->
            <div class="verify-security-note">
              <CheckCircle2 :size="18" class="verify-icon" />
              <span>
                Pembayaran diverifikasi otomatis. MejaKu tidak pernah meminta PIN, OTP, atau kata sandi akunmu.
              </span>
            </div>

            <!-- Help Callout -->
            <div style="margin-top: 20px;">
              <HelpCallout
                title="Ada kendala saat melakukan pembayaran?"
                description="Tim kami siap membantu konfirmasi transaksi tanpa meminta data rahasia perbankan Anda."
                action-text="Chat Bantuan"
              />
            </div>
          </div>

          <!-- 2B. Virtual Account (Transfer Bank) Main Panel -->
          <div v-else-if="selectedMethod === 'bank_va'" class="va-panel card-surface">
            <!-- Header -->
            <div class="qris-header-row">
              <div>
                <h3 class="qris-title">Transfer Virtual Account (VA)</h3>
                <p class="qris-subtitle">Pilih bank tujuan untuk mendapatkan nomor Virtual Account unik.</p>
              </div>
              <span class="badge-pill badge-pill-success">VERIFIKASI OTOMATIS</span>
            </div>

            <!-- Bank Selection Chips -->
            <div class="bank-selector-group">
              <label class="bank-selector-label">Pilih Bank Pembayaran:</label>
              <div class="bank-chips-grid">
                <button
                  v-for="bank in bankList"
                  :key="bank.id"
                  type="button"
                  class="bank-chip-btn"
                  :class="{ active: selectedBank === bank.id }"
                  @click="selectedBank = bank.id"
                >
                  <span class="bank-logo-badge">{{ bank.logo }}</span>
                  <span class="bank-name-text">{{ bank.name }}</span>
                </button>
              </div>
            </div>

            <!-- VA Display Card -->
            <div class="va-display-card">
              <div class="va-card-header">
                <div>
                  <span class="va-card-label">Nomor Virtual Account {{ currentBank.logo }}</span>
                  <span class="va-merchant-name">Penerima: MejaKu Foodcourt Indonesia</span>
                </div>
                <span class="badge-pill badge-pill-primary">{{ currentBank.logo }}</span>
              </div>
              <div class="va-number-row">
                <span class="va-number-text font-sans">{{ currentBank.code }}</span>
                <button
                  type="button"
                  class="btn-copy"
                  :class="{ 'btn-copied': copyVaSuccess }"
                  @click="handleCopyVaCode"
                >
                  <Check v-if="copyVaSuccess" :size="15" />
                  <Copy v-else :size="15" />
                  <span>{{ copyVaSuccess ? 'Tersalin' : 'Salin Nomor' }}</span>
                </button>
              </div>
              <div class="va-card-footer">
                <div class="va-total-label">Total Tagihan Transfer:</div>
                <div class="va-total-amount font-sans">{{ formatRupiah(orderStore.pricing.total) }}</div>
              </div>
            </div>

            <!-- Step by step instructions -->
            <div class="payment-steps-warm">
              <h4 class="warm-title">Panduan Transfer via {{ currentBank.logo }} Mobile / ATM</h4>
              <ol class="warm-steps-list">
                <li>
                  <strong>Login ke aplikasi {{ currentBank.logo }} Mobile atau masukkan kartu ke ATM</strong>
                  <span>Pilih menu Transfer > Virtual Account / Pembayaran Tagihan.</span>
                </li>
                <li>
                  <strong>Masukkan nomor Virtual Account</strong>
                  <span>Ketik <strong>{{ currentBank.code.replace(/\s+/g, '') }}</strong> dan pastikan nama penerima <strong>MejaKu Foodcourt Indonesia</strong>.</span>
                </li>
                <li>
                  <strong>Periksa total nominal dan konfirmasi</strong>
                  <span>Pastikan jumlah tagihan tepat {{ formatRupiah(orderStore.pricing.total) }}, lalu masukkan PIN transaksi Anda.</span>
                </li>
              </ol>
            </div>

            <!-- Green Auto Verify Notice -->
            <div class="verify-security-note">
              <CheckCircle2 :size="18" class="verify-icon" />
              <span>
                Nomor Virtual Account aktif selama 18 menit. Setelah transfer berhasil, klik tombol verifikasi di bawah.
              </span>
            </div>

            <!-- Direct VA Pay Action -->
            <button
              type="button"
              class="btn-primary btn-check-payment"
              style="margin-top: 20px; width: 100%;"
              :disabled="orderStore.isCheckingPayment"
              @click="handleCheckPayment"
            >
              <RefreshCw :size="18" :class="{ 'spin-anim': orderStore.isCheckingPayment }" />
              <span>
                {{ orderStore.isCheckingPayment ? 'Memverifikasi Transfer VA...' : 'Saya Sudah Transfer · Cek Status VA' }}
              </span>
            </button>
          </div>

          <!-- 2C. E-Wallet Main Panel -->
          <div v-else-if="selectedMethod === 'ewallet'" class="ewallet-panel card-surface">
            <!-- Header -->
            <div class="qris-header-row">
              <div>
                <h3 class="qris-title">Bayar dengan Dompet Digital</h3>
                <p class="qris-subtitle">Pilih dompet digital untuk pembayaran instan sekali klik.</p>
              </div>
              <span class="badge-pill badge-pill-warning">INSTAN & CEPAT</span>
            </div>

            <!-- E-Wallet Selector Chips -->
            <div class="ewallet-selector-group">
              <label class="bank-selector-label">Pilih Dompet Digital:</label>
              <div class="ewallet-chips-grid">
                <button
                  v-for="wallet in ewalletList"
                  :key="wallet.id"
                  type="button"
                  class="ewallet-chip-btn"
                  :class="{ active: selectedEwallet === wallet.id }"
                  @click="selectedEwallet = wallet.id"
                >
                  <div class="ewallet-dot" :style="{ background: wallet.iconColor }"></div>
                  <span class="ewallet-name-text">{{ wallet.name }}</span>
                </button>
              </div>
            </div>

            <!-- E-Wallet Input Box -->
            <div class="ewallet-display-card">
              <div class="ewallet-phone-group">
                <label class="ewallet-input-label">Nomor Handphone Akun {{ ewalletList.find(w => w.id === selectedEwallet)?.name }}:</label>
                <div class="ewallet-input-wrap">
                  <Smartphone :size="18" class="ewallet-input-icon" />
                  <input
                    v-model="ewalletPhone"
                    type="tel"
                    class="ewallet-tel-input"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <span class="ewallet-input-hint">Notifikasi konfirmasi bayar akan dikirim ke aplikasi {{ ewalletList.find(w => w.id === selectedEwallet)?.name }} Anda.</span>
              </div>

              <div class="va-card-footer" style="margin-top: 16px; border-top: 1px dashed var(--border); padding-top: 14px;">
                <div class="va-total-label">Total Tagihan:</div>
                <div class="va-total-amount font-sans">{{ formatRupiah(orderStore.pricing.total) }}</div>
              </div>
            </div>

            <!-- Steps Instructions -->
            <div class="payment-steps-warm">
              <h4 class="warm-title">Cara Pembayaran {{ ewalletList.find(w => w.id === selectedEwallet)?.name }}</h4>
              <ol class="warm-steps-list">
                <li>
                  <strong>Klik tombol bayar di bawah</strong>
                  <span>Permintaan pembayaran akan diproses otomatis oleh gateway pembayaran MejaKu.</span>
                </li>
                <li>
                  <strong>Buka notifikasi di smartphone</strong>
                  <span>Periksa rincian pesanan senilai {{ formatRupiah(orderStore.pricing.total) }} di aplikasi {{ ewalletList.find(w => w.id === selectedEwallet)?.name }}.</span>
                </li>
                <li>
                  <strong>Masukkan PIN akun</strong>
                  <span>Setelah pembayaran sukses, halaman ini akan otomatis dialihkan ke status pesanan.</span>
                </li>
              </ol>
            </div>

            <!-- Direct E-Wallet Pay Action -->
            <button
              type="button"
              class="btn-primary btn-check-payment"
              style="margin-top: 20px; width: 100%;"
              :disabled="orderStore.isCheckingPayment"
              @click="handleCheckPayment"
            >
              <RefreshCw :size="18" :class="{ 'spin-anim': orderStore.isCheckingPayment }" />
              <span>
                {{ orderStore.isCheckingPayment ? 'Memproses E-Wallet...' : `Buka ${ewalletList.find(w => w.id === selectedEwallet)?.name} & Bayar Sekarang` }}
              </span>
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN: Order Summary & Actions -->
        <aside class="payment-right-col">
          <div class="summary-card card-surface">
            <!-- Header -->
            <div class="summary-card-header">
              <h2 class="font-display summary-title">Ringkasan Pesanan</h2>
              <span class="badge-pill badge-pill-primary">1 Menu</span>
            </div>

            <!-- Order Number & Table Badge -->
            <div class="order-id-badge-row">
              <strong class="order-id-val">{{ orderStore.currentOrder?.orderNumber || '#MJK-72600-BA' }}</strong>
              <span class="badge-pill badge-pill-success">Meja {{ orderStore.table.tableNumber }}</span>
            </div>

            <!-- Product config recap -->
            <div class="summary-dish-card">
              <div class="dish-title-row">
                <span class="dish-merchant">{{ orderStore.currentItemConfig.merchant }}</span>
                <strong class="dish-name">{{ orderStore.currentItemConfig.name }}</strong>
              </div>
              <div class="dish-options-recap">
                <span>{{ orderStore.quantity }} × {{ orderStore.currentPortion.name }}</span>
                <span>· {{ orderStore.currentSpice.name }}</span>
                <span v-if="orderStore.currentAddons.length > 0">
                  · {{ orderStore.currentAddons.map(a => a.name).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Price Breakdown -->
            <PriceBreakdown :pricing="orderStore.pricing" mode="payment" />

            <!-- Waiting Notice Box -->
            <div class="waiting-notice-wrap">
              <NoticeBox
                variant="warning"
                icon-type="clock"
                title="Menunggu Pembayaran"
                message="Status akan diperbarui otomatis setelah transaksi berhasil diverifikasi gateway."
              />
            </div>

            <!-- Action: Saya Sudah Bayar -->
            <button
              type="button"
              class="btn-primary btn-check-payment"
              :disabled="orderStore.isCheckingPayment"
              @click="handleCheckPayment"
            >
              <RefreshCw
                :size="18"
                :class="{ 'spin-anim': orderStore.isCheckingPayment }"
              />
              <span>
                {{ orderStore.isCheckingPayment ? 'Memeriksa Status Transaksi...' : 'Saya Sudah Bayar · Cek Pembayaran' }}
              </span>
            </button>

            <!-- Action: Konfirmasi Manual -->
            <button
              type="button"
              class="btn-outline btn-manual-confirm"
              @click="showManualModal = true"
            >
              <span>Konfirmasi Pembayaran Manual</span>
            </button>

            <!-- Warning Subtext -->
            <p class="keep-open-warning">
              Jangan tutup halaman ini sebelum status pembayaran berhasil dikonfirmasi.
            </p>

            <!-- Saved Notice -->
            <div class="saved-notice-wrap">
              <NoticeBox
                variant="warm"
                icon-type="info"
                title="Pesananmu tetap tersimpan"
                message="Jika transaksi tertunda, kamu bisa membuka kembali pesanan ini dari riwayat MejaKu."
              />
            </div>
          </div>
        </aside>
      </div>
    </main>

    <AppFooter :is-payment-screen="true" />


    <!-- Manual Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showManualModal" class="modal-backdrop" @click.self="showManualModal = false">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3 class="font-display modal-title">Konfirmasi Manual</h3>
            <button type="button" class="close-btn" @click="showManualModal = false">
              <X :size="20" />
            </button>
          </div>
          <div class="modal-body">
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
              Jika Anda telah mentransfer namun status belum terbarui otomatis, masukkan 4 digit terakhir nomor rekening atau ID referensi bukti transfer Anda:
            </p>
            <input
              type="text"
              placeholder="Contoh: REF9827391"
              class="promo-input"
              style="width: 100%; margin-bottom: 12px; padding: 12px;"
            />
            <span style="font-size: 12px; color: var(--text-muted);">
              Sistem akan memverifikasi mutasi bank dalam 1-2 menit.
            </span>
          </div>
          <div class="modal-footer" style="margin-top: 20px;">
            <button
              type="button"
              class="btn-primary"
              style="width: 100%"
              @click="handleConfirmManual"
            >
              Kirim & Verifikasi
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.payment-page {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.payment-main {
  padding-bottom: 96px;
}

.payment-header-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 36px;
  align-items: center;
}

@media (min-width: 960px) {
  .payment-header-row {
    grid-template-columns: 1fr 380px;
    gap: 48px;
  }
}

.payment-h1 {
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 8px;
}

.payment-desc {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Deadline Panel (360x115px) */
.deadline-panel {
  background-color: var(--warning-soft);
  border: 1px solid var(--warning-border);
  border-radius: 18px;
  padding: 16px 20px;
}

.deadline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.deadline-tag {
  font-size: 11px;
  font-weight: 800;
  color: var(--warning);
  letter-spacing: 0.5px;
}

.deadline-target {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.deadline-timer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timer-label {
  font-size: 13px;
  color: #78350F;
  font-weight: 600;
}

.timer-digits {
  display: flex;
  align-items: center;
  gap: 4px;
}

.digit-box {
  background-color: #FFFFFF;
  border: 1px solid var(--warning-border);
  color: var(--warning);
  font-weight: 800;
  font-size: 20px;
  padding: 4px 8px;
  border-radius: 8px;
  min-width: 38px;
  text-align: center;
}

.digit-sep {
  font-weight: 800;
  color: var(--warning);
  font-size: 18px;
}

/* Grid Layout */
.payment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
}

@media (min-width: 1080px) {
  .payment-grid {
    grid-template-columns: 1fr 432px;
    gap: 48px;
  }
}

.payment-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1080px) {
  .payment-left-col {
    position: sticky;
    top: 84px;
    align-self: start;
  }
}

/* Methods Panel */
.methods-panel {
  padding: 28px;
}

.panel-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.panel-sub {
  font-size: 13px;
  color: var(--text-secondary);
}

.methods-cards-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .methods-cards-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

.method-card {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.method-card:hover {
  border-color: #D6BCAB;
}

.method-card.active {
  border-color: var(--primary);
  background-color: var(--primary-soft);
}

.method-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.method-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--surface-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.method-name {
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* QRIS Panel */
.qris-panel {
  padding: 28px;
}

.qris-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.qris-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.qris-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.qris-content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  margin-bottom: 28px;
}

@media (min-width: 640px) {
  .qris-content-grid {
    grid-template-columns: 200px 1fr;
    gap: 36px;
    align-items: center;
  }
}

.qr-code-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qr-image-wrapper {
  width: 190px;
  height: 190px;
  background: #FFFFFF;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.qr-vector {
  width: 100%;
  height: 100%;
}

.qr-caption {
  font-size: 12px;
  color: var(--text-muted);
}

.qris-meta-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nominal-label {
  font-size: 13px;
  color: var(--text-secondary);
  display: block;
}

.nominal-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
  margin: 4px 0 6px 0;
}

.nominal-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.payment-code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}

.code-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-secondary);
  display: block;
}

.code-val {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
}

.btn-copy:hover {
  background: var(--primary-soft);
}

.btn-copied {
  background: var(--success-soft) !important;
  color: var(--success) !important;
  border-color: var(--success) !important;
}

.supported-apps-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.apps-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.apps-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.app-chip {
  background: var(--surface-warm);
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

/* Warm steps list */
.payment-steps-warm {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 20px;
}

.warm-title {
  font-size: 15px;
  font-weight: 700;
  color: #451A03;
  margin-bottom: 12px;
}

.warm-steps-list {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: #78350F;
}

.warm-steps-list strong {
  color: #451A03;
  display: block;
}

.verify-security-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: var(--success-soft);
  border: 1px solid rgba(21, 128, 61, 0.2);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: 13px;
  color: var(--success);
  line-height: 1.45;
}

.verify-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Right Summary */
.payment-right-col {
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
  margin-bottom: 16px;
}

.summary-title {
  font-size: 26px;
  color: var(--text-primary);
}

.order-id-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.order-id-val {
  font-size: 14px;
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.summary-dish-card {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 20px;
}

.dish-merchant {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  display: block;
}

.dish-name {
  font-size: 15px;
  color: var(--text-primary);
}

.dish-options-recap {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.waiting-notice-wrap {
  margin: 20px 0 16px 0;
}

.btn-check-payment {
  width: 100%;
  font-size: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.spin-anim {
  animation: spinLoader 1s linear infinite;
}

.btn-manual-confirm {
  width: 100%;
  font-size: 14px;
  padding: 12px;
}

.keep-open-warning {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin: 14px 0;
  line-height: 1.4;
}

.saved-notice-wrap {
  margin-top: 10px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(30, 41, 59, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background-color: var(--surface);
  border-radius: var(--radius-xl);
  max-width: 480px;
  width: 100%;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 26px;
  color: var(--primary);
}

.close-btn {
  color: var(--text-secondary);
  padding: 6px;
}

.notice-info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 13px;
  color: #0369A1;
}
</style>
