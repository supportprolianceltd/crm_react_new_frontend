import axios from 'axios';
import { API_BASE_URL } from '../../../config';

// Create a dedicated Axios instance for createUser with no default Content-Type
const userApiClient = axios.create({
  baseURL: API_BASE_URL,
  // No default Content-Type; browser will set multipart/form-data for FormData
});

// Request interceptor to include access token
userApiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
userApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return userApiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantSchema');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export const fetchModules = async () => {
  try {
    const response = await userApiClient.get(`${API_BASE_URL}/api/tenant/modules/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch modules.');
  }
};

export const fetchTenant = async () => {
  try {
    const response = await userApiClient.get(`${API_BASE_URL}/api/tenant/tenants/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch tenant data.');
  }
};
export const fetchTenantUsers = async () => {
  try {
    const response = await userApiClient.get(`${API_BASE_URL}/api/user/tenant-users/`);
    // console.log("response.data")
    // console.log(response.data)
    // console.log("response.data")

    return response.data;


  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch  tenant-users/.');
  }
};

export const createUser = async (userData) => {
  try {
    const formDataEntries = {};
    for (let [key, value] of userData.entries()) {
      formDataEntries[key] = value instanceof File ? `${value.name} (${value.size} bytes)` : value;
    }
    //console.log('FormData being sent to API:', formDataEntries);

    const response = await userApiClient.post('/api/user/create/', userData);
    return response.data;
  } catch (error) {
    console.error('createUser error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorDetails = error.response?.data?.message;
    const errorMessage = typeof errorDetails === 'object'
      ? Object.entries(errorDetails)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ')
      : errorDetails || error.message || 'Failed to create user.';
    throw new Error(errorMessage);
  }
};

export const createBranch = async (branchData) => {
  try {
    const response = await userApiClient.post('/api/tenant/branches/', branchData);
    return response.data;
  } catch (error) {
    console.error('createBranch error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorDetails = error.response?.data?.detail || error.response?.data?.message;
    const errorMessage = typeof errorDetails === 'object'
      ? Object.entries(errorDetails)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ')
      : errorDetails || error.message || 'Failed to create branch.';
    throw new Error(errorMessage);
  }
};

export const updateBranch = async (branchId, branchData) => {
  try {
    const response = await userApiClient.put(`/api/tenant/branches/${branchId}/`, branchData);
    return response.data;
  } catch (error) {
    console.error('updateBranch error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorDetails = error.response?.data?.detail || error.response?.data?.message;
    const errorMessage = typeof errorDetails === 'object'
      ? Object.entries(errorDetails)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ')
      : errorDetails || error.message || 'Failed to update branch.';
    throw new Error(errorMessage);
  }
};

export const deleteBranch = async (branchId) => {
  try {
    const response = await userApiClient.delete(`/api/tenant/branches/${branchId}/`);
    return response.data;
  } catch (error) {
    console.error('deleteBranch error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorDetails = error.response?.data?.detail || error.response?.data?.message;
    const errorMessage = typeof errorDetails === 'object'
      ? Object.entries(errorDetails)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ')
      : errorDetails || error.message || 'Failed to delete branch.';
    throw new Error(errorMessage);
  }
};

export const fetchBranches = async () => {
  try {
    const response = await userApiClient.get(`${API_BASE_URL}/api/tenant/branches/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch branches.');
  }
};

export const fetchAllTasks = async () => {
  try {
    const response = await userApiClient.get('/api/rostering/tasks/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch tasks.');
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await userApiClient.delete(`/api/rostering/tasks/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete task.');
  }
};
