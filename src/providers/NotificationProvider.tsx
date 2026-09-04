

import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications, getOrCreateDeviceId } from "../services/notification.service";
import { useRegisterDeviceToken } from "../hooks/homeHooks";
import { useAppVisitorStore } from "../store/auth";
import { AppConfigUtil } from "../utils/appConfig";
import { resolveNotification } from "../deep-linking";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { visitorId } = useAppVisitorStore();
  const { mutate: registerToken } = useRegisterDeviceToken();

  useEffect(() => {
    (async () => {
      const result = await registerForPushNotifications();
      
      if (result.token && visitorId) {
        const deviceId = await getOrCreateDeviceId();
        const payload = {
          token: result.token,
          visitor_id: visitorId,
          device_id: deviceId,
          platform: Platform.OS === "android" ? ("android" as const) : ("ios" as const),
          app_version: AppConfigUtil.appVersion,
        };

        registerToken(payload);
      }
    })();

    // 1. Listen for notification clicks/taps
    // Uses the deep-linking module's resolveNotification() instead of
    // inline switch statement. This ensures notification-driven navigations
    // go through the same pipeline as URL-based deep links (validation,
    // auth guards, pending navigation, analytics tracking).
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { data } = response.notification.request.content;
      resolveNotification(data);
    });

    // 2. Listen for when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [visitorId]);

  // This provider is purely behavioral — it renders children as-is.
  // No context value is exposed because the token is only logged to console
  // at this stage. Extend this later to provide the token via context if
  // backend registration is needed.
  return <>{children}</>;
};
