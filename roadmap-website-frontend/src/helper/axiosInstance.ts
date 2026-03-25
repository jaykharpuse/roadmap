import axios from "axios";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Add token to Authorization header if it exists in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
