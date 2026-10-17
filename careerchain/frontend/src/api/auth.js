import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, new_password) => {
    const response = await apiClient.post('/auth/reset-password', { token, new_password });
    return response.data;
  },

  resetPasswordWithVerification: async (credentials) => {
    const response = await apiClient.post('/auth/reset-password/verify', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await apiClient.post('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  removeAvatar: async () => {
    const response = await apiClient.delete('/auth/me/avatar');
    return response.data;
  },
};
