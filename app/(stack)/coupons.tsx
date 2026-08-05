import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import {
  ChevronRight,
  Tag,
  Check,
  Sparkles,
} from "lucide-react-native";
import CouponCard from "../../src/components/cart/CouponCard";
import { useAppVisitorStore } from "../../src/store/auth";
import { useCart } from "../../src/hooks/cartHooks";
import {
  useApplicablePromoCodes,
  useApplyPromoCode,
  useRemovePromoCode,
} from "../../src/hooks/prompoCouponHooks";
import { useToast } from "../../src/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

export default function CouponsScreen() {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const { visitorId, userId } = useAppVisitorStore((state) => state);
  const { data: cartData } = useCart({
    user_id: userId ?? 0,
    visitor_id: visitorId!,
  });
  const cartId = cartData?.data?.cart_app?.cart_id;

  const { data: applicablePromoCodesRes, isLoading: isCouponsLoading } =
    useApplicablePromoCodes({
      cart_id: String(cartId || ""),
      user_id: String(userId || 0),
      visitor_id: visitorId || "",
    });

  const { mutate: applyPromo, isPending: isApplying } = useApplyPromoCode();
  const { mutate: removePromo, isPending: isRemoving } = useRemovePromoCode();

  const appliedCouponCode =
    cartData?.data?.cart_app?.promo_code_details?.promo_code ||
    cartData?.data?.cart?.promo_code_details?.promo_code ||
    cartData?.data?.cart_app?.promo_code ||
    cartData?.data?.cart?.promo_code ||
    cartData?.data?.cart_app?.applied_promo_code ||
    cartData?.data?.cart?.applied_promo_code;

  const handleApply = (code: string) => {
    console.log("🎟️ handleApply called with code:", code, "cartId:", cartId);
    if (!cartId) {
      setErrorMsg("Cart not loaded yet");
      return;
    }

    setErrorMsg(null);
    setLoadingCode(code);

    applyPromo(
      {
        cart_id: String(cartId),
        user_id: String(userId || 0),
        visitor_id: visitorId || "",
        promo_code: code,
      },
      {
        onSuccess: (res) => {
          console.log("🎟️ applyPromo success response:", res);
          setLoadingCode(null);
          if (res.status) {
            showToast(
              res.message || "Promo code applied successfully",
              "success",
            );
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({
              queryKey: ["applicable-promo-codes"],
            });
            setInputCode("");
            // Immediately navigate back to Cart screen
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(stack)/cart");
            }
          } else {
            setErrorMsg(res.message || "Failed to apply promo code");
          }
        },
        onError: (err: any) => {
          console.error("🎟️ applyPromo error response:", err);
          setLoadingCode(null);
          setErrorMsg(err?.message || "Failed to apply promo code");
        },
      },
    );
  };

  const handleRemove = (code: string) => {
    console.log("🎟️ handleRemove called for code:", code);
    if (!cartId) return;

    setLoadingCode(code);

    removePromo(
      {
        cart_id: String(cartId),
        user_id: String(userId || 0),
        visitor_id: visitorId || "",
      },
      {
        onSuccess: (res) => {
          console.log("🎟️ removePromo success response:", res);
          setLoadingCode(null);
          if (res.status) {
            showToast(
              res.message || "Promo code removed successfully",
              "success",
            );
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({
              queryKey: ["applicable-promo-codes"],
            });
          } else {
            showToast(res.message || "Failed to remove promo code", "error");
          }
        },
        onError: (err: any) => {
          console.error("🎟️ removePromo error response:", err);
          setLoadingCode(null);
          showToast(err?.message || "Failed to remove promo code", "error");
        },
      },
    );
  };

  const handleToggleCoupon = (code: string) => {
    console.log("🎟️ handleToggleCoupon clicked. code:", code, "appliedCouponCode:", appliedCouponCode);
    if (
      appliedCouponCode &&
      appliedCouponCode.toUpperCase() === code.toUpperCase()
    ) {
      handleRemove(code);
    } else {
      handleApply(code);
    }
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Coupons & Offers" showBack />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundgray }}
        contentContainerStyle={{
          padding: spacing(16),
          paddingBottom: spacing(60),
          gap: spacing(16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Input Promo Code Section ── */}
        <View>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: colors.surface,
                borderColor: errorMsg ? colors.error : colors.border,
              },
            ]}
          >
            <Tag
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Enter coupon code"
              placeholderTextColor={colors.textSecondary}
              value={inputCode}
              onChangeText={(text) => {
                setInputCode(text);
                if (errorMsg) setErrorMsg(null);
              }}
              style={[
                styles.textInput,
                { color: colors.text, fontSize: font(13.5) },
              ]}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              disabled={isApplying}
              onPress={() => {
                if (!inputCode.trim()) {
                  setErrorMsg("Please enter a coupon code");
                  return;
                }
                handleApply(inputCode.trim().toUpperCase());
              }}
              style={styles.applyInputBtn}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.applyInputBtnText,
                    {
                      fontSize: font(12.5),
                      color: inputCode.trim() ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  APPLY
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {errorMsg ? (
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.error,
                  fontSize: font(11.5),
                  marginTop: spacing(4),
                  marginLeft: spacing(4),
                },
              ]}
            >
              {errorMsg}
            </Text>
          ) : null}
        </View>

        {isCouponsLoading ? (
          <View
            style={{
              paddingVertical: spacing(40),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* ── Applicable Coupons List ── */}
            {applicablePromoCodesRes?.data?.applicable_coupons &&
            applicablePromoCodesRes.data.applicable_coupons.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text, fontSize: font(14) },
                  ]}
                >
                  Available Coupons
                </Text>
                {applicablePromoCodesRes.data.applicable_coupons.map((item) => {
                  const isApplied =
                    appliedCouponCode?.toUpperCase() ===
                    item.code.toUpperCase();

                  return (
                    <CouponCard
                      key={item.promo_code_id}
                      item={item}
                      isApplied={isApplied}
                      isApplyingOrRemoving={loadingCode === item.code}
                      disabled={!!loadingCode || isApplying || isRemoving}
                      onToggle={handleToggleCoupon}
                    />
                  );
                })}
              </View>
            ) : null}

            {/* ── Nearby Coupons List ── */}
            {applicablePromoCodesRes?.data?.nearby_coupons &&
            applicablePromoCodesRes.data.nearby_coupons.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: font(14),
                      marginTop: spacing(6),
                    },
                  ]}
                >
                  Unlock More Coupons
                </Text>
                {applicablePromoCodesRes.data.nearby_coupons.map((item) => {
                  return (
                    <CouponCard
                      key={item.promo_code_id}
                      item={item}
                      isLocked={true}
                    />
                  );
                })}
              </View>
            ) : null}

            {/* ── Empty State ── */}
            {(!applicablePromoCodesRes?.data?.applicable_coupons ||
              applicablePromoCodesRes.data.applicable_coupons.length === 0) &&
              (!applicablePromoCodesRes?.data?.nearby_coupons ||
                applicablePromoCodesRes.data.nearby_coupons.length === 0) && (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: spacing(40),
                  }}
                >
                  <Sparkles
                    size={40}
                    color={colors.textSecondary}
                    style={{ marginBottom: spacing(10), opacity: 0.5 }}
                  />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                      fontSize: font(16),
                    }}
                  >
                    No Coupons Available
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      color: colors.textSecondary,
                      fontSize: font(13),
                      marginTop: spacing(4),
                      textAlign: "center",
                    }}
                  >
                    There are no coupons available for your cart at the moment.
                  </Text>
                </View>
              )}
          </>
        )}
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
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    paddingVertical: 6,
  },
  applyInputBtn: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  applyInputBtnText: {
    fontFamily: "Poppins_700Bold",
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 4,
  },
  errorText: {
    fontFamily: "Poppins_500Medium",
  },
});
