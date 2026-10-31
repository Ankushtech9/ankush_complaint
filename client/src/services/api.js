import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 20000,
  headers: { Accept: "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civic_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Server response mein der ho rahi hai. Please dobara try karein.";
    } else if (!error.response) {
      error.message = "API server se connection nahi ho paaya. Backend running hai ya nahi check karein.";
    }
    return Promise.reject(error);
  }
);

export default api;
