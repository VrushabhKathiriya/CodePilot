import api from './axios';

export const analyticsApi = {
  getDashboard:  () => api.get('/analytics/dashboard'),
  getRating:     () => api.get('/analytics/rating'),
  getContests:   () => api.get('/analytics/contests'),
  getTopics:     () => api.get('/analytics/topics'),
  getDifficulty: () => api.get('/analytics/difficulty'),
  getProgress:   () => api.get('/analytics/progress'),
};
