const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
  useAuth?: boolean;
}

async function getToken(): Promise<string | null> {
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { useAuth = true, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (useAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch<any>('/auth/me'),
  updateMe: (data: any) => apiFetch<any>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Products & Catalog
export const productsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params || {}).toString();
    return apiFetch<any>(`/products${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => apiFetch<any>(`/products/${id}`),
  similar: (id: string, limit?: number) =>
    apiFetch<any>(`/products/${id}/similar${limit ? `?limit=${limit}` : ''}`),
  categories: (storeId?: string) =>
    apiFetch<any>(`/categories${storeId ? `?store_id=${storeId}` : ''}`),
  stores: () => apiFetch<any>('/stores'),
  semanticSearch: (query: string, storeId: string) =>
    apiFetch<any>('/search/semantic', {
      method: 'POST',
      body: JSON.stringify({ query, store_id: storeId }),
    }),
};

// Inventory
export const inventoryApi = {
  validate: (productId: string, qty: number) =>
    apiFetch<any>(`/inventory/validate?product_id=${productId}&requested_qty=${qty}`),
  get: (productId: string) => apiFetch<any>(`/inventory/${productId}`),
  reserve: (productId: string, quantity: number) =>
    apiFetch<any>('/inventory/reserve', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  release: (productId: string, quantity: number = 1) =>
    apiFetch<any>(`/inventory/reserve/${productId}?quantity=${quantity}`, { method: 'DELETE' }),
  update: (data: any) =>
    apiFetch<any>('/inventory/update', { method: 'POST', body: JSON.stringify(data) }),
  alerts: () => apiFetch<any>('/inventory/alerts'),
  predictions: () => apiFetch<any>('/inventory/predictions'),
};

// Orders
export const ordersApi = {
  create: (data: any) => apiFetch<any>('/order/create', { method: 'POST', body: JSON.stringify(data) }),
  checkout: (data: any) =>
    apiFetch<any>('/order/checkout', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => apiFetch<any>(`/order/${id}`),
  myOrders: (page?: number) => apiFetch<any>(`/order/my-orders${page ? `?page=${page}` : ''}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiFetch<any>(`/order/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
    }),
  cancel: (id: string, reason: string) =>
    apiFetch<any>(`/order/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  allOrders: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params || {}).toString();
    return apiFetch<any>(`/order/admin/all${qs ? `?${qs}` : ''}`);
  },
  pipeline: () => apiFetch<any>('/order/admin/pipeline'),
  review: (data: any) => apiFetch<any>('/order/review', { method: 'POST', body: JSON.stringify(data) }),
};

// Rider
export const riderApi = {
  profile: () => apiFetch<any>('/rider/profile'),
  availability: (data: any) =>
    apiFetch<any>('/rider/availability', { method: 'PATCH', body: JSON.stringify(data) }),
  orders: () => apiFetch<any>('/rider/orders'),
  accept: (orderId: string) =>
    apiFetch<any>(`/rider/order/${orderId}/accept`, { method: 'PATCH' }),
  reject: (orderId: string) =>
    apiFetch<any>(`/rider/order/${orderId}/reject`, { method: 'PATCH' }),
  pickup: (orderId: string) =>
    apiFetch<any>(`/rider/order/${orderId}/pickup`, { method: 'PATCH' }),
  deliver: (orderId: string) =>
    apiFetch<any>(`/rider/order/${orderId}/deliver`, { method: 'PATCH' }),
};

// Tracking & Maps
export const trackingApi = {
  get: (orderId: string) => apiFetch<any>(`/tracking/${orderId}`),
  route: (orderId: string) => apiFetch<any>(`/tracking/${orderId}/route`),
  history: (orderId: string) => apiFetch<any>(`/tracking/${orderId}/history`),
  geocode: (q: string, limit?: number) =>
    apiFetch<any>(`/tracking/geocode?q=${encodeURIComponent(q)}${limit ? `&limit=${limit}` : ''}`),
  reverseGeocode: (lat: number, lng: number) =>
    apiFetch<any>(`/tracking/reverse-geocode?lat=${lat}&lng=${lng}`),
};

// Notifications
export const notificationsApi = {
  list: (page?: number) => apiFetch<any>(`/notifications${page ? `?page=${page}` : ''}`),
  markRead: (id: string) => apiFetch<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch<any>('/notifications/read-all', { method: 'PATCH' }),
  delete: (id: string) => apiFetch<any>(`/notifications/${id}`, { method: 'DELETE' }),
};

// Admin
export const adminApi = {
  dashboard: () => apiFetch<any>('/admin/dashboard'),
  agentLogs: (agentType?: string) =>
    apiFetch<any>(`/admin/agent-logs${agentType ? `?agent_type=${agentType}` : ''}`),
  ridersMap: () => apiFetch<any>('/admin/riders/map'),
  manualDispatch: (orderId: string, riderId: string) =>
    apiFetch<any>('/admin/dispatch/manual', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, rider_id: riderId }),
    }),
  toggleDispatch: (enabled: boolean) =>
    apiFetch<any>('/admin/dispatch/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
  expandRadius: (orderId: string, radiusKm: number) =>
    apiFetch<any>('/admin/dispatch/expand-radius', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, radius_km: radiusKm }),
    }),
  settings: () => apiFetch<any>('/admin/settings'),
  updateSetting: (key: string, value: any) =>
    apiFetch<any>(`/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    }),
};

// ML
export const mlApi = {
  predictDemand: () => apiFetch<any>('/ml/predict-demand', { method: 'POST' }),
  retrain: () => apiFetch<any>('/ml/retrain', { method: 'POST' }),
  status: () => apiFetch<any>('/ml/model-status'),
};

// Substitution
export const substitutionApi = {
  getOffers: (orderId: string) => apiFetch<any>(`/substitution/order/${orderId}`),
  getOffer: (offerId: string) => apiFetch<any>(`/substitution/${offerId}`),
  respond: (offerId: string, response: string, rankSelected?: number) =>
    apiFetch<any>(`/substitution/${offerId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response, rank_selected: rankSelected }),
    }),
};

// Addresses
export const addressesApi = {
  list: () => apiFetch<any>('/addresses'),
  create: (data: any) => apiFetch<any>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/addresses/${id}`, { method: 'DELETE' }),
};
