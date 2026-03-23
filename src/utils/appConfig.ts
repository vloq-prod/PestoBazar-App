import Constants from "expo-constants";

type AppConfig = {
  app_name: string;
  app_version: string;
  app_code: number;
};

const extra = Constants.expoConfig?.extra as AppConfig;

export const AppConfigUtil = {
  appName: extra?.app_name,
  appVersion: extra?.app_version,
  appCode: extra?.app_code || 1,

  fullVersion: `${extra?.app_version} (${extra?.app_code || 1})`,
};
