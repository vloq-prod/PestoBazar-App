import { Platform } from "react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { apiClient } from "../lib/apiClient";
import type { CheckUpdateResponse } from "../types/appVersion.types";

export const getAppBuildDetails = () => {
  const platform = Platform.OS === "ios" ? "ios" : "android";

  const rawBuildNumber =
    Application.nativeBuildVersion ||
    (Platform.OS === "android"
      ? Constants.expoConfig?.android?.versionCode?.toString()
      : Constants.expoConfig?.ios?.buildNumber) ||
    "1";

  const buildNumber = parseInt(rawBuildNumber, 10) || 1;

  const versionName =
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    "1.0.0";

  return {
    platform,
    buildNumber,
    versionName,
    appCode: "pestobazaar",
  };
};

export const checkAppUpdateApi = async (): Promise<CheckUpdateResponse> => {
  const { platform, buildNumber, versionName, appCode } = getAppBuildDetails();

  const params = {
    app_code: appCode,
    app_name: platform,
    app_version: buildNumber,
    current_version_name: versionName,
  };

  const response = await apiClient.get<CheckUpdateResponse>(
    "/app-api/v1/check-update",
    {
      params,
      headers: {
        "app-version": String(buildNumber),
        "app_version": String(buildNumber),
        "app-name": platform,
        "app_name": platform,
        "app-code": appCode,
        "app_code": appCode,
      },
    },
  );

  return response.data;
};
