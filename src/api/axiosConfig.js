import axios from "axios";
import {
  decryptPayload,
  encryptPayload,
  isPayloadEncryptionEnabled,
} from "../utils/payloadCrypt";

// ── Access token stored in MEMORY only (never localStorage/sessionStorage) ──
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("AXIOS BASE URL =", api.defaults.baseURL);

function maybeDecrypt(payload) {
  if (
    isPayloadEncryptionEnabled() &&
    payload &&
    typeof payload === "object" &&
    typeof payload.data === "string"
  ) {
    return decryptPayload(payload);
  }
  return payload;
}

// ── Request: Bearer + CSRF + encrypt body ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (
      csrfToken &&
      ["post", "put", "delete", "patch"].includes(config.method)
    ) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    if (
      isPayloadEncryptionEnabled() &&
      config.data != null &&
      ["post", "put", "patch", "delete"].includes(config.method) &&
      !config.headers?.["X-Skip-Payload-Encryption"]
    ) {
      // Avoid double-wrapping
      if (!(typeof config.data === "object" && config.data.data && config.data.hmac !== undefined)) {
        config.data = encryptPayload(config.data);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ── Response: decrypt envelope + refresh on 401 ─────────────────────────────
api.interceptors.response.use(
  (response) => {
    response.data = maybeDecrypt(response.data);
    return response;
  },
  async (error) => {
    if (error.response?.data) {
      try {
        error.response.data = maybeDecrypt(error.response.data);
      } catch {
        /* keep raw */
      }
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshBody = isPayloadEncryptionEnabled() ? encryptPayload({}) : {};
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || api.defaults.baseURL}/api/refresh`,
          refreshBody,
          { withCredentials: true }
        );
        const payload = maybeDecrypt(response.data);
        const newToken = payload?.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        window.dispatchEvent(new Event("session-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
