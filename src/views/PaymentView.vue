<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  ShieldCheck,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next'
import QRCode from 'qrcode'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import PriceBreakdown from '@/components/common/PriceBreakdown.vue'
import NoticeBox from '@/components/common/NoticeBox.vue'
import HelpCallout from '@/components/common/HelpCallout.vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import type { PaymentMethodType } from '@/types'
import { api } from '@/api/client'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const breadcrumbItems = computed(() => [
  { label: 'Beranda', to: '/' },
  {
    label: orderStore.currentOrder?.merchant || orderStore.currentItemConfig.merchant || 'MejaKu',
    to: '/menu',
  },
  { label: 'Pesanan', to: '/checkout' },
  { label: 'Pembayaran' },
])

const selectedMethod = ref<PaymentMethodType>('qris')
const selectedBank = ref('bca')
const payment = ref<any>(null)
const qrImage = ref('')
const isCharging = ref(false)
const chargeError = ref('')
const copySuccess = ref(false)
const copyVaSuccess = ref(false)
const checkMessage = ref('')
const localExpired = ref(false)
const isLoadingOrder = ref(false)
const orderLoadError = ref('')
const timeLeft = ref({ hours: '00', minutes: '00', seconds: '00' })

let timerInterval: ReturnType<typeof setInterval> | null = null
let statusPollTimer: ReturnType<typeof setInterval> | null = null
let redirectTimer: ReturnType<typeof setTimeout> | null = null
let redirectScheduled = false

const bankList = [
  { id: 'bca', name: 'BCA Virtual Account', short: 'BCA' },
  { id: 'bri', name: 'BRI Virtual Account (BRIVA)', short: 'BRI' },
  { id: 'bni', name: 'BNI Virtual Account', short: 'BNI' },
  { id: 'permata', name: 'Permata Virtual Account', short: 'Permata' },
]

const orderNumber = computed(() => {
  return String(route.params.orderId || '') || orderStore.currentOrder?.id || ''
})

const currentOrderNumber = computed(() => {
  return orderStore.currentOrder?.orderNumber || (orderNumber.value ? `#${orderNumber.value}` : 'Pesanan Meja')
})

const routeOrderId = computed(() => (route.params.orderId as string) || '')

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

// All items in the order
const orderItems = computed(() => {
  if (activeOrder.value?.items && activeOrder.value.items.length > 0) {
    return activeOrder.value.items
  }
  if (orderStore.currentOrder?.items && orderStore.currentOrder.items.length > 0) {
    return orderStore.currentOrder.items
  }
  if (orderStore.cartItems.length > 0) {
    return orderStore.cartItems
  }
  if (orderStore.orderHistory.length > 0 && (orderStore.orderHistory[0]?.items?.length ?? 0) > 0) {
    return orderStore.orderHistory[0].items!
  }
  return []
})

const orderTable = computed(() => orderStore.currentOrder?.table || orderStore.table)
const orderPricing = computed(() => orderStore.orderPricing)

const paymentStatus = computed(() => {
  return String(payment.value?.status || orderStore.currentOrder?.paymentStatus || 'pending')
})

const isCashier = computed(() => selectedMethod.value === 'cashier')

const isPaid = computed(() => {
  return paymentStatus.value === 'paid' || orderStore.currentOrder?.paymentStatus === 'paid'
})

const isExpired = computed(() => {
  const unusable = ['expired', 'failed', 'cancelled']
  return (
    localExpired.value ||
    unusable.includes(paymentStatus.value) ||
    unusable.includes(String(orderStore.currentOrder?.paymentStatus))
  )
})

const selectedBankInfo = computed(() => {
  const bankId = payment.value?.va_bank || selectedBank.value
  return bankList.find((bank) => bank.id === bankId) || bankList[0]
})

const displayedPaymentCode = computed(() => {
  return (
    payment.value?.payment_code ||
    orderStore.currentOrder?.paymentCode ||
    orderNumber.value.replace(/-/g, '')
  )
})

const deadlineTimestamp = computed<number | null>(() => {
  if (isCashier.value) return null
  const raw = payment.value?.expires_at || orderStore.currentOrder?.expiresAt
  if (!raw) return null
  const timestamp = new Date(raw).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
})

function formatWibTime(date: Date): string {
  return date
    .toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace('.', ':')
}

const formattedDeadline = computed(() => {
  if (isCashier.value) return 'Tanpa batas waktu'
  if (isExpired.value) return 'Waktu habis'
  if (!deadlineTimestamp.value) return '—'
  return `Hari ini, ${formatWibTime(new Date(deadlineTimestamp.value))} WIB`
})

const formattedDeadlineShort = computed(() => {
  if (!deadlineTimestamp.value) return '—'
  return `${formatWibTime(new Date(deadlineTimestamp.value))} WIB`
})

const vaNumber = computed(() => formatVaNumber(payment.value?.va_number || ''))

function formatVaNumber(value: string): string {
  return String(value)
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function mapPaymentMethod(method?: string | null): PaymentMethodType {
  if (method === 'bank_transfer') return 'bank_va'
  if (method === 'cashier') return 'cashier'
  return 'qris'
}

async function renderQr(payload: string) {
  try {
    qrImage.value = await QRCode.toDataURL(payload, {
      width: 360,
      margin: 1,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
  } catch {
    qrImage.value = ''
    chargeError.value = 'Gagal menampilkan gambar QRIS. Silakan coba lagi.'
  }
}

function stopPolling() {
  if (statusPollTimer) {
    clearInterval(statusPollTimer)
    statusPollTimer = null
  }
}

function stopTimers() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  stopPolling()
}

function scheduleRedirect() {
  if (redirectScheduled || !orderNumber.value) return
  redirectScheduled = true
  stopTimers()
  redirectTimer = setTimeout(() => {
    router.push(`/orders/${orderNumber.value}/confirmation`)
  }, 900)
}

function applyPaymentData(data: any) {
  if (!data) return

  payment.value = data
  const method = mapPaymentMethod(data.method)
  selectedMethod.value = method

  if (data.method === 'bank_transfer' && data.va_bank) {
    selectedBank.value = String(data.va_bank)
  }

  if (method !== 'qris') {
    qrImage.value = ''
  } else if (data.qr_data) {
    void renderQr(data.qr_data)
  }

  if (data.expires_at) {
    orderStore.setPaymentDeadline(data.expires_at)
    localExpired.value = false
  }

  if (['expired', 'failed', 'cancelled'].includes(String(data.status))) {
    localExpired.value = true
    stopPolling()
  }

  orderStore.applyPaymentStatus(data)

  if (data.payment_status === 'paid' || data.status === 'paid') {
    scheduleRedirect()
  }
}

async function ensurePayment(force = false) {
  if (!orderNumber.value || isCharging.value) return

  if (!force && payment.value) {
    if (selectedMethod.value === 'cashier' && payment.value.method === 'cashier') return
    if (selectedMethod.value === 'qris' && payment.value.qr_data && !chargeError.value) return
    if (
      selectedMethod.value === 'bank_va' &&
      payment.value.va_number &&
      String(payment.value.va_bank || selectedBank.value) === selectedBank.value
    ) {
      return
    }
  }

  isCharging.value = true
  chargeError.value = ''
  checkMessage.value = ''

  try {
    let res

    if (selectedMethod.value === 'qris') {
      res = await api.createPayment(orderNumber.value, 'qris', 'qris')
    } else if (selectedMethod.value === 'bank_va') {
      res = await api.createPayment(orderNumber.value, 'bank_transfer', 'va', selectedBank.value)
    } else {
      res = await api.createPayment(orderNumber.value, 'cashier')
    }

    if (!res.data) {
      throw new Error((res as any).message || 'Gagal membuat pembayaran.')
    }

    applyPaymentData(res.data)

    if (selectedMethod.value === 'qris' && !res.data.qr_data) {
      chargeError.value = 'QRIS belum tersedia dari server. Silakan coba lagi.'
    }
  } catch (err: any) {
    chargeError.value =
      err?.data?.message || err?.message || 'Gagal membuat pembayaran. Silakan coba lagi.'
  } finally {
    isCharging.value = false
  }
}

async function handleSelectMethod(method: PaymentMethodType) {
  if (isCharging.value || isPaid.value) return

  const previousMethod = selectedMethod.value
  selectedMethod.value = method
  orderStore.setPaymentMethod(method)
  checkMessage.value = ''

  if (method !== previousMethod) {
    payment.value = null
    qrImage.value = ''
    chargeError.value = ''
    localExpired.value = false
  }

  await ensurePayment(false)
}

async function handleSelectBank(bankId: string) {
  if (isCharging.value || isPaid.value) return
  if (bankId === selectedBank.value && payment.value?.va_number) return

  selectedBank.value = bankId
  payment.value = null
  qrImage.value = ''
  chargeError.value = ''
  checkMessage.value = ''
  localExpired.value = false

  await ensurePayment(false)
}

async function handleCopyPaymentCode() {
  if (!displayedPaymentCode.value) return
  try {
    await navigator.clipboard.writeText(displayedPaymentCode.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    // Clipboard unavailable; the code is still visible on screen.
  }
}

async function handleCopyVaCode() {
  if (!payment.value?.va_number) return
  try {
    await navigator.clipboard.writeText(String(payment.value.va_number).replace(/\s+/g, ''))
    copyVaSuccess.value = true
    setTimeout(() => {
      copyVaSuccess.value = false
    }, 2000)
  } catch {
    // Clipboard unavailable; the VA number is still visible on screen.
  }
}

async function pollPaymentStatus() {
  if (!orderNumber.value || isCharging.value || isPaid.value || isExpired.value) return

  try {
    const res = await api.getPaymentStatus(orderNumber.value)
    if (res.data) {
      applyPaymentData(res.data)
    }
  } catch {
    // Keep polling; transient network errors are expected.
  }
}

function startPolling() {
  stopPolling()
  statusPollTimer = setInterval(pollPaymentStatus, 5000)
}

async function handleCheckPayment() {
  if (orderStore.isCheckingPayment || isCharging.value) return

  checkMessage.value = ''

  const data = await orderStore.refreshPaymentStatus()

  if (data) {
    applyPaymentData(data)

    if (data.payment_status === 'paid' || data.status === 'paid') {
      scheduleRedirect()
      return
    }

    if (['expired', 'failed', 'cancelled'].includes(String(data.status))) {
      localExpired.value = true
      checkMessage.value = 'Pembayaran sudah tidak berlaku. Silakan buat pembayaran baru.'
      return
    }
  }

  if (isCashier.value) {
    checkMessage.value =
      'Pembayaran kasir belum dikonfirmasi. Tunjukkan kode pesanan ke kasir untuk menyelesaikan pembayaran.'
  } else {
    checkMessage.value =
      'Status belum berubah. Jika baru saja membayar, tunggu beberapa saat — halaman ini juga memeriksa status secara otomatis.'
  }
}

async function retryPayment() {
  if (isCharging.value) return

  localExpired.value = false
  payment.value = null
  qrImage.value = ''
  chargeError.value = ''
  checkMessage.value = ''

  await ensurePayment(true)
}

function updateCountdown() {
  if (isCashier.value) {
    timeLeft.value = { hours: '00', minutes: '00', seconds: '00' }
    return
  }

  const deadline = deadlineTimestamp.value
  if (!deadline) return

  const diff = deadline - Date.now()

  if (diff <= 0) {
    timeLeft.value = { hours: '00', minutes: '00', seconds: '00' }
    if (!isPaid.value) {
      localExpired.value = true
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

async function initializePaymentPage() {
  isLoadingOrder.value = true
  orderLoadError.value = ''

  try {
    const routeOrderNumber = String(route.params.orderId || '')

    if (!routeOrderNumber && !orderStore.currentOrder?.id) {
      orderLoadError.value =
        'Nomor pesanan tidak ditemukan. Silakan kembali ke keranjang dan buat pesanan terlebih dahulu.'
      return
    }

    if (
      routeOrderNumber &&
      (!orderStore.currentOrder || orderStore.currentOrder.id !== routeOrderNumber)
    ) {
      const fetched = await orderStore.fetchOrder(routeOrderNumber)
      if (!fetched) {
        orderLoadError.value =
          'Pesanan tidak ditemukan di server. Periksa kembali nomor pesanan atau koneksi backend.'
        return
      }
    }

    if (!orderNumber.value) {
      orderLoadError.value = 'Nomor pesanan tidak ditemukan.'
      return
    }

    if (orderStore.currentOrder?.paymentStatus === 'paid') {
      router.replace(`/orders/${orderNumber.value}/confirmation`)
      return
    }

    // Ambil pembayaran yang sudah ada agar QR/VA tidak dibuat ulang saat refresh.
    let existingPayment: any = null
    try {
      const statusRes = await api.getPaymentStatus(orderNumber.value)
      existingPayment = statusRes.data
    } catch {
      // Belum ada pembayaran untuk pesanan ini.
    }

    if (existingPayment) {
      applyPaymentData(existingPayment)

      if (
        existingPayment.status === 'paid' ||
        existingPayment.payment_status === 'paid'
      ) {
        scheduleRedirect()
        return
      }

      const needsChannelData =
        existingPayment.method !== 'cashier' &&
        !['expired', 'failed', 'cancelled'].includes(String(existingPayment.status)) &&
        ((existingPayment.method === 'qris' && !existingPayment.qr_data) ||
          (existingPayment.method === 'bank_transfer' && !existingPayment.va_number))

      if (needsChannelData) {
        await ensurePayment(false)
      }
    } else {
      const initialMethod = orderStore.currentOrder?.paymentMethod || 'qris'
      selectedMethod.value = initialMethod
      orderStore.setPaymentMethod(initialMethod)
      await ensurePayment(false)
    }

    if (!isPaid.value && !redirectScheduled) {
      startPolling()
    }
  } finally {
    isLoadingOrder.value = false
  }
}

onMounted(async () => {
  await initializePaymentPage()
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  stopTimers()
  if (redirectTimer) clearTimeout(redirectTimer)
})
</script>

<template>
  <div class="payment-page">
    <AppNavbar :hide-price-link="true" />

    <main class="container-app payment-main">
      <AppBreadcrumb :items="breadcrumbItems" />

      <!-- Loading state -->
      <div v-if="isLoadingOrder" class="payment-state-card card-surface">
        <Loader2 :size="30" class="spin-anim page-state-icon" />
        <h2 class="state-title font-display">Memuat Detail Pesanan</h2>
        <p class="state-desc">Menyiapkan metode pembayaran dan rincian tagihanmu...</p>
      </div>

      <!-- Order not found -->
      <div v-else-if="orderLoadError" class="payment-state-card card-surface">
        <AlertTriangle :size="34" class="page-state-icon state-error-icon" />
        <h2 class="state-title font-display">Pesanan Tidak Ditemukan</h2>
        <p class="state-desc">{{ orderLoadError }}</p>
        <RouterLink to="/menu" class="btn-primary state-action">Kembali ke Menu</RouterLink>
      </div>

      <template v-else>
        <!-- Top Header & Timer Banner Row -->
        <div class="payment-header-row">
          <div class="title-left">
            <h1 class="font-display payment-h1">Selesaikan Pembayaranmu</h1>
            <p class="payment-desc">
              Pilih metode pembayaran yang paling nyaman. Pesanan akan langsung diteruskan ke dapur setelah pembayaran terverifikasi.
            </p>
          </div>

          <!-- Cashier info panel -->
          <div v-if="isCashier" class="deadline-panel cashier-deadline-panel">
            <div class="deadline-top">
              <span class="deadline-tag">PEMBAYARAN DI KASIR</span>
              <span class="deadline-target">Tunai / EDC</span>
            </div>
            <div class="deadline-timer-row">
              <span class="timer-label">Tanpa batas waktu</span>
              <Banknote :size="30" class="cashier-panel-icon" />
            </div>
          </div>

          <!-- Online payment deadline panel -->
          <div v-else class="deadline-panel">
            <div class="deadline-top">
              <span class="deadline-tag">BATAS WAKTU PEMBAYARAN</span>
              <span class="deadline-target">{{ formattedDeadline }}</span>
            </div>

            <div class="deadline-timer-row">
              <span class="timer-label">{{ isExpired ? 'Waktu habis' : 'Selesaikan dalam' }}</span>
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

        <!-- Main Two-Column Layout -->
        <div class="payment-grid">
          <!-- LEFT COLUMN: Payment Methods & Active Panel -->
          <div class="payment-left-col">
            <!-- Select Payment Method Panel -->
            <div class="methods-panel card-surface">
              <div class="panel-header-row">
                <div>
                  <h2 class="panel-title">Pilih Metode Pembayaran</h2>
                  <p class="panel-sub">
                    QRIS dan VA diproses langsung melalui Midtrans. Pembayaran kasir dikonfirmasi oleh petugas.
                  </p>
                </div>
                <div class="badge-pill badge-pill-success">
                  <ShieldCheck :size="13" />
                  <span>Pembayaran Aman</span>
                </div>
              </div>

              <div class="methods-cards-row">
                <!-- QRIS -->
                <button
                  type="button"
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
                </button>

                <!-- Virtual Account -->
                <button
                  type="button"
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
                  <p class="method-desc">BCA, BRI, BNI, dan Permata</p>
                </button>

                <!-- Kasir -->
                <button
                  type="button"
                  class="method-card"
                  :class="{ active: selectedMethod === 'cashier' }"
                  @click="handleSelectMethod('cashier')"
                >
                  <div class="method-card-top">
                    <div class="method-icon-wrap">
                      <Banknote :size="20" />
                    </div>
                    <span v-if="selectedMethod === 'cashier'" class="badge-pill badge-pill-primary">TERPILIH</span>
                    <span v-else class="badge-pill badge-pill-warning">KASIR</span>
                  </div>
                  <strong class="method-name">Kasir</strong>
                  <p class="method-desc">Bayar tunai atau EDC langsung di kasir</p>
                </button>
              </div>
            </div>

            <!-- QRIS Panel -->
            <div v-if="selectedMethod === 'qris'" class="qris-panel card-surface">
              <div class="qris-header-row">
                <div>
                  <h3 class="qris-title">Bayar dengan QRIS</h3>
                  <p class="qris-subtitle">Pindai kode QR berikut dari aplikasi pilihanmu.</p>
                </div>
                <span class="badge-pill badge-pill-primary">QRIS OTOMATIS</span>
              </div>

              <div class="qris-content-grid">
                <div class="qr-code-box">
                  <div class="qr-image-wrapper">
                    <img
                      v-if="qrImage && !isExpired"
                      :src="qrImage"
                      alt="QRIS Pembayaran MejaKu"
                      class="qr-real-img"
                    />
                    <div v-else-if="isCharging" class="qr-loading-box">
                      <Loader2 :size="34" class="spin-anim" />
                      <span>Menyiapkan QRIS...</span>
                    </div>
                    <div v-else class="qr-loading-box qr-error-box">
                      <AlertTriangle :size="30" />
                      <span>
                        {{ isExpired ? 'QR pembayaran sudah kedaluwarsa.' : chargeError || 'QRIS belum tersedia.' }}
                      </span>
                      <button
                        type="button"
                        class="btn-retry-camera"
                        @click="isExpired ? retryPayment() : ensurePayment(true)"
                      >
                        <RefreshCw :size="14" />
                        {{ isExpired ? 'Buat QR Baru' : 'Coba Lagi' }}
                      </button>
                    </div>
                  </div>
                  <span class="qr-caption">
                    {{ isExpired ? 'QR tidak berlaku lagi' : `QR berlaku hingga ${formattedDeadlineShort}` }}
                  </span>
                </div>

                <div class="qris-meta-box">
                  <div class="qris-nominal-group">
                    <span class="nominal-label">Total Pembayaran</span>
                    <div class="nominal-value font-sans">
                      {{ formatRupiah(orderPricing.total) }}
                    </div>
                    <span class="nominal-hint">
                      Pastikan nominal yang tampil di aplikasi sama persis.
                    </span>
                  </div>

                  <div class="payment-code-bar">
                    <div class="code-info">
                      <span class="code-label">KODE PEMBAYARAN</span>
                      <strong class="code-val">{{ displayedPaymentCode }}</strong>
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

                  <div class="supported-apps-row">
                    <span class="apps-label">DAPAT DIBAYAR MELALUI:</span>
                    <div class="apps-chips">
                      <span class="app-chip">BCA mobile</span>
                      <span class="app-chip">Livin' by Mandiri</span>
                      <span class="app-chip">BRImo</span>
                      <span class="app-chip">GoPay</span>
                      <span class="app-chip">DANA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="payment-steps-warm">
                <h4 class="warm-title">Langkah Pembayaran</h4>
                <ol class="warm-steps-list">
                  <li>
                    <strong>Buka aplikasi bank atau dompet digital</strong>
                    <span>Pilih menu Bayar, Scan, atau QRIS pada halaman utama aplikasi.</span>
                  </li>
                  <li>
                    <strong>Pindai kode QR dan periksa detail</strong>
                    <span>Pastikan merchant MejaKu dan total {{ formatRupiah(orderPricing.total) }} sesuai.</span>
                  </li>
                  <li>
                    <strong>Konfirmasi pembayaran</strong>
                    <span>Masukkan PIN. Status halaman ini diperbarui otomatis setelah pembayaran diterima.</span>
                  </li>
                </ol>
              </div>

              <div class="verify-security-note">
                <CheckCircle2 :size="18" class="verify-icon" />
                <span>
                  Pembayaran diverifikasi otomatis. MejaKu tidak pernah meminta PIN, OTP, atau kata sandi akunmu.
                </span>
              </div>

              <div style="margin-top: 20px;">
                <HelpCallout
                  title="Ada kendala saat melakukan pembayaran?"
                  description="Tim kami siap membantu konfirmasi transaksi tanpa meminta data rahasia perbankan Anda."
                  action-text="Chat Bantuan"
                />
              </div>
            </div>

            <!-- Virtual Account Panel -->
            <div v-else-if="selectedMethod === 'bank_va'" class="va-panel card-surface">
              <div class="qris-header-row">
                <div>
                  <h3 class="qris-title">Transfer Virtual Account (VA)</h3>
                  <p class="qris-subtitle">Pilih bank tujuan untuk mendapatkan nomor Virtual Account unik.</p>
                </div>
                <span class="badge-pill badge-pill-success">VERIFIKASI OTOMATIS</span>
              </div>

              <div class="bank-selector-group">
                <label class="bank-selector-label">Pilih Bank Pembayaran:</label>
                <div class="bank-chips-grid">
                  <button
                    v-for="bank in bankList"
                    :key="bank.id"
                    type="button"
                    class="bank-chip-btn"
                    :class="{ active: selectedBankInfo.id === bank.id }"
                    :disabled="isCharging"
                    @click="handleSelectBank(bank.id)"
                  >
                    <span class="bank-logo-badge">{{ bank.short }}</span>
                    <span class="bank-name-text">{{ bank.name }}</span>
                    <Check
                      v-if="selectedBankInfo.id === bank.id && payment?.va_number && !isCharging"
                      :size="16"
                      class="bank-check"
                    />
                  </button>
                </div>
              </div>

              <div v-if="isCharging" class="va-loading-inline">
                <Loader2 :size="18" class="spin-anim" />
                <span>Membuat nomor Virtual Account {{ selectedBankInfo.short }}...</span>
              </div>

              <div v-else-if="chargeError && !payment?.va_number" class="qr-loading-box qr-error-box va-error-box">
                <AlertTriangle :size="28" />
                <span>{{ chargeError }}</span>
                <button type="button" class="btn-retry-camera" @click="ensurePayment(true)">
                  <RefreshCw :size="14" />
                  Coba Lagi
                </button>
              </div>

              <template v-else-if="payment?.va_number">
                <div class="va-display-card">
                  <div class="va-card-header">
                    <div>
                      <span class="va-card-label">Nomor Virtual Account {{ selectedBankInfo.short }}</span>
                      <span class="va-merchant-name">Penerima: MejaKu</span>
                    </div>
                    <span class="badge-pill badge-pill-primary">{{ selectedBankInfo.short }}</span>
                  </div>
                  <div class="va-number-row">
                    <span class="va-number-text font-sans">{{ vaNumber }}</span>
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
                    <div class="va-total-amount font-sans">{{ formatRupiah(orderPricing.total) }}</div>
                  </div>
                </div>

                <div class="payment-steps-warm">
                  <h4 class="warm-title">Panduan Transfer via {{ selectedBankInfo.short }} Mobile / ATM</h4>
                  <ol class="warm-steps-list">
                    <li>
                      <strong>Login ke aplikasi {{ selectedBankInfo.short }} Mobile atau masukkan kartu ke ATM</strong>
                      <span>Pilih menu Transfer &gt; Virtual Account / Pembayaran Tagihan.</span>
                    </li>
                    <li>
                      <strong>Masukkan nomor Virtual Account</strong>
                      <span>Ketik <strong>{{ payment.va_number }}</strong> dan pastikan nama penerima <strong>MejaKu</strong>.</span>
                    </li>
                    <li>
                      <strong>Periksa total nominal dan konfirmasi</strong>
                      <span>Pastikan jumlah tagihan tepat {{ formatRupiah(orderPricing.total) }}, lalu masukkan PIN transaksi Anda.</span>
                    </li>
                  </ol>
                </div>

                <div class="verify-security-note">
                  <CheckCircle2 :size="18" class="verify-icon" />
                  <span>
                    Nomor Virtual Account berlaku hingga {{ formattedDeadlineShort }}. Status diperbarui otomatis setelah transfer diterima.
                  </span>
                </div>
              </template>

              <div v-else class="qr-loading-box va-error-box">
                <AlertTriangle :size="28" />
                <span>Nomor Virtual Account belum tersedia.</span>
                <button type="button" class="btn-retry-camera" @click="ensurePayment(true)">
                  <RefreshCw :size="14" />
                  Buat Nomor VA
                </button>
              </div>
            </div>

            <!-- Cashier Panel -->
            <div v-else-if="selectedMethod === 'cashier'" class="cashier-panel card-surface">
              <div class="qris-header-row">
                <div>
                  <h3 class="qris-title">Bayar di Kasir</h3>
                  <p class="qris-subtitle">Tunjukkan kode pesanan ini ke kasir, lalu bayar tunai atau dengan kartu EDC.</p>
                </div>
                <span class="badge-pill badge-pill-warning">KONFIRMASI KASIR</span>
              </div>

              <div v-if="isCharging" class="va-loading-inline">
                <Loader2 :size="18" class="spin-anim" />
                <span>Menyiapkan tagihan kasir...</span>
              </div>

              <template v-else>
                <div class="cashier-display-card">
                  <div class="cashier-icon-wrap">
                    <Banknote :size="30" />
                  </div>
                  <div class="cashier-display-body">
                    <span class="cashier-display-label">KODE PESANAN</span>
                    <div class="cashier-code-row">
                      <strong class="cashier-code-val font-sans">{{ displayedPaymentCode }}</strong>
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
                    <span class="cashier-hint">Sebutkan kode ini atau tunjukkan halaman ini ke kasir.</span>
                  </div>
                  <div class="cashier-total">
                    <span>Total Tagihan</span>
                    <strong class="font-sans">{{ formatRupiah(orderPricing.total) }}</strong>
                  </div>
                </div>

                <div v-if="chargeError" class="qr-loading-box qr-error-box va-error-box">
                  <AlertTriangle :size="26" />
                  <span>{{ chargeError }}</span>
                  <button type="button" class="btn-retry-camera" @click="ensurePayment(true)">
                    <RefreshCw :size="14" />
                    Coba Lagi
                  </button>
                </div>

                <div class="payment-steps-warm">
                  <h4 class="warm-title">Langkah Pembayaran di Kasir</h4>
                  <ol class="warm-steps-list">
                    <li>
                      <strong>Datang ke meja kasir MejaKu</strong>
                      <span>Tunjukkan kode pesanan atau halaman pembayaran ini kepada kasir.</span>
                    </li>
                    <li>
                      <strong>Bayar dengan tunai atau kartu EDC</strong>
                      <span>Kasir akan memeriksa total tagihan sebesar {{ formatRupiah(orderPricing.total) }}.</span>
                    </li>
                    <li>
                      <strong>Tunggu konfirmasi kasir</strong>
                      <span>Status akan berubah menjadi lunas setelah kasir menandai pembayaran dari dashboard.</span>
                    </li>
                  </ol>
                </div>

                <div class="verify-security-note cashier-security-note">
                  <CheckCircle2 :size="18" class="verify-icon" />
                  <span>
                    Pesanan mulai disiapkan setelah kasir mengonfirmasi pembayaran. Tidak ada biaya tambahan untuk pembayaran di kasir.
                  </span>
                </div>
              </template>
            </div>
          </div>

          <!-- RIGHT COLUMN: Order Summary & Actions -->
          <aside class="payment-right-col">
            <div class="summary-card card-surface">
              <div class="summary-card-header">
                <h2 class="font-display summary-title">Ringkasan Pesanan</h2>
                <span class="badge-pill badge-pill-primary">{{ orderItems.length }} Menu</span>
              </div>

              <div class="order-id-badge-row">
                <strong class="order-id-val">{{ currentOrderNumber }}</strong>
                <span class="badge-pill badge-pill-success">Meja {{ orderTable.tableNumber }}</span>
              </div>

              <div class="summary-dishes-list">
                <div
                  v-for="item in orderItems"
                  :key="item.cartId || item.itemId"
                  class="summary-dish-card"
                >
                  <div class="dish-title-row">
                    <span class="dish-merchant">{{ item.merchant || 'MejaKu' }}</span>
                    <strong class="dish-name">{{ item.name }}</strong>
                  </div>
                  <div class="dish-options-recap">
                    <span>{{ item.quantity }} × {{ item.portion?.name || 'Porsi Standar' }}</span>
                    <span v-if="item.spice"> · {{ item.spice.name }}</span>
                    <span v-if="item.addons && item.addons.length > 0">
                      · {{ item.addons.map(a => a.name).join(', ') }}
                    </span>
                  </div>
                </div>
              </div>

              <PriceBreakdown :pricing="orderPricing" mode="payment" />

              <div class="waiting-notice-wrap">
                <NoticeBox
                  v-if="isCashier"
                  variant="warm"
                  icon-type="info"
                  title="Menunggu Konfirmasi Kasir"
                  message="Status akan berubah otomatis setelah kasir menandai pembayaranmu lunas."
                />
                <NoticeBox
                  v-else-if="isExpired"
                  variant="warning"
                  icon-type="warning"
                  title="Pembayaran Kedaluwarsa"
                  message="Waktu pembayaran sudah habis. Buat pembayaran baru untuk melanjutkan pesanan."
                />
                <NoticeBox
                  v-else
                  variant="warning"
                  icon-type="clock"
                  title="Menunggu Pembayaran"
                  message="Status akan diperbarui otomatis setelah transaksi berhasil diverifikasi gateway."
                />
              </div>

              <p v-if="checkMessage" class="status-feedback">{{ checkMessage }}</p>

              <button
                v-if="isExpired"
                type="button"
                class="btn-primary btn-check-payment"
                :disabled="isCharging"
                @click="retryPayment"
              >
                <RefreshCw :size="18" :class="{ 'spin-anim': isCharging }" />
                <span>{{ isCharging ? 'Membuat Pembayaran Baru...' : 'Buat Pembayaran Baru' }}</span>
              </button>

              <button
                v-else
                type="button"
                class="btn-primary btn-check-payment"
                :disabled="orderStore.isCheckingPayment || isCharging"
                @click="handleCheckPayment"
              >
                <RefreshCw
                  :size="18"
                  :class="{ 'spin-anim': orderStore.isCheckingPayment }"
                />
                <span>
                  {{
                    orderStore.isCheckingPayment
                      ? 'Memeriksa Status...'
                      : isCashier
                        ? 'Cek Konfirmasi Kasir'
                        : 'Saya Sudah Bayar · Cek Status'
                  }}
                </span>
              </button>

              <p class="keep-open-warning">
                {{
                  isCashier
                    ? 'Simpan halaman ini sampai kasir mengonfirmasi pembayaranmu.'
                    : 'Jangan tutup halaman ini sebelum status pembayaran berhasil dikonfirmasi.'
                }}
              </p>

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
      </template>
    </main>

    <AppFooter :is-payment-screen="true" />
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

.payment-state-card {
  max-width: 520px;
  margin: 48px auto;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.page-state-icon {
  color: var(--primary);
  margin-bottom: 4px;
}

.state-error-icon {
  color: #DC2626;
}

.state-title {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0;
}

.state-desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
  max-width: 420px;
}

.state-action {
  margin-top: 12px;
  text-decoration: none;
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

.cashier-deadline-panel {
  background-color: var(--primary-soft);
  border: 1px solid #FCD9BD;
}

.cashier-deadline-panel .deadline-tag {
  color: var(--primary);
}

.cashier-deadline-panel .timer-label {
  color: #7C2D12;
}

.cashier-panel-icon {
  color: var(--primary);
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
  width: 100%;
  background-color: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-family: inherit;
}

.method-card:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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

.qr-real-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.qr-loading-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.qr-error-box {
  color: #B91C1C;
}

.qr-error-box .btn-retry-camera {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

.summary-dishes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-dish-card {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 0;
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
/* ─── VA Bank Chip Selector ─── */
.bank-selector-group,
.ewallet-selector-group {
  margin-bottom: 20px;
}

.bank-selector-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bank-chips-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-chip-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.bank-chip-btn:hover {
  border-color: #D6BCAB;
  background: var(--surface-warm);
}

.bank-chip-btn.active {
  border-color: var(--primary);
  background-color: var(--primary-soft);
}

.bank-logo-badge {
  background-color: #1E293B;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 44px;
  text-align: center;
  letter-spacing: 0.3px;
}

.bank-chip-btn.active .bank-logo-badge {
  background-color: var(--primary);
}

.bank-name-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ─── E-Wallet Chip Selector ─── */
.ewallet-chips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ewallet-chip-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.ewallet-chip-btn:hover {
  border-color: #D6BCAB;
  background: var(--surface-warm);
}

.ewallet-chip-btn.active {
  border-color: var(--primary);
  background-color: var(--primary-soft);
}

.ewallet-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ewallet-name-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ─── VA Display Card ─── */
.va-panel,
.cashier-panel {
  padding: 28px;
}

.va-loading-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--surface-warm);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.va-error-box {
  margin-bottom: 20px;
  border: 1px dashed #FCA5A5;
  border-radius: var(--radius-md);
  background-color: #FEF2F2;
}

.status-feedback {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin: 0 0 12px 0;
}

.btn-retry-camera {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary);
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-full);
  cursor: pointer;
}

.btn-retry-camera:hover {
  filter: brightness(1.05);
}

.bank-check {
  margin-left: auto;
  color: var(--primary);
  flex-shrink: 0;
}

.cashier-display-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cashier-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background-color: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cashier-display-body {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cashier-display-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.cashier-code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cashier-code-val {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.cashier-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.cashier-total {
  margin-left: auto;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.cashier-total strong {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
}

.cashier-security-note {
  margin-top: 0;
}

.va-display-card {
  background: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
}

.va-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
  flex-wrap: wrap;
}

.va-card-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.va-merchant-name {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
}

.va-number-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  padding: 10px 0;
  border-top: 1px dashed var(--border);
  border-bottom: 1px dashed var(--border);
}

.va-number-text {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 2px;
  word-break: break-all;
}

.va-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.va-total-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.va-total-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
}

/* E-Wallet Input */
.ewallet-phone-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ewallet-input-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.ewallet-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ewallet-input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.ewallet-tel-input {
  width: 100%;
  padding: 11px 12px 11px 40px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--surface);
  transition: border-color 0.2s ease;
  outline: none;
}

.ewallet-tel-input:focus {
  border-color: var(--primary);
}

.ewallet-input-hint {
  font-size: 11.5px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ─── Mobile Fixes for PaymentView ─── */
@media (max-width: 640px) {
  .payment-main {
    padding-top: 12px;
    padding-bottom: 32px;
  }

  .methods-panel,
  .qris-panel,
  .va-panel,
  .cashier-panel {
    padding: 16px;
  }

  .cashier-display-card {
    flex-direction: column;
  }

  .cashier-total {
    margin-left: 0;
    text-align: left;
  }

  .panel-title {
    font-size: 16px;
  }

  .qris-title {
    font-size: 16px;
  }

  /* VA number: smaller on mobile */
  .va-number-text {
    font-size: 15px;
    letter-spacing: 1px;
  }

  .va-total-amount {
    font-size: 17px;
  }

  /* Bank chips: 2-col grid on mobile */
  .bank-chips-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .bank-chip-btn {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 10px;
  }

  .bank-name-text {
    font-size: 12px;
  }

  /* Timer compact */
  .deadline-panel {
    padding: 12px 14px;
  }

  .digit-box {
    font-size: 16px;
    min-width: 30px;
    padding: 3px 6px;
  }
}
</style>
