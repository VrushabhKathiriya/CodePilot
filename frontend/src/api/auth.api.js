import api from './axios';

export const authApi = {
  register:          (data)  => api.post('/users/register', data),
  verifyOTP:         (data)  => api.post('/users/verify-otp', data),
  resendOtp:         (data)  => api.post('/users/resend-otp', data),
  login:             (data)  => api.post('/users/login', data),
  logout:            ()      => api.post('/users/logout'),
  getMe:             ()      => api.get('/users/me'),
  refreshToken:      ()      => api.post('/users/refresh-token'),
  forgotPassword:    (data)  => api.post('/users/forgot-password', data),
  resetPassword:     (data)  => api.post('/users/reset-password', data),
  changePassword:    (data)  => api.post('/users/change-password', data),
  changeEmail:       (data)  => api.post('/users/change-email', data),
  verifyEmailChange: (data)  => api.post('/users/verify-email-change', data),
  deleteAccount:     ()      => api.delete('/users/delete-account'),
};
