import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Modal,
  Pressable,
} from "react-native";
import RenderHtml from "react-native-render-html";
import RazorpayCheckout from "react-native-razorpay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useAppVisitorStore } from "../../src/store/auth";
import { BASE_URL } from "../../src/lib/apiClient";
import {
  useAddress,
  useCheckout,
  useRemoveAddress,
  useShipping,
  useValidateCart,
  useValidatePincode,
} from "../../src/hooks/CheckoutHooks";
import { useResponsive } from "../../src/utils/useResponsive";
import { getImageUrl } from "../../src/utils/imageUtils";
import CheckoutItem from "../../src/components/cart/CheckoutItem";
import {
  ShoppingBag,
  Info,
  MoveRight,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Circle,
  CircleDot,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  X,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import AddressCard from "../../src/components/checkout/AddressCard";
import { fmt, formatINR } from "../../src/utils/productHelpers";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";
import { useRouter } from "expo-router";

const cleanPrice = (val: any) => {
  if (val === undefined || val === null || val === "") return "₹0";
  const str = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(str);
  if (isNaN(num)) return "₹0";
  return `₹${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
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
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../src/context/ToastContext";
import LoadingOverlay from "../../src/components/comman/LoadingOverlay";
import {
  useCodSuccess,
  useInitiateOrder,
  usePaymentSuccess,
} from "../../src/hooks/orderHooks";
import { useCartStore } from "../../src/store/cartStore";
import { trackCheckout } from "../../src/lib/analytics";

const SectionTitle = ({ title, colors, font, spacing, rightElement }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing(8),
    }}
  >
    <Text
      style={{
        fontFamily: "Poppins_700Bold",
        fontSize: font(13.5),
        color: colors.text,
      }}
    >
      {title}
    </Text>
    {rightElement}
  </View>
);

const PriceRow = ({
  label,
  value,
  isTotal,
  isGreen,
  isRed,
  colors,
  font,
  spacing,
}: any) => (
  <View style={[styles.priceRow, { paddingVertical: spacing(5) }]}>
    <Text
      style={[
        styles.priceRowLabel,
        {
          fontSize: isTotal ? font(14) : font(13),
          fontFamily: isTotal ? "Poppins_600SemiBold" : "Poppins_400Regular",
          color: isRed
            ? "#EF4444"
            : isTotal
              ? colors.text
              : colors.textSecondary,
        },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.priceRowValue,
        {
          fontSize: isTotal ? font(17) : font(13),
          fontFamily: isTotal ? "Poppins_700Bold" : "Poppins_500Medium",
          color: isRed
            ? "#EF4444"
            : isGreen
              ? "#22C55E"
              : isTotal
                ? colors.primary
                : colors.text,
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Checkout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing, wp } = useResponsive();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const scrollRef = React.useRef<ScrollView>(null);
  const [summaryY, setSummaryY] = useState(0);
  const clearCart = useCartStore((s) => s.clearCart);

  const userId = useAppVisitorStore((s) => s.userId);
  const visitorId = useAppVisitorStore((s) => s.visitorId);
  const { mutate: checkoutMutate, isPending, data, error } = useCheckout();
  const { data: addressData } = useAddress({ user_id: userId! });
  const { mutate: shippingMutate, data: shippingData } = useShipping();
  const { mutate: validateCartMutate, isPending: isValidatingCart } =
    useValidateCart();
  const { mutate: validatePincodeMutate, isPending: isValidatingPincode } =
    useValidatePincode();
  const { mutate: codSuccessMutate, isPending: isCodSuccessPending } =
    useCodSuccess();
  const { mutate: initiateOrderMutate, isPending: isInitiatingOrder } =
    useInitiateOrder();
  const { mutate: paymentSuccessMutate, isPending: isPaymentSuccessPending } =
    usePaymentSuccess();

  // ── Address state ──────────────────────────────────────────────────────────
  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(
    null,
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null,
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // ── Payment state ──────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );

  // ── Items state ────────────────────────────────────────────────────────────
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  // ── Delete Modal state ──
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [billingSheetVisible, setBillingSheetVisible] = useState(false);
  const [deliverySheetVisible, setDeliverySheetVisible] = useState(false);

  const { mutate: removeAddress, isPending: isRemoving } = useRemoveAddress();

  const handleDeleteConfirm = () => {
    if (!addressToDelete || !userId) return;
    removeAddress(
      { user_id: userId, address_id: addressToDelete },
      {
        onSuccess: () => {
          showToast("Address deleted successfully", "success");
          setDeleteModalVisible(false);
          setAddressToDelete(null);
          queryClient.invalidateQueries({ queryKey: ["address"] });
          if (selectedBillingId === addressToDelete) setSelectedBillingId(null);
          if (selectedDeliveryId === addressToDelete)
            setSelectedDeliveryId(null);
        },
        onError: () => {
          showToast("Failed to delete address", "error");
        },
      },
    );
  };

  // ── Place Order handler ─────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (!userId || !visitorId || !cartId || !effectiveAddressId) {
      showToast("Please select a delivery address", "warning");
      return;
    }

    console.log("🛒 [Checkout] Place Order Triggered | Mode:", isCod ? "COD" : "Online", "| Amount:", amountToPay, "| CartId:", cartId);

    // Step 1: Validate Cart
    const cartPayload = {
      visitor_id: visitorId,
      user_id: userId,
      cart_id: cartId,
    };

    console.log("🔍 [Checkout] Step 1: Validating Cart with payload:", cartPayload);

    validateCartMutate(cartPayload, {
      onSuccess: (cartRes) => {
        console.log("✅ [Checkout] Step 1 Cart Validation Success:", cartRes);
        if (cartRes?.status !== 1) {
          console.warn("⚠️ [Checkout] Cart validation returned status !== 1:", cartRes?.message);
          showToast(cartRes?.message || "Cart validation failed", "error");
          return;
        }

        // Step 2: Validate Pincode
        const pincodePayload = {
          cart_id: cartId,
          delivery_address_id: effectiveAddressId!,
          payment_method: (isCod ? "cash" : "online") as "cash" | "online",
        };

        console.log("📍 [Checkout] Step 2: Validating Pincode with payload:", pincodePayload);

        validatePincodeMutate(pincodePayload, {
          onSuccess: (pincodeRes) => {
            console.log("✅ [Checkout] Step 2 Pincode Validation Success:", pincodeRes);
            if (pincodeRes?.status !== 1) {
              console.warn("⚠️ [Checkout] Pincode validation failed:", pincodeRes?.message);
              showToast(
                pincodeRes?.message ||
                  "Delivery not available for this pincode",
                "error",
              );
              return;
            }

            // Step 3: Initiate Order
            const billingAddr = billingList.find(
              (a) => a.id === selectedBillingId,
            );
            const deliveryAddr = sameAsBilling
              ? billingAddr
              : deliveryList.find((a) => a.id === selectedDeliveryId);

            const initiatePayload = {
              visitor_id: visitorId!,
              user_id: userId!,
              cart_id: String(cartId),
              delivery_address_id: deliveryAddr?.address_id,
              billing_address_id: billingAddr?.address_id || "",
            };

            console.log("🚀 [Checkout] Step 3: Initiating Order with payload:", initiatePayload);

            initiateOrderMutate(initiatePayload, {
              onSuccess: (initRes) => {
                console.log("📥 [Checkout] Step 3 Initiate Order Response:", initRes);
                if (initRes.status === 0) {
                  console.warn("⚠️ [Checkout] Initiate order returned status 0:", initRes.message);
                  showToast(
                    initRes.message || "Failed to initiate order",
                    "error",
                  );
                  return;
                }

                // Step 4: Process Order based on Payment Method
                if (isCod) {
                  const codPayload = { cart_id: String(cartId) };
                  console.log("💵 [Checkout] Step 4: Processing COD with payload:", codPayload);

                  codSuccessMutate(codPayload, {
                    onSuccess: (res) => {
                      console.log("🎉 [Checkout] COD Order Placed Successfully:", res);
                      clearCart();
                      queryClient.invalidateQueries({ queryKey: ["cart"] });
                      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
                      queryClient.invalidateQueries({ queryKey: ["cart-quantity"] });
                      showToast(
                        res.message || "Order placed successfully!",
                        "success",
                      );
                      router.replace({
                        pathname: "/ordersuccess",
                        params: {
                          order_id: res.order_id,
                          amount: String(amountToPay),
                          subtotal: String(cart?.cart_amount || 0),
                          shipping: String(shippingCharge),
                          gst: String(gstAmount || 0),
                          cod: String(codCharge),
                          payment_method: "COD",
                        },
                      });
                    },
                    onError: (err: any) => {
                      console.error("❌ [Checkout] COD Order Error:", err);
                      showToast(
                        err.message || "Failed to process COD order",
                        "error",
                      );
                    },
                  });
                } else {
                  // Logic for online payment (Razorpay)
                  const cleanBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
                  const activeRazorpayKey =
                    initRes.data?.key ||
                    razorpayKey ||
                    process.env.EXPO_PUBLIC_RAZORPAY_KEY ||
                    "rzp_test_S9hH56T4ntHqvV";

                  const options = {
                    description: "Payment for Order",
                    image: `${cleanBaseUrl}images/logo.png`,
                    currency: "INR",
                    key: activeRazorpayKey,
                    amount:
                      Number(initRes.data?.total_cost) * 100 ||
                      amountToPay * 100,
                    name: initRes.data?.company_name || "Pesto Bazaar",
                    order_id: initRes.data?.orderId,
                    prefill: {
                      email: initRes.data?.email || "",
                      contact: initRes.data?.mobile || "",
                      name: initRes.data?.first_name || "",
                    },
                    theme: { color: colors.primary },
                  };

                  console.log("💳 [Checkout] Opening Razorpay SDK with options:", {
                    key: options.key,
                    order_id: options.order_id,
                    amount: options.amount,
                    currency: options.currency,
                    name: options.name,
                    email: options.prefill.email,
                    contact: options.prefill.contact,
                  });

                  RazorpayCheckout.open(options)
                    .then((paymentRes: any) => {
                      console.log("🎉 [Checkout] Razorpay Payment Success from SDK:", paymentRes);
                      showToast("Payment Successful!", "success");

                      // Step 5: Inform Backend about Success
                      const successPayload = {
                        razorpay_order_id: paymentRes.razorpay_order_id,
                        razorpay_payment_id: paymentRes.razorpay_payment_id,
                        razorpay_signature: paymentRes.razorpay_signature,
                      };

                      console.log("📤 [Checkout] Step 5: Verifying Payment with backend:", successPayload);

                      paymentSuccessMutate(successPayload, {
                        onSuccess: (res) => {
                          console.log("🎉 [Checkout] Backend Payment Verification Success:", res);
                          clearCart();
                          queryClient.invalidateQueries({ queryKey: ["cart"] });
                          queryClient.invalidateQueries({ queryKey: ["cart-count"] });
                          queryClient.invalidateQueries({ queryKey: ["cart-quantity"] });
                          router.replace({
                            pathname: "/ordersuccess",
                            params: {
                              order_id:
                                res.order_id ||
                                res.data?.order_id ||
                                initRes.data?.orderId,
                              amount: String(amountToPay),
                              subtotal: String(cart?.cart_amount || 0),
                              shipping: String(shippingCharge),
                              gst: String(gstAmount || 0),
                              cod: "0",
                              payment_method: "Online",
                            },
                          });
                        },
                        onError: (err) => {
                          console.error("❌ [Checkout] Payment verification error:", err);
                          showToast(
                            "Payment recorded but verification failed. Please contact support.",
                            "warning",
                          );
                        },
                      });
                    })
                    .catch((error: any) => {
                      console.warn("⚠️ [Checkout] Razorpay Payment Dismissed or Failed:", error);
                      showToast("Payment cancelled or failed.", "error");
                    });
                }
              },
              onError: (err: any) => {
                console.error("❌ [Checkout] Order Initiation Error:", err);
                showToast(err.message || "Order initiation error", "error");
              },
            });
          },
          onError: (err: any) => {
            console.error("❌ [Checkout] Pincode Validation Error:", err);
            showToast("Pincode validation error. Please try again.", "error");
          },
        });
      },
      onError: (err: any) => {
        console.error("❌ [Checkout] Cart Validation Error:", err);
        showToast(err.message || "Cart validation error. Please try again.", "error");
      },
    });
  };

  const isPlacingOrder =
    isValidatingCart ||
    isValidatingPincode ||
    isInitiatingOrder ||
    isCodSuccessPending ||
    isPaymentSuccessPending;

  useEffect(() => {
    const billing = addressData?.data?.billing_address ?? [];
    const delivery = addressData?.data?.delivery_address ?? [];

    if (!billing.some((a) => a.id === selectedBillingId)) {
      setSelectedBillingId(billing[0]?.id ?? null);
    }

    if (!delivery.some((a) => a.id === selectedDeliveryId)) {
      setSelectedDeliveryId(delivery[0]?.id ?? null);
    }
  }, [addressData]);

  // ── All derived data ─────────────────────────────────────────────────────
  const cart = data?.data?.cart_app;
  const items: any[] = data?.data?.cart_details || [];
  const freeProducts: any[] = data?.data?.free_products || [];
  const cartId = data?.data?.cart_app?.cart_id;
  const razorpayKey =
    data?.data?.razorpay?.RAZORPAY_KEY ||
    process.env.EXPO_PUBLIC_RAZORPAY_KEY ||
    "rzp_test_S9hH56T4ntHqvV";

  const billingList: any[] = addressData?.data?.billing_address ?? [];
  const deliveryList: any[] = addressData?.data?.delivery_address ?? [];

  const effectiveAddressId: string | null = sameAsBilling
    ? (billingList.find((a) => a.id === selectedBillingId)?.address_id ?? null)
    : (deliveryList.find((a) => a.id === selectedDeliveryId)?.address_id ??
      null);

  const selectedBillingAddr = billingList.find((a) => a.id === selectedBillingId);
  const selectedDeliveryAddr = deliveryList.find((a) => a.id === selectedDeliveryId);

  const shippingCart = shippingData?.data?.cart;
  const isFreeShipping =
    (shippingCart?.free_shipping ?? cart?.free_shipping) === "Yes";
  const shippingCharge = Number(
    shippingCart?.shipping_charge ?? cart?.shipping_charge ?? 0,
  );
  const gstAmount = cart?.gst_amount ?? "";
  const isCod = paymentMethod === "cod";

  const codCharge = Number(cart?.cod_charges ?? 0);

  const amountToPay = shippingCart?.amount_to_pay
    ? Number(shippingCart.amount_to_pay)
    : Number(cart?.amount_to_pay ?? 0);

  useEffect(() => {
    console.log(
      "🛒 [Checkout] Screen Mounted | userId:",
      userId,
      "| visitorId:",
      visitorId,
    );
    if (!userId) return;
    checkoutMutate(
      { user_id: userId },
      {
        onSuccess: (data) => {
          trackCheckout({
            value: data?.data?.cart?.amount_to_pay || data?.data?.cart?.cart_amount,
            coupon: data?.data?.cart?.promo_code || data?.data?.cart?.promo_code_details?.promo_code,
          });
          console.log("✅ [Checkout] Checkout details loaded successfully:", {
            cartId: data?.data?.cart?.cart_id,
            itemCount: data?.data?.cart_details?.length,
            cartAmount: data?.data?.cart?.cart_amount,
            amountToPay: data?.data?.cart?.amount_to_pay,
          });
        },
        onError: (err) => {
          console.error("❌ [Checkout] Failed to load checkout details:", err);
          showToast("Failed to load checkout details", "error");
        },
      },
    );
  }, [checkoutMutate, userId, visitorId]);
  useEffect(() => {
    if (!userId || !visitorId || !cartId || !effectiveAddressId) return;
    shippingMutate({
      visitor_id: visitorId,
      user_id: userId,
      cart_id: cartId,
      address_id: effectiveAddressId,
      payment_mode: paymentMethod === "cod" ? "cod" : "online",
    });
  }, [effectiveAddressId, cartId, userId, visitorId, paymentMethod]);

  useEffect(() => {
    if (shippingData?.message) {
      showToast(shippingData.message, "error");
    }
  }, [shippingData]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack showNotification />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: colors.textSecondary,
                fontSize: font(13),
                marginTop: spacing(10),
              },
            ]}
          >
            Loading your cart...
          </Text>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack />
        <View className="flex-1 items-center justify-center gap-2">
          <Text style={styles.errorText}>Something went wrong</Text>
        </View>
      </View>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!cart) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack />
        <View className="flex-1 items-center justify-center gap-2">
          <ShoppingBag size={48} color={colors.textTertiary} />
          <Text
            style={[
              styles.emptyText,
              { color: colors.textSecondary, marginTop: spacing(12) },
            ]}
          >
            Your cart is empty
          </Text>
        </View>
      </View>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top }} />
      <AppNavbar title="Checkout" showBack />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.backgroundgray }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing(16),
            paddingVertical: spacing(12),
            paddingBottom: insets.bottom + spacing(160),
            gap: spacing(16),
          },
        ]}
      >
        {/* ══════════════════════════════════════
            BILLING ADDRESS SECTION
        ══════════════════════════════════════ */}
        <View>
          <SectionTitle
            title="Billing Address"
            colors={colors}
            font={font}
            spacing={spacing}
            rightElement={
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(12) }}>
                {billingList.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setBillingSheetVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: font(11.5),
                        color: colors.primary,
                        fontFamily: "Poppins_600SemiBold",
                      }}
                    >
                      Change
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/map",
                      params: { from: "checkout", type: "billing" },
                    })
                  }
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text
                    style={{
                      fontSize: font(11.5),
                      color: colors.primary,
                      fontFamily: "Poppins_500Medium",
                    }}
                  >
                    Add New
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
          {billingList.length === 0 ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/map",
                  params: { from: "checkout", type: "billing" },
                })
              }
              activeOpacity={0.7}
              style={[
                styles.emptyAddrBox,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <View
                style={{
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: 18,
                  backgroundColor: colors.backgroundgray,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: spacing(4),
                }}
              >
                <Plus size={18} color={colors.textSecondary} />
              </View>
              <Text
                style={[
                  styles.emptyAddrText,
                  { color: colors.textSecondary, fontSize: font(12.5), fontFamily: "Poppins_500Medium" },
                ]}
              >
                No billing address added
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.addrList, { gap: spacing(10) }]}>
              {selectedBillingAddr && (
                <AddressCard
                  item={selectedBillingAddr}
                  isSelected={true}
                  onSelect={() => setBillingSheetVisible(true)}
                  onEdit={() =>
                    router.push({
                      pathname: "/addaddress",
                      params: { type: "billing", id: selectedBillingAddr.id },
                    })
                  }
                  onDelete={() => {
                    setAddressToDelete(selectedBillingAddr.id);
                    setDeleteModalVisible(true);
                  }}
                />
              )}
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════
            "SAME AS BILLING" CHECKBOX
        ══════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSameAsBilling((v) => !v)}
          style={[styles.sameAsBillingRow, { paddingVertical: 8 }]}
        >
          {sameAsBilling ? (
            <CheckSquare size={20} color={colors.primary} />
          ) : (
            <Square size={20} color={colors.textSecondary} />
          )}
          <View style={styles.sameAsBillingTextWrap}>
            <Text
              style={[
                styles.sameAsBillingTitle,
                {
                   fontFamily: "Poppins_700Bold",
                  fontSize: font(13),
                  color: colors.text,
                },
              ]}
            >
              Delivery address same as billing
            </Text>
          </View>
        </TouchableOpacity>

        {/* ══════════════════════════════════════
            DELIVERY ADDRESS SECTION (hidden when same as billing)
        ══════════════════════════════════════ */}
        {!sameAsBilling && (
          <View>
            <SectionTitle
              title="Delivery Address"
              colors={colors}
              font={font}
              spacing={spacing}
              rightElement={
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(12) }}>
                  {deliveryList.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setDeliverySheetVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: font(11.5),
                          color: colors.primary,
                          fontFamily: "Poppins_600SemiBold",
                        }}
                      >
                        Change
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/map",
                        params: { from: "checkout", type: "delivery" },
                      })
                    }
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={14} color={colors.primary} />
                    <Text
                      style={{
                        fontSize: font(11.5),
                        color: colors.primary,
                        fontFamily: "Poppins_500Medium",
                      }}
                    >
                      Add New
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
            {deliveryList.length === 0 ? (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/map",
                    params: { from: "checkout", type: "delivery" },
                  })
                }
                activeOpacity={0.7}
                style={[
                  styles.emptyAddrBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: 18,
                    backgroundColor: colors.backgroundgray,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: spacing(4),
                  }}
                >
                  <Plus size={18} color={colors.textSecondary} />
                </View>
                <Text
                  style={[
                    styles.emptyAddrText,
                    { color: colors.textSecondary, fontSize: font(12.5), fontFamily: "Poppins_500Medium" },
                  ]}
                >
                  No delivery address added
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addrList, { gap: spacing(10) }]}>
                {selectedDeliveryAddr && (
                  <AddressCard
                    item={selectedDeliveryAddr}
                    isSelected={true}
                    onSelect={() => setDeliverySheetVisible(true)}
                    onEdit={() =>
                      router.push({
                        pathname: "/addaddress",
                        params: { type: "delivery", id: selectedDeliveryAddr.id },
                      })
                    }
                    onDelete={() => {
                      setAddressToDelete(selectedDeliveryAddr.id);
                      setDeleteModalVisible(true);
                    }}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* ── Payment Method Section ── */}
        <View style={{ marginTop: spacing(10) }}>
          <SectionTitle
            title="Payment methods"
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {/* Single Container Box for Both Payment Methods */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing(14),
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            {/* ── Online Payment Option ── */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPaymentMethod("online")}
              style={{
                padding: spacing(14),
                backgroundColor: paymentMethod === "online" ? colors.primary + "06" : "transparent",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing(12) }}>
                {/* Icon Box */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: paymentMethod === "online" ? colors.primary + "12" : colors.backgroundgray,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: paymentMethod === "online" ? colors.primary + "30" : colors.border,
                  }}
                >
                  <CreditCard
                    size={22}
                    color={paymentMethod === "online" ? colors.primary : colors.textSecondary}
                  />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                          color: colors.text,
                        }}
                      >
                        Online Payment
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#22C55E18",
                          paddingHorizontal: 7,
                          paddingVertical: 2,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: "#22C55E30",
                        }}
                      >
                        <Text
                          style={{
                            color: "#16A34A",
                            fontSize: font(9.5),
                            fontFamily: "Poppins_600SemiBold",
                          }}
                        >
                          RECOMMENDED
                        </Text>
                      </View>
                    </View>

                    {/* Selection Checkbox */}
                    {paymentMethod === "online" ? (
                      <CheckCircle2 size={20} color={colors.primary} />
                    ) : (
                      <Circle size={20} color={colors.textTertiary} />
                    )}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    UPI, Debit / Credit Card, Net Banking & more
                  </Text>

                  {/* Payment Badges Pills */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginTop: spacing(8),
                      flexWrap: "wrap",
                    }}
                  >
                    {["UPI", "GPay", "Cards", "NetBanking"].map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: colors.backgroundgray,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins_500Medium",
                            fontSize: font(9.5),
                            color: colors.textSecondary,
                          }}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* ── Separator Line ── */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* ── Cash on Delivery Option ── */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPaymentMethod("cod")}
              style={{
                padding: spacing(14),
                backgroundColor: paymentMethod === "cod" ? colors.primary + "06" : "transparent",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing(12) }}>
                {/* Icon Box */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: paymentMethod === "cod" ? colors.primary + "12" : colors.backgroundgray,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: paymentMethod === "cod" ? colors.primary + "30" : colors.border,
                  }}
                >
                  <Banknote
                    size={22}
                    color={paymentMethod === "cod" ? colors.primary : colors.textSecondary}
                  />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                          color: colors.text,
                        }}
                      >
                        Cash on Delivery
                      </Text>
                      {codCharge > 0 && (
                        <View
                          style={{
                            backgroundColor: "#EF444415",
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: "#EF444430",
                          }}
                        >
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: font(9.5),
                              fontFamily: "Poppins_600SemiBold",
                            }}
                          >
                            +{cleanPrice(codCharge)} Fee
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Selection Checkbox */}
                    {paymentMethod === "cod" ? (
                      <CheckCircle2 size={20} color={colors.primary} />
                    ) : (
                      <Circle size={20} color={colors.textTertiary} />
                    )}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Pay cash when your order is delivered
                  </Text>

                  {codCharge > 0 && (
                    <View
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderRadius: spacing(6),
                        paddingHorizontal: spacing(8),
                        paddingVertical: spacing(4),
                        marginTop: spacing(8),
                        borderWidth: 1,
                        borderColor: "#FCA5A5",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_500Medium",
                          fontSize: font(10.5),
                          color: "#B91C1C",
                        }}
                      >
                        ⚠️ Extra {cleanPrice(codCharge)} COD fee applies. Pay online to save!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bill Summary Ticket Card ── */}
        <View
          onLayout={(e) => setSummaryY(e.nativeEvent.layout.y)}
          style={[
            styles.ticketCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginTop: spacing(10),
            },
          ]}
        >
          {/* Internal Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: isItemsExpanded ? 0 : 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: 6,
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

            <TouchableOpacity
              onPress={() => setIsItemsExpanded(!isItemsExpanded)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                padding: 4,
              }}
            >
              <Text
                style={{
                  fontSize: font(11.5),
                  color: colors.primary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                {isItemsExpanded ? "Hide Items" : "View Items"}
              </Text>
              {isItemsExpanded ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Expanded Items List */}
          {isItemsExpanded && (
            <View style={{ paddingHorizontal: 12, marginBottom: spacing(12) }}>
              {items.map((item, index) => (
                <CheckoutItem 
                  key={item.id} 
                  item={item} 
                  isLast={index === items.length - 1 && (!freeProducts || freeProducts.length === 0)}
                />
              ))}

              {freeProducts && freeProducts.map((item, index) => {
                const imageUri = getImageUrl(item.s3_image_path);

                return (
                  <React.Fragment key={item.free_cart_item_id}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: spacing(10),
                        paddingTop: spacing(8),
                        paddingBottom: spacing(8),
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: spacing(52),
                          height: spacing(52),
                          borderRadius: spacing(8),
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceElevated,
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: spacing(48), height: spacing(48) }}
                          resizeMode="contain"
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: spacing(3),
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: font(12.5),
                            fontFamily: "Poppins_500Medium",
                            color: colors.text,
                          }}
                        >
                          {item.product_name}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: font(11.5),
                              fontFamily: "Poppins_400Regular",
                              color: colors.textSecondary,
                            }}
                          >
                            Qty: {item.quantity}
                            {item.mrp && Number(item.mrp) > 0 ? (
                              <>
                                <Text style={{ color: colors.textSecondary }}>{"  ·  "}</Text>
                                <Text
                                  style={{
                                    textDecorationLine: "line-through",
                                    color: colors.textSecondary,
                                  }}
                                >
                                  ₹{fmt(item.mrp)}
                                </Text>
                              </>
                            ) : null}
                          </Text>

                          <View style={{ alignItems: "flex-end" }}>
                            <Text
                              style={{
                                fontSize: font(13.5),
                                fontFamily: "Poppins_600SemiBold",
                                color: "#10B981",
                              }}
                            >
                              {item.display_price || "FREE"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        marginHorizontal: -12,
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <View style={styles.cardContent}>
            {/* Item Total */}
            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.textSecondary,
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
                {cleanPrice(cart?.cart_amount)}
              </Text>
            </View>

            {/* Promo Discount Row */}
            {parseFloat(String(cart?.promo_discount_amount || 0)) > 0 && (
              <View style={styles.summaryRow}>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.textSecondary,
                  }}
                >
                  Promo Discount
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color: "#10B981",
                  }}
                >
                  - {cleanPrice(cart?.promo_discount_amount)}
                </Text>
              </View>
            )}

            {/* Shipping Row */}
            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.textSecondary,
                }}
              >
                Shipping
              </Text>
              {shippingCharge === 0 || isFreeShipping ? (
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
                  + {cleanPrice(shippingCharge)}
                </Text>
              )}
            </View>

            {/* COD Charges Row */}
            {isCod && codCharge > 0 && (
              <View style={styles.summaryRow}>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.textSecondary,
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
                  + {cleanPrice(codCharge)}
                </Text>
              </View>
            )}

            {/* GST Row */}
            {!!gstAmount && (
              <View style={styles.summaryRow}>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.textSecondary,
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
                  + {cleanPrice(gstAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Avoid COD Alert Banner if applicable */}
          {isCod && codCharge > 0 && (
            <View style={{ paddingHorizontal: 12, marginTop: spacing(8) }}>
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: spacing(8),
                  paddingHorizontal: spacing(10),
                  paddingVertical: spacing(6),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#B91C1C",
                    lineHeight: font(16),
                  }}
                >
                  Avoid COD charges and pay online to save{" "}
                  <Text
                    style={{ fontFamily: "Poppins_700Bold", color: "#EF4444" }}
                  >
                    {cleanPrice(codCharge)}
                  </Text>{" "}
                  on this order
                </Text>
              </View>
            </View>
          )}

          <WavyDivider color={colors.border} spacing={spacing} />

          <View
            style={[
              styles.cardContent,
              { marginTop: 0, marginBottom: spacing(4), paddingBottom: 12 },
            ]}
          >
            <View style={styles.summaryRow}>
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(14),
                    color: colors.text,
                  }}
                >
                  Grand Total
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
                  {cleanPrice(amountToPay)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* ── Free Shipping Banner ── */}
        {isFreeShipping ? (
          <View
            style={[
              styles.freeShippingBanner,
              {
                backgroundColor: colors.primary + 20,
                borderColor: colors.primary + "28",
              },
            ]}
          >
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(12),
                color: colors.textSecondary,
                lineHeight: font(18),
              }}
            >
              You have unlocked{" "}
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  color: colors.primary,
                }}
              >
                FREE shipping
              </Text>
            </Text>
          </View>
        ) : !!cart.free_shipping_message ? (
          <View
            style={[
              styles.freeShippingBanner,
              {
                backgroundColor: colors.primary + 20,
                borderColor: colors.primary + "28",
              },
            ]}
          >
            <RenderHtml
              contentWidth={windowWidth - 40}
              source={{ html: cart.free_shipping_message }}
              tagsStyles={{
                body: {
                  margin: 0,
                  padding: 0,
                },
                p: {
                  margin: 0,
                  padding: 0,
                },
                span: {
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  fontWeight: "500",

                  color: colors.textSecondary,
                  lineHeight: font(18),
                },
                strong: {
                  fontFamily: "Poppins_700Bold",
                  fontSize: font(12),
                  color: colors.primary,
                },
                b: {
                  fontFamily: "Poppins_700Bold",
                  fontSize: font(12),
                  color: colors.primary,
                },
              }}
              defaultTextProps={{
                allowFontScaling: false,
              }}
              ignoredDomTags={["o:p"]}
            />
          </View>
        ) : null}

        <View style={styles.bottomBarInner}>
          <View>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {formatINR(amountToPay)}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                scrollRef.current?.scrollTo({ y: summaryY, animated: true })
              }
              style={styles.grandTotalRow}
            >
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Info size={13} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder}
            style={[
              styles.placeOrderBtn,
              {
                backgroundColor: isPlacingOrder
                  ? colors.primary + "99"
                  : colors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            {isPlacingOrder ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
            <MoveRight size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmationModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#EF4444"
        icon={<Trash2 size={24} color="#EF4444" />}
        isLoading={isRemoving}
      />

      <LoadingOverlay
        visible={isPlacingOrder}
        message={
          isPaymentSuccessPending
            ? "Verifying Payment..."
            : "Processing Order..."
        }
      />

      {/* ── Billing Address Bottom Sheet ── */}
      <Modal
        visible={billingSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBillingSheetVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setBillingSheetVisible(false)} />
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + spacing(16),
              maxHeight: "75%",
            }}
          >
            {/* Header / Handle */}
            <View style={{ alignItems: "center", paddingVertical: spacing(10) }}>
              <View
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            {/* Title & Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: spacing(16),
                paddingBottom: spacing(12),
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Select Billing Address
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(14) }}>
                <TouchableOpacity
                  onPress={() => {
                    setBillingSheetVisible(false);
                    router.push({
                      pathname: "/map",
                      params: { from: "checkout", type: "billing" },
                    });
                  }}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text
                    style={{
                      fontSize: font(12),
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Add New
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setBillingSheetVisible(false)}
                  activeOpacity={0.7}
                  style={{ padding: spacing(2) }}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Address List */}
            <ScrollView
              contentContainerStyle={{
                padding: spacing(16),
                gap: spacing(12),
              }}
            >
              {billingList.map((addr) => (
                <AddressCard
                  key={addr.id}
                  item={addr}
                  isSelected={selectedBillingId === addr.id}
                  onSelect={() => {
                    setSelectedBillingId(addr.id);
                    setBillingSheetVisible(false);
                  }}
                  onEdit={() => {
                    setBillingSheetVisible(false);
                    router.push({
                      pathname: "/addaddress",
                      params: { type: "billing", id: addr.id },
                    });
                  }}
                  onDelete={() => {
                    setBillingSheetVisible(false);
                    setAddressToDelete(addr.id);
                    setDeleteModalVisible(true);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Delivery Address Bottom Sheet ── */}
      <Modal
        visible={deliverySheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDeliverySheetVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setDeliverySheetVisible(false)} />
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + spacing(16),
              maxHeight: "75%",
            }}
          >
            {/* Header / Handle */}
            <View style={{ alignItems: "center", paddingVertical: spacing(10) }}>
              <View
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            {/* Title & Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: spacing(16),
                paddingBottom: spacing(12),
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Select Delivery Address
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(14) }}>
                <TouchableOpacity
                  onPress={() => {
                    setDeliverySheetVisible(false);
                    router.push({
                      pathname: "/map",
                      params: { from: "checkout", type: "delivery" },
                    });
                  }}
                  activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Plus size={14} color={colors.primary} />
                  <Text
                    style={{
                      fontSize: font(12),
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Add New
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeliverySheetVisible(false)}
                  activeOpacity={0.7}
                  style={{ padding: spacing(2) }}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Address List */}
            <ScrollView
              contentContainerStyle={{
                padding: spacing(16),
                gap: spacing(12),
              }}
            >
              {deliveryList.map((addr) => (
                <AddressCard
                  key={addr.id}
                  item={addr}
                  isSelected={selectedDeliveryId === addr.id}
                  onSelect={() => {
                    setSelectedDeliveryId(addr.id);
                    setDeliverySheetVisible(false);
                  }}
                  onEdit={() => {
                    setDeliverySheetVisible(false);
                    router.push({
                      pathname: "/addaddress",
                      params: { type: "delivery", id: addr.id },
                    });
                  }}
                  onDelete={() => {
                    setDeliverySheetVisible(false);
                    setAddressToDelete(addr.id);
                    setDeleteModalVisible(true);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenRoot: { flex: 1 },
  scrollContent: {},

  // ── Section title ──
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  // ── Price row ──
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRowLabel: {},
  priceRowValue: {},

  // ── State screens ──
  loadingText: { fontFamily: "Poppins_400Regular" },
  errorText: { color: "#EF4444", fontFamily: "Poppins_500Medium" },
  emptyText: { fontFamily: "Poppins_500Medium" },

  // ── Address list ──
  addrList: {},

  // ── Empty address placeholder ──
  emptyAddrBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyAddrText: {
    fontFamily: "Poppins_400Regular",
  },

  // ── Same as billing checkbox row ──
  sameAsBillingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sameAsBillingTextWrap: { flex: 1 },
  sameAsBillingTitle: { fontFamily: "Poppins_500Medium" },

  // ── Order summary card ──
  summaryCard: {},

  // ── Divider ──
  divider: { height: 1 },

  // ── Payment Method ──
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderStyle: "solid",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontFamily: "Poppins_400Regular",
  },

  // ── Bottom bar ──
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  freeShippingBanner: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    marginTop: 1,
  },
  freeShippingText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  bottomBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingHorizontal: 20,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  grandTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    color: "#888",
    fontFamily: "Poppins_400Regular",
    includeFontPadding: false,
  },
  placeOrderBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 180,
    flexDirection: "row",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },
  ticketCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 0,
  },
  cardContent: {
    gap: 10,
    paddingHorizontal: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
