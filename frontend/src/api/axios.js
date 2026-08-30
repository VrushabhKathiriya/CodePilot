import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,   // send httpOnly cookies automatically
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Response interceptor: auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't retry refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/users/refresh-token') &&
      !original.url?.includes('/users/login') &&
      !original.url?.includes('/users/register')
    ) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post(
          '/users/refresh-token',
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Clear auth state — import store lazily to avoid circular deps
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().clearUser();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
