import apiClient from './client';

export const jobsApi = {
  getJobs: async (params = {}) => {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  getMyJobs: async () => {
    const response = await apiClient.get('/jobs/my/listings');
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await apiClient.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  },
};
