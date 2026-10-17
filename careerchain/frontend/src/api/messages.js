import apiClient from './client';

export const messagesApi = {
  getConversations: async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  getConversationHistory: async (conversationId) => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  sendMessage: async (data) => {
    const response = await apiClient.post('/messages/send', data);
    return response.data;
  },
};
