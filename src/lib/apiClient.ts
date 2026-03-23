import axios from "axios";

const ENVIRONMENT =
  process.env.EXPO_PUBLIC_ENVIRONMENT?.toUpperCase() ?? "PRODUCTION";

const BASE_URLS = {
  STAGING: "https://staging-api.furnixcrm.com/api",
  PRODUCTION: "https://api.production.com/api",
};

const baseURL =
  BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] || BASE_URLS.PRODUCTION;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
