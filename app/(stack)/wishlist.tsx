import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import React, { useMemo, useCallback } from "react";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { Heart, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import ItemCard, { ItemCardSkeleton } from "../../src/components/comman/ItemCard";
import { useUserWishlist } from "../../src/hooks/wishlistHooks";
import { ProductItem } from "../../src/types/home.types";
import { WishlistProductItem } from "../../src/types/wishlist.types";

const WishlistScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const { products, isLoading, isRefetching, refetch } = useUserWishlist();

  const itemWidth = (screenWidth - spacing(16) * 2 - spacing(12)) / 2;

  const formattedProducts = useMemo(() => {
    return products.map(
      (item: WishlistProductItem): ProductItem => ({
        id: item.id || item.product_variation_id,
        slug: item.url || "",
        overview: item.overview || "",
        selling_price: item.selling_price,
        mrp: item.mrp,
        product_name: item.product_name,
        avg_rating: item.avg_rating,
        total_reviews: 0,
        s3_image_path: item.s3_image_path || item.image_path,
      })
    );
  }, [products]);

  const renderProductItem = useCallback(
    ({ item }: { item: ProductItem }) => {
      return (
        <View style={{ width: itemWidth }}>
          <ItemCard item={item} />
        </View>
      );
    },
    [itemWidth]
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      <AppNavbar
        title="My Wishlist"
        count={products.length > 0 ? products.length : undefined}
        showBack
        showSearch
        showCart
        onSearchPress={() => router.push("/shop")}
      />

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => `skeleton-${item}`}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: spacing(12),
            paddingBottom: insets.bottom + spacing(20),
          }}
          columnWrapperStyle={{
            paddingHorizontal: spacing(16),
            gap: spacing(12),
            marginBottom: spacing(16),
          }}
          renderItem={() => (
            <View style={{ width: itemWidth }}>
              <ItemCardSkeleton />
            </View>
          )}
        />
      ) : formattedProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "12" },
            ]}
          >
            <Heart size={44} color={colors.primary} fill={colors.primary + "20"} />
          </View>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontSize: font(18) },
            ]}
          >
            Your Wishlist is Empty
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: font(13) },
            ]}
          >
            Explore our collection and add your favorite pest control products to your wishlist!
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/shop")}
            style={[
              styles.shopBtn,
              { backgroundColor: colors.primary, borderRadius: spacing(10) },
            ]}
          >
            <ShoppingBag size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              style={[
                styles.shopBtnText,
                { fontSize: font(14) },
              ]}
            >
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={formattedProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: spacing(12),
            paddingBottom: insets.bottom + spacing(24),
          }}
          columnWrapperStyle={{
            paddingHorizontal: spacing(16),
            gap: spacing(12),
            marginBottom: spacing(16),
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 24,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  shopBtnText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
});
