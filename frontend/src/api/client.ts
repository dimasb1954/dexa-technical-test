import axios from 'axios';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AUTH_URL: string =
  import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3001';
export const ATTENDANCE_URL: string =
  import.meta.env.VITE_ATTENDANCE_URL ?? 'http://localhost:3002';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const saveSession = (token: string, user: unknown) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

function createClient(baseURL: string) {
  const client = axios.create({ baseURL });

  // Sisipkan token JWT di setiap request
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Token kedaluwarsa atau tidak valid lanjut bersihkan sesi lalu ke halaman login
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const isLogin = error.config?.url?.includes('/auth/login');
      if (error.response?.status === 401 && !isLogin) {
        clearSession();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const authApi = createClient(AUTH_URL);
export const attendanceApi = createClient(ATTENDANCE_URL);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    if (!err.response) return 'Tidak dapat terhubung ke server';
    return err.message;
  }
  return 'Terjadi kesalahan';
}