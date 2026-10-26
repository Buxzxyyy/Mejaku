<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  QrCode,
  X,
  CheckCircle,
  Sparkles,
  Camera,
  AlertCircle,
  RefreshCw,
} from 'lucide-vue-next'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { useOrderStore } from '@/stores/orderStore'
import { api } from '@/api/client'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref<'camera' | 'samples'>('camera')
const isSuccess = ref(false)
const selectedTable = ref('')
const cameraError = ref('')
const scanError = ref('')
const isCameraLoading = ref(false)

const tables = ref<ScannerTable[]>([])
const isLoadingTables = ref(false)
const tablesError = ref('')

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let mediaStream: MediaStream | null = null
let animationFrameId: number | null = null

interface ScannerTable {
  id: number
  code: string
  floor: string
  qrUrl?: string
}

/**
 * Ambil daftar meja aktif dari database. Dipanggil setiap modal dibuka
 * supaya meja yang baru dibuat di dashboard langsung muncul.
 */
async function loadTables() {
  isLoadingTables.value = true
  tablesError.value = ''

  try {
    const res = await api.getTables()
    const list = Array.isArray(res.data) ? res.data : []
    tables.value = list.map((t: any) => ({
      id: Number(t.id),
      code: String(t.code || '').toUpperCase(),
      floor: String(t.floor || ''),
    }))
    if (!selectedTable.value && tables.value.length > 0) {
      selectedTable.value = tables.value[0].code
    }
    await generateTableQrs()
  } catch {
    tables.value = []
    tablesError.value = 'Gagal memuat daftar meja dari server. Periksa koneksi backend.'
  } finally {
    isLoadingTables.value = false
  }
}

// Generate QR preview dari kode meja yang benar-benar ada di database.
// Format kanonis: {origin}/pesan/{CODE} (sama dengan QR cetak dashboard).
async function generateTableQrs() {
  const origin = window.location.origin
  for (const t of tables.value) {
    try {
      t.qrUrl = await QRCode.toDataURL(`${origin}/pesan/${encodeURIComponent(t.code)}`, {
        width: 220,
        margin: 1,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
    } catch {
      t.qrUrl = ''
    }
  }
}

// Camera lifecycle management
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      isSuccess.value = false
      scanError.value = ''
      cameraError.value = ''
      await loadTables()
      if (activeTab.value === 'camera') {
        await nextTick()
        startCamera()
      }
    } else {
      stopCamera()
    }
  }
)

watch(activeTab, async (newTab) => {
  if (newTab === 'camera' && props.modelValue) {
    await nextTick()
    startCamera()
  } else {
    stopCamera()
  }
})

async function startCamera() {
  cameraError.value = ''
  isCameraLoading.value = true

  // Check camera API support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraError.value = 'Browser ini tidak mendukung akses kamera perangkat.'
    isCameraLoading.value = false
    return
  }

  try {
    // Request environment-facing (rear) camera on mobile, fallback to any camera
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      videoRef.value.setAttribute('playsinline', 'true') // Required for iOS
      await videoRef.value.play()
      isCameraLoading.value = false
      requestScanTick()
    }
  } catch (err: any) {
    isCameraLoading.value = false
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Izin kamera ditolak. Silakan izinkan kamera di browser atau pilih meja dari tab QR Stiker Meja.'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = 'Kamera tidak ditemukan pada perangkat ini. Silakan pilih meja dari tab QR Stiker Meja.'
    } else {
      cameraError.value = 'Tidak dapat memulai kamera: ' + (err.message || 'Periksa pengaturan kamera.')
    }
  }
}

function stopCamera() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function requestScanTick() {
  if (!props.modelValue || activeTab.value !== 'camera' || isSuccess.value || scanError.value) return

  const video = videoRef.value
  if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
    const canvas = canvasRef.value || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code && code.data) {
        handleRawScanData(code.data)
        return
      }
    }
  }

  animationFrameId = requestAnimationFrame(requestScanTick)
}

// Parse scanned content (supports full URLs like ?table=A12,
// /pesan/A12, plain text A12, or MEJA-A12).
async function handleRawScanData(rawText: string) {
  let detectedCode = ''

  try {
    const parsedUrl = new URL(rawText)
    const tableParam =
      parsedUrl.searchParams.get('table') ||
      parsedUrl.searchParams.get('meja') ||
      parsedUrl.pathname.match(/\/pesan\/([A-Za-z0-9-]+)/)?.[1]
    if (tableParam) {
      detectedCode = tableParam.toUpperCase()
    }
  } catch {
    // Plain text scan
  }

  if (!detectedCode) {
    const upper = rawText.trim().toUpperCase()
    const mejaMatch = upper.match(/MEJA[\s-]*([A-Z0-9-]+)/)
    detectedCode = (mejaMatch?.[1] || upper.replace(/\s+/g, '')).toUpperCase()
  }

  if (!detectedCode) {
    scanError.value = 'Kode QR tidak valid. Gunakan QR yang tertempel di meja.'
    return
  }

  // Pastikan kode benar-benar ada di database, bukan hasil tebakan.
  if (tables.value.length === 0) {
    await loadTables()
  }

  const foundTable = tables.value.find((t) => t.code === detectedCode)
  if (!foundTable) {
    scanError.value = `Meja ${detectedCode} tidak ditemukan atau tidak aktif.`
    return
  }

  await applyVerifiedTable(foundTable)
}

async function applyVerifiedTable(tableItem: ScannerTable) {
  scanError.value = ''
  const isValid = await orderStore.setTable({ tableNumber: tableItem.code })
  if (!isValid) {
    scanError.value = `Meja ${tableItem.code} tidak ditemukan atau tidak aktif.`
    return
  }

  selectedTable.value = tableItem.code
  isSuccess.value = true
  playBeepSound()

  if (navigator.vibrate) {
    try {
      navigator.vibrate([60, 40, 60])
    } catch {
      // Ignore vibration error
    }
  }

  stopCamera()

  setTimeout(() => {
    closeModal()
    router.push({ path: '/', query: { table: tableItem.code } })
  }, 1200)
}

function retryScan() {
  scanError.value = ''
  if (props.modelValue && activeTab.value === 'camera' && !isSuccess.value) {
    requestScanTick()
  }
}

// Gentle pleasant scanner beep feedback
function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audioCtx.currentTime) // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1) // E6 note

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.12)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

function closeModal() {
  stopCamera()
  emit('update:modelValue', false)
  isSuccess.value = false
  scanError.value = ''
}

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="scanner-backdrop" @click.self="closeModal">
      <div
        class="scanner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-modal-title"
      >
        <!-- Header -->
        <div class="scanner-header">
          <div class="header-left">
            <div class="scanner-badge">
              <Camera :size="14" />
              <span>Pemindai Kamera Barcode & QR</span>
            </div>
            <h3 id="scanner-modal-title" class="font-display scanner-title">
              Pindai Meja MejaKu
            </h3>
          </div>
          <button
            type="button"
            class="close-btn"
            aria-label="Tutup pemindai"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Tab Selector: Live Camera vs QR stickers -->
        <div class="scanner-tabs-bar">
          <button
            type="button"
            class="scanner-tab-btn"
            :class="{ active: activeTab === 'camera' }"
            @click="activeTab = 'camera'"
          >
            <Camera :size="15" />
            <span>Kamera Live</span>
          </button>
          <button
            type="button"
            class="scanner-tab-btn"
            :class="{ active: activeTab === 'samples' }"
            @click="activeTab = 'samples'"
          >
            <QrCode :size="15" />
            <span>{{ isLoadingTables ? 'Memuat...' : `${tables.length} QR Stiker Meja` }}</span>
          </button>
        </div>

        <!-- TAB 1: Real Camera Scanner Viewport -->
        <div v-show="activeTab === 'camera'" class="camera-tab-content">
          <div class="camera-viewport">
            <!-- Hidden canvas for pixel analysis -->
            <canvas ref="canvasRef" class="hidden-scanner-canvas" />

            <!-- Live Video Feed from device camera -->
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="camera-video-feed"
            />

            <!-- Scan Laser Animation -->
            <div v-if="!isSuccess && !cameraError" class="laser-line" />

            <!-- Reticle Corners -->
            <div class="reticle-corner top-left" />
            <div class="reticle-corner top-right" />
            <div class="reticle-corner bottom-left" />
            <div class="reticle-corner bottom-right" />

            <!-- Loading Spinner -->
            <div v-if="isCameraLoading" class="camera-center-msg">
              <div class="loading-spin" />
              <span>Menyiapkan kamera ponsel...</span>
            </div>

            <!-- Error fallback inside viewport -->
            <div v-else-if="cameraError" class="camera-center-msg error-msg">
              <AlertCircle :size="32" class="error-icon" />
              <p class="error-text">{{ cameraError }}</p>
              <button
                type="button"
                class="btn-retry-camera"
                @click="startCamera"
              >
                Coba Kamera Lagi
              </button>
            </div>

            <!-- QR meja tidak valid -->
            <div v-else-if="scanError" class="camera-center-msg error-msg">
              <AlertCircle :size="32" class="error-icon" />
              <p class="error-text">{{ scanError }}</p>
              <button
                type="button"
                class="btn-retry-camera"
                @click="retryScan"
              >
                <RefreshCw :size="14" />
                Coba Pindai Lagi
              </button>
            </div>

            <!-- Scanning Guide Overlay -->
            <div v-else-if="!isSuccess" class="qr-target-guide">
              <span class="target-hint">Arahkan kamera ke kode QR di mejamu</span>
            </div>

            <!-- Success Overlay with Pop Animation -->
            <Transition name="scale-fade">
              <div v-if="isSuccess" class="scan-success-overlay">
                <CheckCircle :size="52" class="success-icon" />
                <h4 class="success-title">QR Meja Terverifikasi!</h4>
                <p class="success-subtitle">
                  Tersambung ke <strong>Meja {{ selectedTable }}</strong>. Membuka menu...
                </p>
              </div>
            </Transition>
          </div>

          <!-- Quick click-to-select fallback under camera -->
          <div v-if="tables.length > 0" class="quick-tables-row">
            <span class="quick-label">Atau pilih meja terdaftar:</span>
            <div class="quick-chips">
              <button
                v-for="t in tables"
                :key="t.code"
                type="button"
                class="quick-table-chip"
                :class="{ active: selectedTable === t.code && isSuccess }"
                @click="applyVerifiedTable(t)"
              >
                Meja {{ t.code }}
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: QR stickers for every active table in the database -->
        <div v-show="activeTab === 'samples'" class="samples-tab-content">
          <div v-if="isLoadingTables" class="samples-state">
            <div class="loading-spin dark-spin" />
            <span>Memuat daftar meja dari database...</span>
          </div>

          <div v-else-if="tablesError" class="samples-state error-state">
            <AlertCircle :size="28" />
            <p>{{ tablesError }}</p>
            <button type="button" class="btn-retry-camera" @click="loadTables">
              <RefreshCw :size="14" />
              Coba Muat Ulang
            </button>
          </div>

          <div v-else-if="tables.length === 0" class="samples-state">
            <QrCode :size="36" />
            <p>Belum ada meja aktif. Tambahkan meja dari dashboard admin terlebih dahulu.</p>
            <button type="button" class="btn-retry-camera" @click="loadTables">
              <RefreshCw :size="14" />
              Muat Ulang
            </button>
          </div>

          <template v-else>
            <div class="samples-intro">
              <Sparkles :size="16" class="sparkle-icon" />
              <p>
                Gunakan ponsel untuk memindai salah satu dari <strong>{{ tables.length }} QR stiker meja</strong> di bawah ini, atau klik tombol untuk memilih langsung:
              </p>
            </div>

            <div class="sample-qrs-grid">
              <div
                v-for="t in tables"
                :key="t.id"
                class="sample-qr-card"
                :class="{ selected: selectedTable === t.code && isSuccess }"
              >
                <!-- Sticker Header -->
                <div class="sticker-top">
                  <div class="sticker-brand">
                    <span class="brand-m">M</span>
                    <span class="brand-text">MejaKu</span>
                  </div>
                  <span class="sticker-floor">{{ t.floor || 'Meja' }}</span>
                </div>

                <!-- Generated QR Code Image -->
                <div class="qr-code-frame">
                  <img
                    v-if="t.qrUrl"
                    :src="t.qrUrl"
                    :alt="`QR Meja ${t.code}`"
                    class="generated-qr-img"
                  />
                  <div v-else class="qr-placeholder">
                    <QrCode :size="100" />
                  </div>
                </div>

                <!-- Table Info -->
                <div class="sticker-info">
                  <strong class="sticker-table-title">Meja {{ t.code }}</strong>
                  <span class="sticker-venue">Pindai QR ini untuk memesan</span>
                  <span class="sticker-area">{{ t.floor }}</span>
                </div>

                <!-- Action Button -->
                <button
                  type="button"
                  class="btn-apply-sticker"
                  @click="applyVerifiedTable(t)"
                >
                  Terapkan Meja {{ t.code }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer notice -->
        <div class="scanner-footer">
          <p>
            <strong>Info:</strong> Kamera pemindai membaca barcode & QR code secara otomatis secara real-time. Jika membuka web di HP lain, Anda dapat langsung mengarahkan kamera ke salah satu QR di atas!
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.scanner-backdrop {
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

.scanner-modal {
  background-color: #FFFFFF;
  border-radius: 24px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  border: 1px solid var(--border);
  animation: modalScale 0.25s var(--ease-spring);
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

.scanner-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 14px 24px;
  border-bottom: 1px solid var(--border);
}

.scanner-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  margin-bottom: 6px;
}

.scanner-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.close-btn {
  color: var(--text-secondary);
  background: transparent;
  border: none;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
  cursor: pointer;
}

.close-btn:hover {
  background-color: var(--surface-warm);
  color: var(--text-primary);
}

/* Tabs switcher */
.scanner-tabs-bar {
  display: flex;
  background-color: #F8FAFC;
  padding: 6px 20px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}

.scanner-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 700;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scanner-tab-btn.active {
  background-color: #FFFFFF;
  color: var(--primary);
  border-color: var(--border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Camera Viewport */
.camera-tab-content {
  padding: 16px 20px 8px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.camera-viewport {
  position: relative;
  height: 260px;
  background-color: #0F172A;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #334155;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6);
}

.hidden-scanner-canvas {
  display: none;
}

.camera-video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.laser-line {
  position: absolute;
  left: 10%;
  right: 10%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #F97316, #EA580C, #F97316, transparent);
  box-shadow: 0 0 16px #F97316;
  z-index: 10;
  animation: scanLaser 2s linear infinite;
  pointer-events: none;
}

@keyframes scanLaser {
  0% { top: 12%; }
  50% { top: 88%; }
  100% { top: 12%; }
}

.reticle-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 3px solid #F97316;
  z-index: 5;
  pointer-events: none;
}

.reticle-corner.top-left {
  top: 18px;
  left: 18px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.reticle-corner.top-right {
  top: 18px;
  right: 18px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.reticle-corner.bottom-left {
  bottom: 18px;
  left: 18px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.reticle-corner.bottom-right {
  bottom: 18px;
  right: 18px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.qr-target-guide {
  position: absolute;
  bottom: 16px;
  background: rgba(15, 23, 42, 0.8);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  z-index: 8;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.target-hint {
  font-size: 11.5px;
  color: #F8FAFC;
  font-weight: 600;
}

.camera-center-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #CBD5E1;
  text-align: center;
  padding: 20px;
  z-index: 6;
}

.loading-spin {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  color: #FCA5A5;
}

.error-icon {
  color: #EF4444;
}

.error-text {
  font-size: 12.5px;
  line-height: 1.45;
  margin: 0;
  max-width: 320px;
}

.btn-retry-camera {
  background-color: var(--primary);
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-full);
  cursor: pointer;
}

.scan-success-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(22, 101, 52, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  padding: 24px;
  text-align: center;
  z-index: 25;
}

.success-icon {
  margin-bottom: 10px;
  color: #86EFAC;
}

.success-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.success-subtitle {
  font-size: 13px;
  opacity: 0.95;
  margin: 0;
}

/* Quick chips */
.quick-tables-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-table-chip {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background-color: var(--surface-warm);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-table-chip:hover {
  background-color: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

.quick-table-chip.active {
  background-color: #22C55E;
  color: #FFFFFF;
  border-color: #22C55E;
}

/* TAB 2: QR stickers from database */
.samples-tab-content {
  padding: 16px 20px;
  overflow-y: auto;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.samples-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary);
  font-size: 13px;
}

.samples-state p {
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
}

.samples-state.error-state {
  color: #B91C1C;
}

.dark-spin {
  border-color: rgba(30, 41, 59, 0.15);
  border-top-color: var(--primary);
}

.samples-intro {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 12.5px;
  color: #92400E;
  line-height: 1.45;
}

.sparkle-icon {
  color: #D97706;
  flex-shrink: 0;
  margin-top: 2px;
}

.sample-qrs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.sample-qr-card {
  background: #FFFFFF;
  border: 2px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.sample-qr-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(194, 65, 12, 0.12);
  transform: translateY(-2px);
}

.sample-qr-card.selected {
  border-color: #22C55E;
  background-color: #F0FDF4;
}

.sticker-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.sticker-brand {
  display: flex;
  align-items: center;
  gap: 4px;
}

.brand-m {
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-primary);
}

.sticker-floor {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  background: #F1F5F9;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.qr-code-frame {
  width: 140px;
  height: 140px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.generated-qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sticker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.sticker-table-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
}

.sticker-venue {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
}

.sticker-area {
  font-size: 10px;
  color: var(--text-muted);
}

.btn-apply-sticker {
  width: 100%;
  background-color: #1E293B;
  color: #FFFFFF;
  border: none;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-apply-sticker:hover {
  background-color: var(--primary);
  transform: translateY(-1px);
}

/* Footer */
.scanner-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background-color: #F8FAFC;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}

.scanner-footer p {
  margin: 0;
}
</style>
