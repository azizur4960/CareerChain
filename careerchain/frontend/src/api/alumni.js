import apiClient from './client';

export const alumniApi = {
  getAlumni: async (params = {}) => {
    const response = await apiClient.get('/alumni', { params });
    return response.data;
  },

  getAlumniById: async (userId) => {
    const response = await apiClient.get(`/alumni/${userId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await apiClient.get('/alumni/me');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await apiClient.put('/alumni/me', profileData);
    return response.data;
  },
};
