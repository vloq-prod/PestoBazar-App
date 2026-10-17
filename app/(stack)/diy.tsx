import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import React, { useState, useMemo } from "react";
import { Image } from "expo-image";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import { useDiyListing } from "../../src/hooks/diyHooks";
import { useResponsive } from "../../src/utils/useResponsive";
import { getImageUrl } from "../../src/utils/imageUtils";
import { LayoutGrid, List } from "lucide-react-native";
import ProductCard from "../../src/components/ProductCard";
import { ItemCardSkeleton } from "../../src/components/comman/ItemCard";
import { ListingItem } from "../../src/types/shop.types";
import { DiyItem } from "../../src/types/diy.types";
import AddToCartPreview from "../../src/components/cart/AddToCartPreview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type GridMode = "grid" | "list";

// Map DIY item to standard ListingItem format expected by ProductCard
const mapDiyToListingItem = (item: DiyItem): ListingItem => {
  return {
    id: item.id,
    url: item.url || "",
    mrp: String(item.mrp || 0),
    selling_price: String(item.selling_price || 0),
    size: item.size || "",
    unit: item.unit || "",
    product_name: item.product_name,
    image_path:
      item.image_path ||
      (item.product_all_images && item.product_all_images[0]?.s3_image_path) ||
      "",
    overview: item.overview ?? null,
    is_new: item.is_new ? String(item.is_new) : "0",
    is_best_selling: item.is_best_selling ? String(item.is_best_selling) : "0",
    avg_rating: String(item.avg_rating || 0),
    product_variation_id: item.product_variation_id || item.id,
    enc_product_variation_id: item.enc_product_variation_id || String(item.id),
  };
};

const DiyScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { spacing } = useResponsive();

  const [gridMode, setGridMode] = useState<GridMode>("grid");
  const isGrid = gridMode === "grid";

  const toggleGridMode = () => {
    setGridMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Fetch DIY products and banner
  const { products, banner, totalCount, loading } = useDiyListing({});

  const mappedProducts = useMemo(() => {
    return products.map(mapDiyToListingItem);
  }, [products]);

  const handleBannerPress = () => {
    if (banner?.redirect) {
      Linking.openURL(banner.redirect).catch(() => {});
    }
  };

  const getBannerImageUrl = (b: any) => {
    if (!b) return null;
    return getImageUrl(
      b.s3_image_url ||
        b.s3_image_path ||
        b.mobile_banner_url ||
        b.desktop_banner_url ||
        b.mobile_banner ||
        b.desktop_banner,
    );
  };

  const GAP = spacing(12);
  const PADDING = spacing(16);
  const itemWidth = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;
  const isSkeleton = loading && products.length === 0;
  const productCount = isSkeleton ? undefined : totalCount || products.length;

  const renderHeader = () => {
    const imageUrl = getBannerImageUrl(banner);
    const bannerHeight = (SCREEN_WIDTH - PADDING * 2) * 0.46;

    if (!imageUrl) {
      if (loading) {
        return (
          <View
            style={{
              width: "100%",
              height: bannerHeight,
              backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
              borderRadius: spacing(12),
              marginBottom: spacing(16),
            }}
          />
        );
      }
      return null;
    }

    return (
      <TouchableOpacity
        activeOpacity={banner?.redirect ? 0.88 : 1}
        onPress={handleBannerPress}
        disabled={!banner?.redirect}
        style={{
          width: "100%",
          height: bannerHeight,
          backgroundColor: colors.surface || "#F3F4F6",
          borderRadius: spacing(12),
          overflow: "hidden",
          marginBottom: spacing(16),
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppNavbar
        title="Do It Yourself"
        showBack
        count={productCount}
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

      <FlatList
        key={gridMode}
        data={isSkeleton ? ([1, 2, 3, 4, 5, 6] as any[]) : mappedProducts}
        numColumns={isGrid ? 2 : 1}
        keyExtractor={(item, index) =>
          isSkeleton ? `skeleton-${index}` : String(item.id)
        }
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingTop: spacing(14),
          paddingBottom: insets.bottom + spacing(80),
        }}
        columnWrapperStyle={
          isGrid
            ? {
                justifyContent: "space-between",
                marginBottom: spacing(16),
              }
            : undefined
        }
        renderItem={({ item }) => {
          if (isSkeleton) {
            if (isGrid) {
              return (
                <View style={{ width: itemWidth }}>
                  <ItemCardSkeleton />
                </View>
              );
            }
            return (
              <View style={{ marginBottom: spacing(12) }}>
                <View
                  style={{
                    flexDirection: "row",
                    padding: spacing(10),
                    borderRadius: spacing(10),
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    gap: spacing(12),
                  }}
                >
                  <View
                    style={{
                      width: spacing(80),
                      height: spacing(80),
                      borderRadius: spacing(8),
                      backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
                    }}
                  />
                  <View style={{ flex: 1, gap: spacing(8) }}>
                    <View
                      style={{
                        width: "75%",
                        height: spacing(14),
                        borderRadius: 4,
                        backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
                      }}
                    />
                    <View
                      style={{
                        width: "45%",
                        height: spacing(12),
                        borderRadius: 4,
                        backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
                      }}
                    />
                    <View
                      style={{
                        width: "30%",
                        height: spacing(16),
                        borderRadius: 4,
                        backgroundColor: colors.backgroundSkeleton || "#E5E7EB",
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          }

          if (isGrid) {
            return (
              <View style={{ width: itemWidth }}>
                <ProductCard item={item} mode="grid" />
              </View>
            );
          }

          return (
            <View style={{ marginBottom: spacing(12) }}>
              <ProductCard item={item} mode="list" />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ paddingVertical: spacing(40), alignItems: "center" }}>
              <Text
                style={{
                  color: colors.textSecondary ?? "#6B7280",
                  fontFamily: "Poppins_500Medium",
                  fontSize: 14,
                }}
              >
                No DIY products found
              </Text>
            </View>
          ) : null
        }
      />

      <AddToCartPreview
        pbandroid={Math.max(insets.bottom, 16) + 10}
        pbios={insets.bottom + 15}
      />
    </View>
  );
};

export default DiyScreen;
const styles = StyleSheet.create({});
