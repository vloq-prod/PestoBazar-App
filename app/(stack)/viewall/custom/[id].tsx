// app/(stack)/viewall/custom/[id].tsx

import {
  View,
  StatusBar,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import React from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../src/theme";
import AppNavbar from "../../../../src/components/comman/AppNavbar";
import { useLocalSearchParams } from "expo-router";
import { useInfiniteCustomSectionProducts } from "../../../../src/hooks/customSection.hooks";
import { LayoutGrid, List } from "lucide-react-native";
import { CustomSectionProduct } from "../../../../src/types/customSection.types";
import { ListingItem } from "../../../../src/types/shop.types";
import ProductCard from "../../../../src/components/ProductCard";
import { useResponsive } from "../../../../src/utils/useResponsive";
import AddToCartPreview from "../../../../src/components/cart/AddToCartPreview";
import { useAppVisitorStore } from "../../../../src/store/auth";

const { width } = Dimensions.get("window");

const GAP = 10;
const PADDING = 16;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

type GridMode = "grid" | "list";

// ✅ MAPPER (IMPORTANT)
const mapCustomProductToListingItem = (
  item: CustomSectionProduct,
): ListingItem => {
  const variationId = Number(item.product_variation_id || item.id || item.product_id);
  const image = item.image_path || item.s3_image_path || "";
  return {
    id: variationId,
    url: item.url,
    mrp: String(item.mrp),
    selling_price: String(item.selling_price),
    size: item.size || "",
    unit: item.unit || "",
    product_name: item.product_name,
    image_path: image,
    overview: item.overview || null,
    is_new: item.is_new,
    is_best_selling: item.is_best_selling,
    avg_rating: String(item.avg_rating || 0),
    product_variation_id: variationId,
    enc_product_variation_id: item.enc_product_variation_id || String(variationId),
    is_b2b_user: item.is_b2b_user,
    selling_price_inclusive_gst: item.selling_price_inclusive_gst,
    selling_price_exclusive_gst: item.selling_price_exclusive_gst,
    gst_percent: item.gst_percent,
  };
};

// ── Simple skeleton card ─────────────────────────────────────────────
const SkeletonCard = ({ width: cardWidth }: { width: number }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: cardWidth,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      {/* Image placeholder */}
      <View
        style={{
          width: "100%",
          height: cardWidth * 0.9,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      {/* Text placeholders */}
      <View style={{ padding: 8, gap: 6 }}>
        <View
          style={{
            height: 11,
            width: "80%",
            backgroundColor: colors.backgroundSkeleton,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            height: 11,
            width: "55%",
            backgroundColor: colors.backgroundSkeleton,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            height: 28,
            width: "100%",
            backgroundColor: colors.backgroundSkeleton,
            borderRadius: 6,
            marginTop: 4,
          }}
        />
      </View>
    </View>
  );
};

// ── Skeleton grid for initial load ───────────────────────────────────
const SkeletonGrid = ({ isGrid }: { isGrid: boolean }) => {
  if (isGrid) {
    return (
      <View style={{ paddingHorizontal: PADDING, paddingTop: 10 }}>
        {[0, 1, 2, 3].map((row) => (
          <View
            key={row}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: GAP,
            }}
          >
            <SkeletonCard width={ITEM_WIDTH} />
            <SkeletonCard width={ITEM_WIDTH} />
          </View>
        ))}
      </View>
    );
  }

  return <SkeletonListView />;
};

const SkeletonListView = () => {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: PADDING, paddingTop: 10 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            marginBottom: GAP,
            flexDirection: "row",
            gap: 12,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
            <View
              style={{
                height: 11,
                width: "75%",
                backgroundColor: colors.backgroundSkeleton,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                height: 11,
                width: "50%",
                backgroundColor: colors.backgroundSkeleton,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                height: 26,
                width: "60%",
                backgroundColor: colors.backgroundSkeleton,
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const CustomSectionAllProducts = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { id, title: routeTitle } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();
  const sectionId = Number(id);
  const userId = useAppVisitorStore((state) => state.userId);

  const [gridMode, setGridMode] = React.useState<GridMode>("grid");
  const isGrid = gridMode === "grid";

  const toggleGridMode = () => {
    setGridMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomSectionProducts(sectionId, userId);

  const firstPage = data?.pages?.[0];
  const title =
    (typeof routeTitle === "string" && routeTitle.trim() ? routeTitle : undefined) ||
    firstPage?.data?.section?.section_title ||
    "Products";

  // Flatten and deduplicate all products across pages
  const allProducts = React.useMemo(() => {
    const rawList =
      data?.pages?.flatMap((page) => page?.data?.products ?? []) ?? [];

    const seenIds = new Set<number>();
    const result: CustomSectionProduct[] = [];

    for (const p of rawList) {
      const varId = Number(p.product_variation_id || p.id || p.product_id);
      if (!seenIds.has(varId)) {
        seenIds.add(varId);
        result.push(p);
      }
    }

    return result;
  }, [data]);

  const productCount =
    firstPage?.data?.pagination?.total ??
    firstPage?.data?.section?.product_count ??
    (allProducts.length > 0 ? allProducts.length : undefined);

  // ✅ MAPPED DATA
  const mappedProducts = React.useMemo(() => {
    return allProducts.map(mapCustomProductToListingItem);
  }, [allProducts]);

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleAddToCart = (item: ListingItem, qty: number) => {
    // Handled internally inside ProductCard
  };

  // Show skeleton only on initial fetch when no cached products exist
  const showSkeleton = isLoading && allProducts.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* NAVBAR */}
      <View style={{ paddingTop: insets.top }}>
        <AppNavbar
          title={title}
          showBack
          showSearch
          count={showSkeleton ? undefined : productCount}
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

      {/* SKELETON DURING INITIAL LOAD */}
      {showSkeleton ? (
        <SkeletonGrid isGrid={isGrid} />
      ) : (
        <FlatList
          key={gridMode} // 🔥 Forces re-render when layout mode switches
          data={mappedProducts}
          numColumns={isGrid ? 2 : 1}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            paddingHorizontal: PADDING,
            paddingBottom: insets.bottom + 80,
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
          ListFooterComponent={() => {
            if (isFetchingNextPage) {
              return (
                <View
                  style={{
                    paddingVertical: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              );
            }
            return null;
          }}
          ListEmptyComponent={() => {
            if (isLoading) return null;

            return (
              <View
                style={{
                  flex: 1,
                  paddingVertical: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  No products found
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  This section has no products available.
                </Text>
              </View>
            );
          }}
        />
      )}

      <AddToCartPreview
        pbandroid={Math.max(insets.bottom, 16) + 10}
        pbios={insets.bottom + 15}
      />
    </View>
  );
};

export default CustomSectionAllProducts;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
