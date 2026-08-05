import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { ChevronRight, Tag, Check, Sparkles } from "lucide-react-native";

// Dummy Coupons Data
interface CouponItem {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  savings: string;
  details?: string;
  isApplied?: boolean;
}

const DUMMY_COUPONS: CouponItem[] = [
  {
    id: "1",
    title: "Rocket 90",
    subtitle: "Coupon available for this cart.",
    code: "ROCKET-90",
    savings: "₹1988.10",
    details: "Get instant discount of ₹1988.10 on orders above ₹2499.",
  },
  {
    id: "2",
    title: "Flat 20% OFF",
    subtitle: "Special mega savings offer for you.",
    code: "PESTO20",
    savings: "₹500.00",
    details: "Valid on all grocery and organic essentials.",
  },
  {
    id: "3",
    title: "First Order Discount",
    subtitle: "Welcome offer for new users.",
    code: "WELCOME100",
    savings: "₹100.00",
    details: "Applicable on your first successful purchase.",
  },
];

export default function CouponsScreen() {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();

  const [inputCode, setInputCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>("ROCKET-90");

  const handleApply = (code: string) => {
    if (appliedCoupon === code) {
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(code);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Coupons & Offers" showBack />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing(16),
          gap: spacing(16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Input Promo Code Card ── */}
        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <Tag size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Enter coupon code"
              placeholderTextColor={colors.textSecondary}
              value={inputCode}
              onChangeText={setInputCode}
              style={[
                styles.textInput,
                { color: colors.text, fontSize: font(13.5) },
              ]}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity
            disabled={!inputCode.trim()}
            onPress={() => handleApply(inputCode.trim().toUpperCase())}
            style={[
              styles.applyInputBtn,
              {
                backgroundColor: inputCode.trim()
                  ? colors.primary
                  : colors.border + "80",
              },
            ]}
          >
            <Text style={[styles.applyInputBtnText, { fontSize: font(12.5) }]}>
              APPLY
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Available Coupons List ── */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: font(14) }]}>
          Available Coupons
        </Text>

        {DUMMY_COUPONS.map((item) => {
          const isApplied = appliedCoupon === item.code;

          return (
            <View
              key={item.id}
              style={[
                styles.couponCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isApplied ? colors.primary : colors.border,
                  borderWidth: isApplied ? 1.5 : 1,
                },
              ]}
            >
              {/* Card Main Body */}
              <View style={styles.cardMain}>
                <Text style={[styles.title, { fontSize: font(15), color: colors.text }]}>
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    { fontSize: font(12), color: colors.textSecondary },
                  ]}
                >
                  {item.subtitle}
                </Text>

                {/* Dashed Code Box */}
                <View
                  style={[
                    styles.dashedBox,
                    {
                      backgroundColor: isApplied
                        ? colors.primary + "12"
                        : "#F3F0FF", // Soft lavender/purple tint from screenshot
                      borderColor: isApplied ? colors.primary : "#8B5CF6", // Lavender dashed border
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.codeText,
                      {
                        fontSize: font(14),
                        color: isApplied ? colors.primary : "#4C1D95",
                      },
                    ]}
                  >
                    {item.code}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleApply(item.code)}
                    style={styles.applyBtnTouch}
                  >
                    {isApplied ? (
                      <View style={styles.appliedRow}>
                        <Check size={14} color={colors.primary} strokeWidth={3} />
                        <Text
                          style={[
                            styles.applyText,
                            { fontSize: font(13), color: colors.primary },
                          ]}
                        >
                          Applied
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.applyText,
                          { fontSize: font(13.5), color: "#4C1D95" },
                        ]}
                      >
                        Apply
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Savings Ribbon (Exact visual match from screenshot) */}
              <View
                style={[
                  styles.savingsRibbon,
                  {
                    backgroundColor: isApplied
                      ? colors.primary + "15"
                      : "#F3F0FF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.savingsText,
                    {
                      fontSize: font(13.5),
                      color: isApplied ? colors.primary : "#4C1D95",
                    },
                  ]}
                >
                  You save {item.savings}
                </Text>
                <ChevronRight
                  size={16}
                  color={isApplied ? colors.primary : "#4C1D95"}
                  strokeWidth={2.5}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    paddingVertical: 6,
  },
  applyInputBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyInputBtnText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 4,
  },
  couponCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    padding: 16,
  },
  title: {
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
    marginBottom: 12,
  },
  dashedBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  applyBtnTouch: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  applyText: {
    fontFamily: "Poppins_700Bold",
  },
  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  savingsRibbon: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  savingsText: {
    fontFamily: "Poppins_700Bold",
  },
});
