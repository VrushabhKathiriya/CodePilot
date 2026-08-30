import api from './axios';

export const syncApi = {
  syncPlatform:          (data)     => api.post('/codingplatforms/sync/platform', data),
  syncGithub:            (data)     => api.post('/codingplatforms/sync/github', data),
  getUpcomingContests:   ()         => api.get('/codingplatforms/contests/upcoming'),
  refreshUpcoming:       ()         => api.post('/codingplatforms/contests/refresh'),
  getContestHistory:     (platform) => api.get(`/codingplatforms/contests/history${platform ? `?platform=${platform}` : ''}`),
  getCfProblems:         ()         => api.get('/codingplatforms/codeforces/problems'),
  getLeetCodeProblems:   ()         => api.get('/codingplatforms/leetcode/problems'),
  getTopicStats:         (platform) => api.get(`/codingplatforms/topics${platform ? `?platform=${platform}` : ''}`),
  getGithubActivity:     ()         => api.get('/codingplatforms/activity/github'),
  getCpActivity:         (platform) => api.get(`/codingplatforms/activity/cp${platform ? `?platform=${platform}` : ''}`),
  getGithubStats:        ()         => api.get('/codingplatforms/github/stats'),
  getGithubLanguages:    ()         => api.get('/codingplatforms/github/languages'),
};

