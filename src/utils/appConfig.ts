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
  appVersion: extra?.app_version || Constants.expoConfig?.version || "1.3.3",
  appCode:
    extra?.app_code ||
    (Platform.OS === "android"
      ? Constants.expoConfig?.android?.versionCode
      : Number(Constants.expoConfig?.ios?.buildNumber)) ||
    14,
  fullVersion: `${extra?.app_version || Constants.expoConfig?.version || "1.3.3"} (${
    extra?.app_code ||
    (Platform.OS === "android"
      ? Constants.expoConfig?.android?.versionCode
      : Constants.expoConfig?.ios?.buildNumber) ||
    14
  })`,
};