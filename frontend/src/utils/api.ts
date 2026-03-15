import { store } from '../store';
import { logout } from '../store/authSlice';

export const API_URL = '/api';

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('Server is not available. Please try again.');
  }

  if (res.status === 401) {
    store.dispatch(logout());
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && !res.ok) {
    throw new Error('Server is not available. Please try again.');
  }

  return res;
}
