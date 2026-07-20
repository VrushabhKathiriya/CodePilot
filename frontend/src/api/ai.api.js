import api from './axios';

export const aiApi = {
  getSummary:      (refresh = false) => api.get(`/ai/summary${refresh ? '?refresh=true' : ''}`),
  getWeekly:       (refresh = false) => api.get(`/ai/weekly${refresh ? '?refresh=true' : ''}`),
  getMonthly:      (refresh = false) => api.get(`/ai/monthly${refresh ? '?refresh=true' : ''}`),
  getStudyPlan:    (refresh = false) => api.get(`/ai/study-plan${refresh ? '?refresh=true' : ''}`),
  getContestReview:(refresh = false) => api.get(`/ai/contest-review${refresh ? '?refresh=true' : ''}`),
  getHistory:      (type, limit = 10) => api.get(`/ai/history${type ? `?type=${type}&limit=${limit}` : `?limit=${limit}`}`),
};
