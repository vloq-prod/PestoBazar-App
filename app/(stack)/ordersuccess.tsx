import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { formatINR } from "../../src/utils/productHelpers";
import { BadgeCheck, ShoppingBag, ArrowRight } from "lucide-react-native";

export default function OrderSuccess() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { amount, order_id } = useLocalSearchParams<{
    amount: string;
    order_id: string;
  }>();

  // ── Animations ──────────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Icon pop-in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Content fade + slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
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
          paddingTop: insets.top + spacing(60),
          paddingBottom: insets.bottom + spacing(20),
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {/* ── 1. Main Title ── */}
      <Animated.Text
        style={[
          styles.mainHeading,
          {
            color: colors.text,
            fontSize: font(28),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        Order Successful!
      </Animated.Text>

      {/* ── 2. Success Icon ── */}
      <View style={styles.badgeSection}>
        <Animated.View
          style={[styles.badgeWrapper, { transform: [{ scale: scaleAnim }] }]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "10" },
            ]}
          >
            <BadgeCheck
              size={font(100)}
              color={colors.primary}
              strokeWidth={1.5}
            />
          </View>
        </Animated.View>
      </View>

      {/* ── 3. Content Section (No Box) ── */}
      <Animated.View
        style={[
          styles.detailsSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text
          style={[
            styles.paymentDetail,
            {
              color: colors.textSecondary,
              fontSize: font(15),
              marginTop: spacing(10),
            },
          ]}
        >
          We've received your order. Your payment of{" "}
          <Text style={{ fontFamily: "Poppins_700Bold", color: colors.text }}>
            {formatINR(amountNumber)}
          </Text>{" "}
          was successful.
        </Text>

        <Text
          style={[
            styles.confirmationText,
            {
              color: colors.textTertiary,
              fontSize: font(13),
              marginTop: spacing(12),
            },
          ]}
        >
          A confirmation email and SMS has been sent to your registered details.
        </Text>

        {/* ── 4. Thank You Text ── */}
        <View style={{ marginTop: spacing(40) }}>
          <Text
            style={[
              styles.thankYouText,
              { color: colors.text, fontSize: font(18) },
            ]}
          >
            Thank you for shopping with us!
          </Text>
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />

      {/* ── 5. Buttons ── */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryBtnText, { fontSize: font(15) }]}>
            Continue Shopping
          </Text>
          <ArrowRight size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.7}
          style={[
            styles.secondaryBtn,
            { borderColor: colors.border, marginTop: spacing(12) },
          ]}
        >
          <ShoppingBag size={18} color={colors.text} />
          <Text
            style={[
              styles.secondaryBtnText,
              { color: colors.text, fontSize: font(15) },
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
    paddingHorizontal: 24,
    alignItems: "center",
  },
  badgeSection: {
    marginVertical: 40,
    alignItems: "center",
  },
  badgeWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsSection: {
    width: "100%",
    alignItems: "center",
  },
  mainHeading: {
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  thankYouText: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  paymentDetail: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  confirmationText: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  orderRefBox: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  orderIdText: {
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    width: "100%",
    marginBottom: 10,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontFamily: "Poppins_600SemiBold",
  },
});
