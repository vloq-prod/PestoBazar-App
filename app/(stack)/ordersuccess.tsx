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
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { formatINR } from "../../src/utils/productHelpers";
import { BadgeCheck, ShoppingBag, ArrowRight } from "lucide-react-native";

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
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const SummaryRow = ({ label, value, isTotal }: any) => (
    <View style={[styles.infoRow, isTotal && { marginTop: spacing(8), paddingTop: spacing(8), borderTopWidth: 1, borderTopColor: colors.border + '40' }]}>
      <Text style={[styles.infoLabel, { color: isTotal ? colors.text : colors.textSecondary, fontSize: font(isTotal ? 13 : 11), fontFamily: isTotal ? 'Poppins_600SemiBold' : 'Poppins_400Regular' }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: isTotal ? colors.primary : colors.text, fontSize: font(isTotal ? 15 : 11), fontFamily: isTotal ? 'Poppins_700Bold' : 'Poppins_600SemiBold' }]}>{formatINR(value)}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + spacing(20),
          paddingBottom: insets.bottom + spacing(40),
          paddingHorizontal: 20,
        }}
      >
        {/* ── Header ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <BadgeCheck size={font(70)} color={colors.primary} strokeWidth={2} />
            </Animated.View>
          </View>
          
          <Text style={[styles.successTitle, { color: colors.text, fontSize: font(22) }]}>Order Confirmed!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary, fontSize: font(13) }]}>
            Your payment was successful
          </Text>
        </Animated.View>

        {/* ── Detailed Breakdown Card ── */}
        <Animated.View 
          style={[
            styles.ticketCard, 
            { 
              backgroundColor: "#F3F4F6", 
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textTertiary, fontSize: font(10) }]}>BILLING SUMMARY</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#fff' }]}>
              <Text style={{ color: colors.primary, fontSize: font(9), fontFamily: 'Poppins_600SemiBold' }}>{payment_method || 'PAID'}</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <SummaryRow label="Subtotal" value={subTotalNum} />
            <SummaryRow label="Shipping Fee" value={shippingNum} />
            <SummaryRow label="Tax (GST)" value={gstNum} />
            {codNum > 0 && <SummaryRow label="COD Charges" value={codNum} />}
          </View>

          <View style={styles.ticketDivider}>
             <View style={[styles.leftNotch, { backgroundColor: colors.background, borderColor: colors.border }]} />
             <View style={[styles.dottedLine, { borderColor: colors.border + '40' }]} />
             <View style={[styles.rightNotch, { backgroundColor: colors.background, borderColor: colors.border }]} />
          </View>

          <View style={[styles.cardContent, { marginTop: spacing(8), marginBottom: 16 }]}>
            <SummaryRow label="Grand Total" value={totalNum} isTotal />
          </View>
        </Animated.View>

        {/* ── Buttons ── */}
        <Animated.View 
          style={[
            styles.buttonGroup, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.btnPrimaryText, { fontSize: font(14) }]}>Continue Shopping</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.7}
            style={[styles.btnSecondary, { borderColor: colors.border }]}
          >
            <ShoppingBag size={18} color={colors.text} />
            <Text style={[styles.btnSecondaryText, { color: colors.text, fontSize: font(14) }]}>View My Orders</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Bottom Message ── */}
        <Animated.Text 
          style={[
            styles.bottomMessage, 
            { 
              color: colors.textTertiary, 
              fontSize: font(10),
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: spacing(32)
            }
          ]}
        >
          Thank you for choosing Pestobazaar. Your order is being processed and will be delivered soon.
        </Animated.Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    // defined inline
  },
  infoValue: {
    // defined inline
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  dottedLine: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    height: 1,
    marginHorizontal: 2,
  },
  leftNotch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: -11,
    zIndex: 10,
    borderWidth: 1,
  },
  rightNotch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    right: -11,
    zIndex: 10,
    borderWidth: 1,
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

