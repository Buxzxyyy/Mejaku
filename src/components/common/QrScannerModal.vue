<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QrCode, X, CheckCircle, Sparkles, MapPin } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const orderStore = useOrderStore()

const isSuccess = ref(false)
const selectedTable = ref('A12')

const tables = [
  { id: 'A12', name: 'Meja A12', venue: 'Jakarta Culinary Hall (Lantai 2)', area: 'Blok B' },
  { id: 'B07', name: 'Meja B07', venue: 'Pujasera Sunset (Lantai 1)', area: 'Outdoor Area' },
  { id: 'C15', name: 'Meja C15', venue: 'Food Oasis Atrium', area: 'Zona Santai' },
]

function closeModal() {
  emit('update:modelValue', false)
  isSuccess.value = false
}

function handleScanTable(tableItem: (typeof tables)[0]) {
  selectedTable.value = tableItem.id
  isSuccess.value = true

  // Update table context in store
  orderStore.table = {
    tableNumber: tableItem.id,
    floor: tableItem.id === 'A12' ? 2 : 1,
    venue: tableItem.venue.split(' (')[0],
    area: tableItem.area,
    isVerified: true,
  }

  setTimeout(() => {
    closeModal()
    router.push('/menu/nasi-campur-bali-agung')
  }, 1200)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="scanner-backdrop" @click.self="closeModal">
      <div class="scanner-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-modal-title">
        <!-- Header -->
        <div class="scanner-header">
          <div class="header-left">
            <div class="scanner-badge">
              <QrCode :size="16" />
              <span>Kamera Pemindai QR Meja</span>
            </div>
            <h3 id="scanner-modal-title" class="font-display scanner-title">
              Pindai QR di Mejamu
            </h3>
          </div>
          <button type="button" class="close-btn" aria-label="Tutup pemindai" @click="closeModal">
            <X :size="20" />
          </button>
        </div>

        <!-- Camera Viewport Simulation -->
        <div class="camera-viewport">
          <!-- Live scan line animation -->
          <div v-if="!isSuccess" class="laser-line" />

          <!-- Corner Reticle Markers -->
          <div class="reticle-corner top-left" />
          <div class="reticle-corner top-right" />
          <div class="reticle-corner bottom-left" />
          <div class="reticle-corner bottom-right" />

          <!-- Centered QR Target Graphic -->
          <div v-if="!isSuccess" class="qr-target-center">
            <QrCode :size="120" stroke-width="1.2" class="target-icon" />
            <span class="target-hint">Arahkan kamera ke stiker MejaKu</span>
          </div>

          <!-- Success scan feedback overlay -->
          <div v-else class="scan-success-overlay animate-fade-in">
            <CheckCircle :size="54" class="success-icon" />
            <h4 class="success-title">QR Meja Terverifikasi!</h4>
            <p class="success-subtitle">Membuka menu kuliner meja {{ selectedTable }}...</p>
          </div>
        </div>

        <!-- Simulated Table QR Sticker options -->
        <div class="sample-tables-section">
          <div class="sample-label">
            <Sparkles :size="14" />
            <span>Pilih stiker simulasi meja untuk demo instan:</span>
          </div>

          <div class="tables-grid">
            <button
              v-for="t in tables"
              :key="t.id"
              type="button"
              class="table-card-btn"
              :class="{ selected: selectedTable === t.id && isSuccess }"
              @click="handleScanTable(t)"
            >
              <div class="table-card-top">
                <span class="table-number">{{ t.name }}</span>
                <span class="badge-qr">Pindai</span>
              </div>
              <div class="table-card-venue">
                <MapPin :size="12" />
                <span>{{ t.venue }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer notice -->
        <div class="scanner-footer">
          <p>
            💡 Di pujasera asli, pelanggan cukup membuka aplikasi kamera bawaan ponsel lalu arahkan ke QR stiker meja tanpa download aplikasi apa pun.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.scanner-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.scanner-modal {
  background-color: var(--surface);
  border-radius: var(--radius-xl);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border);
  animation: modalScale 0.25s var(--ease-spring);
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(16px);
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
  padding: 20px 24px 16px 24px;
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
  font-size: 26px;
  color: var(--text-primary);
  line-height: 1.2;
}

.close-btn {
  color: var(--text-secondary);
  padding: 6px;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: var(--surface-warm);
  color: var(--text-primary);
}

/* Simulated Camera Viewport */
.camera-viewport {
  position: relative;
  height: 240px;
  margin: 0 24px;
  background-color: #0F172A;
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #334155;
}

.laser-line {
  position: absolute;
  left: 10%;
  right: 10%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #F97316, #EA580C, #F97316, transparent);
  box-shadow: 0 0 14px #F97316;
  z-index: 10;
  animation: scanLaser 2s linear infinite;
}

@keyframes scanLaser {
  0% {
    top: 15%;
  }
  50% {
    top: 85%;
  }
  100% {
    top: 15%;
  }
}

/* Reticle corners */
.reticle-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 3px solid var(--accent);
  z-index: 5;
}

.reticle-corner.top-left {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.reticle-corner.top-right {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.reticle-corner.bottom-left {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.reticle-corner.bottom-right {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.qr-target-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94A3B8;
  opacity: 0.8;
}

.target-icon {
  color: #CBD5E1;
}

.target-hint {
  font-size: 12px;
  color: #94A3B8;
  letter-spacing: 0.5px;
}

.scan-success-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(21, 128, 61, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  padding: 20px;
  text-align: center;
  z-index: 20;
}

.success-icon {
  margin-bottom: 12px;
  animation: scalePop 0.3s var(--ease-spring);
}

@keyframes scalePop {
  from { transform: scale(0.6); }
  to { transform: scale(1); }
}

.success-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.success-subtitle {
  font-size: 13px;
  opacity: 0.9;
}

/* Sample tables section */
.sample-tables-section {
  padding: 18px 24px 0 24px;
}

.sample-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 10px;
}

.tables-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-card-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: var(--surface-warm);
  border: 1.5px solid var(--border);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all 0.18s ease;
}

.table-card-btn:hover {
  background-color: var(--primary-soft);
  border-color: var(--primary);
  transform: translateX(4px);
}

.table-card-btn.selected {
  background-color: var(--success-soft);
  border-color: var(--success);
}

.table-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-number {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-primary);
}

.badge-qr {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: #FFFFFF;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.table-card-venue {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.scanner-footer {
  padding: 16px 24px 20px 24px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
