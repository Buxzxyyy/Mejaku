<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  Star,
  ShoppingBag,
  Check,
  ArrowLeft,
  X,
  Send,
  Sparkles,
} from 'lucide-vue-next'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import FoodCard from '@/components/common/FoodCard.vue'
import { MAIN_MENU_ITEM, RECOMMENDATIONS_DETAIL_ITEMS, getMenuItemBySlug } from '@/data/mockData'
import { useOrderStore } from '@/stores/orderStore'
import { formatRupiah } from '@/utils/pricing'
import type { PortionOption, SpiceOption, AddonOption, MenuItem } from '@/types'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const currentItem = computed(() => {
  const slug = route.params.slug as string
  return getMenuItemBySlug(slug)
})

const activeGalleryIndex = ref(0)
const isGalleryExpanded = ref(false)
const thumbnailsContainer = ref<HTMLElement | null>(null)

const galleryImages = computed(() => {
  return currentItem.value.gallery && currentItem.value.gallery.length > 0
    ? currentItem.value.gallery
    : [currentItem.value.image]
})

const MAX_VISIBLE = 5 // exactly 5 slots visible in initial row

// Extra images hidden behind the +N badge
const extraImagesCount = computed(() => {
  return Math.max(0, galleryImages.value.length - MAX_VISIBLE)
})

// If expanded or total <= 5, show all images. If not expanded, show only 5 slots.
const visibleThumbnails = computed(() => {
  if (isGalleryExpanded.value || galleryImages.value.length <= MAX_VISIBLE) {
    return galleryImages.value
  }
  return galleryImages.value.slice(0, MAX_VISIBLE)
})

// The +N overlay only shows on the 5th slot (index 4) when NOT expanded and there are extra images
function isOverflowSlot(idx: number): boolean {
  return !isGalleryExpanded.value && idx === MAX_VISIBLE - 1 && extraImagesCount.value > 0
}

// Mouse drag-to-scroll support for desktop
let isDragging = false
let startX = 0
let initialScrollLeft = 0
let dragDistance = 0

function handleMouseDown(e: MouseEvent) {
  const container = thumbnailsContainer.value
  if (!container) return
  isDragging = true
  dragDistance = 0
  startX = e.pageX - container.offsetLeft
  initialScrollLeft = container.scrollLeft
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  const container = thumbnailsContainer.value
  if (!container) return
  const x = e.pageX - container.offsetLeft
  const walk = x - startX
  dragDistance = Math.abs(walk)
  container.scrollLeft = initialScrollLeft - walk
}

function handleMouseUp() {
  isDragging = false
}

function handleMouseLeave() {
  isDragging = false
}

function handleThumbnailClick(idx: number, e?: MouseEvent) {
  if (dragDistance > 6) {
    dragDistance = 0
    return
  }

  if (isOverflowSlot(idx)) {
    // Expand to show all slots and scroll slightly to reveal the added slot(s)
    isGalleryExpanded.value = true
    activeGalleryIndex.value = idx
    nextTick(() => {
      const container = thumbnailsContainer.value
      if (container) {
        container.scrollBy({ left: 140, behavior: 'smooth' })
      }
    })
    return
  }

  activeGalleryIndex.value = idx

  // Auto-scroll thumbnail into view if partially hidden
  nextTick(() => {
    const container = thumbnailsContainer.value
    if (container && e?.currentTarget) {
      const btn = e.currentTarget as HTMLElement
      const btnLeft = btn.offsetLeft - container.offsetLeft
      const btnRight = btnLeft + btn.offsetWidth
      const containerLeft = container.scrollLeft
      const containerRight = containerLeft + container.clientWidth

      if (btnRight > containerRight) {
        container.scrollTo({ left: btnRight - container.clientWidth + 16, behavior: 'smooth' })
      } else if (btnLeft < containerLeft) {
        container.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' })
      }
    }
  })
}

// Sync orderStore active item and reset gallery index when item changes
watch(
  () => currentItem.value.id,
  () => {
    orderStore.setActiveItem(currentItem.value)
    activeGalleryIndex.value = 0
    isGalleryExpanded.value = false
    if (thumbnailsContainer.value) {
      thumbnailsContainer.value.scrollLeft = 0
    }
  },
  { immediate: true }
)

const breadcrumbItems = computed(() => [
  { label: 'Daftar Menu', to: '/' },
  { label: currentItem.value.merchant, to: '/' },
  { label: currentItem.value.name },
])

const currentUnitPrice = computed(() => {
  return orderStore.unitPrice
})

const currentButtonTotal = computed(() => {
  return currentUnitPrice.value * orderStore.quantity
})

function isPortionActive(p: PortionOption) {
  return orderStore.currentPortion?.id === p.id
}

function isSpiceActive(s: SpiceOption) {
  return orderStore.currentSpice?.id === s.id
}

function isAddonChecked(a: AddonOption) {
  return orderStore.currentAddons.some((item) => item.id === a.id)
}

function handleAddToCart() {
  orderStore.addItemToCart(
    currentItem.value,
    orderStore.currentPortion,
    orderStore.currentSpice,
    orderStore.currentAddons,
    orderStore.quantity,
    ''
  )
  router.push('/checkout')
}

function handleRecommendationClick(item: MenuItem) {
  router.push(`/menu/${item.slug}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Menu Rating Feature State
const showRatingModal = ref(false)
const userRating = ref(5)
const userReviewText = ref('')
const selectedTags = ref<string[]>([])
const reviewSubmittedToast = ref(false)
const availableRatingTags = ['Rasa Autentik 🌶️', 'Porsi Pas 👍', 'Bumbu Meresap 🤤', 'Penyajian Cepat ⚡', 'Higienis 🧼']

function toggleRatingTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx > -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function submitRating() {
  showRatingModal.value = false
  reviewSubmittedToast.value = true
  if (currentItem.value.reviewsCount !== undefined) {
    currentItem.value.reviewsCount++
  }
  setTimeout(() => {
    reviewSubmittedToast.value = false
  }, 4000)
}
</script>

<template>
  <div class="food-detail-page">
    <AppNavbar />

    <!-- Review Success Toast -->
    <Transition name="fade-slide">
      <div v-if="reviewSubmittedToast" class="rating-toast" role="alert">
        <div class="toast-star-icon">
          <Star :size="18" fill="#F59E0B" color="#F59E0B" />
        </div>
        <div class="toast-content">
          <strong>Terima kasih atas ulasanmu!</strong>
          <span>Rating {{ userRating }} bintang telah berhasil dicatat untuk {{ currentItem.name }}.</span>
        </div>
      </div>
    </Transition>

    <main class="container-app detail-main-content">
      <!-- Top Row: Back button aligned with Left Column, Breadcrumb on the Right -->
      <div class="top-nav-row">
        <RouterLink to="/" class="btn-back-menu" aria-label="Kembali ke buku menu">
          <ArrowLeft :size="16" />
          <span>Kembali ke Menu</span>
        </RouterLink>

        <AppBreadcrumb :items="breadcrumbItems" class="detail-breadcrumb" />
      </div>

      <!-- Main Two-Column Grid: Left (Gallery + Notes), Right (Sticky Title + Options) -->
      <div class="detail-grid">
        <!-- LEFT COLUMN: Gallery & Dietary Notes (Aligned with Back Button) -->
        <div class="gallery-column">
          <!-- Main Hero Image Frame -->
          <div class="main-image-frame card-surface">
            <Transition name="fade" mode="out-in">
              <img
                :key="activeGalleryIndex"
                :src="galleryImages[activeGalleryIndex] || currentItem.image"
                :alt="`${currentItem.name} foto ${activeGalleryIndex + 1}`"
                class="main-food-image"
              />
            </Transition>
            <div v-if="currentItem.badge" class="gallery-badge-overlay">
              <span>{{ currentItem.badge }}</span>
            </div>
          </div>

          <!-- Thumbnails: 5 slots by default, clicking +N expands and scrolls right -->
          <div
            ref="thumbnailsContainer"
            class="thumbnails-row"
            :class="{ 'is-expanded': isGalleryExpanded }"
            role="tablist"
            aria-label="Galeri Foto Makanan"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
          >
            <button
              v-for="(img, idx) in visibleThumbnails"
              :key="idx"
              type="button"
              class="thumb-btn"
              :class="{
                active: activeGalleryIndex === idx,
                'thumb-slot-extra': isOverflowSlot(idx),
              }"
              :aria-selected="activeGalleryIndex === idx"
              :aria-label="`Pilih foto ${idx + 1}`"
              @click="handleThumbnailClick(idx, $event)"
            >
              <img
                :src="img"
                :alt="`Thumbnail ${idx + 1}`"
                class="thumb-img"
                :class="{ 'thumb-img-blurred': isOverflowSlot(idx) }"
                draggable="false"
              />

              <!-- +N overlay on 5th slot when there are more images and not expanded -->
              <div v-if="isOverflowSlot(idx)" class="thumb-extra-overlay">
                +{{ extraImagesCount }}
              </div>
            </button>
          </div>

          <!-- Dietary and Ingredients Note Panel: Placed here to fill vertical left space cleanly -->
          <div class="dietary-note-card card-surface">
            <div class="dietary-header">
              <span class="dietary-icon">🌾</span>
              <h4 class="dietary-title">Bahan & Catatan Diet</h4>
            </div>
            <p class="dietary-body">
              {{ currentItem.dietaryNotes || 'Dibuat dengan bahan-bahan segar pilihan dan racikan bumbu khas Warung Bali Dwi. Halal dan higienis.' }}
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: Details & Customizer Panel -->
        <div class="config-column">
          <!-- FOOD HEADER: Clean, natural flow -->
          <div class="food-header-block">
            <!-- Merchant Badge & Rating Header -->
            <div class="merchant-rating-row">
              <div class="merchant-badge">
                <span class="chef-emoji">👨‍🍳</span>
                <span class="merchant-text">{{ currentItem.merchant.toUpperCase() }} · {{ currentItem.merchantBadge || 'REKOMENDASI' }}</span>
              </div>

              <div
                class="rating-badge rating-badge-interactive"
                role="button"
                tabindex="0"
                title="Klik untuk memberi rating hidangan ini"
                @click="showRatingModal = true"
              >
                <Star :size="15" class="star-icon filled" />
                <strong class="rating-score">{{ currentItem.rating }}</strong>
                <span class="rating-count">({{ currentItem.reviewsCount }}+ ulasan)</span>
                <span class="rate-prompt-pill">Beri Rating</span>
              </div>
            </div>

            <!-- Title & Base Price -->
            <h1 class="font-display food-title">{{ currentItem.name }}</h1>
            <div class="food-price-row">
              <span class="food-price-value">{{ formatRupiah(currentItem.basePrice) }}</span>
              <span class="price-suffix">/ porsi standar</span>
            </div>

            <!-- Description -->
            <p class="food-description">
              {{ currentItem.description }}
            </p>
          </div>

          <!-- 1. OPTION: Pilih Ukuran Porsi -->
          <fieldset v-if="currentItem.portions && currentItem.portions.length > 0" class="option-section">
            <legend class="option-title">
              Pilih Ukuran Porsi
              <span class="required-tag">Pilih 1</span>
            </legend>

            <div class="portion-cards-list">
              <div
                v-for="portion in currentItem.portions"
                :key="portion.id"
                class="radio-card"
                :class="{ active: isPortionActive(portion) }"
                @click="orderStore.setPortion(portion)"
              >
                <input
                  :id="`portion-${portion.id}`"
                  type="radio"
                  name="portion-size"
                  :value="portion.id"
                  :checked="isPortionActive(portion)"
                  class="radio-input"
                  @change="orderStore.setPortion(portion)"
                />
                <label :for="`portion-${portion.id}`" class="radio-label">
                  <div class="radio-info">
                    <span class="radio-name">{{ portion.name }}</span>
                    <span class="radio-desc">{{ portion.description }}</span>
                  </div>
                  <span class="radio-price">
                    {{ portion.price === 0 ? '+ Rp 0' : `+ ${formatRupiah(portion.price)}` }}
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          <!-- 2. OPTION: Tingkat Kepedasan -->
          <fieldset v-if="currentItem.spices && currentItem.spices.length > 0" class="option-section">
            <legend class="option-title">
              Tingkat Kepedasan
              <span class="required-tag">Pilih 1</span>
            </legend>

            <div class="spice-chips-row">
              <button
                v-for="spice in currentItem.spices"
                :key="spice.id"
                type="button"
                class="spice-chip"
                :class="{ active: isSpiceActive(spice) }"
                @click="orderStore.setSpice(spice)"
              >
                <span class="spice-name">{{ spice.name }}</span>
                <span v-if="spice.emoji" class="spice-emoji">{{ spice.emoji }}</span>
              </button>
            </div>
          </fieldset>

          <!-- 3. OPTION: Tambahkan Pelengkap -->
          <fieldset v-if="currentItem.addons && currentItem.addons.length > 0" class="option-section">
            <legend class="option-title">
              Tambahkan Pelengkap
              <span class="optional-tag">Opsional</span>
            </legend>

            <div class="addons-list">
              <div
                v-for="addon in currentItem.addons"
                :key="addon.id"
                class="checkbox-card"
                :class="{ active: isAddonChecked(addon) }"
                @click="orderStore.toggleAddon(addon)"
              >
                <input
                  :id="`addon-${addon.id}`"
                  type="checkbox"
                  :checked="isAddonChecked(addon)"
                  class="checkbox-input"
                  @change="orderStore.toggleAddon(addon)"
                />
                <label :for="`addon-${addon.id}`" class="checkbox-label" @click.prevent>
                  <div class="custom-checkbox">
                    <Check v-if="isAddonChecked(addon)" :size="14" stroke-width="3" />
                  </div>
                  <span class="addon-name">{{ addon.name }}</span>
                  <span class="addon-price">+ {{ formatRupiah(addon.price) }}</span>
                </label>
              </div>
            </div>
          </fieldset>

          <!-- Action Bar: Stepper + Add CTA -->
          <div class="order-action-bar">
            <QuantityStepper
              v-model="orderStore.quantity"
              size="lg"
            />

            <button
              type="button"
              class="btn-primary btn-add-order"
              @click="handleAddToCart"
            >
              <ShoppingBag :size="20" />
              <span>Tambahkan ke Pesanan Meja · {{ formatRupiah(currentButtonTotal) }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- RECOMMENDATIONS SECTION: Lengkapi Hidanganmu (Aligned with Left Column & Grid) -->
      <section class="recommendations-section" aria-labelledby="rec-title">
        <div class="rec-header">
          <span class="section-eyebrow">LENGKAPI HIDANGANMU</span>
          <h2 id="rec-title" class="font-display rec-h2">Mungkin Kamu Juga Suka</h2>
        </div>

        <div class="recommendations-grid">
          <FoodCard
            v-for="item in RECOMMENDATIONS_DETAIL_ITEMS"
            :key="item.id"
            :item="item"
            @select="handleRecommendationClick"
            @add="handleRecommendationClick"
          />
        </div>
      </section>
    </main>

    <!-- Rating Modal -->
    <Teleport to="body">
      <div v-if="showRatingModal" class="modal-backdrop" @click.self="showRatingModal = false">
        <div class="modal-card rating-modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <h3 class="font-display modal-title">Beri Rating Hidangan</h3>
              <p class="modal-sub">{{ currentItem.name }} · {{ currentItem.merchant }}</p>
            </div>
            <button type="button" class="close-btn" @click="showRatingModal = false">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body rating-modal-body">
            <!-- 5 Interactive Stars -->
            <div class="star-rating-selector">
              <span class="rating-val-display">{{ userRating }} / 5 Bintang</span>
              <div class="stars-row">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-btn"
                  @click="userRating = star"
                >
                  <Star
                    :size="32"
                    :class="{ filled: star <= userRating }"
                    :fill="star <= userRating ? '#F59E0B' : 'transparent'"
                    :color="star <= userRating ? '#F59E0B' : '#CBD5E1'"
                  />
                </button>
              </div>
            </div>

            <!-- Quick Tag Chips -->
            <div class="rating-tags-group">
              <label class="rating-label">Apa yang paling kamu sukai?</label>
              <div class="rating-tags-chips">
                <button
                  v-for="tag in availableRatingTags"
                  :key="tag"
                  type="button"
                  class="rating-tag-chip"
                  :class="{ active: selectedTags.includes(tag) }"
                  @click="toggleRatingTag(tag)"
                >
                  <span>{{ tag }}</span>
                </button>
              </div>
            </div>

            <!-- Review Input Textarea -->
            <div class="rating-input-group">
              <label for="review-text" class="rating-label">Tulis ulasanmu (opsional):</label>
              <textarea
                id="review-text"
                v-model="userReviewText"
                placeholder="Bagikan rasa bumbu, kelezatan porsi, atau rekomendasi untuk pelanggan lainnya..."
                class="review-textarea"
                rows="3"
              />
            </div>
          </div>

          <div class="modal-footer" style="margin-top: 20px;">
            <button type="button" class="btn-primary" style="width: 100%" @click="submitRating">
              <Sparkles :size="16" />
              <span>Kirim Ulasan & Rating</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <AppFooter />
  </div>
</template>

<style scoped>
.food-detail-page {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.detail-main-content {
  padding-bottom: 96px;
  flex: 1;
}

/* Top Navigation Row: Back button aligned flush left */
.top-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-back-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  background-color: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.btn-back-menu:hover {
  background-color: var(--primary-soft);
  transform: translateX(-3px);
  border-color: var(--primary);
}

.detail-breadcrumb {
  margin: 0;
}

/* Two-column layout */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
  margin-bottom: 64px;
  align-items: start;
}

@media (min-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr 1.15fr;
    gap: 48px;
  }
}

/* Left Column: Gallery */
.gallery-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 960px) {
  .gallery-column {
    position: sticky;
    top: 90px;
  }
}

.main-image-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.main-food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-badge-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 800;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

/* Thumbnails Row: Exactly 5 slots in view, horizontally scrollable when expanded */
.thumbnails-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  user-select: none;
}

.thumbnails-row::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-row::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-row::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 99px;
}

.thumb-btn {
  position: relative;
  flex: 0 0 calc((100% - 40px) / 5);
  width: calc((100% - 40px) / 5);
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  background: var(--surface);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}

.thumb-btn:hover {
  transform: translateY(-2px);
  border-color: var(--border);
}

.thumb-btn.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(194, 65, 12, 0.2);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-img-blurred {
  filter: blur(2.5px) brightness(0.65);
  transform: scale(1.08);
}

.thumb-extra-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.5px;
  background: rgba(0, 0, 0, 0.35);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

/* Dietary Notes Card */
.dietary-note-card {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  margin-top: 8px;
}

.dietary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.dietary-icon {
  font-size: 18px;
}

.dietary-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.dietary-body {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

/* Right Column: Configuration */
.config-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.food-header-block {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.merchant-rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
  flex-wrap: wrap;
}

.merchant-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.star-icon {
  color: var(--gold);
  fill: var(--gold);
}

.rating-score {
  font-weight: 800;
  color: var(--text-primary);
}

.rating-count {
  color: var(--text-secondary);
}

.food-title {
  font-size: clamp(28px, 3.5vw, 38px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.15;
  margin-bottom: 6px;
}

.food-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.food-price-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-sans);
}

.price-suffix {
  font-size: 14px;
  color: var(--text-secondary);
}

.food-description {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}

/* Option Sections */
.option-section {
  border: none;
  padding: 0;
  margin: 0;
}

.option-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.required-tag {
  background-color: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.optional-tag {
  background-color: var(--surface-warm);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Portion Cards */
.portion-cards-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 640px) {
  .portion-cards-list {
    grid-template-columns: 1fr;
  }
}

.radio-card {
  position: relative;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-card:hover {
  border-color: #D6BCAB;
}

.radio-card.active {
  border-color: var(--primary);
  background-color: var(--primary-soft);
}

.radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
}

.radio-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}

.radio-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  display: block;
}

.radio-price {
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
}

/* Spice Chips */
.spice-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spice-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.spice-chip:hover {
  border-color: #D6BCAB;
}

.spice-chip.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
}

/* Addons */
.addons-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-card {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-card:hover {
  border-color: #D6BCAB;
}

.checkbox-card.active {
  border-color: var(--primary);
  background-color: var(--primary-soft);
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  cursor: pointer;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--border);
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.checkbox-card.active .custom-checkbox {
  background-color: var(--primary);
  border-color: var(--primary);
}

.addon-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

.addon-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

/* Action Bar */
.order-action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
}

.btn-add-order {
  flex: 1;
  padding: 16px 24px;
  font-size: 16px;
}

/* Recommendations Section */
.recommendations-section {
  padding-top: 48px;
  border-top: 1px solid var(--border);
}

.rec-header {
  margin-bottom: 24px;
}

.section-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 4px;
  display: block;
}

.rec-h2 {
  font-size: 26px;
  color: var(--text-primary);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}
</style>
