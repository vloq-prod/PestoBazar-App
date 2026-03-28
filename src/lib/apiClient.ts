// src/lib/apiClient.ts

import axios from "axios";
import { getAppHeaders } from "../utils/appHeaders";

const ENVIRONMENT =
  process.env.EXPO_PUBLIC_ENVIRONMENT?.toUpperCase() ?? "STAGING";

const BASE_URLS = {
  STAGING: "http://pestobazaar.confidevtech.com/",
  PRODUCTION: "https://api.production.com/api",
};

const baseURL =
  BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] || BASE_URLS.STAGING;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const appHeaders = getAppHeaders();
    Object.entries(appHeaders).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        config.headers?.set(key, String(value));
      }
    });

    return config;
  },
  (error) => Promise.reject(error),
);
