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
import {
  useAddress,
  useCheckout,
  useRemoveAddress,
  useShipping,
  useValidateCart,
  useValidatePincode,
} from "../../src/hooks/CheckoutHooks";
import { useResponsive } from "../../src/utils/useResponsive";
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
} from "lucide-react-native";
import AddressCard from "../../src/components/checkout/AddressCard";
import { fmt, formatINR } from "../../src/utils/productHelpers";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../src/context/ToastContext";
import LoadingOverlay from "../../src/components/comman/LoadingOverlay";
import {
  useCodSuccess,
  useInitiateOrder,
  usePaymentSuccess,
} from "../../src/hooks/orderHooks";
import { useCartStore } from "../../src/store/cartStore";

const SectionTitle = ({ title, colors, font, spacing, rightElement }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing(12),
    }}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          fontSize: font(11),
          color: colors.text,
        },
      ]}
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
  console.log("userId: ", userId);
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
    console.log("🚀 Starting Order Placement Process...");
    console.log("DEBUG: userId:", userId);
    console.log("DEBUG: visitorId:", visitorId);
    console.log("DEBUG: cartId:", cartId);
    console.log("DEBUG: effectiveAddressId:", effectiveAddressId);

    if (!userId || !visitorId || !cartId || !effectiveAddressId) {
      showToast("Please select a delivery address", "warning");
      console.log("❌ Missing required fields for order placement");
      return;
    }

    // Step 1: Validate Cart
    const cartPayload = {
      visitor_id: visitorId,
      user_id: userId,
      cart_id: cartId,
    };
    console.log("📦 Step 1: Validating Cart...", cartPayload);

    validateCartMutate(cartPayload, {
      onSuccess: (cartRes) => {
        console.log("✅ Step 1 Success: Cart Validated", cartRes);
        if (cartRes?.status !== 1) {
          showToast(cartRes?.message || "Cart validation failed", "error");
          console.log("❌ Step 1 Failed: API returned status", cartRes?.status);
          return;
        }

        // Step 2: Validate Pincode
        const pincodePayload = {
          cart_id: cartId,
          delivery_address_id: effectiveAddressId!,
          payment_method: (isCod ? "cash" : "online") as "cash" | "online",
        };
        console.log("📍 Step 2: Validating Pincode...", pincodePayload);

        validatePincodeMutate(pincodePayload, {
          onSuccess: (pincodeRes) => {
            console.log("✅ Step 2 Success: Pincode Validated", pincodeRes);
            if (pincodeRes?.status !== 1) {
              showToast(
                pincodeRes?.message ||
                  "Delivery not available for this pincode",
                "error",
              );
              console.log(
                "❌ Step 2 Failed: API returned status",
                pincodeRes?.status,
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
            console.log("📝 Step 3: Initiating Order...", initiatePayload);

            initiateOrderMutate(initiatePayload, {
              onSuccess: (initRes) => {
                console.log("✅ Step 3 Success: Order Initiated", initRes);

                if (initRes.status === 0) {
                  showToast(
                    initRes.message || "Failed to initiate order",
                    "error",
                  );
                  console.log("❌ Step 3 Failed: API returned status 0");
                  return;
                }

                // Step 4: Process Order based on Payment Method
                console.log(
                  "💳 Step 4: Processing Payment Mode:",
                  paymentMethod,
                );
                if (isCod) {
                  const codPayload = { cart_id: String(cartId) };
                  console.log(
                    "💵 Step 4 (COD): Confirming Order...",
                    codPayload,
                  );

                  codSuccessMutate(codPayload, {
                    onSuccess: (res) => {
                      console.log("✅ Step 4 Success: COD Confirmed", res);
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
                      console.log("❌ Step 4 Failed: COD Confirm Error", err);
                      showToast(
                        err.message || "Failed to process COD order",
                        "error",
                      );
                    },
                  });
                } else {
                  // Logic for online payment (Razorpay)
                  console.log("🌐 Step 4 (Online): Payment Data", initRes.data);

                  const options = {
                    description: "Payment for Order",
                    image:
                      "https://pestobazaar.confidevtech.com/images/logo.png",
                    currency: "INR",
                    key: initRes.data?.key || razorpayKey,
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

                  RazorpayCheckout.open(options)
                    .then((paymentRes: any) => {
                      console.log("✅ Razorpay Success:", paymentRes);
                      showToast("Payment Successful!", "success");

                      // Step 5: Inform Backend about Success
                      const successPayload = {
                        razorpay_order_id: paymentRes.razorpay_order_id,
                        razorpay_payment_id: paymentRes.razorpay_payment_id,
                        razorpay_signature: paymentRes.razorpay_signature,
                      };

                      paymentSuccessMutate(successPayload, {
                        onSuccess: (res) => {
                          console.log(
                            "✅ Step 5 Success: Backend Notified",
                            res,
                          );
                          clearCart();
                          queryClient.invalidateQueries({ queryKey: ["cart"] });
                          queryClient.invalidateQueries({ queryKey: ["cart-count"] });
                          queryClient.invalidateQueries({ queryKey: ["cart-quantity"] });
                          router.replace({
                            pathname: "/ordersuccess",
                            params: {
                              order_id: initRes.data?.orderId,
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
                          console.log(
                            "❌ Step 5 Failed: Backend Notify Error",
                            err,
                          );
                          showToast(
                            "Payment recorded but verification failed. Please contact support.",
                            "warning",
                          );
                        },
                      });
                    })
                    .catch((error: any) => {
                      console.log("❌ Razorpay Failed:", error);
                      showToast("Payment cancelled or failed.", "error");
                    });
                }
              },
              onError: (err: any) => {
                console.log("❌ Step 3 Failed: Initiate Error", err);
                showToast(err.message || "Order initiation error", "error");
              },
            });
          },
          onError: (err: any) => {
            console.log("❌ Step 2 Failed: Pincode Error", err);
            showToast("Pincode validation error. Please try again.", "error");
          },
        });
      },
      onError: (err: any) => {
        console.log("❌ Step 1 Failed: Cart Validation Error", err);
        showToast("Cart validation error. Please try again.", "error");
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
  const razorpayKey = data?.data?.razorpay?.RAZORPAY_KEY;

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
    if (!userId) return;
    checkoutMutate(
      { user_id: userId },
      {
        onError: () => {
          showToast("Failed to load checkout details", "error");
        },
      },
    );
  }, [checkoutMutate, userId]);

  const visitorId = useAppVisitorStore((s) => s.visitorId);
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

  // useEffect(() => {
  //   console.log("\n======= CHECKOUT PRICE DEBUG =======");
  //   console.log("[CART API]");
  //   console.log("  cart_amount     :", cart?.cart_amount);
  //   console.log("  shipping_charge :", cart?.shipping_charge);
  //   console.log("  gst_amount      :", cart?.gst_amount);
  //   console.log("  cod_charges     :", cart?.cod_charges);
  //   console.log("  amount_to_pay   :", cart?.amount_to_pay);
  //   console.log("  free_shipping   :", cart?.free_shipping);
  //   console.log("[SHIPPING API]");
  //   console.log("  cart_amount     :", shippingCart?.cart_amount);
  //   console.log("  shipping_charge :", shippingCart?.shipping_charge);
  //   console.log("  cod_charges     :", shippingCart?.cod_charges);
  //   console.log("  amount_to_pay   :", shippingCart?.amount_to_pay);
  //   console.log("  free_shipping   :", shippingCart?.free_shipping);
  //   console.log(" message shipping: ", shippingData?.message);
  //   console.log("[COMPUTED]");
  //   console.log("  shippingCharge  :", shippingCharge);
  //   console.log("  codCharge       :", codCharge);
  //   console.log("  amountToPay     :", amountToPay);
  //   console.log("  paymentMethod   :", paymentMethod);
  //   console.log("  isCod           :", isCod);
  //   console.log("  effectiveAddrId :", effectiveAddressId);
  //   console.log("[IDs]");
  //   console.log("  userId          :", userId);
  //   console.log("  visitorId       :", visitorId);
  //   console.log("  cartId          :", cartId);
  //   console.log("===================================\n");
  // }, [
  //   shippingCart,
  //   cart,
  //   shippingCharge,
  //   codCharge,
  //   amountToPay,
  //   paymentMethod,
  //   effectiveAddressId,
  // ]);

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

        <View>
          <SectionTitle
            title="Payment Method"
            colors={colors}
            font={font}
            spacing={spacing}
          />
          <View style={{ gap: spacing(10) }}>
            {/* ── Online Payment Option ── */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPaymentMethod("online")}
              style={[
                styles.paymentOption,
                {
                  backgroundColor:
                    paymentMethod === "online"
                      ? colors.primary + "08"
                      : colors.surface,
                  borderColor:
                    paymentMethod === "online" ? colors.primary : colors.border,
                  borderWidth: 1.5,
                  padding: spacing(16),
                  alignItems: "flex-start", // Top alignment for cleaner multi-line look
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.background, marginTop: 2 },
                ]}
              >
                <CreditCard
                  size={22}
                  color={
                    paymentMethod === "online"
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </View>

              <View style={{ flex: 1, marginLeft: spacing(12) }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={[
                      styles.paymentOptionTitle,
                      { color: colors.text, fontSize: font(13.5) },
                    ]}
                  >
                    Pay Online
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#22C55E15",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#22C55E",
                        fontSize: font(10),
                        fontFamily: "Poppins_600SemiBold",
                      }}
                    >
                      RECOMMENDED
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.paymentOptionDesc,
                    {
                      color: colors.textSecondary,
                      fontSize: font(11),
                      lineHeight: font(16),
                    },
                  ]}
                >
                  UPI, Cards, Wallets, NetBanking
                </Text>

                <View
                  style={{
                    marginTop: spacing(8),
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#22C55E",
                      fontSize: font(10.5),
                      fontFamily: "Poppins_500Medium",
                    }}
                  >
                    No extra charges applied
                  </Text>
                </View>
              </View>

              <View style={{ marginLeft: spacing(12), marginTop: 4 }}>
                {paymentMethod === "online" ? (
                  <CircleDot size={20} color={colors.primary} />
                ) : (
                  <Circle size={20} color={colors.textTertiary} />
                )}
              </View>
            </TouchableOpacity>

            {/* ── COD Payment Option ── */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPaymentMethod("cod")}
              style={[
                styles.paymentOption,
                {
                  backgroundColor:
                    paymentMethod === "cod"
                      ? colors.error + "05"
                      : colors.surface,
                  borderColor:
                    paymentMethod === "cod" ? colors.primary : colors.border,
                  borderWidth: 1.5,
                  padding: spacing(16),
                  alignItems: "flex-start",
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.background, marginTop: 2 },
                ]}
              >
                <Banknote
                  size={22}
                  color={
                    paymentMethod === "cod"
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </View>

              <View style={{ flex: 1, marginLeft: spacing(12) }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={[
                      styles.paymentOptionTitle,
                      { color: colors.text, fontSize: font(13.5) },
                    ]}
                  >
                    Cash on Delivery
                  </Text>
                  {codCharge > 0 && (
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: font(11),
                        fontFamily: "Poppins_600SemiBold",
                      }}
                    >
                      {fmt(codCharge)} extra
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.paymentOptionDesc,
                    {
                      color: colors.textSecondary,
                      fontSize: font(11),
                      lineHeight: font(16),
                    },
                  ]}
                >
                  Pay when you receive the order
                </Text>

                {codCharge > 0 && (
                  <View
                    style={{
                      marginTop: spacing(8),
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: font(10.5),
                        fontFamily: "Poppins_500Medium",
                      }}
                    >
                      {fmt(codCharge)} COD handling charges applied
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ marginLeft: spacing(12), marginTop: 4 }}>
                {paymentMethod === "cod" ? (
                  <CircleDot size={20} color={colors.primary} />
                ) : (
                  <Circle size={20} color={colors.textTertiary} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          onLayout={(e) => setSummaryY(e.nativeEvent.layout.y)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderRadius: spacing(16),
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing(12),
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: font(11),
                  color: colors.text,
                },
              ]}
            >
              {`Order Summary (${cart.cart_count} item${cart.cart_count > 1 ? "s" : ""})`}
            </Text>

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
                  fontSize: font(11),
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

          {isItemsExpanded && (
            <View style={{ marginBottom: spacing(4) }}>
              {items.map((item, index) => (
                <CheckoutItem 
                  key={item.id} 
                  item={item} 
                  isLast={index === items.length - 1 && (!freeProducts || freeProducts.length === 0)}
                />
              ))}

              {freeProducts && freeProducts.map((item, index) => {
                const imageUri = item.s3_image_path?.startsWith("http")
                  ? item.s3_image_path
                  : `https://static-cdn.pestobazaar.com${item.s3_image_path}`;

                const isLastFreeProduct = index === freeProducts.length - 1;

                return (
                  <React.Fragment key={item.free_cart_item_id}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: spacing(12),
                        paddingBottom: spacing(10),
                      }}
                    >
                      {/* Image */}
                      <View
                        style={{
                          width: wp(22),
                          height: wp(22),
                          borderRadius: spacing(8),
                          backgroundColor: colors.inputBackground,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: wp(22), height: wp(22) }}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Content */}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: spacing(8),
                        }}
                      >
                        {/* Title */}
                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: font(13),
                            fontFamily: "Poppins_500Medium",
                            color: colors.text,
                          }}
                        >
                          {item.product_name}
                        </Text>

                        {/* Details */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {/* Details */}
                          <Text
                            style={{
                              fontSize: font(12),
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

                          {/* Price */}
                          <View style={{ alignItems: "flex-end" }}>
                            <Text
                              style={{
                                fontSize: font(15),
                                fontFamily: "Poppins_600SemiBold",
                                color: "#10B981", // Green for FREE
                              }}
                            >
                              {item.display_price || "FREE"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Divider at the bottom of the card */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        marginBottom: spacing(10),
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <PriceRow
            label={`Subtotal (${cart.cart_count} item${cart.cart_count > 1 ? "s" : ""})`}
            value={cart.cart_amount}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          <PriceRow
            label="Shipping"
            value={shippingCharge === 0 ? "FREE" : fmt(shippingCharge)}
            isGreen={shippingCharge === 0}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {!!gstAmount && (
            <PriceRow
              label="GST"
              value={gstAmount}
              colors={colors}
              font={font}
              spacing={spacing}
            />
          )}

          {isCod && codCharge > 0 && (
            <>
              <PriceRow
                label="COD Charges"
                value={fmt(codCharge)}
                isRed
                colors={colors}
                font={font}
                spacing={spacing}
              />
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: spacing(8),
                  paddingHorizontal: spacing(10),
                  paddingVertical: spacing(6),
                  marginTop: spacing(2),
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
                    {fmt(codCharge)}
                  </Text>{" "}
                  on this order
                </Text>
              </View>
            </>
          )}

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
                marginVertical: spacing(8),
              },
            ]}
          />

          <PriceRow
            label="Grand Total"
            value={fmt(amountToPay)}
            isTotal
            colors={colors}
            font={font}
            spacing={spacing}
          />
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
});
