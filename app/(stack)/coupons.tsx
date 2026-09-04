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
import { useLocalSearchParams, useRouter } from "expo-router";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import {
  ChevronRight,
  Tag,
  Check,
  Sparkles,
  AlertCircle,
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
import { useCartStore } from "../../src/store/cartStore";

export default function CouponsScreen() {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { cartId: routeCartId, returnToCart } = useLocalSearchParams<{
    cartId?: string;
    returnToCart?: string;
  }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const { visitorId, userId } = useAppVisitorStore((state) => state);

  // Coupons are account-only. Cart intentionally remains usable for a guest.
  React.useEffect(() => {
    if (!userId) {
      router.replace({
        pathname: "/login",
        params: { redirectTo: "/(stack)/coupons" },
      });
    }
  }, [router, userId]);

  const { data: cartData, isLoading: isCartLoading } = useCart({
    user_id: userId ?? 0,
    visitor_id: userId ? visitorId! : "",
  });
  const cartId = routeCartId || cartData?.data?.cart_app?.cart_id;

  const { data: applicablePromoCodesRes, isLoading: isCouponsLoading } =
    useApplicablePromoCodes({
      cart_id: String(cartId || ""),
      user_id: String(userId || 0),
      visitor_id: visitorId || "",
    });

  const isInitialLoading =
    (isCouponsLoading || (!cartId && isCartLoading)) && !applicablePromoCodesRes;

  const { mutate: applyPromo, isPending: isApplying } = useApplyPromoCode();
  const { mutate: removePromo, isPending: isRemoving } = useRemovePromoCode();

  const isActionLoading = isApplying || isRemoving || !!loadingCode;

  const appliedCouponCode =
    cartData?.data?.cart_app?.promo_code_details?.promo_code ||
    cartData?.data?.cart?.promo_code_details?.promo_code ||
    cartData?.data?.cart_app?.promo_code ||
    cartData?.data?.cart?.promo_code ||
    cartData?.data?.cart_app?.applied_promo_code ||
    cartData?.data?.cart?.applied_promo_code;

  if (!userId) {
    return null;
  }

  const handleApply = (code: string) => {
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
            useCartStore.getState().setCouponSuccessCode(code);

            // Cart opened this screen, so pop Coupons and reveal that exact
            // Cart instance. This guarantees cart → coupons → cart stays one
            // cart entry instead of growing the navigation stack.
            if (returnToCart === "true" && router.canGoBack()) {
              router.back();
            } else {
              // Coupon can also be opened directly after login/deep link.
              // There is no cart route to return to in that case.
              router.replace("/(stack)/cart");
            }
          } else {
            setErrorMsg(res.message || "Failed to apply promo code");
          }
        },
        onError: (err: any) => {
          setLoadingCode(null);
          setErrorMsg(err?.message || "Failed to apply promo code");
        },
      },
    );
  };

  const handleRemove = (code: string) => {
    if (!cartId) return;

    setErrorMsg(null);
    setLoadingCode(code);

    removePromo(
      {
        cart_id: String(cartId),
        user_id: String(userId || 0),
        visitor_id: visitorId || "",
      },
      {
        onSuccess: (res) => {
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
            setErrorMsg(res.message || "Failed to remove promo code");
          }
        },
        onError: (err: any) => {
          setLoadingCode(null);
          setErrorMsg(err?.message || "Failed to remove promo code");
        },
      },
    );
  };

  const handleToggleCoupon = (code: string) => {
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
              disabled={isActionLoading}
              onPress={() => {
                if (!inputCode.trim()) {
                  setErrorMsg("Please enter a coupon code");
                  return;
                }
                handleApply(inputCode.trim().toUpperCase());
              }}
              style={styles.applyInputBtn}
            >
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
            </TouchableOpacity>
          </View>
        </View>

        {isInitialLoading ? (
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
                      isApplyingOrRemoving={false}
                      disabled={isActionLoading}
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

      {/* ── Centered Full Screen Loading Overlay ── */}
      {isActionLoading && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            },
          ]}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              paddingVertical: spacing(22),
              paddingHorizontal: spacing(28),
              borderRadius: spacing(14),
              alignItems: "center",
              justifyContent: "center",
              gap: spacing(12),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
              }}
            >
              Applying coupon...
            </Text>
          </View>
        </View>
      )}

      {/* ── Centered Error Popup Overlay ── */}
      {!!errorMsg && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
              paddingHorizontal: spacing(24),
            },
          ]}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              width: "100%",
              maxWidth: 330,
              padding: spacing(20),
              borderRadius: spacing(16),
              alignItems: "center",
              justifyContent: "center",
              gap: spacing(10),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <View
              style={{
                width: spacing(46),
                height: spacing(46),
                borderRadius: spacing(23),
                backgroundColor: colors.error + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing(2),
              }}
            >
              <AlertCircle size={spacing(26)} color={colors.error} />
            </View>

            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(15),
                color: colors.text,
                textAlign: "center",
              }}
            >
              Coupon Error
            </Text>

            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(12.5),
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: font(18),
              }}
            >
              {errorMsg}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setErrorMsg(null)}
              style={{
                marginTop: spacing(6),
                backgroundColor: colors.primary,
                paddingVertical: spacing(10),
                borderRadius: spacing(10),
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(13),
                  color: "#FFFFFF",
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
