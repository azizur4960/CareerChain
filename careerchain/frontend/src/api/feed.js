import apiClient from './client';

export const feedApi = {
  getFeed: async (params = {}) => (await apiClient.get('/feed', { params })).data,
  createPost: async (data) => (await apiClient.post('/feed', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data,
  addComment: async (postId, data) => (await apiClient.post(`/feed/${postId}/comments`, data)).data,
  deleteComment: async (postId, commentId) => (await apiClient.delete(`/feed/${postId}/comments/${commentId}`)).data,
  toggleReaction: async (postId, emoji) => (await apiClient.put(`/feed/${postId}/reactions`, { emoji })).data,
  deletePost: async (postId) => apiClient.delete(`/feed/${postId}`),
};
