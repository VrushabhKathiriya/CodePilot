import { useState, useCallback } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { useAnalyticsStore } from '../store/analyticsStore';

export function useAnalytics() {
  const store = useAnalyticsStore();
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  function setKey(key, v) { setLoading((p) => ({ ...p, [key]: v })); }
  function setErr(key, e) { setErrors((p) => ({ ...p, [key]: e })); }

  const fetch = useCallback(async (key, apiFn, storeSetter) => {
    if (store[key]) return store[key]; // cached
    setKey(key, true); setErr(key, null);
    try {
      const res = await apiFn();
      const data = res.data?.data;
      storeSetter(data);
      return data;
    } catch (e) {
      setErr(key, e.response?.data?.message || e.message);
    } finally {
      setKey(key, false);
    }
  }, [store]);

  return {
    loading,
    errors,
    dashboard:  store.dashboard,
    rating:     store.rating,
    contests:   store.contests,
    topics:     store.topics,
    difficulty: store.difficulty,
    fetchDashboard:  () => fetch('dashboard',  analyticsApi.getDashboard,  store.setDashboard),
    fetchRating:     () => fetch('rating',     analyticsApi.getRating,     store.setRating),
    fetchContests:   () => fetch('contests',   analyticsApi.getContests,   store.setContests),
    fetchTopics:     () => fetch('topics',     analyticsApi.getTopics,     store.setTopics),
    fetchDifficulty: () => fetch('difficulty', analyticsApi.getDifficulty, store.setDifficulty),
  };
}
