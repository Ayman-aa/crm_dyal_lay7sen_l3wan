import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies
});

// Track if a token refresh is in progress to prevent multiple calls
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to retry failed requests
const retryRequest = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Add a subscriber for retrying requests
const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and it's not an already retried request or refresh request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, wait for it to complete
        return new Promise(resolve => {
          addSubscriber((token) => {
            // Replace the expired token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        // Token refresh successful
        const { token } = response.data;
        
        // Notify all subscribers
        retryRequest(token);
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors
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