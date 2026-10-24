<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import type { MenuItem } from '@/types'
import { formatRupiah } from '@/utils/pricing'

const props = defineProps<{
  item: MenuItem
}>()

const emit = defineEmits<{
  (e: 'select', item: MenuItem): void
  (e: 'add', item: MenuItem): void
}>()

const isAddedFeedback = ref(false)

function handleAdd(e: Event) {
  e.stopPropagation()
  isAddedFeedback.value = true
  emit('add', props.item)
  setTimeout(() => {
    isAddedFeedback.value = false
  }, 1200)
}
</script>

<template>
  <article
    class="food-card"
    tabindex="0"
    role="button"
    :aria-label="`${item.name}, harga ${formatRupiah(item.basePrice)}`"
    @click="emit('select', item)"
    @keydown.enter="emit('select', item)"
    @keydown.space.prevent="emit('select', item)"
  >
    <!-- Image Media Container -->
    <div class="media-container">
      <img
        :src="item.image"
        :alt="`Foto hidangan ${item.name}`"
        class="food-img"
        loading="lazy"
      />
      <div v-if="item.badge" class="badge-tag">
        {{ item.badge }}
      </div>
    </div>

    <!-- Content Body -->
    <div class="card-content">
      <div class="merchant-name">{{ item.merchant }}</div>
      <h3 class="food-name">{{ item.name }}</h3>
      <p v-if="item.description" class="food-desc">{{ item.description }}</p>

      <!-- Footer: Price & CTA -->
      <div class="card-footer">
        <div class="price-value">{{ formatRupiah(item.basePrice) }}</div>

        <button
          type="button"
          class="btn-add"
          :class="{ 'btn-added': isAddedFeedback }"
          :aria-label="`Tambahkan ${item.name} ke pesanan`"
          @click="handleAdd"
        >
          <template v-if="!isAddedFeedback">
            <Plus :size="16" />
            <span>Tambahkan</span>
          </template>
          <template v-else>
            <Check :size="16" />
            <span>Ditambahkan</span>
          </template>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.food-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s var(--ease-spring), box-shadow 0.3s ease, border-color 0.2s ease;
  cursor: pointer;
  height: 100%;
  position: relative;
}

.food-card:hover {
  transform: translateY(-8px) scale(1.015);
  border-color: #D6BCAB;
  box-shadow: 0 20px 40px rgba(120, 53, 15, 0.12);
}

.food-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background-color: var(--surface-warm);
}

.food-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease-smooth);
}

.food-card:hover .food-img {
  transform: scale(1.06);
}

.badge-tag {
  position: absolute;
  top: 14px;
  right: 14px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 212, 201, 0.6);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.merchant-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.food-name {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #F1E5DB;
}

.price-value {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 18px;
  color: var(--primary);
  white-space: nowrap;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-soft);
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  min-height: 38px;
}

.btn-add:hover {
  background-color: var(--primary);
  color: #FFFFFF;
  transform: scale(1.03);
}

.btn-added {
  background-color: var(--success-soft) !important;
  color: var(--success) !important;
}
</style>
