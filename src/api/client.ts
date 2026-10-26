/**
 * client.ts - API client for MejaKu Laravel backend.
 */

const DEFAULT_API_BASE = 'http://localhost:8000/api'
const LS_API_BASE = 'mejaku_api_base'

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(LS_API_BASE)
    if (custom) return custom.replace(/\/+$/, '')
    if (import.meta.env.DEV || ['5173', '5174'].includes(window.location.port)) return '/api'
  }
  return DEFAULT_API_BASE
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  let data: any = null
  try {
    data = await res.json()
  } catch (err) {
    data = null
  }

  if (!res.ok) {
    const errorMsg = data?.message || `Request failed with status ${res.status}`
    const error = new Error(errorMsg) as Error & { status: number; data: any }
    error.status = res.status
    error.data = data
    throw error
  }

  return data as T
}

export const api = {
  // Menu & Catalog
  getMenus: () => request<{ success: boolean; data: any[] }>('/menu'),
  getMenuBySlug: (slug: string) => request<{ success: boolean; data: any }>(`/menu/${encodeURIComponent(slug)}`),
  getMenuReviews: (id: number | string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString()
    return request<{ success: boolean; data: any }>(`/menu/${id}/reviews${query ? '?' + query : ''}`)
  },
  submitMenuRating: (id: number | string, payload: { rating: number; customer_name?: string; review?: string; order_number?: string }) => {
    return request<{ success: boolean; message: string; data: any }>(`/menu/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Tables
  getTables: () => request<{ success: boolean; data: any[] }>('/tables'),
  getTableByCode: (code: string) => request<{ success: boolean; data: any }>(`/tables/${encodeURIComponent(code)}`),

  // Orders
  createOrder: (payload: any) => request<{ success: boolean; data: any }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getOrder: (orderNumber: string) => request<{ success: boolean; data: any }>(`/orders/${encodeURIComponent(orderNumber)}`),

  // Payments
  createPayment: (
    orderNumber: string,
    method: string,
    channel?: 'qris' | 'va',
    bank?: string
  ) => request<{ success: boolean; data: any; demo_mode?: boolean }>(`/payments/${encodeURIComponent(orderNumber)}`, {
    method: 'POST',
    body: JSON.stringify({ method, channel, bank }),
  }),
  getPaymentStatus: (orderNumber: string) => request<{ success: boolean; data: any }>(`/payments/${encodeURIComponent(orderNumber)}/status`),

  // Promo
  getActivePromos: () => request<{ success: boolean; data: any[] }>('/promos'),
  validatePromo: (code: string, subtotal: number) => request<{ success: boolean; valid?: boolean; message?: string; data: any }>('/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  }),

  // Chatbot
  sendChatMessage: (
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ) =>
    request<{
      success: boolean
      data?: { reply: string; model?: string }
      reply?: string
      timestamp?: string
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
}
