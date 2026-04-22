import React from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import {
  useCart,
  useCartAction,
  useCartCount,
} from "../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import CartItem from "../../src/components/cart/CartItem";
import { CartItem as CartItemTypes } from "../../src/types/cart.types";
import CartItemSkeleton from "../../src/skeleton/CartItemSkeleton";
import { ArrowRight, Info, MoveRight } from "lucide-react-native";

export default function CartScreen() {
  const visitorId = useAppVisitorStore((state) => state.visitorId);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();


  const insets = useSafeAreaInsets();
  const { updateCart } = useCartAction();

  const {
    data: cartData,
    isLoading,
    error,
  } = useCart({
    user_id: 0,
    visitor_id: visitorId!,
  });

  const { data: cartCountData } = useCartCount({
    user_id: 0,
    visitor_id: visitorId!,
  });

  // const cart = cartData?.data.cart;
  const items = cartData?.data.cart_details;

  const cartTotal = cartData?.data.cart;
  const isFreeShipping = cartData?.data.cart.free_shipping;
  console.log("cartTotal", cartTotal);
  const cartCount = cartCountData?.data;

  const getCartPayloadProductId = (item: CartItemTypes) => {
    return item.variation_id || item.product_id;
  };

  const handleIncrease = (item: CartItemTypes) => {
    if (item.qty >= item.stock) return;

    updateCart({
      product_id: getCartPayloadProductId(item),
      qty: item.qty + 1,
      user_id: 0,
      visitor_id: visitorId,
    });
  };

  const handleDecrease = (item: CartItemTypes) => {
    if (item.qty <= 1) return;

    updateCart({
      user_id: 0,
      visitor_id: visitorId,
      product_id: getCartPayloadProductId(item),
      qty: item.qty - 1,
    });
  };

  const handleRemove = (item: CartItemTypes) => {
    updateCart({
      product_id: getCartPayloadProductId(item),
      qty: 0, // 🔥 remove trick
      user_id: 0,
      visitor_id: visitorId,
    });
  };

  const handleChangeQty = (item: CartItemTypes, qty: number) => {
    updateCart({
      product_id: getCartPayloadProductId(item),
      qty,
      user_id: 0,
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

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />

      <AppNavbar
        title="Cart Item"
        showBack
      
        count={`${cartCount} items`}
      />

      <ScrollView
        style={[
          styles.content,
          {
            paddingVertical: spacing(20),
          },
        ]}
        contentContainerStyle={{
          paddingBottom: spacing(200),
          gap: spacing(16),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4">
          {/* <CartItem /> */}
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </>
          ) : error ? (
            <Text>Error loading cart data</Text>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onDecrease={handleDecrease}
                onIncrease={handleIncrease}
                onRemove={handleRemove}
                onChangeQty={handleChangeQty}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontSize: font(16) }}>
                Your cart is empty
              </Text>
            </View>
          )}
        </View>
        {/* 
          <View className="px-4 gap-3">
            <View className="flex-row items-center">
              <Text
                style={{
                  fontSize: 14,
                  marginRight: 4,
                  fontFamily: "Poppins_500Medium",
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
              >
                Cart Summary
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Poppins_400Regular",
                  color: colors.textTertiary,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
              >
                ({cartCount} Items)
              </Text>
            </View>

            <View>
              <View>
                <Text>Sub-Total</Text>
                <Text></Text>
              </View>
            </View>
          </View> */}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,

          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          
          paddingBottom: Platform.OS === "ios" ? 35 : 0,
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
          >{`${isFreeShipping && "You have unlocked FREE shipping"}`}</Text>
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
                fontFamily: "Poppins_600SemiBold,",
              }}
            >
              {formatINR(cartTotal?.amount_to_pay || 0)}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#888",
                  marginBottom: 2,
                }}
              >
                Grand Total
              </Text>
              {/* <Info size={12} color={colors.textTertiary} /> */}
            </View>
          </View>

          {/* RIGHT: BUTTON */}
          <TouchableOpacity
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
  emptyState: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
