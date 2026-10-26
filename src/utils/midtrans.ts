/**
 * Helper Snap.js Midtrans untuk Mejaku customer FE.
 */

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void
    }
  }
}

function snapScriptUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
}

export function ensureSnapLoaded(clientKey: string, isProduction: boolean = false): Promise<void> {
  if (typeof window !== 'undefined' && window.snap && typeof window.snap.pay === 'function') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-midtrans-snap]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Snap.js Midtrans.')), { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = snapScriptUrl(isProduction)
    s.setAttribute('data-client-key', clientKey || '')
    s.setAttribute('data-midtrans-snap', '1')
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Gagal memuat Snap.js Midtrans.'))
    document.head.appendChild(s)
  })
}

export function payWithSnapToken(snapToken: string, callbacks: {
  onSuccess?: (result: any) => void
  onPending?: (result: any) => void
  onError?: (result: any) => void
  onClose?: () => void
} = {}) {
  if (typeof window === 'undefined' || !window.snap || typeof window.snap.pay !== 'function') {
    throw new Error('Snap.js belum termuat.')
  }
  window.snap.pay(snapToken, {
    onSuccess: callbacks.onSuccess || (() => {}),
    onPending: callbacks.onPending || (() => {}),
    onError: callbacks.onError || (() => {}),
    onClose: callbacks.onClose || (() => {}),
  })
}
