
import { AppConfigUtil } from "./appConfig";

export const getAppHeaders = () => {
  return {
    "app-name": AppConfigUtil.appName,
    "app_name": AppConfigUtil.appName,
    "app-code": AppConfigUtil.appCode,
    "app-version": AppConfigUtil.appVersion,
  };
};

