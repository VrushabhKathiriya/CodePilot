import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  dashboard:  null,
  rating:     null,
  contests:   null,
  topics:     null,
  difficulty: null,

  setDashboard:  (d) => set({ dashboard: d }),
  setRating:     (d) => set({ rating: d }),
  setContests:   (d) => set({ contests: d }),
  setTopics:     (d) => set({ topics: d }),
  setDifficulty: (d) => set({ difficulty: d }),
  clearAll:      ()  => set({ dashboard: null, rating: null, contests: null, topics: null, difficulty: null }),
}));
