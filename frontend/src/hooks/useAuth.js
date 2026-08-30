import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import { useUIStore } from '../store/uiStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, clearUser } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  async function login(credentials) {
    const res = await authApi.login(credentials);
    const u = res.data?.data?.user || res.data?.data;
    setUser(u);
    try {
      const meRes = await authApi.getMe();
      if (meRes.data?.data) {
        setUser(meRes.data.data);
      }
    } catch (_) {}
    return u;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (_) { /* ignore */ }
    clearUser();
    window.location.href = '/login';
  }

  async function refreshMe() {
    try {
      const res = await authApi.getMe();
      setUser(res.data?.data);
    } catch (_) {
      clearUser();
    }
  }

  return { user, isAuthenticated, isLoading, login, logout, refreshMe, setUser, clearUser, addToast };
}
