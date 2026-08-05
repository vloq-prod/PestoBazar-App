import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import {
  useCart,
  useCartAction,
  useCartCount,
  useRemoveCartItem,
} from "../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import CartItem from "../../src/components/cart/CartItem";
import { CartItem as CartItemTypes } from "../../src/types/cart.types";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";
import { Info, MoveRight, Gift, Tag, ChevronRight, Receipt, BadgePercent, Clock } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import CartItemSkeleton from "../../src/skeleton/CartItemSkeleton";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRemovePromoCode } from "../../src/hooks/prompoCouponHooks";
import { useToast } from "../../src/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

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

const FilledWavyDivider = ({ color }: { color: string }) => {
  let path = "M0 0 L0 3 Q 4 1, 8 3 ";
  for (let x = 16; x <= 1000; x += 8) {
    path += `T ${x} 3 `;
  }
  path += "L 1000 0 Z";

  return (
    <View style={{ height: 6, overflow: "hidden", marginTop: -1 }}>
      <Svg height="6" width="1000">
        <Path d={path} fill={color} />
      </Svg>
    </View>
  );
};

export default function CartScreen() {
  const { visitorId, userId } = useAppVisitorStore((state) => state);

  console.log("userId: ", userId);

  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: removePromo, isPending: isRemovingPromo } = useRemovePromoCode();

  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const insets = useSafeAreaInsets();
  const { updateCart } = useCartAction();

  const { mutate: removeCartItem, isPending: isRemoving } = useRemoveCartItem();

  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItemTypes | null>(null);

  const {
    data: cartData,
    isLoading,
    error,
  } = useCart({
    user_id: userId ?? 0,
    visitor_id: visitorId!,
  });

  const { data: cartCountData } = useCartCount({
    user_id: userId ?? 0,
    visitor_id: visitorId!,
  });

  // const cart = cartData?.data.cart;
  const items = cartData?.data?.cart_details;
  const freeProducts = cartData?.data?.free_products;

  const cartId = cartData?.data?.cart_app?.cart_id;
  console.log("cartId: ", cartId);

  const cartTotal = cartData?.data?.cart_app;
  const isFreeShipping = cartData?.data?.cart_app?.free_shipping;
  const cartCount = cartCountData?.data;
  const appliedPromo = cartTotal?.promo_code_details || cartData?.data?.cart?.promo_code_details;

  const handleRemovePromo = () => {
    if (!cartId) return;

    removePromo(
      {
        cart_id: String(cartId),
        user_id: String(userId || 0),
        visitor_id: visitorId || "",
      },
      {
        onSuccess: (res) => {
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
          showToast(err?.message || "Failed to remove promo code", "error");
        },
      },
    );
  };

  const getCartPayloadProductId = (item: CartItemTypes) => {
    return item.variation_id || item.product_id;
  };

  const handleIncrease = (item: CartItemTypes) => {
    if (item.qty >= item.stock) return;

    updateCart({
      product_id: getCartPayloadProductId(item),
      qty: item.qty + 1,
      user_id: userId ?? 0,
      visitor_id: visitorId,
    });
  };

  const handleDecrease = (item: CartItemTypes) => {
    if (item.qty <= 1) return;

    updateCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: getCartPayloadProductId(item),
      qty: item.qty - 1,
    });
  };

  const handleRemove = (item: CartItemTypes) => {
    const performRemoval = () => {
      removeCartItem({
        product_id: item.enc_product_id,
        qty: 0,
        user_id: userId ?? 0,
        visitor_id: visitorId!,
        cart_id: cartId!,
        cart_detail_id: item.id,
      });
    };

    if (item.qty > 1) {
      setItemToRemove(item);
      setRemoveModalVisible(true);
    } else {
      performRemoval();
    }
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeCartItem({
        product_id: itemToRemove.enc_product_id,
        qty: 0,
        user_id: userId ?? 0,
        visitor_id: visitorId!,
        cart_id: cartId!,
        cart_detail_id: itemToRemove.id,
      });
      setRemoveModalVisible(false);
      setItemToRemove(null);
    }
  };

  const handleChangeQty = (item: CartItemTypes, qty: number) => {
    updateCart({
      product_id: getCartPayloadProductId(item),
      qty,
      user_id: userId ?? 0,
      visitor_id: visitorId,
    });
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const cleanPrice = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return "₹0";
    if (typeof val === "number") {
      return formatINR(val);
    }
    if (typeof val === "string") {
      if (val.trim().startsWith("₹") || val.includes("₹")) {
        return val.replace(/\s+/g, " ");
      }
      const num = parseFloat(val.replace(/[^\d.]/g, ""));
      return isNaN(num) ? val : formatINR(num);
    }
    return String(val);
  };

  const handleContinue = () => {
    console.log("🛒 Continue Pressed! userId:", userId);
    if (userId) {
      console.log("➡️ Navigating to /(stack)/checkout");
      router.push("/(stack)/checkout");
    } else {
      console.log("🔑 Navigating to /login");
      router.push({
        pathname: "/login",
        params: { redirectTo: "/(stack)/checkout" },
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]} // Removed "bottom" to allow absolute footer to handle safe area
    >
      <StatusBar barStyle="dark-content" />

      <AppNavbar title="Cart Item" showBack count={`${cartCount}`} />

      {isLoading || (items && items.length > 0) || error ? (
        <ScrollView
          style={[styles.content, { backgroundColor: colors.backgroundgray }]}
          contentContainerStyle={{
            paddingTop: spacing(15),
            paddingBottom: insets.bottom + 170,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: spacing(15), gap: spacing(15) }}>
            {/* ── Coupons & Offers Premium Card ── */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: spacing(12),
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {/* Blue Header Tag */}
              <View
                style={{
                  backgroundColor: "#F0F6FF",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing(8),
                  paddingHorizontal: spacing(14),
                  gap: spacing(8),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#006FEE",
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(9),
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                    }}
                  >
                    New
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(11.5),
                    color: "#005BC6",
                    flex: 1,
                  }}
                >
                  Apply coupons + payment offers & save more
                </Text>
              </View>

              {/* Main Body */}
              <View style={{ padding: spacing(14), gap: spacing(12) }}>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(14),
                    color: colors.text,
                  }}
                >
                  Coupons & offers
                </Text>

                {appliedPromo?.promo_code ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing(10),
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#10B981",
                        backgroundColor: colors.background,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <BadgePercent size={25} color="#10B981" />
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push("/(stack)/coupons")}
                      style={{ flex: 1, gap: 1 }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(12.5),
                          color: colors.text,
                        }}
                        numberOfLines={2}
                      >
                        {parseFloat(String(appliedPromo.discount_amount || 0)) > 0
                          ? `Saved ${cleanPrice(appliedPromo.discount_amount)} with ${appliedPromo.promo_code}`
                          : `${appliedPromo.title || "Coupon"} with ${appliedPromo.promo_code}`}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                          style={{
                            fontFamily: "Poppins_500Medium",
                            fontSize: font(11),
                            color: colors.textSecondary,
                          }}
                        >
                          View all coupons
                        </Text>
                        <ChevronRight size={12} color={colors.textSecondary} style={{ marginTop: 1 }} />
                      </View>
                    </TouchableOpacity>

                    {/* Remove button */}
                    <TouchableOpacity
                      disabled={isRemovingPromo}
                      onPress={handleRemovePromo}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: colors.background,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: font(11.5),
                          fontFamily: "Poppins_600SemiBold",
                          color: colors.text,
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/(stack)/coupons")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing(10),
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundgray,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <BadgePercent size={25} color={colors.textSecondary} />
                    </View>

                    <View style={{ flex: 1, gap: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(12.5),
                          color: colors.text,
                        }}
                      >
                        Apply coupons & save more
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                          style={{
                            fontFamily: "Poppins_500Medium",
                            fontSize: font(11),
                            color: colors.textSecondary,
                          }}
                        >
                          View all coupons
                        </Text>
                        <ChevronRight size={12} color={colors.textSecondary} style={{ marginTop: 1 }} />
                      </View>
                    </View>

                    {/* Apply text button */}
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.primary,
                        borderRadius: 8,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        backgroundColor: "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: font(11.5),
                          fontFamily: "Poppins_600SemiBold",
                          color: colors.primary,
                        }}
                      >
                        Apply
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Free Products */}
            {!isLoading && !error && freeProducts && freeProducts.length > 0 && (
              <View
                style={{
                  borderWidth: 1.2,
                  borderColor: "#A7F3D0", // Soft light green border
                  borderRadius: spacing(12),
                  backgroundColor: colors.surface,
                  overflow: "hidden", // Clips header's background to rounded corners
                }}
              >
                {/* Section Header */}
                <View
                  style={{
                    backgroundColor: "#E8FDF0", // Soft success green
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing(12),
                    paddingHorizontal: spacing(14),
                    gap: spacing(10),
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#10B981",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Gift size={16} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: font(13),
                      fontFamily: "Poppins_600SemiBold",
                      color: "#06563F",
                      flex: 1,
                    }}
                  >
                    {freeProducts.length} Free gift{freeProducts.length > 1 ? "s" : ""} added to your order
                  </Text>
                </View>

                {/* Divider Line connecting sides */}
                <FilledWavyDivider color="#E8FDF0" />

                {/* Free Products Cards */}
                <View style={{ padding: spacing(14), gap: spacing(16) }}>
                  {freeProducts.map((item) => {
                    // Resolve image path
                    const imageUri = item.s3_image_path?.startsWith("http")
                      ? item.s3_image_path
                      : `https://static-cdn.pestobazaar.com${item.s3_image_path}`;

                    return (
                      <View
                        key={item.free_cart_item_id}
                        style={{
                          flexDirection: "row",
                          backgroundColor: "transparent",
                          gap: spacing(12),
                          alignItems: "center",
                        }}
                      >
                        {/* Image */}
                        <View
                          style={{
                            width: spacing(75),
                            height: spacing(75),
                            borderRadius: spacing(8),
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            overflow: "hidden",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={{ uri: imageUri }}
                            style={{
                              width: spacing(65),
                              height: spacing(65),
                            }}
                            resizeMode="contain"
                          />
                        </View>

                        {/* Content */}
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            numberOfLines={2}
                            style={{
                              fontSize: font(12.5),
                              fontFamily: "Poppins_600SemiBold",
                              color: colors.text,
                              lineHeight: font(17),
                            }}
                          >
                            {item.product_name}
                          </Text>

                          <Text
                            style={{
                              fontSize: font(10.5),
                              fontFamily: "Poppins_400Regular",
                              color: colors.textSecondary,
                              marginTop: spacing(3),
                            }}
                          >
                            {item.size ? `${item.size} • ` : ""}
                            {item.quantity ? `${item.quantity} unit` : "1 unit"}
                          </Text>
                        </View>

                        {/* Green FREE text label instead of ADD button */}
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: "#10B981",
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: "#10B98110",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: font(11.5),
                              fontFamily: "Poppins_700Bold",
                              color: "#10B981",
                              textTransform: "uppercase",
                            }}
                          >
                            Free
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Cart Product List Section */}
            {isLoading ? (
              <View style={{ gap: spacing(12) }}>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={{ color: colors.text }}>Error loading cart data</Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: spacing(12),
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {/* Unified Card Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: spacing(14),
                    paddingVertical: spacing(12),
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(10) }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.backgroundgray,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={16} color={colors.text} />
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: font(13),
                          fontFamily: "Poppins_600SemiBold",
                          color: colors.text,
                        }}
                      >
                        Delivering soon
                      </Text>
                      <Text
                        style={{
                          fontSize: font(11),
                          fontFamily: "Poppins_400Regular",
                          color: colors.textSecondary,
                        }}
                      >
                        {items?.length || 0} item{items && items.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  
                </View>

                {/* Divider Line */}
                <View style={{ height: 1, backgroundColor: colors.border }} />

                {/* Items List */}
                <View>
                  {items?.map((item, index) => (
                    <View key={item.id}>
                      {index > 0 && (
                        <View
                          style={{
                            height: 1,
                            backgroundColor: colors.border,
                          }}
                        />
                      )}
                      <CartItem
                        item={item}
                        onDecrease={handleDecrease}
                        onIncrease={handleIncrease}
                        onRemove={handleRemove}
                        onChangeQty={handleChangeQty}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* ── Bill Summary Ticket Card ── */}
            {cartTotal ? (
              <View
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
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    marginBottom: 16,
                  }}
                >
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

                <View style={styles.cardContent}>
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
                      {cleanPrice(cartTotal?.cart_amount)}
                    </Text>
                  </View>

                  {/* Promo Discount Row */}
                  {parseFloat(String(cartTotal?.promo_discount_amount || 0)) > 0 && (
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
                        - {cleanPrice(cartTotal?.promo_discount_amount)}
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
                    {cartTotal?.shipping_charge === 0 ||
                    cartTotal?.shipping_charge === "0" ||
                    String(cartTotal?.shipping_charge).toLowerCase() === "free" ? (
                      <Text
                        style={{
                          fontFamily: "Poppins_700Bold",
                          fontSize: font(12.5),
                          color: "#10B981", // Green for FREE
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
                        + {cleanPrice(cartTotal?.shipping_charge)}
                      </Text>
                    )}
                  </View>

                  {/* COD Charges Row */}
                  {parseFloat(String(cartTotal?.cod_charges || 0)) > 0 && (
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
                        + {cleanPrice(cartTotal?.cod_charges)}
                      </Text>
                    </View>
                  )}

                  {/* GST Row */}
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
                      + {cleanPrice(cartTotal?.gst_amount)}
                    </Text>
                  </View>
                </View>

                <WavyDivider color={colors.border} spacing={spacing} />

                <View
                  style={[
                    styles.cardContent,
                    { marginTop: 0, marginBottom: spacing(4) },
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
                        {cleanPrice(cartTotal?.amount_to_pay)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.emptyContainer, { flex: 1 }]}>
          <LottieView
            source={require("../../assets/lottieview/Empty Cart.json")}
            autoPlay
            loop
            style={{
              width: spacing(220),
              height: spacing(220),
              marginBottom: spacing(10),
            }}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text, fontSize: font(20) },
            ]}
          >
            Your cart is empty
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontSize: font(14) },
            ]}
          >
            Looks like you haven&apos;t added anything to your cart yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={[styles.shopNowBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.shopNowText, { fontSize: font(15) }]}>
              Shop Now
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {items && items.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom),
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary + 20,
              paddingHorizontal: 20,
              paddingVertical: 7,
              marginTop: 1,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: colors.primary,
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {isFreeShipping ? "You have unlocked FREE shipping" : ""}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              paddingHorizontal: 20,
            }}
          >
            {/* LEFT: PRICE SECTION */}
            <View className="">
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                {formatINR(cartTotal?.amount_to_pay || 0)}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text style={{ fontSize: 14, color: "#888", marginBottom: 2 }}>
                  Grand Total
                </Text>
                <Info size={14} color={colors.textTertiary} />
              </View>
            </View>

            {/* RIGHT: BUTTON */}
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: 180,
                flexDirection: "row",
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Continue
              </Text>
              <MoveRight size={26} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ConfirmationModal
        visible={removeModalVisible}
        onClose={() => {
          setRemoveModalVisible(false);
          setItemToRemove(null);
        }}
        onConfirm={confirmRemove}
        title="Remove Item"
        description={`Are you sure you want to remove "${itemToRemove?.name}" from your cart?`}
        confirmText="Remove"
        isLoading={isRemoving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.7,
  },
  shopNowBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  shopNowText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
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
