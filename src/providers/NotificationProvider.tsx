
/**
 * NotificationProvider.tsx
 *
 * WHY THIS FILE EXISTS:
 *   Manages Firebase Cloud Messaging (FCM) push notification lifecycle:
 *   - Registers the device token with the backend on mount
 *   - Listens for notification taps (response listener)
 *   - Listens for foreground notifications (received listener)
 *
 * WHAT CHANGED (Deep Linking Integration):
 *   The inline `handleNotificationNavigation()` switch statement has been
 *   REPLACED with a single call to `resolveNotification()` from the
 *   deep-linking module. This eliminates duplicate navigation logic and
 *   ensures ALL notification-driven navigations go through the same
 *   pipeline (parse → validate → guard → navigate → track).
 *
 * DEPENDENCIES:
 *   - notification.service.ts (FCM token registration)
 *   - deep-linking module (resolveNotification)
 *   - auth store (visitorId for token registration)
 *
 * WHAT HAPPENS IF THIS FILE IS REMOVED:
 *   - FCM token is never registered → no push notifications received
 *   - Notification taps are not handled → deep links from notifications don't work
 */

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

        console.log("[FCM] Registering device token with backend payload:", payload);
        registerToken(payload, {
          onSuccess: (data) => {
            console.log("[FCM] Device token registered successfully on backend:", data);
          },
          onError: (error) => {
            console.error("[FCM] Failed to register device token on backend:", error);
          },
        });
      }
    })();

    // 1. Listen for notification clicks/taps
    // Uses the deep-linking module's resolveNotification() instead of
    // inline switch statement. This ensures notification-driven navigations
    // go through the same pipeline as URL-based deep links (validation,
    // auth guards, pending navigation, analytics tracking).
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body, data } = response.notification.request.content;
      console.log("[Notification Clicked] Full Content:", JSON.stringify(response.notification.request.content, null, 2));
      resolveNotification(data);
    });

    // 2. Listen for when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notification Received in Foreground] Full Content:", JSON.stringify(notification.request.content, null, 2));
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
