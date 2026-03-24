// src/utils/appConfig.ts

import { Platform } from "react-native";
import Constants from "expo-constants";

type AppConfig = {
  app_version: string;
  app_code: number;
};

const extra = Constants.expoConfig?.extra as AppConfig;

export const AppConfigUtil = {
  appName: Platform.OS,
  appVersion: extra?.app_version || "1.0.0",
  appCode: extra?.app_code || 1,

  fullVersion: `${extra?.app_version || "1.0.0"} (${extra?.app_code || 1})`,
};