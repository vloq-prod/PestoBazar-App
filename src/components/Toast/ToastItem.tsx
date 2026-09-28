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
const ENTER_DURATION = 200;
const EXIT_DURATION = 180;

const DURATION: Record<ToastType, number> = {
  success: 2600,
  warning: 3000,
  info: 2600,
  error: 3500,
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

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(8);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const dismissed = useRef(false);

  const dismiss = useCallback(
    (direction: "fade" | "right" = "fade") => {
      if (dismissed.current) return;
      dismissed.current = true;

      if (direction === "right") {
        translateX.value = withTiming(SCREEN_WIDTH, {
          duration: EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(0, { duration: EXIT_DURATION }, (done) => {
          if (done) runOnJS(onRemove)(id);
        });
      } else {
        opacity.value = withTiming(0, { duration: EXIT_DURATION });
        scale.value = withTiming(0.92, { duration: EXIT_DURATION }, (done) => {
          if (done) runOnJS(onRemove)(id);
        });
      }
    },
    [id, onRemove, opacity, scale, translateX],
  );

  useEffect(() => {
    opacity.value = withTiming(1, { duration: ENTER_DURATION });
    scale.value = withTiming(1, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.quad),
    });

    const t = setTimeout(() => dismiss("fade"), duration);
    return () => clearTimeout(t);
  }, []);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = e.translationX;
        opacity.value = Math.max(0, 1 - e.translationX / (SCREEN_WIDTH * 0.5));
      }
    })
    .onEnd((e) => {
      if (e.translationX > 40 || e.velocityX > 400) {
        runOnJS(dismiss)("right");
      } else {
        translateX.value = withTiming(0, { duration: 150 });
        opacity.value = withTiming(1, { duration: 150 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={[
          styles.container,
          { width: TOAST_WIDTH },
          containerStyle,
        ]}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Icon size={20} color={accentColor} strokeWidth={2.2} />
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          <TouchableOpacity
            onPressIn={() => dismiss()}
            activeOpacity={0.7}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="rgba(255, 255, 255, 0.75)" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

ToastItem.displayName = "ToastItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#18181B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12.5,
    fontFamily: "Poppins_500Medium",
    lineHeight: 16,
    includeFontPadding: false,
    letterSpacing: 0.1,
  },
  closeBtn: {
    marginLeft: 6,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});