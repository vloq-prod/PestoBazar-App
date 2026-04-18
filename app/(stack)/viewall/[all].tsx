import {
  View,
  StatusBar,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import React from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../src/theme";
import AppNavbar from "../../../src/components/comman/AppNavbar";
import { useLocalSearchParams } from "expo-router";
import { useHomeProduct } from "../../../src/hooks/homeHooks";
import ItemCard from "../../../src/components/comman/ItemCard";
import { useAddToCart } from "../../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../../src/store/auth";

const { width } = Dimensions.get("window");

const GAP = 10;
const PADDING = 16;

const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

const AllProducts = () => {
  const { colors } = useTheme();
  const { sections } = useHomeProduct();
  const insets = useSafeAreaInsets();

  const rawTitle = useLocalSearchParams().title;

  const title =
    typeof rawTitle === "string"
      ? rawTitle
      : Array.isArray(rawTitle)
        ? rawTitle[0]
        : "Products";

  const selectedSection = sections.find((sec) => sec.title === title);
  const products = selectedSection?.products || [];

  const { addToCart } = useAddToCart();
  const visitorId = useAppVisitorStore((s) => s.visitorId);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* NAVBAR */}
      <View style={{ paddingTop: insets.top }}>
        <AppNavbar title={title} showBack showSearch showCart />
      </View>

      {/* 🔥 GRID LIST */}
      <FlatList
        data={products}
        numColumns={2} // ✅ GRID
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingBottom: insets.bottom + 20,
          paddingTop: 10,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: GAP,
        }}
        renderItem={({ item }) => (
          <View style={{ width: ITEM_WIDTH }}>
            <ItemCard
              item={item}
              onAddToCart={(item, qty) =>
                addToCart({
                  visitor_id: visitorId,
                  product_id: item.id,
                  qty,
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
};

export default AllProducts;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
