import api from './axios';

export const portfolioApi = {
  getByUsername: (username) => api.get(`/portfolio/${username}`),
};
