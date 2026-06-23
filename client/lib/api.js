const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers
  });

  const data = await res.json().catch(() => ({}));
  
  if (typeof window !== 'undefined') {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (path === '/api/auth/logout') {
      localStorage.removeItem('token');
    }
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
