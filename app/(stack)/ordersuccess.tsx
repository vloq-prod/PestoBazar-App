import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { formatINR } from "../../src/utils/productHelpers";
import { CheckCircle, ShoppingBag, Home, Package } from "lucide-react-native";

export default function OrderSuccess() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  // ── Animations ──────────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Icon pop-in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Content fade + slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const amountNumber = Number(amount ?? 0);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + spacing(20),
        },
      ]}
    >
      {/* ── Success Icon ── */}
      <View style={styles.iconSection}>
        {/* Glow ring */}
        <View
          style={[
            styles.glowRing,
            { backgroundColor: colors.primary + "18" },
          ]}
        />
        <View
          style={[
            styles.glowRingInner,
            { backgroundColor: colors.primary + "28" },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View
            style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}
          >
            <CheckCircle
              size={72}
              color={colors.primary}
              strokeWidth={1.5}
            />
          </View>
        </Animated.View>
      </View>

      {/* ── Text Content ── */}
      <Animated.View
        style={[
          styles.contentSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text, fontSize: font(26) },
          ]}
        >
          Order Placed! 🎉
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, fontSize: font(14), marginTop: spacing(8) },
          ]}
        >
          Your order has been confirmed and{"\n"}will be delivered soon.
        </Text>

        {/* Amount Card */}
        {amountNumber > 0 && (
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginTop: spacing(28),
              },
            ]}
          >
            <View
              style={[styles.amountIconWrap, { backgroundColor: colors.primary + "18" }]}
            >
              <Package size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.amountLabel,
                  { color: colors.textSecondary, fontSize: font(12) },
                ]}
              >
                Amount Charged
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: colors.text, fontSize: font(20) },
                ]}
              >
                {formatINR(amountNumber)}
              </Text>
            </View>
          </View>
        )}

        {/* Info Note */}
        <View
          style={[
            styles.infoNote,
            { backgroundColor: colors.primary + "12", marginTop: spacing(20) },
          ]}
        >
          <Text
            style={[
              styles.infoText,
              { color: colors.primary, fontSize: font(12) },
            ]}
          >
            📦  You'll receive a confirmation shortly
          </Text>
        </View>
      </Animated.View>

      {/* ── Buttons ── */}
      <Animated.View
        style={[
          styles.btnSection,
          { opacity: fadeAnim, gap: spacing(12) },
        ]}
      >
        {/* Continue Shopping */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Home size={18} color="#fff" />
          <Text style={[styles.primaryBtnText, { fontSize: font(14) }]}>
            Continue Shopping
          </Text>
        </TouchableOpacity>

        {/* View Orders */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
          style={[
            styles.secondaryBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <ShoppingBag size={18} color={colors.primary} />
          <Text
            style={[
              styles.secondaryBtnText,
              { color: colors.primary, fontSize: font(14) },
            ]}
          >
            View My Orders
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Icon
  iconSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowRingInner: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  // Text
  contentSection: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },

  // Amount card
  amountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  amountIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  amountLabel: {
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
  },
  amountValue: {
    fontFamily: "Poppins_700Bold",
  },

  // Info note
  infoNote: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  infoText: {
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },

  // Buttons
  btnSection: {
    width: "100%",
    marginTop: 36,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: "Poppins_600SemiBold",
  },
});
