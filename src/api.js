import axios from 'axios';

const API_BASE_URL = 'http://localhost:4043/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPosts = () => api.get('/posts');
export const createPost = (content, images, video) => {
  const formData = new FormData();
  formData.append('content', content);
  if (images) {
    images.forEach((image) => formData.append('images', image));
  }
  if (video) {
    formData.append('video', video);
  }
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMediaUrl = (fileId) => {
  return `${API_BASE_URL}/posts/media/${fileId}`;
};

export const updatePost = (postId, content) => {
  return api.put(`/posts/${postId}`, null, {
    params: { content },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
};
export const likePost = (postId) => api.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => api.post(`/posts/${postId}/unlike`);
export const addComment = (postId, content) => api.post(`/posts/${postId}/comment`, { content });
export const deletePost = (postId) => api.delete(`/posts/${postId}`);
export const getFollowingPosts = () => api.get('/posts/following');
export const getRecommendedUsers = () => api.get('/users/recommendations');
export const followUser = (userId) => api.post(`/users/follow/${userId}`);
export const unfollowUser = (userId) => api.post(`/users/unfollow/${userId}`);
