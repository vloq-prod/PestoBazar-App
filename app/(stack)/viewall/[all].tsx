import {
  View,
  StatusBar,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../src/theme";
import AppNavbar from "../../../src/components/comman/AppNavbar";
import { useLocalSearchParams } from "expo-router";
import { useHomeProduct } from "../../../src/hooks/homeHooks";
import { useAddToCart } from "../../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../../src/store/auth";
import { LayoutGrid, List } from "lucide-react-native";
import { ProductItem } from "../../../src/types/home.types";
import { ListingItem } from "../../../src/types/shop.types";
import ProductCard from "../../../src/components/ProductCard";

const { width } = Dimensions.get("window");

const GAP = 10;
const PADDING = 16;

const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

type GridMode = "grid" | "list";

// ✅ MAPPER (IMPORTANT)
const mapProductToListingItem = (item: ProductItem): ListingItem => {
  return {
    id: item.id,
    url: item.slug,
    mrp: item.mrp,
    selling_price: item.selling_price,
    size: "",
    unit: "",
    product_name: item.product_name,
    image_path: item.s3_image_path,
    overview: item.overview ?? null,
    is_new: "0",
    is_best_selling: "0",
    avg_rating: item.avg_rating,
    product_variation_id: item.id,
    enc_product_variation_id: String(item.id),
  };
};

const AllProducts = () => {
  const { colors } = useTheme();
  const { sections } = useHomeProduct();
  const insets = useSafeAreaInsets();

  const [gridMode, setGridMode] = React.useState<GridMode>("grid");
  const isGrid = gridMode === "grid";

  const toggleGridMode = () => {
    setGridMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

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

  // ✅ MAPPED DATA
  const mappedProducts = React.useMemo(() => {
    return products.map(mapProductToListingItem);
  }, [products]);

  const handleAddToCart = (item: ListingItem, qty: number) => {
    addToCart({
      visitor_id: visitorId,
      product_id: item.id,
      qty,
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* NAVBAR */}
      <View style={{ paddingTop: insets.top }}>
        <AppNavbar
          title={title}
          showBack
          showSearch
          rightComponent={
            <TouchableOpacity
              onPress={toggleGridMode}
              style={{
                padding: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.primary + "12",
              }}
            >
              {isGrid ? (
                <LayoutGrid size={20} color={colors.primary} />
              ) : (
                <List size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          }
        />
      </View>

      {/* LIST */}
      <FlatList
        key={gridMode} // 🔥 IMPORTANT
        data={mappedProducts}
        numColumns={isGrid ? 2 : 1}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingBottom: insets.bottom + 20,
          paddingTop: 10,
        }}
        columnWrapperStyle={
          isGrid
            ? {
                justifyContent: "space-between",
                marginBottom: GAP,
              }
            : undefined
        }
        renderItem={({ item }) => {
          if (isGrid) {
            return (
              <View style={{ width: ITEM_WIDTH }}>
                <ProductCard
                  item={item}
                  mode="grid"
                  onAddToCart={handleAddToCart}
                />
              </View>
            );
          }

          return (
            <ProductCard
              item={item}
              mode="list"
              onAddToCart={handleAddToCart}
            />
          );
        }}
      />
    </View>
  );
};

export default AllProducts;

const styles = StyleSheet.create({
  root: { flex: 1 },
});