export type Deal = {
  id: string
  slug: string
  name: string
  brand?: string
  model?: string
  variant?: string
  category?: string
  image_url?: string
  price: number
  old_price?: number
  delivery_price?: number
  external_url?: string
  store_name?: string
  score: number
  avg_30?: number
  min_180?: number
  real_discount_pct?: number
  lat?: number
  lng?: number
  address?: string
  distance_km?: number | null
}

export type ProductSummary = Deal

export type ProductDetails = {
  product: {
    id: string
    slug: string
    name: string
    brand?: string
    model?: string
    variant?: string
    category?: string
    image_url?: string
    description?: string
  }
  offers: Array<{
    id: string
    store_name: string
    price: number
    old_price?: number
    delivery_price: number
    external_url: string
    availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown'
    reliability_score: number
    score?: number
    avg_30?: number
    min_180?: number
    real_discount_pct?: number
  }>
  history: Array<{ price: number; captured_at: string }>
}

export type WatchItem = ProductSummary & { watch_id: string; target_price?: number; created_at: string }

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
  })
  const data = await response.json().catch(() => ({})) as { message?: string }
  if (!response.ok) throw new ApiError(response.status, data.message || `HTTP ${response.status}`)
  return data as T
}

export const api = {
  products: (query = '', category = '') => request<{ items: ProductSummary[] }>(`/api/products?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`),
  product: (slugOrId: string) => request<ProductDetails>(`/api/products/${encodeURIComponent(slugOrId)}`),
  deals: (category = '', limit = 50) => request<{ items: Deal[] }>(`/api/deals?category=${encodeURIComponent(category)}&limit=${limit}`),
  mapDeals: (lat?: number, lng?: number, radius = 25) => {
    const params = new URLSearchParams({ radius: String(radius) })
    if (lat != null && lng != null) { params.set('lat', String(lat)); params.set('lng', String(lng)) }
    return request<{ items: Deal[] }>(`/api/map/deals?${params}`)
  },
  watchlist: () => request<{ items: WatchItem[] }>(`/api/watchlist?deviceId=${encodeURIComponent(getDeviceId())}`),
  watch: (productId: string, targetPrice?: number) => request<{ ok: boolean }>('/api/watchlist', {
    method: 'POST', body: JSON.stringify({ productId, targetPrice, deviceId: getDeviceId() })
  }),
  unwatch: (productId: string) => request<{ ok: boolean }>(`/api/watchlist/${encodeURIComponent(productId)}?deviceId=${encodeURIComponent(getDeviceId())}`, { method: 'DELETE' }),
  createRequest: (body: { productText: string; productId?: string; budget: number; deadline?: string; comment?: string }) => request<{ ok: boolean; id: string; status: string }>('/api/requests', {
    method: 'POST', body: JSON.stringify({ ...body, deviceId: getDeviceId() })
  }),
  sellerOffers: (requestId: string) => request<{ items: Array<{ id: string; store_name: string; price: number; delivery_price: number; note?: string }> }>(`/api/requests/${encodeURIComponent(requestId)}/offers`)
}

export function getDeviceId() {
  const key = 'vyhidno_device_id'
  let value = localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    localStorage.setItem(key, value)
  }
  return value
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Сталася неочікувана помилка.'
}
