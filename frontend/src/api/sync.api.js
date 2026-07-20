import api from './axios';

export const syncApi = {
  syncPlatform:     (data) => api.post('/codingplatforms/sync/platform', data),
  syncGithub:       (data) => api.post('/codingplatforms/sync/github', data),
  getUpcomingContests: ()  => api.get('/codingplatforms/contests/upcoming'),
  getTopicStats:    ()     => api.get('/codingplatforms/topics'),
  getGithubActivity:()     => api.get('/codingplatforms/activity/github'),
  getCpActivity:    ()     => api.get('/codingplatforms/activity/cp'),
};
