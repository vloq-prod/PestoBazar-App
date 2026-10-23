

import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications, getOrCreateDeviceId } from "../services/notification.service";
import { useRegisterDeviceToken } from "../hooks/homeHooks";
import { useAppVisitorStore } from "../store/auth";
import { AppConfigUtil } from "../utils/appConfig";
import { resolveNotification } from "../deep-linking";

import OtpVerify from "../utils/otpVerify";

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
      if (Platform.OS === "android") {
        OtpVerify.getHash()
          .then((hash) => console.log("🔑 [AppHash]:", hash))
          .catch((error) => console.log("AppHash Error:", error));
      }

      const result = await registerForPushNotifications();
      if (result.token) {
        console.log("📲 [NotificationProvider] FCM Token:", result.token);
      } else if (result.error) {
        console.warn("⚠️ [NotificationProvider] FCM Token Error:", result.error);
      }
      
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

    // 0. Cold-start check (when app is opened directly by tapping a notification while closed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const content = response.notification.request.content as any;
        console.log("=================================================");
        console.log("🚀 [COLD START NOTIFICATION RESPONSE]");
        console.log("📌 Title:", content.title);
        console.log("📝 Body:", content.body);
        console.log("📦 Data (Payload):", JSON.stringify(content.data, null, 2));
        console.log("🖼️ Attachments:", JSON.stringify(content.attachments, null, 2));
        console.log("🔍 Full Content:", JSON.stringify(content, null, 2));
        console.log("=================================================");
        const { data } = response.notification.request.content;
        resolveNotification(data);
      }
    });

    // 1. Listen for notification clicks/taps
    // Uses the deep-linking module's resolveNotification() instead of
    // inline switch statement. This ensures notification-driven navigations
    // go through the same pipeline as URL-based deep links (validation,
    // auth guards, pending navigation, analytics tracking).
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const content = response.notification.request.content as any;
      console.log("=================================================");
      console.log("👆 [NOTIFICATION TAPPED / CLICKED]");
      console.log("📌 Title:", content.title);
      console.log("📝 Body:", content.body);
      console.log("📦 Data (Payload):", JSON.stringify(content.data, null, 2));
      console.log("🖼️ Attachments:", JSON.stringify(content.attachments, null, 2));
      console.log("🔍 Full Content:", JSON.stringify(content, null, 2));
      console.log("=================================================");
      const { data } = response.notification.request.content;
      resolveNotification(data);
    });

    // 2. Listen for when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content as any;
      console.log("=================================================");
      console.log("📬 [PUSH NOTIFICATION RECEIVED (FOREGROUND)]");
      console.log("📌 Title:", content.title);
      console.log("📝 Body:", content.body);
      console.log("📦 Data (Payload):", JSON.stringify(content.data, null, 2));
      console.log("🖼️ Attachments:", JSON.stringify(content.attachments, null, 2));

      const data: any = content.data || {};
      const img =
        data.image ||
        data.imageUrl ||
        data.image_url ||
        data.picture ||
        data.img ||
        (content.attachments?.[0]?.url);

      if (img) {
        console.log("🖼️ [Image URL Detected]:", img);
      } else {
        console.log("⚠️ [Image Notice]: No direct image URL found in data keys (image, imageUrl, image_url, picture, attachments). Check your backend payload!");
      }
      console.log("🔍 Full Request Object:", JSON.stringify(notification.request, null, 2));
      console.log("=================================================");
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
