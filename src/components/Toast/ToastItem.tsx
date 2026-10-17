import React, { useEffect, useRef, useCallback } from "react";
import { Text, View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  LinearTransition,
} from "react-native-reanimated";
import { Gesture, GestureDetector, TouchableOpacity } from "react-native-gesture-handler";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react-native";
import { Toast, ToastType } from "../../context/ToastContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOAST_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 420);
const ENTER_DURATION = 220;
const EXIT_DURATION = 180;
const AUTO_DISMISS_DURATION = 3000; // 3 seconds auto-dismiss

const ICONS: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

type Props = { toast: Toast; onRemove: (id: string) => void };

export const ToastItem = React.memo(({ toast, onRemove }: Props) => {
  const { type, message, id } = toast;
  const Icon = ICONS[type] || Info;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.96);
  const opacity = useSharedValue(0);
  const dismissed = useRef(false);

  const dismiss = useCallback(
    (direction: "up" | "right" | "left" = "up") => {
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
      } else if (direction === "left") {
        translateX.value = withTiming(-SCREEN_WIDTH, {
          duration: EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(0, { duration: EXIT_DURATION }, (done) => {
          if (done) runOnJS(onRemove)(id);
        });
      } else {
        translateY.value = withTiming(-24, {
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.cubic),
        });
        opacity.value = withTiming(0, { duration: EXIT_DURATION });
        scale.value = withTiming(0.96, { duration: EXIT_DURATION }, (done) => {
          if (done) runOnJS(onRemove)(id);
        });
      }
    },
    [id, onRemove, opacity, scale, translateX, translateY],
  );

  useEffect(() => {
    opacity.value = withTiming(1, { duration: ENTER_DURATION });
    scale.value = withTiming(1, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: ENTER_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    const t = setTimeout(() => dismiss("up"), AUTO_DISMISS_DURATION);
    return () => clearTimeout(t);
  }, [dismiss]);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Allow swiping up to dismiss top toast
      if (e.translationY < 0) {
        translateY.value = e.translationY;
        opacity.value = Math.max(0, 1 - Math.abs(e.translationY) / 60);
      } else if (Math.abs(e.translationX) > 0) {
        translateX.value = e.translationX;
        opacity.value = Math.max(0, 1 - Math.abs(e.translationX) / (SCREEN_WIDTH * 0.5));
      }
    })
    .onEnd((e) => {
      if (e.translationY < -20 || e.velocityY < -300) {
        runOnJS(dismiss)("up");
      } else if (e.translationX > 40 || e.velocityX > 400) {
        runOnJS(dismiss)("right");
      } else if (e.translationX < -40 || e.velocityX < -400) {
        runOnJS(dismiss)("left");
      } else {
        translateY.value = withTiming(0, { duration: 150 });
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
        layout={LinearTransition.duration(200)}
        style={[
          styles.container,
          { width: TOAST_WIDTH },
          containerStyle,
        ]}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Icon size={19} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          <TouchableOpacity
            onPressIn={() => dismiss("up")}
            activeOpacity={0.7}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color="rgba(255, 255, 255, 0.75)" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

ToastItem.displayName = "ToastItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#323236",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    lineHeight: 18,
    includeFontPadding: false,
    letterSpacing: 0.1,
  },
  closeBtn: {
    marginLeft: 8,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});