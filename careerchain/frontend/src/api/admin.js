import apiClient from './client';

export const adminApi = {
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getUsers: async (role = '') => {
    const response = await apiClient.get('/admin/users', { params: role ? { role } : {} });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  toggleIdentityVerification: async (userId) => {
    const response = await apiClient.patch(`/admin/users/${userId}/verify-identity`);
    return response.data;
  },

  toggleAlumniVerification: async (profileId) => {
    const response = await apiClient.patch(`/admin/alumni/${profileId}/verify`);
    return response.data;
  },
};
