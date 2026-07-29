import { useState, useCallback } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { useAnalyticsStore } from '../store/analyticsStore';

function mapRatingData(data) {
  if (!data) return { current: {}, history: [] };
  const current = {};
  const historyMap = {};

  const platforms = data.platforms || [];
  platforms.forEach(p => {
    const key = p.platform.toLowerCase(); // 'codeforces', 'leetcode', etc.
    current[key] = p.currentRating;

    if (Array.isArray(p.ratingHistory)) {
      p.ratingHistory.forEach(h => {
        const dateObj = new Date(h.date);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short' }); // e.g. 'Jul'
        
        if (!historyMap[label]) {
          historyMap[label] = { date: label };
        }
        historyMap[label][key] = h.rating;
      });
    }
  });

  return { current, history: Object.values(historyMap) };
}

function mapContestsData(data) {
  if (!data) return { total: 0, bestRank: null, avgRank: null, ratingDelta: 0, history: [] };

  const rawContests = data.contests || [];
  const ratingDelta = rawContests.reduce((sum, c) => sum + (c.ratingChange || 0), 0);

  const history = rawContests.map(c => {
    const d = new Date(c.contestDate);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short' }),
      rank: c.rank,
    };
  });

  return {
    total: data.totalContests ?? 0,
    bestRank: data.bestRank,
    avgRank: data.averageRank,
    ratingDelta,
    history,
  };
}

function mapTopics(data) {
  if (!data) return { topics: [] };
  const raw = Array.isArray(data) ? data : data.topics || data.topicStats || [];
  const list = raw.map((t) => ({
    topic: t.topic,
    count: t.solved ?? t.count ?? t.problemCount ?? 0,
  }));
  return { topics: list };
}

function mapDifficulty(data) {
  if (!data) return { difficultyBreakdown: [] };
  const raw = Array.isArray(data) ? data : data.difficultyBreakdown || data.distribution || [];
  const list = raw.map((d) => ({
    difficulty: d.difficulty,
    count: d.solved ?? d.count ?? d.attempted ?? 0,
  }));
  return { difficultyBreakdown: list, ratingBrackets: data.ratingBrackets || [] };
}

export function useAnalytics() {
  const store = useAnalyticsStore();
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  function setKey(key, v) { setLoading((p) => ({ ...p, [key]: v })); }
  function setErr(key, e) { setErrors((p) => ({ ...p, [key]: e })); }

  const fetch = useCallback(async (key, apiFn, storeSetter, mapper) => {
    if (store[key]) return store[key]; // cached
    setKey(key, true); setErr(key, null);
    try {
      const res = await apiFn();
      let data = res.data?.data;
      if (mapper) data = mapper(data);
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
    fetchRating:     () => fetch('rating',     analyticsApi.getRating,     store.setRating,     mapRatingData),
    fetchContests:   () => fetch('contests',   analyticsApi.getContests,   store.setContests,   mapContestsData),
    fetchTopics:     () => fetch('topics',     analyticsApi.getTopics,     store.setTopics,     mapTopics),
    fetchDifficulty: () => fetch('difficulty', analyticsApi.getDifficulty, store.setDifficulty, mapDifficulty),
  };
}
