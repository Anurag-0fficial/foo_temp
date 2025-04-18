import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure the token is properly formatted with 'Bearer' prefix
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If the request data is FormData, remove the Content-Type header
    // to let the browser set it with the correct boundary
    if (config.data instanceof FormData) {
      console.log('Request contains FormData, removing Content-Type header');
      delete config.headers['Content-Type'];
      
      // Log the FormData contents
      console.log('FormData contents in interceptor:');
      for (let pair of config.data.entries()) {
        console.log('FormData entry:', pair[0] + ': ' + (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]));
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Enquiries API
export const enquiriesAPI = {
  getAll: (params) => api.get('/enquiries', { params }),
  getById: (id) => api.get(`/enquiries/${id}`),
  create: (enquiryData) => api.post('/enquiries', enquiryData),
  update: (id, enquiryData) => api.put(`/enquiries/${id}`, enquiryData),
  addNote: (id, noteData) => api.post(`/enquiries/${id}/notes`, noteData),
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  addNote: (id, noteData) => api.post(`/customers/${id}/notes`, noteData),
  updateTags: (id, tags) => api.put(`/customers/${id}/tags`, { tags }),
  updateLastContact: (id, date) => api.put(`/customers/${id}/last-contact`, { date }),
};

export default api; 