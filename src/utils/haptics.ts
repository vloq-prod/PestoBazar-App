import { Vibration, Platform } from "react-native";

/**
 * Triggers a crisp haptic vibration pulse across Android and iOS.
 * @param duration Duration in milliseconds (default: 35ms)
 */
export const triggerHaptic = (duration: number = 35) => {
  try {
    if (Platform.OS === "android") {
      Vibration.vibrate(duration);
    } else {
      Vibration.vibrate();
    }
  } catch {
    // Ignore vibration errors on unsupported platforms or emulators
  }
};
