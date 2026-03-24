
import { AppConfigUtil } from "./appConfig";

export const getAppHeaders = () => {
  return {
    app_name: AppConfigUtil.appName,
    app_code: AppConfigUtil.appCode,
    app_version: AppConfigUtil.appVersion,
  };
};
