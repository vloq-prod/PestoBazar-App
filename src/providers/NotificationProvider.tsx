

import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications, getOrCreateDeviceId } from "../services/notification.service";
import { useRegisterDeviceToken } from "../hooks/homeHooks";
import { useAppVisitorStore } from "../store/auth";
import { AppConfigUtil } from "../utils/appConfig";
import { useRouter } from "expo-router";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { visitorId } = useAppVisitorStore();
  const { mutate: registerToken } = useRegisterDeviceToken();
  const router = useRouter();

  // ── Helper to handle screen navigation when user clicks notification ──
  const handleNotificationNavigation = (data: Record<string, any>) => {
    if (!data) return;

    console.log("[Notification DeepLink] Handling data payload:", data);

    // 1. Explicit route provided (e.g. data.route = "/(stack)/orders")
    if (data.route) {
      router.push(data.route);
      return;
    }

    // 2. Handle based on redirect_type or type sent from backend
    const redirectType = data.type || data.redirect_type || data.app_redirect_key;

    switch (redirectType) {
      case "product":
      case "products":
        if (data.product_slug || data.slug || data.id) {
          router.push({
            pathname: "/(stack)/product/[id]",
            params: {
              id: data.id ? String(data.id) : "slug",
              product_slug: data.product_slug || data.slug || "",
              product_name: data.title || data.product_name || "",
            },
          });
        }
        break;

      case "order":
      case "order_details":
        if (data.order_id || data.id) {
          router.push({
            pathname: "/(stack)/orderdetails/[id]",
            params: { id: String(data.order_id || data.id) },
          });
        }
        break;

      case "category":
      case "categories":
        if (data.category_slug || data.slug) {
          router.push({
            pathname: "/(stack)/shop",
            params: { category_slug: data.category_slug || data.slug },
          });
        }
        break;

      case "custom_section":
        if (data.section_id || data.id) {
          router.push({
            pathname: "/(stack)/viewall/custom/[id]",
            params: {
              id: Number(data.section_id || data.id),
              title: data.title || "Products",
            },
          });
        }
        break;

      default:
        break;
    }
  };

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
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body, data } = response.notification.request.content;
      console.log("[Notification Clicked] Title:", title, "Data:", data);
      handleNotificationNavigation(data);
    });

    // 2. Listen for when a notification is received while the app is in the foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notification Received in Foreground]:", notification.request.content);
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
