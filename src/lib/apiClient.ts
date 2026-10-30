// src/lib/apiClient.ts

import axios from "axios";
import { getAppHeaders } from "../utils/appHeaders";

const ENVIRONMENT =
  process.env.EXPO_PUBLIC_ENVIRONMENT?.toUpperCase() ?? "LOCAL";

const BASE_URLS = {
  LOCAL: "http://192.168.1.101:8000/",
  STAGING: "https://pestobazaar.vloq.com/",
  PRODUCTION: "https://pestobazaar.com/",
};

export const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] ||
  BASE_URLS.LOCAL;

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

    // If body is FormData, ensure multipart/form-data header and bypass Axios JSON serialization
    const isFormData =
      config.data instanceof FormData ||
      (config.data &&
        (typeof (config.data as any).append === "function" ||
          (config.data as any)._parts !== undefined));

    if (isFormData) {
      config.headers?.set("Content-Type", "multipart/form-data");
      config.transformRequest = [(data) => data];
    }

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
      const serverMsg = error.response?.data?.message;
      if (typeof serverMsg === "string" && /invalid visitor/i.test(serverMsg)) {
        try {
          const { useAppVisitorStore } = await import("../store/auth");
          await useAppVisitorStore.getState().resetVisitor();
        } catch (_) {}
      }
    } else if (status === 500) {
      const serverMsg = error.response?.data?.message;
      console.warn(`⚠️ [apiClient] 500 Server Error on: ${url}${serverMsg ? ` (${serverMsg})` : ""}`);
    } else if (error.code === "ECONNABORTED" || !error.response) {
      const errDetail = error.message || error.code || "unknown";
      console.warn(`📡 [apiClient] Network timeout or disconnected on: ${url} (${errDetail})`);
    }

    return Promise.reject(error);
  },
);
