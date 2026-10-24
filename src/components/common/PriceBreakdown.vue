<script setup lang="ts">
import type { OrderPricing } from '@/types'
import { formatRupiah } from '@/utils/pricing'

withDefaults(
  defineProps<{
    pricing: OrderPricing
    mode?: 'checkout' | 'payment' | 'confirmation'
  }>(),
  {
    mode: 'checkout',
  }
)
</script>

<template>
  <div class="price-breakdown">
    <!-- Subtotal -->
    <div class="breakdown-row">
      <span class="row-label">
        {{ mode === 'checkout' ? 'Subtotal' : 'Subtotal Makanan' }}
      </span>
      <span class="row-value">{{ formatRupiah(pricing.subtotal) }}</span>
    </div>

    <!-- Service Fee -->
    <div class="breakdown-row">
      <span class="row-label">
        {{ mode === 'checkout' ? 'Biaya layanan meja' : 'Biaya Pelayanan Meja' }}
      </span>
      <span class="row-value">{{ formatRupiah(pricing.serviceFee) }}</span>
    </div>

    <!-- Tax -->
    <div class="breakdown-row">
      <span class="row-label">
        {{ mode === 'checkout' ? 'Pajak (10%)' : 'Pajak PB1 (10%)' }}
      </span>
      <span class="row-value">{{ formatRupiah(pricing.tax) }}</span>
    </div>

    <!-- Discount if any -->
    <div v-if="pricing.discount > 0" class="breakdown-row row-discount">
      <span class="row-label">Potongan Kupon Promo</span>
      <span class="row-value">- {{ formatRupiah(pricing.discount) }}</span>
    </div>

    <div class="divider" />

    <!-- Total -->
    <div class="breakdown-row total-row">
      <span class="total-label">
        {{ mode === 'confirmation' ? 'Total Terbayar' : 'Total Pembayaran' }}
      </span>
      <span class="total-value">{{ formatRupiah(pricing.total) }}</span>
    </div>
  </div>
</template>

<style scoped>
.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.row-label {
  color: var(--text-secondary);
}

.row-value {
  color: var(--text-primary);
  font-weight: 600;
}

.row-discount {
  color: var(--success);
}

.row-discount .row-label,
.row-discount .row-value {
  color: var(--success);
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: #EBDDCE;
  margin: 6px 0;
}

.total-row {
  margin-top: 2px;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.total-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
  font-family: var(--font-sans);
}
</style>
