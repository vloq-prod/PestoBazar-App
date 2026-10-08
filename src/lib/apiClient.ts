// src/lib/apiClient.ts

import axios from "axios";
import { getAppHeaders } from "../utils/appHeaders";

const ENVIRONMENT =
  process.env.EXPO_PUBLIC_ENVIRONMENT?.toUpperCase() ?? "PRODUCTION";

const BASE_URLS = {
  STAGING: "https://pestobazaar.vloq.com/",
  PRODUCTION: "https://pestobazaar.com/",
};

export const BASE_URL =
  BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] || BASE_URLS.PRODUCTION;

const baseURL = BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const appHeaders = getAppHeaders();
    Object.entries(appHeaders).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (!config.headers?.has(key)) {
          config.headers?.set(key, String(value));
        }
      }
    });

    // Ensure cache-busting headers are always present
    config.headers?.set("Cache-Control", "no-cache, no-store, must-revalidate");
    config.headers?.set("Pragma", "no-cache");
    config.headers?.set("Expires", "0");

    // Add unique timestamp query parameter to GET requests to bypass any HTTP/CDN/Device caching
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      console.warn(`🔒 [apiClient] 401 Unauthorized on: ${url}`);
    } else if (status === 500) {
      const serverMsg = error.response?.data?.message;
      console.warn(`⚠️ [apiClient] 500 Server Error on: ${url}${serverMsg ? ` (${serverMsg})` : ""}`);
    } else if (error.code === "ECONNABORTED" || !error.response) {
      console.warn(`📡 [apiClient] Network timeout or disconnected on: ${url}`);
    }

    return Promise.reject(error);
  },
);
