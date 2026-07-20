import api from './axios';

export const recommendationApi = {
  getAll:   () => api.get('/recommendations/'),
  getTopics:() => api.get('/recommendations/topics'),
  getDaily: () => api.get('/recommendations/daily'),
};
