// authService.ts
// Handles communication with backend authentication endpoints and token storage

const getApiBase = () => {
  // Check if we have an environment variable
  const envBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE;
  if (envBase) {
    return envBase.replace(/\/api\/?$/, '');
  }
  
  // Fallback to localhost if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://${window.location.hostname}:8000`;
  }
  
  // Final fallback
  return 'http://localhost:8000';
};

const API_BASE = getApiBase();

interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  success: boolean;
  user: any;
  tokens: Tokens;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: any;
  requires_login?: boolean;
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
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const res = await fetch(`${API_BASE}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw body;
    }
    return res.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json().catch(() => ({}));
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
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  setMpin: async (userId: number, mpin: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/auth/set-mpin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, mpin })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw body;
    return body;
  },

  verifyMpin: async (userId: number, mpin: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/auth/verify-mpin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, mpin })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw body;
    return body;
  }
};

// convenience helper to attach Authorization header
export const authFetch = (input: RequestInfo, init?: RequestInit) => {
  const token = getAccessToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};
