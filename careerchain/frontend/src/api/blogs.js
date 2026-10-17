import apiClient from './client';

export const blogsApi = {
  getBlogs: async (params = {}) => {
    const response = await apiClient.get('/blogs', { params });
    return response.data;
  },

  getBlogById: async (blogId) => {
    const response = await apiClient.get(`/blogs/${blogId}`);
    return response.data;
  },

  getMyBlogs: async () => {
    const response = await apiClient.get('/blogs/my/posts');
    return response.data;
  },

  createBlog: async (blogData) => {
    const response = await apiClient.post('/blogs', blogData);
    return response.data;
  },

  updateBlog: async (blogId, blogData) => {
    const response = await apiClient.put(`/blogs/${blogId}`, blogData);
    return response.data;
  },

  deleteBlog: async (blogId) => {
    const response = await apiClient.delete(`/blogs/${blogId}`);
    return response.data;
  },
};
