import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { ShoppingBag, ArrowRight, Receipt, Download } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import LottieView from "lottie-react-native";
import orderConfirmLottie from "../../assets/lottieview/order-confirm.json";

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const cleanPrice = String(price).replace(/[₹\s,]/g, "");
  const num = Number(cleanPrice);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

const WavyDivider = ({ color, spacing }: { color: string; spacing: any }) => {
  return (
    <View
      style={{ height: 10, overflow: "hidden", marginVertical: spacing(8) }}
    >
      <Svg height="10" width="1000">
        <Path
          d="M0 5 Q 3 1, 6 5 T 12 5 T 18 5 T 24 5 T 30 5 T 36 5 T 42 5 T 48 5 T 54 5 T 60 5 T 66 5 T 72 5 T 78 5 T 84 5 T 90 5 T 96 5 T 102 5 T 108 5 T 114 5 T 120 5 T 126 5 T 132 5 T 138 5 T 144 5 T 150 5 T 156 5 T 162 5 T 168 5 T 174 5 T 180 5 T 186 5 T 192 5 T 198 5 T 204 5 T 210 5 T 216 5 T 222 5 T 228 5 T 234 5 T 240 5 T 246 5 T 252 5 T 258 5 T 264 5 T 270 5 T 276 5 T 282 5 T 288 5 T 294 5 T 300 5 T 306 5 T 312 5 T 318 5 T 324 5 T 330 5 T 336 5 T 342 5 T 348 5 T 354 5 T 360 5 T 366 5 T 372 5 T 378 5 T 384 5 T 390 5 T 396 5 T 402 5 T 408 5 T 414 5 T 420 5 T 426 5 T 432 5 T 438 5 T 444 5 T 450 5 T 456 5 T 462 5 T 468 5 T 474 5 T 480 5 T 486 5 T 492 5 T 498 5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
};

export default function OrderSuccess() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const { amount, subtotal, shipping, gst, cod, payment_method } = params;

  // ── Animations ──────────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(600)).current;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate cart related queries to ensure count is updated
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    queryClient.invalidateQueries({ queryKey: ["quick-cart"] });

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 25,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [queryClient]);

  // Robust number parsing
  const parseSafe = (val: any) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const totalNum = parseSafe(amount);
  const subTotalNum = parseSafe(subtotal);
  const shippingNum = parseSafe(shipping);
  const gstNum = parseSafe(gst);
  const codNum = parseSafe(cod);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + spacing(60),
          paddingBottom: insets.bottom + spacing(40),
          paddingHorizontal: 20,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: "100%" }}>
          {/* ── Header ── */}
          <View style={{ alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: spacing(12) }}>
              <LottieView
                source={orderConfirmLottie}
                autoPlay
                loop={false}
                style={{ width: spacing(120), height: spacing(120) }}
              />
            </Animated.View>
            
            <Text style={[styles.successTitle, { color: colors.text, fontSize: font(22) }]}>Order Confirmed!</Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary, fontSize: font(13) }]}>
              {payment_method === "COD"
                ? "Your order has been placed successfully"
                : "Your payment was successful"}
            </Text>
          </View>

        {/* ── Detailed Breakdown Card ── */}
        <View
          style={[
            styles.ticketCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              marginBottom: spacing(32),
            },
          ]}
        >
          {/* Internal Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundgray,
                }}
              >
                <Receipt size={16} color={colors.textSecondary} />
              </View>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(14),
                  color: colors.text,
                }}
              >
                Bill Summary
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.backgroundgray, borderWidth: 1, borderColor: colors.border }
              ]}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: font(9),
                  fontFamily: "Poppins_600SemiBold",
                  textTransform: "uppercase"
                }}
              >
                {payment_method || "PAID"}
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                Item Total
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                ₹{formatPrice(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                Shipping
              </Text>
              {parseSafe(shipping) === 0 ? (
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color: "#10B981",
                  }}
                >
                  FREE
                </Text>
              ) : (
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(12.5),
                    color: colors.text,
                  }}
                >
                  + ₹{formatPrice(shipping)}
                </Text>
              )}
            </View>

            {parseSafe(cod) > 0 && (
              <View style={styles.summaryRow}>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.text,
                  }}
                >
                  COD Charges
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color: "#EF4444",
                  }}
                >
                  + ₹{formatPrice(cod)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                GST (Govt. Taxes)
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                + ₹{formatPrice(gst || "0")}
              </Text>
            </View>
          </View>

          <WavyDivider color={colors.border} spacing={spacing} />

          <View
            style={[
              styles.cardContent,
              { marginTop: 0, marginBottom: spacing(16) },
            ]}
          >
            <View style={styles.summaryRow}>
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(14),
                    color: colors.textSecondary,
                  }}
                >
                  Grand Total
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(10),
                    color: colors.textSecondary,
                    marginTop: -1,
                  }}
                >
                  Payment by {payment_method || "Online"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(20),
                    color: colors.text,
                  }}
                >
                  ₹{formatPrice(amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Buttons ── */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.btnPrimaryText, { fontSize: font(14) }]}>Continue Shopping</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (params.order_id) {
                router.replace(`/(stack)/orderdetails/${params.order_id}`);
              } else {
                router.replace("/(tabs)");
              }
            }}
            activeOpacity={0.7}
            style={[styles.btnSecondary, { borderColor: colors.border }]}
          >
            <ShoppingBag size={18} color={colors.text} />
            <Text style={[styles.btnSecondaryText, { color: colors.text, fontSize: font(14) }]}>View Order Details</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bottom Message ── */}
        <Text 
          style={[
            styles.bottomMessage, 
            { 
              color: colors.textTertiary, 
              fontSize: font(10),
              marginTop: spacing(32)
            }
          ]}
        >
          Thank you for choosing Pestobazaar. Your order is being processed and will be delivered soon.
        </Text>
      </Animated.View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSubtitle: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  ticketCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardContent: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonGroup: {
    gap: 10,
    width: '100%',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  btnSecondary: {
    flexDirection: 'row',
    
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
  },
  btnSecondaryText: {
    fontFamily: 'Poppins_600SemiBold',
  },
  bottomMessage: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 30,
  },
});

