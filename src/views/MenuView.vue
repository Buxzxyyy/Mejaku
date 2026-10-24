<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import { ALL_MENU_ITEMS, MENU_CATEGORIES, MAIN_MENU_ITEM } from '@/data/mockData'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import type { MenuItem } from '@/types'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const showScanner = ref(false)
const showScanSuccessToast = ref(false)
const quickFilter = ref<'all' | 'popular' | 'spicy'>('all')

// Detect table parameter from barcode scan (e.g. ?table=A12 or ?meja=B07)
onMounted(() => {
  const tableParam = (route.query.table || route.query.meja) as string
  if (tableParam) {
    const cleanTable = tableParam.toUpperCase()
    orderStore.setTable({
      tableNumber: cleanTable,
      isVerified: true,
    })
    showScanSuccessToast.value = true
    setTimeout(() => {
      showScanSuccessToast.value = false
    }, 4500)
  }
})

// Filter menu items by category, search text, and quick filter
const filteredMenuItems = computed(() => {
  let list = ALL_MENU_ITEMS

  // Category filter
  if (selectedCategory.value !== 'all') {
    list = list.filter((item) => item.category === selectedCategory.value)
  }

  // Quick filter
  if (quickFilter.value === 'popular') {
    list = list.filter((item) => (item.rating && item.rating >= 4.8) || item.badge?.includes('🔥'))
  } else if (quickFilter.value === 'spicy') {
    list = list.filter((item) => item.spices && item.spices.some((s) => s.emoji?.includes('🌶️')))
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

    <!-- Scan success toast if entered via table QR query -->

    <!-- Scan success toast if entered via table QR query -->
    <Transition name="fade-slide">
      <div v-if="showScanSuccessToast" class="scan-welcome-toast" role="alert">
        <div class="toast-icon-wrap">
          <CheckCircle :size="18" />
        </div>
        <div class="toast-text">
          <strong>QR Meja {{ orderStore.table.tableNumber }} Berhasil Terhubung!</strong>
          <span>Pesananmu akan langsung diantar oleh staf ke mejamu.</span>
        </div>
        <button
          type="button"
          class="toast-close"
          aria-label="Tutup notifikasi"
          @click="showScanSuccessToast = false"
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
              type="search"
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

          <!-- Quick Filter Chips -->
          <div class="quick-filter-row">
            <span class="quick-filter-label">Filter Cepat:</span>
            <button
              type="button"
              class="chip-btn"
              :class="{ active: quickFilter === 'all' }"
              @click="quickFilter = 'all'"
            >
              Semua
            </button>
            <button
              type="button"
              class="chip-btn"
              :class="{ active: quickFilter === 'popular' }"
              @click="quickFilter = 'popular'"
            >
              🔥 Paling Laris
            </button>
            <button
              type="button"
              class="chip-btn"
              :class="{ active: quickFilter === 'spicy' }"
              @click="quickFilter = 'spicy'"
            >
              🌶️ Bisa Pedas
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
            <span class="cat-icon">{{ cat.icon }}</span>
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

        <!-- Empty search results state -->
        <div v-if="filteredMenuItems.length === 0" class="empty-menu-state">
          <div class="empty-icon-box">
            <UtensilsCrossed :size="48" />
          </div>
          <h3 class="empty-title font-display">Tidak Ada Menu yang Cocok</h3>
          <p class="empty-desc">
            Kami tidak dapat menemukan hidangan dengan kata kunci "{{ searchQuery }}". Coba cari kata kunci lain seperti "nasi", "sate", "soto", atau "cendol".
          </p>
          <button
            type="button"
            class="btn-primary empty-btn"
            @click="clearSearch(); selectedCategory = 'all'"
          >
            Lihat Semua Menu
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
        <div class="container-app cart-bar-inner">
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
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight :size="18" />
            </RouterLink>
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
  gap: 32px;
  align-items: center;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  margin-bottom: 24px;
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
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 90;
  pointer-events: none;
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
}

.cart-pill-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #FFFFFF;
  color: var(--primary);
  font-size: 11px;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
@media (max-width: 900px) {
  .menu-hero-header {
    grid-template-columns: 1fr;
    padding: 24px;
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

  /* Fix: category nav must stay sticky and not be hidden behind other content */
  .categories-nav-sticky {
    top: 60px;
    padding: 8px 0;
    margin-bottom: 16px;
    /* Extend left/right to bleed to screen edges on mobile for scroll feel */
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .categories-scroll-row {
    gap: 8px;
    padding-bottom: 2px;
    /* Ensure full scroll on mobile without clipping */
    padding-right: 16px;
  }

  .cat-tab-btn {
    padding: 8px 14px;
    font-size: 13px;
    gap: 6px;
    /* Prevent shrinking on small screens */
    flex-shrink: 0;
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

  /* Floating cart bar: compact on mobile */
  .cart-bar-inner {
    padding: 12px 14px;
    gap: 10px;
  }

  .cart-item-name {
    font-size: 13px;
  }

  .cart-subtotal-price {
    font-size: 12px;
  }

  .cart-subtotal-price strong {
    font-size: 13px;
  }

  .cart-tax-hint {
    display: none;
  }

  .btn-checkout-floating {
    font-size: 13px;
    padding: 10px 16px;
  }

  /* Title row: prevent table tag from being pushed down */
  .cart-title-row {
    flex-wrap: nowrap;
    gap: 6px;
  }

  .cart-table-tag {
    white-space: nowrap;
    font-size: 10px;
  }
}
</style>
