/**
 * NotificationProvider.tsx
 *
 * WHY THIS FILE EXISTS:
 *   Expo's notification APIs must be called from inside a React tree, after
 *   the app has fully mounted. Putting this logic in a Provider ensures:
 *     - It runs exactly once on app startup (useEffect with empty deps)
 *     - It integrates cleanly with Expo Router's layout system
 *     - It doesn't block rendering (async, fire-and-forget on mount)
 *
 * WHY A PROVIDER PATTERN (not just useEffect in _layout.tsx):
 *   Keeping notification bootstrap out of _layout.tsx avoids polluting the
 *   root layout with unrelated logic. The Provider is self-contained and can
 *   be added/removed without touching the rest of the layout tree.
 *
 * WHAT HAPPENS IF THIS FILE IS REMOVED:
 *   registerForPushNotifications() is never called → FCM token is never
 *   generated → no push notifications can be received.
 */

import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications, getOrCreateDeviceId } from "../services/notification.service";
import { useRegisterDeviceToken } from "../hooks/homeHooks";
import { useAppVisitorStore } from "../store/auth";
import { AppConfigUtil } from "../utils/appConfig";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { visitorId } = useAppVisitorStore();
  const { mutate: registerToken } = useRegisterDeviceToken();

  useEffect(() => {
    /**
     * WHY async IIFE here:
     *   useEffect callback cannot be async directly. We wrap in an immediately-
     *   invoked async function so we can await the service cleanly.
     */
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
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body, data } = response.notification.request.content;
      console.log("[Notification Clicked] Title:", title, "Data:", data);
      
      Alert.alert(
        "Notification Clicked! 🚀",
        `Title: ${title}\nBody: ${body}\nData: ${JSON.stringify(data)}`
      );
    });

    // 2. Listen for when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notification Received in Foreground]:", notification.request.content);
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
    // Re-run whenever visitorId changes so we register once the visitor/user logs in.
  }, [visitorId]);

  // This provider is purely behavioral — it renders children as-is.
  // No context value is exposed because the token is only logged to console
  // at this stage. Extend this later to provide the token via context if
  // backend registration is needed.
  return <>{children}</>;
};
