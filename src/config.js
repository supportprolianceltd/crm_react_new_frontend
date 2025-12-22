import axios from "axios";

const config = {
  WEB_PAGE__URL: import.meta.env.VITE_WEB_PAGE_URL,
  API_Documentation_URL: import.meta.env.VITE_API_DOCUMENTATION_URL,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL,
};

export const API_BASE_URL = `${config.API_BASE_URL}`;
export const WEBSOCKET_URL = `${config.WEBSOCKET_URL}`;
export const WEB_PAGE__URL = `${config.WEB_PAGE__URL}`;

// Create an axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.defaults.withCredentials = true;

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        }, {
          withCredentials: true,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tenantId");
        localStorage.removeItem("tenantSchema");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);