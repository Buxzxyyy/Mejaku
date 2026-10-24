<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, RotateCcw, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()
const isExpanded = ref(false)

function handleReset() {
  orderStore.resetToDefault()
  window.location.reload()
}
</script>

<template>
  <aside class="demo-banner-container" aria-label="Informasi Mode Demo">
    <div class="demo-banner">
      <div class="banner-content">
        <div class="banner-pill">
          <Sparkles :size="13" class="sparkle-icon" />
          <span>Mode Demo Interaktif Frontend</span>
        </div>
        <p class="banner-text">
          Meja: <strong>{{ orderStore.table.tableNumber }} ({{ orderStore.table.venue }})</strong> · Data tersinkronisasi otomatis
        </p>
      </div>

      <div class="banner-actions">
        <button
          type="button"
          class="btn-reset-demo"
          title="Reset pilihan ke nilai default baseline referensi (Rp 72.600)"
          @click="handleReset"
        >
          <RotateCcw :size="13" />
          <span>Reset Default</span>
        </button>

        <button
          type="button"
          class="btn-toggle-info"
          :aria-expanded="isExpanded"
          @click="isExpanded = !isExpanded"
        >
          <span>Info Scope</span>
          <ChevronDown v-if="!isExpanded" :size="13" />
          <ChevronUp v-else :size="13" />
        </button>
      </div>
    </div>

    <!-- Collapsible detail about PRD demo assumptions -->
    <div v-if="isExpanded" class="demo-drawer animate-fade-in">
      <div class="drawer-grid">
        <div class="drawer-col">
          <strong>Ruang Lingkup MVP:</strong>
          <p>5 Layar Utama (Landing, Detail Makanan, Checkout, Pembayaran QRIS, Konfirmasi & Timeline Status Dapur).</p>
        </div>
        <div class="drawer-col">
          <strong>Kalkulasi Authoritative:</strong>
          <p>58.000 (dasar) + 5.000 (sambal) = 63.000. Biaya layanan: 3.000. Pajak 10%: 6.600. Total = 72.600.</p>
        </div>
        <div class="drawer-col">
          <strong>Keamanan:</strong>
          <p>Demo ini adalah simulasi antarmuka klien. Tidak ada data rahasia/PIN yang diminta atau disimpan.</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.demo-banner-container {
  background-color: #1E293B;
  color: #F8FAFC;
  font-size: 12px;
  border-bottom: 1px solid #334155;
  position: relative;
  z-index: 99;
}

.demo-banner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.banner-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: rgba(249, 115, 22, 0.2);
  color: #FB923C;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(249, 115, 22, 0.4);
}

.sparkle-icon {
  animation: spinSlow 4s linear infinite;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.banner-text {
  color: #CBD5E1;
  margin: 0;
}

.banner-text strong {
  color: #FFFFFF;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-reset-demo,
.btn-toggle-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
}

.btn-reset-demo:hover,
.btn-toggle-info:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.demo-drawer {
  background-color: #0F172A;
  border-top: 1px solid #334155;
  padding: 12px 20px;
}

.drawer-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.drawer-col strong {
  color: #F97316;
  display: block;
  margin-bottom: 2px;
}

.drawer-col p {
  color: #94A3B8;
  margin: 0;
  line-height: 1.4;
}
</style>
