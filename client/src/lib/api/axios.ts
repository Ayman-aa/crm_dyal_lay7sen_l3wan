import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't automatically redirect to login on 401 errors
    // Let the components/context handle this to prevent redirect loops
    
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        msg: error.response.data?.msg || 'Server error',
        ...error.response.data
      });
    }
    
    return Promise.reject({
      msg: 'Network error. Please check your connection.'
    });
  }
);

export default api;