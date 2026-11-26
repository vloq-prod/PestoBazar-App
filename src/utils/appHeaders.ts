
import { AppConfigUtil } from "./appConfig";

export const getAppHeaders = () => {
  const platform =
    AppConfigUtil.appName === "ios"
      ? "IOS"
      : AppConfigUtil.appName === "android"
        ? "ANDROID"
        : "WEB";

  return {
    "app-name": AppConfigUtil.appName,
    "app_name": AppConfigUtil.appName,
    "app-code": AppConfigUtil.appCode,
    "app-version": AppConfigUtil.appVersion,
    "X-Platform": platform,
  };
};

