import { useEffect } from "react";
import {  StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Fade + scale in
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    // Hold → fade out whole screen → call onFinish
    containerOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
      <LinearGradient
        colors={["#4a3280", "#3a286c", "#7a1840", "#e10320"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Centered content */}
      <View style={styles.center}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.brand}>Pestobazaar</Text>
          <Text style={styles.tagline}>India&apos;s Leading Online Pesticide Hub</Text>
        </Animated.View>
      </View>

      {/* Bottom badge */}
      <Animated.View style={[styles.bottomBadge, contentStyle]}>
        <Text style={styles.bottomText}>Trusted by farmers across India</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoLetter: {
    fontSize: 42,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    lineHeight: 50,
  },
  brand: {
    fontSize: 40,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  bottomBadge: {
    position: "absolute",
    bottom: 52,
    alignSelf: "center",
  },
  bottomText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.5,
  },
});
