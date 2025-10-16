const API_BASE_URL = 'https://itecony-neriva-backend.onrender.com';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const api = {
  // 1. POST /api/signup
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // 2. POST /api/login
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      
      // Store token if returned
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // 3. GET /api/auth/google
  googleAuth: () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  // 4. GET /api/profile (protected)
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // 5. PUT /api/profile (protected)
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // 6. GET /api/users (protected)
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // 7. GET /api/health
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // Logout helper
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },
};

export default api;