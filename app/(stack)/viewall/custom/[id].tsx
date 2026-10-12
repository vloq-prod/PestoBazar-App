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
import { useCustomSectionProducts } from "../../../../src/hooks/customSection.hooks";
import { LayoutGrid, List } from "lucide-react-native";
import { CustomSectionProduct } from "../../../../src/types/customSection.types";
import { ListingItem } from "../../../../src/types/shop.types";
import ProductCard from "../../../../src/components/ProductCard";
import { useResponsive } from "../../../../src/utils/useResponsive";

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

  const { id } = useLocalSearchParams();
  const sectionId = Number(id);

  const [gridMode, setGridMode] = React.useState<GridMode>("grid");
  const isGrid = gridMode === "grid";

  const toggleGridMode = () => {
    setGridMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Pagination states
  const [page, setPage] = React.useState(1);
  const [allProducts, setAllProducts] = React.useState<CustomSectionProduct[]>(
    [],
  );
  // Track whether we have ever received a response (to distinguish "loading" vs "empty")
  const [hasFetched, setHasFetched] = React.useState(false);

  const {
    data: res,
    isLoading,
    isFetching,
  } = useCustomSectionProducts({
    sectionId,
    page,
  });

  const title = res?.data?.section?.section_title || "Products";

  React.useEffect(() => {
    if (res?.data?.products) {
      setHasFetched(true);
      if (page === 1) {
        setAllProducts(res.data.products);
      } else {
        setAllProducts((prev) => {
          const getVarId = (p: CustomSectionProduct) =>
            Number(p.product_variation_id || p.id || p.product_id);
          const existingIds = new Set(prev.map(getVarId));
          const newProducts = res.data.products.filter(
            (p) => !existingIds.has(getVarId(p)),
          );
          return [...prev, ...newProducts];
        });
      }
    }
  }, [res, page]);

  // Reset pagination and fetch state if section ID changes
  React.useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasFetched(false);
  }, [sectionId]);

  // ✅ MAPPED DATA
  const mappedProducts = React.useMemo(() => {
    return allProducts.map(mapCustomProductToListingItem);
  }, [allProducts]);

  const loadMore = () => {
    if (!isFetching && res?.data?.pagination?.has_more_pages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleAddToCart = (item: ListingItem, qty: number) => {
    // Handled internally inside ProductCard
  };

  // Show skeleton only on initial fetch (page 1, never received data)
  const showSkeleton = !hasFetched && (isLoading || isFetching);

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
          ListFooterComponent={() => {
            // Footer spinner only for paginated loads (page 2+)
            if (isFetching && page > 1) {
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
            // Only show empty state after a real fetch has completed with no data
            if (!hasFetched) return null;

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
    </View>
  );
};

export default CustomSectionAllProducts;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
