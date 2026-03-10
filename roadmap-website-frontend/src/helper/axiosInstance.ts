import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://roadmap-backend-1-9rcd.onrender.com",
  baseURL: "http://localhost:8000",
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
