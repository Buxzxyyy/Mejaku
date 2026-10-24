import type { PortionOption, AddonOption, OrderPricing } from '@/types'

export const SERVICE_FEE = 3000
export const TAX_RATE = 0.10

/**
 * Format a number into Indonesian Rupiah format: Rp 72.600
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0'
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${formatted}`
}

/**
 * Calculate the unit price of an item given its base price, portion, and selected addons.
 */
export function calculateUnitPrice(
  basePrice: number,
  portion: PortionOption | null,
  addons: AddonOption[] = []
): number {
  const portionPrice = portion ? portion.price : 0
  const addonsTotal = addons.reduce((sum, item) => sum + item.price, 0)
  return basePrice + portionPrice + addonsTotal
}

/**
 * Calculate the full order pricing breakdown.
 */
export function calculateOrderPricing(
  unitPrice: number,
  quantity: number,
  discount: number = 0
): OrderPricing {
  const subtotal = unitPrice * Math.max(1, quantity)
  const serviceFee = SERVICE_FEE
  // tax = round((subtotal + serviceFee) * 0.10)
  const taxableAmount = Math.max(0, subtotal + serviceFee - discount)
  const tax = Math.round(taxableAmount * TAX_RATE)
  const total = Math.max(0, subtotal + serviceFee + tax - discount)

  return {
    subtotal,
    serviceFee,
    taxRate: TAX_RATE,
    tax,
    discount,
    total,
  }
}
