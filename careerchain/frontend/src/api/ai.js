import apiClient from './client';

export const aiApi = {
  matchJob: async (data) => {
    const response = await apiClient.post('/ai/match-job', data);
    return response.data;
  },

  getRankedJobs: async () => {
    const response = await apiClient.get('/ai/match-jobs');
    return response.data;
  },

  getRecommendedMentors: async () => {
    const response = await apiClient.get('/ai/recommend-mentors');
    return response.data;
  },

  chatAssistant: async (chatData) => {
    const response = await apiClient.post('/ai/assistant/chat', chatData);
    return response.data;
  },

  analyzeResume: async (formData) => {
    const response = await apiClient.post('/ai/resume-match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
