// authService.ts
// Handles communication with backend authentication endpoints and token storage

const rawBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
// Strip trailing /api or /api/ so we can append /api/auth/... uniformly
const API_BASE = rawBase.replace(/\/api\/?$/, '');

interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  success: boolean;
  user: any;
  tokens: Tokens;
}

export interface RegisterData {
  username: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

const saveTokens = (tokens: Tokens) => {
  localStorage.setItem('accessToken', tokens.access);
  localStorage.setItem('refreshToken', tokens.refresh);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const getAccessToken = () => localStorage.getItem('accessToken');

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/api/auth/register/`, {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw body;
    saveTokens(body.tokens);
    return body;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) throw body;
    saveTokens(body.tokens);
    return body;
  },

  logout: async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      clearTokens();
    }
  },

  getCurrentUser: async (): Promise<any> => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');
    const res = await fetch(`${API_BASE}/api/auth/me/`, {      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }
};

// convenience helper to attach Authorization header
export const authFetch = (input: RequestInfo, init?: RequestInit) => {
  const token = getAccessToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};
