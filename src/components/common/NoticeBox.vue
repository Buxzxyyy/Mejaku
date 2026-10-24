<script setup lang="ts">
import { Info, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'warm' | 'success' | 'warning' | 'info'
    title?: string
    message: string
    iconType?: 'info' | 'success' | 'clock' | 'shield' | 'warning'
  }>(),
  {
    variant: 'warm',
    iconType: 'info',
  }
)
</script>

<template>
  <div class="notice-box" :class="[`notice-${variant}`]">
    <div class="notice-icon-wrapper" aria-hidden="true">
      <CheckCircle2 v-if="iconType === 'success'" :size="18" />
      <Clock v-else-if="iconType === 'clock'" :size="18" />
      <ShieldCheck v-else-if="iconType === 'shield'" :size="18" />
      <AlertCircle v-else-if="iconType === 'warning'" :size="18" />
      <Info v-else :size="18" />
    </div>

    <div class="notice-body">
      <div v-if="title" class="notice-title">{{ title }}</div>
      <div class="notice-message">{{ message }}</div>
    </div>
  </div>
</template>

<style scoped>
.notice-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
}

.notice-icon-wrapper {
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-body {
  flex: 1;
}

.notice-title {
  font-weight: 700;
  margin-bottom: 2px;
}

.notice-message {
  font-weight: 500;
}

/* Variants */
.notice-warm {
  background-color: var(--surface-warm);
  border: 1px solid var(--border);
  color: #78350F;
}

.notice-warm .notice-title {
  color: #451A03;
}

.notice-success {
  background-color: var(--success-soft);
  border: 1px solid rgba(21, 128, 61, 0.2);
  color: var(--success);
}

.notice-warning {
  background-color: var(--warning-soft);
  border: 1px solid var(--warning-border);
  color: var(--warning);
}

.notice-info {
  background-color: #F0F9FF;
  border: 1px solid #BAE6FD;
  color: #0369A1;
}
</style>
