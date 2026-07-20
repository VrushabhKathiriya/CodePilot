import { useState, useCallback } from 'react';
import { aiApi } from '../api/ai.api';

export function useAI() {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  const fetchSection = useCallback(async (key, apiFn, refresh = false) => {
    if (!refresh && data[key]) return data[key];
    setLoading((p) => ({ ...p, [key]: true }));
    setErrors ((p) => ({ ...p, [key]: null }));
    try {
      const res = await apiFn(refresh);
      const d = res.data?.data;
      setData((p) => ({ ...p, [key]: d }));
      return d;
    } catch (e) {
      setErrors((p) => ({ ...p, [key]: e.response?.data?.message || e.message }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }, [data]);

  return {
    data,
    loading,
    errors,
    fetchSummary:       (r) => fetchSection('summary',       aiApi.getSummary,       r),
    fetchWeekly:        (r) => fetchSection('weekly',        aiApi.getWeekly,        r),
    fetchMonthly:       (r) => fetchSection('monthly',       aiApi.getMonthly,       r),
    fetchStudyPlan:     (r) => fetchSection('studyPlan',     aiApi.getStudyPlan,     r),
    fetchContestReview: (r) => fetchSection('contestReview', aiApi.getContestReview, r),
    fetchHistory:       (type, limit) => fetchSection('history', () => aiApi.getHistory(type, limit), false),
  };
}
