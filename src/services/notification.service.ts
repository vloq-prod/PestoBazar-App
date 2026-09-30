/**
 * notification.service.ts
 *
 * WHY THIS FILE EXISTS:
 *   All notification permission + FCM token logic is isolated here as a pure
 *   async function with no React dependency. This makes it independently
 *   testable, reusable from any hook / provider, and easy to extend later.
 *
 * WHY getDevicePushTokenAsync (not getExpoPushTokenAsync):
 *   getExpoPushTokenAsync() returns an Expo-routed push token that goes through
 *   Expo's own servers. We want the RAW Firebase FCM token so our own backend
 *   can call FCM directly. getDevicePushTokenAsync() returns the native device
 *   token — on Android that is always the FCM registration token.
 *
 * WHAT HAPPENS IF THIS FILE IS REMOVED:
 *   The NotificationProvider has nowhere to call; FCM token is never generated.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

/**
 * getOrCreateDeviceId
 * Fetches the unique device identifier from SecureStore or generates a new one.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await SecureStore.getItemAsync("device_unique_id");
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync("device_unique_id", deviceId);
    }
    return deviceId;
  } catch (error) {
    return "fallback-device-id";
  }
}

// Configure foreground notifications to display alerts and play sounds
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FCMTokenResult {
  /** The raw FCM registration token, or null if unavailable. */
  token: string | null;
  /** Human-readable reason when token could not be obtained. */
  error?: string;
}

// ─── Android Notification Channel ────────────────────────────────────────────
/**
 * WHY setNotificationChannelAsync:
 *   Android 8+ (API 26+) requires every notification to belong to a channel.
 *   Without this, push notifications are silently dropped on Android.
 *   This only has effect on Android; on iOS it is a no-op.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6C63FF", // matches app primary color
    enableVibrate: true,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("pestobazaar_general", {
    name: "General",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6C63FF",
    enableVibrate: true,
    showBadge: true,
  });
}

// ─── Permission Request ───────────────────────────────────────────────────────
/**
 * WHY requestPermissionsAsync:
 *   iOS strictly requires the user to grant permission before any push
 *   notification can be delivered. Android 13+ (API 33+) also requires it.
 *   We request here and bail out cleanly if denied.
 *
 * RETURNS true if permission granted, false otherwise.
 */
async function requestPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Main Service Function ────────────────────────────────────────────────────
/**
 * registerForPushNotifications
 *
 * Full flow:
 *  1. Check physical device (emulators cannot receive push)
 *  2. Create Android notification channel
 *  3. Request OS permission
 *  4. Fetch the raw FCM device token
 *  5. Log and return it
 *
 * WHAT HAPPENS IF THIS FUNCTION IS NOT CALLED:
 *   The app never registers with FCM; no token is generated, no push can be
 *   received even if the backend sends one.
 */
export async function registerForPushNotifications(): Promise<FCMTokenResult> {
  try {
    // ── Step 1: Physical device check ──────────────────────────────────────
    // Emulators / simulators do not have a valid push token from FCM.
    if (!Device.isDevice) {
      return {
        token: null,
        error: "Must use a physical device for push notifications.",
      };
    }

    // ── Step 2: Android channel setup ──────────────────────────────────────
    await ensureAndroidChannel();

    // ── Step 3: Permission request ─────────────────────────────────────────
    const granted = await requestPermission();

    if (!granted) {
      return {
        token: null,
        error: "Notification permission denied.",
      };
    }

    // ── Step 4: Get native FCM token ───────────────────────────────────────
    // getDevicePushTokenAsync() returns the raw OS-level push token.
    // On Android this is the FCM registration token.
    // On iOS this is the APNs token (a different format).
    const devicePushToken = await Notifications.getDevicePushTokenAsync();

    const fcmToken = devicePushToken.data as string;
    console.log("🔥 ==================== [FCM TOKEN] ====================");
    console.log(fcmToken);
    console.log("🔥 =====================================================");

    return { token: fcmToken };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    console.error("❌ [FCM TOKEN ERROR]:", message);
    return { token: null, error: message };
  }
}
