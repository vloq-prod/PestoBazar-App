import React, { useEffect, useRef, useCallback } from "react";
import { Text, View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react-native";
import { Toast, ToastType } from "../../context/ToastContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOAST_WIDTH = SCREEN_WIDTH * 0.88;
const ENTER_DURATION = 350;
const EXIT_DURATION  = 280;

const DURATION: Record<ToastType, number> = {
  success: 3000,
  warning: 3000,
  info:    3000,
  error:   4000,
};

const CONFIG: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: { bg: "#16a34a", icon: <CheckCircle  size={18} color="#fff" strokeWidth={2.2} /> },
  error:   { bg: "#dc2626", icon: <XCircle       size={18} color="#fff" strokeWidth={2.2} /> },
  warning: { bg: "#d97706", icon: <AlertTriangle size={18} color="#fff" strokeWidth={2.2} /> },
  info:    { bg: "#334155", icon: <Info          size={18} color="#fff" strokeWidth={2.2} /> },
};

type Props = { toast: Toast; onRemove: (id: string) => void };

export const ToastItem = React.memo(({ toast, onRemove }: Props) => {
  const { type, message, id } = toast;
  const { bg, icon } = CONFIG[type];
  const duration = DURATION[type];

  const translateY = useSharedValue(-60);
  const opacity    = useSharedValue(0);
  const dismissed  = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    translateY.value = withTiming(-60, {
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
      easing: Easing.out(Easing.back(1.3)),
    });
    opacity.value = withTiming(1, { duration: ENTER_DURATION });
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, []);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
        opacity.value    = 1 + e.translationY / 60;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -30) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 180 });
        opacity.value    = withTiming(1, { duration: 180 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.container, { backgroundColor: bg, width: TOAST_WIDTH }, animatedStyle]}>
        {/* Icon pill */}
        <View style={styles.iconWrap}>{icon}</View>

        {/* Message */}
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </Animated.View>
    </GestureDetector>
  );
});

ToastItem.displayName = "ToastItem";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    // 4-side shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});