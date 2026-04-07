import React from "react";
import { View, Text, StatusBar, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useCart, useCartAction } from "../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import CartItem from "../../src/components/cart/CartItem";
import { CartItem as CartItemTypes } from "../../src/types/cart.types";

export default function CartScreen() {
  const visitorId = useAppVisitorStore((state) => state.visitorId);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const { updateCart } = useCartAction();

  const {
    data: cartData,
    isLoading,
    error,
  } = useCart({
    user_id: 0,
    visitor_id: visitorId!,
  });

  // const cart = cartData?.data.cart;
  const items = cartData?.data.cart_details;

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

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <AppNavbar title="Cart Item" showBack />

      <ScrollView
        style={[
          styles.content,
          {
            paddingVertical: spacing(20),
          },
        ]}
        contentContainerStyle={{ paddingBottom: spacing(24) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4">
          {/* <CartItem /> */}
          {isLoading ? (
            <Text>Loading...</Text>
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
      </ScrollView>
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
