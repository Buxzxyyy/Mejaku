<script setup lang="ts">
import { ref, watch } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    min: 1,
    max: 99,
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const isBumping = ref(false)

watch(
  () => props.modelValue,
  () => {
    isBumping.value = true
    setTimeout(() => {
      isBumping.value = false
    }, 180)
  }
)

function handleDecrement() {
  if (props.modelValue > props.min) {
    const newVal = props.modelValue - 1
    emit('update:modelValue', newVal)
    emit('change', newVal)
  }
}

function handleIncrement() {
  if (props.modelValue < props.max) {
    const newVal = props.modelValue + 1
    emit('update:modelValue', newVal)
    emit('change', newVal)
  }
}
</script>

<template>
  <div
    class="stepper-wrapper"
    :class="[`size-${size}`]"
    role="group"
    aria-label="Pengatur jumlah pesanan"
  >
    <button
      type="button"
      class="stepper-btn btn-minus"
      :disabled="modelValue <= min"
      :aria-label="`Kurangi jumlah, saat ini ${modelValue}`"
      @click="handleDecrement"
    >
      <Minus :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16" />
    </button>

    <span
      class="stepper-value"
      :class="{ 'bump-anim': isBumping }"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ modelValue }}
    </span>

    <button
      type="button"
      class="stepper-btn btn-plus"
      :disabled="modelValue >= max"
      :aria-label="`Tambah jumlah, saat ini ${modelValue}`"
      @click="handleIncrement"
    >
      <Plus :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16" />
    </button>
  </div>
</template>

<style scoped>
.stepper-wrapper {
  display: inline-flex;
  align-items: center;
  background-color: #FFFFFF;
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-full);
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.stepper-wrapper:hover {
  box-shadow: 0 2px 8px rgba(194, 65, 12, 0.12);
}

.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0;
}

.stepper-btn:hover:not(:disabled) {
  background-color: var(--primary-soft);
}

.stepper-btn:active:not(:disabled) {
  background-color: #F8D9C8;
  transform: scale(0.92);
}

.stepper-btn:disabled {
  color: #CBD5E1;
  cursor: not-allowed;
  background: transparent;
}

.stepper-value {
  font-family: var(--font-sans);
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  display: inline-block;
  transition: transform 0.15s ease, color 0.15s ease;
}

.bump-anim {
  transform: scale(1.15);
  color: var(--primary);
}

/* Sizing definitions */
.size-sm {
  height: 36px;
}
.size-sm .stepper-btn {
  width: 36px;
  height: 36px;
}
.size-sm .stepper-value {
  font-size: 14px;
  min-width: 26px;
}

.size-md {
  height: 44px;
}
.size-md .stepper-btn {
  width: 44px;
  height: 44px;
}
.size-md .stepper-value {
  font-size: 16px;
  min-width: 34px;
}

.size-lg {
  height: 50px;
}
.size-lg .stepper-btn {
  width: 48px;
  height: 48px;
}
.size-lg .stepper-value {
  font-size: 18px;
  min-width: 40px;
}
</style>
