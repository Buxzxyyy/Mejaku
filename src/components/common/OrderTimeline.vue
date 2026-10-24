<script setup lang="ts">
import { computed } from 'vue'
import { Check, Flame, UtensilsCrossed, PartyPopper } from 'lucide-vue-next'
import type { PrepStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    status: PrepStatus
    paymentTimestamp?: string
    foodName?: string
    tableNumber?: string
  }>(),
  {
    status: 'preparing',
    paymentTimestamp: '12:40 WIB',
    foodName: 'Nasi Campur Bali Agung',
    tableNumber: 'A12',
  }
)

const emit = defineEmits<{
  (e: 'update:status', newStatus: PrepStatus): void
}>()

const statusOrder: PrepStatus[] = ['received', 'preparing', 'ready', 'completed']

const currentStepIndex = computed(() => {
  return statusOrder.indexOf(props.status)
})

interface StepItem {
  id: PrepStatus
  title: string
  description: string
  timestamp?: string
}

const steps = computed<StepItem[]>(() => [
  {
    id: 'received',
    title: 'Pesanan Diterima & Terbayar',
    description: `Sistem kami berhasil memverifikasi pembayaran Anda via QRIS pada pukul ${props.paymentTimestamp}.`,
    timestamp: props.paymentTimestamp,
  },
  {
    id: 'preparing',
    title: 'Sedang Disiapkan di Dapur',
    description: `Koki Warung Bali Dwi sedang memasak ${props.foodName} pesananmu hangat-hangat.`,
    timestamp: 'Estimasi 15-20 mnt',
  },
  {
    id: 'ready',
    title: 'Siap Disajikan / Dikirim',
    description: `Makanan akan segera diantarkan langsung ke Meja ${props.tableNumber} oleh pramusaji hall kuliner.`,
    timestamp: 'Segera tiba',
  },
  {
    id: 'completed',
    title: 'Pesanan Selesai',
    description: 'Selamat menikmati hidangan lezat Anda di Jakarta Culinary Hall!',
    timestamp: 'Selesai',
  },
])

function setStep(newStatus: PrepStatus) {
  emit('update:status', newStatus)
}
</script>

<template>
  <div class="timeline-container">
    <div class="timeline-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="timeline-step"
        :class="{
          'is-completed': index < currentStepIndex,
          'is-current': index === currentStepIndex,
          'is-pending': index > currentStepIndex,
        }"
      >
        <!-- Connector vertical line -->
        <div v-if="index < steps.length - 1" class="step-line" aria-hidden="true">
          <div
            class="line-fill"
            :class="{ 'fill-completed': index < currentStepIndex }"
          />
        </div>

        <!-- Node Icon Circle -->
        <div class="step-node" aria-hidden="true">
          <template v-if="index < currentStepIndex">
            <Check :size="16" stroke-width="3" />
          </template>
          <template v-else-if="index === currentStepIndex">
            <Flame v-if="step.id === 'preparing'" :size="18" class="pulse-icon" />
            <UtensilsCrossed v-else-if="step.id === 'ready'" :size="18" class="pulse-icon" />
            <PartyPopper v-else-if="step.id === 'completed'" :size="18" class="pulse-icon" />
            <Check v-else :size="16" />
          </template>
          <template v-else>
            <span class="step-number">{{ index + 1 }}</span>
          </template>
        </div>

        <!-- Step Content -->
        <div class="step-content">
          <div class="step-header">
            <h4 class="step-title">{{ step.title }}</h4>
            <span v-if="index <= currentStepIndex" class="step-time">
              {{ index === currentStepIndex ? 'Sedang berlangsung' : step.timestamp }}
            </span>
          </div>
          <p class="step-desc">{{ step.description }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-steps {
  display: flex;
  flex-direction: column;
  position: relative;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  padding-bottom: 28px;
}

.timeline-step:last-child {
  padding-bottom: 8px;
}

/* Connector Line */
.step-line {
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: 0;
  width: 2px;
  background-color: #E2D4C9;
  z-index: 1;
}

.line-fill {
  width: 100%;
  height: 0%;
  background-color: var(--success);
  transition: height 0.4s ease;
}

.line-fill.fill-completed {
  height: 100%;
}

/* Node Icon Circle */
.step-node {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  flex-shrink: 0;
  transition: all 0.3s var(--ease-spring);
}

.timeline-step.is-completed .step-node {
  background-color: var(--success);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
}

.timeline-step.is-current .step-node {
  background-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 0 0 6px var(--primary-soft), 0 6px 16px rgba(194, 65, 12, 0.3);
  animation: pulseNode 2s infinite;
}

.timeline-step.is-pending .step-node {
  background-color: #F1E5DB;
  color: var(--text-muted);
  border: 2px solid var(--border);
}

.step-number {
  font-size: 14px;
  font-weight: 700;
}

.pulse-icon {
  animation: flameBounce 1.5s ease-in-out infinite alternate;
}

@keyframes pulseNode {
  0%, 100% {
    box-shadow: 0 0 0 4px var(--primary-soft);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(194, 65, 12, 0.15);
  }
}

@keyframes flameBounce {
  from {
    transform: scale(0.92);
  }
  to {
    transform: scale(1.08);
  }
}

/* Step Content */
.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.timeline-step.is-current .step-title {
  color: var(--primary);
}

.timeline-step.is-pending .step-title {
  color: var(--text-secondary);
}

.step-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  background-color: var(--surface-warm);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.timeline-step.is-current .step-time {
  background-color: var(--primary-soft);
  color: var(--primary);
}

.step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.timeline-step.is-pending .step-desc {
  color: var(--text-muted);
}


</style>
