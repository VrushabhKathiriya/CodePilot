import api from './axios';

export const userApi = {
  getProfile:      (username) => api.get(`/users/profile/${username}`),
  upsertProfile:   (data)     => api.put('/users/profile', data),
  updateInfo:      (data)     => api.patch('/users/info', data),
  uploadAvatar:    (formData) => api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Social links
  upsertSocialLink: (data)         => api.put('/users/social', data),
  deleteSocialLink: (platform)     => api.delete(`/users/social/${platform}`),

  // Education
  addEducation:    (data)  => api.post('/users/education', data),
  updateEducation: (id, d) => api.patch(`/users/education/${id}`, d),
  deleteEducation: (id)    => api.delete(`/users/education/${id}`),

  // Experience
  addExperience:    (data)  => api.post('/users/experience', data),
  updateExperience: (id, d) => api.patch(`/users/experience/${id}`, d),
  deleteExperience: (id)    => api.delete(`/users/experience/${id}`),

  // Achievements
  addAchievement:    (data)  => api.post('/users/achievement', data),
  updateAchievement: (id, d) => api.patch(`/users/achievement/${id}`, d),
  deleteAchievement: (id)    => api.delete(`/users/achievement/${id}`),

  // Projects
  addProject:    (data)    => api.post('/users/project', data),
  updateProject: (id, d)   => api.patch(`/users/project/${id}`, d),
  deleteProject: (id)      => api.delete(`/users/project/${id}`),
  reorderProjects:(data)   => api.patch('/users/project/reorder', data),
};
