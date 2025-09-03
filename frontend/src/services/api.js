import axios from 'axios';
import { baseUrl } from '../../apiConfig.js';

const API_BASE_URL = `${baseUrl}/api`;

console.log('API Configuration:', {
  baseUrl,
  API_BASE_URL
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This enables cookies to be sent with requests
});

// Add auth token to requests (cookies are sent automatically, but keep this for fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SEO Accounts API
export const seoAccountsAPI = {
  // Get all SEO accounts (filtered by role on backend)
  getAll: () => api.get('/seo-accounts'),
  
  // Get single SEO account
  getById: (id) => api.get(`/seo-accounts/${id}`),
  
  // Create new SEO account
  create: (accountData) => api.post('/seo-accounts', accountData),
  
  // Update SEO account
  update: (id, accountData) => api.put(`/seo-accounts/${id}`, accountData),
  
  // Delete SEO account
  delete: (id) => api.delete(`/seo-accounts/${id}`)
};

// Blog Posts API
export const blogPostsAPI = {
  // Get all blog posts (filtered by role on backend)
  getAll: () => api.get('/blog-posts'),
  
  // Get single blog post
  getById: (id) => api.get(`/blog-posts/${id}`),
  
  // Create new blog post
  create: (postData) => api.post('/blog-posts', postData),
  
  // Update blog post
  update: (id, postData) => api.put(`/blog-posts/${id}`, postData),
  
  // Delete blog post
  delete: (id) => api.delete(`/blog-posts/${id}`),
  
  // Review blog post (Agency/Admin only)
  review: (id, reviewData) => api.patch(`/blog-posts/${id}/review`, reviewData),
  
  // Add revision note
  addRevision: (id, revisionData) => api.post(`/blog-posts/${id}/revision`, revisionData),
  
  // Publish blog post
  publish: (id) => api.patch(`/blog-posts/${id}/publish`)
};

// Backlinks API
export const backlinksAPI = {
  // Get all backlinks (filtered by role on backend)
  getAll: () => api.get('/backlinks'),
  
  // Get single backlink
  getById: (id) => api.get(`/backlinks/${id}`),
  
  // Create new backlink
  create: (backlinkData) => api.post('/backlinks', backlinkData),
  
  // Update backlink
  update: (id, backlinkData) => api.put(`/backlinks/${id}`, backlinkData),
  
  // Delete backlink
  delete: (id) => api.delete(`/backlinks/${id}`)
};

// Dashboard API calls
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get('/dashboard/activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

export const getEnhancedUserStats = async () => {
  try {
    const response = await api.get('/dashboard/user-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced user stats:', error);
    throw error;
  }
};

export default api;
