import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
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
import { Info, MoveRight } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import CartItemSkeleton from "../../src/skeleton/CartItemSkeleton";

export default function CartScreen() {
  const { visitorId, userId } = useAppVisitorStore((state) => state);

  console.log("userId: ", userId);

  const router = useRouter();

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

  const cartId = cartData?.data?.cart_app?.cart_id;
  console.log("cartId: ", cartId);

  const cartTotal = cartData?.data?.cart_app;
  const isFreeShipping = cartData?.data?.cart_app?.free_shipping;
  const cartCount = cartCountData?.data;

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
          style={[styles.content]}
          contentContainerStyle={{
            paddingTop: spacing(20),
            paddingBottom: insets.bottom + 170,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text>Error loading cart data</Text>
              </View>
            ) : (
              items?.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onDecrease={handleDecrease}
                  onIncrease={handleIncrease}
                  onRemove={handleRemove}
                  onChangeQty={handleChangeQty}
                />
              ))
            )}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
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
});
