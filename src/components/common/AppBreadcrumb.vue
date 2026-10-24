<script setup lang="ts">
import { ChevronRight, Home } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="breadcrumb-container">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <RouterLink to="/" class="breadcrumb-link home-link" title="Beranda MejaKu">
          <Home :size="15" />
          <span class="sr-only">Beranda</span>
        </RouterLink>
      </li>

      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <ChevronRight :size="14" class="separator-icon" aria-hidden="true" />
        <RouterLink v-if="item.to && index < items.length - 1" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </RouterLink>
        <span v-else class="breadcrumb-current" aria-current="page">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-container {
  padding: 16px 0 24px 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: var(--text-secondary);
  transition: color 0.15s ease;
  font-weight: 500;
}

.breadcrumb-link:hover {
  color: var(--primary);
  text-decoration: underline;
}

.home-link {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}

.home-link:hover {
  background-color: var(--surface-warm);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 600;
}

.separator-icon {
  color: var(--border);
  flex-shrink: 0;
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
</style>
