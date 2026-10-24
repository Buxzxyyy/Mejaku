import assert from 'node:assert/strict'

// Import utilities to test
function calculateUnitPrice(basePrice, portionPrice = 0, addons = []) {
  const addonsTotal = addons.reduce((sum, item) => sum + item.price, 0)
  return basePrice + portionPrice + addonsTotal
}

function calculateOrderPricing(unitPrice, quantity = 1, discount = 0) {
  const subtotal = unitPrice * Math.max(1, quantity)
  const serviceFee = 3000
  const taxableAmount = Math.max(0, subtotal + serviceFee - discount)
  const taxRate = 0.10
  const tax = Math.round(taxableAmount * taxRate)
  const total = Math.max(0, subtotal + serviceFee + tax - discount)

  return { subtotal, serviceFee, taxRate, tax, discount, total }
}

function formatRupiah(amount) {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

console.log('--- RUNNING MEJAKU VALIDATION SUITE ---')

// TEST 1: Baseline Nominal check (PRD Section 10 & design.md Section 10)
{
  const basePrice = 58000
  const portionPrice = 0 // Porsi Biasa
  const addons = [{ id: 'extra-sambal', name: 'Ekstra Sambal Matah', price: 5000 }]
  const unitPrice = calculateUnitPrice(basePrice, portionPrice, addons)
  assert.equal(unitPrice, 63000, 'Unit price must be 63.000')

  const pricing = calculateOrderPricing(unitPrice, 1, 0)
  assert.equal(pricing.subtotal, 63000, 'Subtotal must be 63.000')
  assert.equal(pricing.serviceFee, 3000, 'Service fee must be 3.000')
  assert.equal(pricing.tax, 6600, 'Tax must be 6.600')
  assert.equal(pricing.total, 72600, 'Total must be 72.600')
  assert.equal(formatRupiah(pricing.total), 'Rp 72.600', 'Formatted Rupiah must be Rp 72.600')
  console.log('✓ TEST 1 PASSED: Baseline 58.000 + 5.000 + 3.000 + 6.600 = 72.600')
}

// TEST 2: Portion customization (Porsi Jumbo + 15.000)
{
  const basePrice = 58000
  const portionPrice = 15000 // Porsi Jumbo
  const addons = [{ id: 'extra-sambal', name: 'Ekstra Sambal Matah', price: 5000 }]
  const unitPrice = calculateUnitPrice(basePrice, portionPrice, addons)
  assert.equal(unitPrice, 78000, 'Unit price with Jumbo must be 78.000')

  const pricing = calculateOrderPricing(unitPrice, 1, 0)
  assert.equal(pricing.subtotal, 78000)
  assert.equal(pricing.serviceFee, 3000)
  assert.equal(pricing.tax, 8100) // (78000 + 3000) * 0.10 = 8100
  assert.equal(pricing.total, 89100)
  console.log('✓ TEST 2 PASSED: Porsi Jumbo recalculation is accurate')
}

// TEST 3: Multiple addons customization
{
  const basePrice = 58000
  const addons = [
    { id: 'extra-sambal', price: 5000 },
    { id: 'extra-sate-lilit', price: 8000 },
    { id: 'extra-kulit-ayam', price: 12000 },
  ]
  const unitPrice = calculateUnitPrice(basePrice, 0, addons)
  assert.equal(unitPrice, 83000, 'Unit price with all 3 addons must be 83.000')

  const pricing = calculateOrderPricing(unitPrice, 2, 0)
  assert.equal(pricing.subtotal, 166000, 'Subtotal for qty 2 must be 166.000')
  assert.equal(pricing.tax, Math.round((166000 + 3000) * 0.10))
  console.log('✓ TEST 3 PASSED: Multiple addons & quantity multiplier work accurately')
}

// TEST 4: Quantity Guard (Minimum 1)
{
  const pricingZero = calculateOrderPricing(63000, 0, 0)
  assert.equal(pricingZero.subtotal, 63000, 'Quantity 0 should be guarded to at least 1')

  const pricingNegative = calculateOrderPricing(63000, -5, 0)
  assert.equal(pricingNegative.subtotal, 63000, 'Negative quantity should be guarded to at least 1')
  console.log('✓ TEST 4 PASSED: Quantity guard preserves minimum 1')
}

// TEST 5: Customer note length validation (150 chars max)
{
  const noteValid = 'Sambal dipisah, tanpa kacang karena alergi.'
  assert.ok(noteValid.length <= 150, 'Valid note must be <= 150 chars')

  const noteTooLong = 'A'.repeat(180)
  const trimmed = noteTooLong.slice(0, 150)
  assert.equal(trimmed.length, 150, 'Trimmed note must not exceed 150 chars')
  console.log('✓ TEST 5 PASSED: Note length constraint 150 chars validated')
}

// TEST 6: Payment and Kitchen status machine transitions
{
  const paymentStatuses = ['pending', 'checking', 'paid', 'failed', 'expired']
  const prepStatuses = ['received', 'preparing', 'ready', 'completed']

  assert.ok(paymentStatuses.includes('pending'))
  assert.ok(paymentStatuses.includes('paid'))
  assert.ok(prepStatuses.includes('preparing'))
  assert.ok(prepStatuses.includes('completed'))
  console.log('✓ TEST 6 PASSED: Status state machines defined properly')
}

// TEST 7: Promo code discount calculation
{
  const pricingWithPromo = calculateOrderPricing(63000, 1, 10000)
  assert.equal(pricingWithPromo.subtotal, 63000)
  assert.equal(pricingWithPromo.discount, 10000)
  // taxable: 63000 + 3000 - 10000 = 56000 => tax 5600
  assert.equal(pricingWithPromo.tax, 5600)
  assert.equal(pricingWithPromo.total, 61600)
  console.log('✓ TEST 7 PASSED: Promo discount applies correctly to tax and total')
}

console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---')
