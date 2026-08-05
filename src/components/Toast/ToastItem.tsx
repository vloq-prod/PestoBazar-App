import React, { useEffect, useRef, useCallback } from "react";
import { Text, View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector, TouchableOpacity } from "react-native-gesture-handler";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react-native";
import { Toast, ToastType } from "../../context/ToastContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOAST_WIDTH = SCREEN_WIDTH * 0.88;
const ENTER_DURATION = 320;
const EXIT_DURATION = 260;

const DURATION: Record<ToastType, number> = {
  success: 2800,
  warning: 3000,
  info: 2800,
  error: 4000,
};

const ACCENT: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#6366f1",
};

const ICONS: Record<ToastType, any> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

type Props = { toast: Toast; onRemove: (id: string) => void };

export const ToastItem = React.memo(({ toast, onRemove }: Props) => {
  const { type, message, id } = toast;
  const duration = DURATION[type];
  const accentColor = ACCENT[type];
  const Icon = ICONS[type];

  const translateY = useSharedValue(150); // Slides up from bottom
  const opacity = useSharedValue(0);
  const dismissed = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;

    translateY.value = withTiming(150, { // Slides down to exit
      duration: EXIT_DURATION,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(0, { duration: EXIT_DURATION }, (done) => {
      if (done) runOnJS(onRemove)(id);
    });
  }, [id, onRemove, opacity, translateY]);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.back(1.2)),
    });
    opacity.value = withTiming(1, { duration: ENTER_DURATION });

    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, []);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) { // Swipe down to dismiss
        translateY.value = e.translationY;
        opacity.value = 1 - e.translationY / 100;
      }
    })
    .onEnd((e) => {
      // If swiped down significantly or with high velocity
      if (e.translationY > 25 || e.velocityY > 500) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 160 });
        opacity.value = withTiming(1, { duration: 160 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={[
          styles.container,
          { width: TOAST_WIDTH, borderLeftColor: accentColor },
          containerStyle,
        ]}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Icon size={20} color={accentColor} strokeWidth={2.5} />
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          <TouchableOpacity
            onPress={dismiss}
            activeOpacity={0.7}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={19} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

ToastItem.displayName = "ToastItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111111",
    borderRadius: 10,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "hidden",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  closeBtn: {
    marginLeft: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  progressFill: {
    height: 3,
    opacity: 0.8,
  },
});