import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        // 1. Nukes the token
        localStorage.removeItem("token");

        // 2. Triggers your AlertContext to show the red toast
        window.dispatchEvent(new Event("auth-changed"));

        // 3. Native fallback: If Next.js ignores the router.push, this forces the redirect
        if (!window.location.pathname.includes("/auth/login")) {
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 500); // 500ms delay lets the "Session expired" toast render first
        }
      }
    }

    return Promise.reject(error);
  },
);
