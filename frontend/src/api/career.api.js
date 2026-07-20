import api from './axios';

export const careerApi = {
  getReadiness:        (refresh = false) => api.get(`/careerreadiness/career/readiness${refresh ? '?refresh=true' : ''}`),
  getReadinessHistory: (limit = 10)      => api.get(`/careerreadiness/career/readiness/history?limit=${limit}`),
};
