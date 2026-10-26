<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  Search,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Flame,
  Star,
  CheckCircle,
  X,
  SlidersHorizontal,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-vue-next'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import FoodCard from '@/components/common/FoodCard.vue'
import QrScannerModal from '@/components/common/QrScannerModal.vue'
import { MENU_CATEGORIES } from '@/utils/categories'
import { transformBackendMenuItem } from '@/utils/adapters'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import type { MenuItem } from '@/types'
import { api } from '@/api/client'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const menuItems = ref<MenuItem[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const searchQuery = ref('')
const selectedCategory = ref('all')
const showScanner = ref(false)
const scanToast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let scanToastTimer: ReturnType<typeof setTimeout> | null = null

async function applyTableFromRoute() {
  const tableParam = ((route.params.tableCode as string) || (route.query.table as string) || (route.query.meja as string))
  if (!tableParam) return

  const cleanTable = tableParam.toUpperCase()
  const isValid = await orderStore.setTable({ tableNumber: cleanTable })

  if (isValid) {
    scanToast.value = {
      type: 'success',
      message: `QR Meja ${orderStore.table.tableNumber} berhasil terhubung! Pesananmu akan diantar ke mejamu.`,
    }
  } else {
    scanToast.value = {
      type: 'error',
      message: `Meja ${cleanTable} tidak ditemukan atau tidak aktif. Pindai QR yang tertempel di meja.`,
    }
  }

  if (scanToastTimer) clearTimeout(scanToastTimer)
  scanToastTimer = setTimeout(() => {
    scanToast.value = null
  }, 4500)
}

watch(
  () => [route.params.tableCode, route.query.table, route.query.meja],
  () => applyTableFromRoute()
)

async function loadMenu() {
  isLoading.value = true
  fetchError.value = null
  try {
    const res = await api.getMenus()
    if (res.data && Array.isArray(res.data)) {
      menuItems.value = res.data.map(transformBackendMenuItem)
    } else {
      menuItems.value = []
    }
  } catch (err: any) {
    fetchError.value = 'Gagal memuat menu dari server backend.'
    menuItems.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  applyTableFromRoute()
  loadMenu()
})

// Filter menu items by category and search text
const filteredMenuItems = computed(() => {
  let list = menuItems.value

  // Category filter
  if (selectedCategory.value !== 'all') {
    list = list.filter((item) => item.category === selectedCategory.value)
  }

  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.merchant.toLowerCase().includes(q)
    )
  }

  return list
})

function handleSelectFood(item: MenuItem) {
  orderStore.setActiveItem(item)
  router.push(`/menu/${item.slug}`)
}

function handleQuickAddFood(item: MenuItem) {
  orderStore.addItemToCart(item)
}

function handleCategoryChange(catId: string) {
  selectedCategory.value = catId
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="menu-page">
    <AppNavbar />

    <!-- Scan result toast (success / invalid table) -->
    <Transition name="fade-slide">
      <div
        v-if="scanToast"
        class="scan-welcome-toast"
        :class="{ 'is-error': scanToast.type === 'error' }"
        role="alert"
      >
        <div class="toast-icon-wrap">
          <CheckCircle v-if="scanToast.type === 'success'" :size="18" />
          <X v-else :size="18" />
        </div>
        <div class="toast-text">
          <strong>{{ scanToast.type === 'success' ? 'QR Meja Terhubung!' : 'QR Meja Tidak Valid' }}</strong>
          <span>{{ scanToast.message }}</span>
        </div>
        <button
          type="button"
          class="toast-close"
          aria-label="Tutup notifikasi"
          @click="scanToast = null"
        >
          <X :size="16" />
        </button>
      </div>
    </Transition>

    <main class="container-app menu-main">
      <!-- 1. VENUE HEADER & SEARCH -->
      <header class="menu-hero-header">
        <div class="menu-header-copy">
          <div class="hero-badge">
            <Sparkles :size="14" />
            <span>BUKU MENU DIGITAL MEJAKU</span>
          </div>

          <h1 class="font-display menu-h1">
            Menu Kuliner Pilihan
            <span class="gradient-text-accent">Langsung ke Mejamu</span>
          </h1>

          <p class="menu-header-desc">
            Pindai barcode meja terverifikasi. Pilih hidangan kaki lima & pujasera favorit, sesuaikan porsi & level pedas, lalu bayar secara online tanpa antre kasir.
          </p>

          <!-- Status badges row -->
          <div class="venue-badges-row">
            <div class="venue-badge">
              <Clock :size="14" />
              <span>12–18 Mnt Siap Saji</span>
            </div>
            <div class="venue-badge">
              <Star :size="14" class="star-color" />
              <span>Rating 4.9 (1.200+ ulasan)</span>
            </div>
            <div class="venue-badge">
              <CheckCircle :size="14" class="check-color" />
              <span>Dapur Terhubung Otomatis</span>
            </div>
          </div>
        </div>

        <!-- Search Box Container -->
        <div class="search-box-card">
          <label for="menu-search-input" class="search-label font-display">
            Cari Makanan & Minuman
          </label>
          <div class="search-input-wrapper">
            <Search :size="18" class="search-icon" />
            <input
              id="menu-search-input"
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              placeholder="Cari nasi campur, sate, soto, es cendol..."
              class="search-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="clear-search-btn"
              aria-label="Hapus pencarian"
              @click="clearSearch"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </header>

      <!-- 2. STICKY CATEGORIES TABS -->
      <nav class="categories-nav-sticky" aria-label="Kategori Menu">
        <div class="categories-scroll-row">
          <button
            v-for="cat in MENU_CATEGORIES"
            :key="cat.id"
            type="button"
            class="cat-tab-btn"
            :class="{ active: selectedCategory === cat.id }"
            @click="handleCategoryChange(cat.id)"
          >
            <span v-if="cat.icon" class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </button>
        </div>
      </nav>

      <!-- 4. MENU ITEMS GRID -->
      <section class="menu-catalog-section" aria-labelledby="catalog-heading">
        <div class="section-title-row">
          <div>
            <h2 id="catalog-heading" class="font-display catalog-h2">
              {{
                searchQuery
                  ? `Hasil Pencarian: "${searchQuery}"`
                  : MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Daftar Menu'
              }}
            </h2>
            <p class="catalog-count-text">
              Menampilkan {{ filteredMenuItems.length }} hidangan lezat siap diantar ke Meja {{ orderStore.table.tableNumber }}
            </p>
          </div>

        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="empty-menu-state" style="padding: 48px 16px;">
          <div class="empty-icon-box animate-spin-slow">
            <UtensilsCrossed :size="40" />
          </div>
          <h3 class="empty-title font-display">Memuat Menu Dapur...</h3>
          <p class="empty-desc">Mengambil data menu langsung dari server backend.</p>
        </div>

        <!-- Empty search results / error state -->
        <div v-else-if="filteredMenuItems.length === 0" class="empty-menu-state">
          <div class="empty-icon-box">
            <UtensilsCrossed :size="48" />
          </div>
          <h3 class="empty-title font-display">{{ fetchError || 'Tidak Ada Menu yang Cocok' }}</h3>
          <p class="empty-desc">
            {{ fetchError ? 'Silakan periksa koneksi backend atau coba muat ulang.' : `Kami tidak dapat menemukan hidangan dengan kata kunci "${searchQuery}". Coba kata kunci lain atau lihat seluruh menu.` }}
          </p>
          <button
            type="button"
            class="btn-primary empty-btn"
            @click="clearSearch(); selectedCategory = 'all'; loadMenu()"
          >
            Muat Ulang Semua Menu
          </button>
        </div>

        <!-- Food cards grid -->
        <div v-else class="menu-cards-grid">
          <FoodCard
            v-for="item in filteredMenuItems"
            :key="item.id"
            :item="item"
            @select="handleSelectFood"
            @add="handleQuickAddFood"
          />
        </div>
      </section>
    </main>

    <!-- 5. FLOATING BOTTOM CART BAR (ONLY appears when cart has items) -->
    <Transition name="cart-slide">
      <aside
        v-if="orderStore.cartItems.length > 0 && orderStore.totalQuantity > 0"
        class="floating-cart-bar"
        aria-label="Ringkasan Pesanan"
      >
        <div class="container-app floating-cart-container">
          <div class="cart-bar-inner">
            <div class="cart-bar-left">
              <div class="cart-badge-icon">
                <ShoppingBag :size="20" />
                <span class="cart-pill-count">{{ orderStore.totalQuantity }}</span>
              </div>

              <div class="cart-text-details">
                <div class="cart-title-row">
                  <span class="cart-item-name">{{ orderStore.totalQuantity }} Menu Dipilih</span>
                  <span class="cart-table-tag">Meja {{ orderStore.table.tableNumber }}</span>
                </div>
                <div class="cart-subtotal-price">
                  Total: <strong>{{ formatRupiah(orderStore.pricing.total) }}</strong>
                  <span class="cart-tax-hint">(Termasuk Pajak & Layanan)</span>
                </div>
              </div>
            </div>

            <div class="cart-bar-right">
              <RouterLink to="/checkout" class="btn-checkout-floating">
                <span class="checkout-btn-full">Lanjut ke Pembayaran</span>
                <span class="checkout-btn-short">Lanjut Bayar</span>
                <ArrowRight :size="18" />
              </RouterLink>
            </div>
          </div>
        </div>
      </aside>
    </Transition>

    <AppFooter />

    <!-- QR Scanner Modal -->
    <QrScannerModal
      v-model="showScanner"
    />
  </div>
</template>

<style scoped>
.menu-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  padding-bottom: 0;
}

/* 1. TABLE STATUS BAR */
.table-status-bar {
  background-color: #FBF6F0;
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
  position: relative;
  z-index: 20;
}

.table-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.table-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #E6F4EA;
  color: #137333;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 13px;
  border: 1px solid rgba(19, 115, 51, 0.2);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0F9D58;
  box-shadow: 0 0 0 3px rgba(15, 157, 88, 0.25);
  animation: pulse-ring 2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(15, 157, 88, 0.5); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(15, 157, 88, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(15, 157, 88, 0); }
}

.verified-tag {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #CEEAD6;
  padding: 2px 6px;
  border-radius: 4px;
}

.table-divider {
  color: #C4B5A5;
}

.venue-location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-muted);
}

.loc-icon {
  color: var(--primary);
}

.btn-rescan {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: 1px dashed var(--primary);
  color: var(--primary);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-rescan:hover {
  background-color: var(--surface-warm);
  border-style: solid;
  transform: translateY(-1px);
}

/* Scan Welcome Toast */
.scan-welcome-toast {
  position: fixed;
  top: 85px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #1E4620;
  color: #FFFFFF;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  max-width: 420px;
}

.toast-icon-wrap {
  color: #81C995;
  flex-shrink: 0;
}

.scan-welcome-toast.is-error {
  background-color: #7F1D1D;
}

.scan-welcome-toast.is-error .toast-icon-wrap {
  color: #FCA5A5;
}

.toast-text {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.toast-close {
  background: transparent;
  border: none;
  color: #E2E8F0;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
}

/* 2. MENU HERO HEADER */
.menu-main {
  padding-top: 28px;
  padding-bottom: 120px;
}

.menu-hero-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: center;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
  margin-bottom: 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--surface-warm);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
}

.menu-h1 {
  font-size: 38px;
  line-height: 1.15;
  color: var(--text-heading);
  margin-bottom: 12px;
}

.menu-header-desc {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.venue-badges-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.venue-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading);
  background-color: #FAF4EE;
  padding: 6px 12px;
  border-radius: var(--radius-full);
}

.star-color {
  color: #F59E0B;
  fill: #F59E0B;
}

.check-color {
  color: #10B981;
}

/* Search Box Card */
.search-box-card {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.search-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-heading);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  font-size: 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  color: var(--text-heading);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(184, 80, 24, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.clear-search-btn:hover {
  color: var(--text-heading);
}

.quick-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-filter-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.chip-btn {
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-body);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.chip-btn.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
}

/* 3. STICKY CATEGORIES BAR */
.categories-nav-sticky {
  position: sticky;
  top: 72px;
  z-index: 30;
  background-color: rgba(253, 248, 243, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(226, 212, 201, 0.7);
}

.categories-scroll-row {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.categories-scroll-row::-webkit-scrollbar {
  display: none;
}

.cat-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-heading);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s var(--ease-spring);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.cat-tab-btn:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(184, 80, 24, 0.12);
}

.cat-tab-btn.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(184, 80, 24, 0.28);
}

/* 4. FEATURED HERO BANNER */
.featured-hero-banner {
  margin-bottom: 36px;
}

.featured-card {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(120, 53, 15, 0.08);
  transition: transform 0.3s ease;
}

.featured-card:hover {
  transform: translateY(-3px);
}

.featured-img-col {
  position: relative;
  min-height: 280px;
  background-color: var(--surface-warm);
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-ribbon {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.featured-info-col {
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-badge-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.merchant-tag {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-heading);
}

.star-filled {
  color: #F59E0B;
  fill: #F59E0B;
}

.featured-title {
  font-size: 28px;
  line-height: 1.2;
  color: var(--text-heading);
  margin-bottom: 12px;
}

.featured-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px dashed var(--border);
}

.price-container {
  display: flex;
  flex-direction: column;
}

.price-tag {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
}

.price-amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.btn-featured-order {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-full);
}

/* 5. CATALOG SECTION */
.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.catalog-h2 {
  font-size: 26px;
  color: var(--text-heading);
  margin-bottom: 4px;
}

.catalog-count-text {
  font-size: 14px;
  color: var(--text-muted);
}

.btn-reset-filters {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.menu-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Empty state */
.empty-menu-state {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--surface-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 22px;
  color: var(--text-heading);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 440px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.empty-btn {
  padding: 10px 24px;
  border-radius: var(--radius-full);
}

/* 6. FLOATING BOTTOM CART BAR */
.floating-cart-bar {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 90;
  pointer-events: none;
}

.floating-cart-container {
  pointer-events: none;
  width: 100%;
}

.cart-bar-inner {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #2D1A10;
  color: #FFFFFF;
  padding: 14px 24px;
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.checkout-btn-full {
  display: inline;
}

.checkout-btn-short {
  display: none;
}

.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-badge-icon {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
  overflow: visible;
}

.cart-pill-count {
  position: absolute;
  top: -3px;
  right: -3px;
  background-color: #FFFFFF;
  color: var(--primary);
  font-size: 11px;
  font-weight: 900;
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  z-index: 5;
}

.cart-text-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-item-name {
  font-weight: 700;
  font-size: 14px;
  color: #FFFFFF;
}

.cart-table-tag {
  background-color: rgba(255, 255, 255, 0.15);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  color: #FFD2A8;
}

.cart-subtotal-price {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.cart-subtotal-price strong {
  color: #FFB37C;
  font-size: 15px;
}

.cart-tax-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 6px;
}

.btn-checkout-floating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary);
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 800;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(184, 80, 24, 0.4);
}

.btn-checkout-floating:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(184, 80, 24, 0.5);
}

/* Animations */
.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: all 0.35s var(--ease-spring);
}

.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* Responsive adjustments */
/* Tablet-landscape / small desktop: keep 2-col but reduce padding slightly */
@media (max-width: 1100px) and (min-width: 901px) {
  .menu-hero-header {
    padding: 32px 36px;
    gap: 28px;
  }
}

@media (max-width: 900px) {
  .menu-hero-header {
    grid-template-columns: 1fr;
    padding: 28px;
    gap: 20px;
  }

  .featured-card {
    grid-template-columns: 1fr;
  }

  .featured-img-col {
    min-height: 200px;
  }

  .featured-info-col {
    padding: 24px;
  }
}

@media (max-width: 640px) {
  .menu-main {
    padding-top: 16px;
    padding-bottom: 140px;
  }

  .menu-h1 {
    font-size: 24px;
  }

  .menu-header-desc {
    font-size: 13px;
  }

  /* Fix: category nav does NOT stick on mobile - stays static at top of list so it doesn't block screen */
  .categories-nav-sticky {
    position: static;
    top: auto;
    padding: 8px 0;
    margin-bottom: 16px;
  }

  /* MASALAH 4 FIX: Filter category wrap jadi 2-kolom grid di mobile */
  .categories-scroll-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    overflow-x: visible;
    padding-bottom: 2px;
    padding-right: 0;
  }

  .cat-tab-btn {
    width: 100%;
    justify-content: center;
    padding: 9px 8px;
    font-size: 13px;
    gap: 5px;
  }

  /* Quick filter chips: ensure wrapping and sizing are compact */
  .quick-filter-row {
    gap: 6px;
  }

  .chip-btn {
    font-size: 11px;
    padding: 4px 9px;
  }

  /* catalog heading - prevent item count from wrapping */
  .catalog-count-text {
    font-size: 12px;
    white-space: normal;
    line-height: 1.4;
  }

  .catalog-h2 {
    font-size: 20px;
  }

  .table-bar-content {
    flex-direction: column;
    align-items: flex-start;
  }

  /* Universal Mobile Responsive: Floating cart bar adapts fluidly on any screen width */
  .floating-cart-bar {
    bottom: 20px;
    left: 0;
    right: 0;
    width: 100%;
  }

  .floating-cart-container {
    padding-left: 14px;
    padding-right: 14px;
  }

  .cart-bar-inner {
    padding: 11px 14px;
    gap: 8px;
    border-radius: var(--radius-lg);
    box-sizing: border-box;
    width: 100%;
    overflow: visible;
  }

  .cart-bar-left {
    min-width: 0;
    flex: 1 1 auto;
    gap: 8px;
    overflow: visible;
    align-items: center;
  }

  .cart-badge-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    position: relative;
    overflow: visible;
  }

  .cart-text-details {
    min-width: 0;
    overflow: hidden;
  }

  .cart-title-row {
    flex-wrap: nowrap;
    gap: 4px;
    min-width: 0;
  }

  .cart-item-name {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cart-table-tag {
    white-space: nowrap;
    font-size: 10px;
    padding: 1px 5px;
    flex-shrink: 0;
  }

  .cart-subtotal-price {
    font-size: 11px;
    white-space: nowrap;
  }

  .cart-subtotal-price strong {
    font-size: 12px;
  }

  .cart-tax-hint {
    display: none;
  }

  .cart-bar-right {
    flex-shrink: 0;
  }

  .checkout-btn-full {
    display: none;
  }

  .checkout-btn-short {
    display: inline;
  }

  .btn-checkout-floating {
    font-size: 12px;
    padding: 9px 12px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}
</style>
