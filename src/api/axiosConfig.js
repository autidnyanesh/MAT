import axios from "axios";
import {
  decryptPayload,
  encryptPayload,
  isPayloadEncryptionEnabled,
} from "../utils/payloadCrypt";

// ── Access token stored in MEMORY only (never localStorage/sessionStorage) ──
let accessToken = null;

/** Shared so React StrictMode does not fire /api/refresh twice on boot. */
let sessionRestorePromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export function resetSessionRestoreCache() {
  sessionRestorePromise = null;
}

/**
 * Empty base URL → same-origin via CRA "proxy" (cookies work on F5).
 * Set REACT_APP_API_URL only when API is on another deployed host.
 */
function apiBaseUrl() {
  const v = process.env.REACT_APP_API_URL;
  if (v == null || String(v).trim() === "") return "";
  return String(v).trim().replace(/\/$/, "");
}

const api = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

function readCsrfToken() {
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  return raw ? decodeURIComponent(raw) : null;
}

function isAuthUrl(url = "") {
  return (
    url.includes("/api/refresh") ||
    url.includes("/api/login") ||
    url.includes("/api/logout") ||
    url.includes("/api/auth/captcha")
  );
}

/**
 * Always POST /api/refresh and store the new access JWT in memory.
 * Used by inactivity OK, F5 restore, and 401 retry.
 */
export async function refreshAccessToken() {
  const res = await api.post("/api/refresh", {});
  const data = res.data;
  if (!data?.accessToken) throw new Error("No access token from refresh");
  setAccessToken(data.accessToken);
  return data;
}

/**
 * One shared POST /api/refresh for page-load restore (F5).
 * Uses api instance so response decrypt + credentials match other calls.
 */
export function restoreSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = refreshAccessToken().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(
        "[MAT] session restore failed",
        err?.response?.status || err?.message
      );
      return null;
    });
  }
  return sessionRestorePromise;
}

// ── Request: Bearer + CSRF + encrypt body ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const csrfToken = readCsrfToken();
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
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (status === 401 && isAuthUrl(url)) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
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
        const data = await refreshAccessToken();
        processQueue(null, data.accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        resetSessionRestoreCache();
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
