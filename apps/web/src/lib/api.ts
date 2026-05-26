const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface ApiOptions {
  method?: string;
  body?: any;
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = true } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>) => api<T>(endpoint, { params }),
  post: <T>(endpoint: string, body?: any) => api<T>(endpoint, { method: 'POST', body }),
  patch: <T>(endpoint: string, body?: any) => api<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => api<T>(endpoint, { method: 'DELETE' }),
};
