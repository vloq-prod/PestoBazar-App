import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProductDetails } from "../../../src/hooks/productDetailsHook";
import { useTheme } from "../../../src/theme";
import {
  ChevronLeft,
  Search,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  LucideShare2,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import RenderHTML from "react-native-render-html";
import ImageVideoCarousel from "../../../src/components/comman/ImageVideoCarousel";
import Branches from "../../../src/components/home/Branches";
import HomeUsp from "../../../src/components/home/HomeUsp";
import ProductDetailsSkeleton from "../../../src/skeleton/ProductDetails";

const FOOTER_HEIGHT = 112;

const ProductDetails = () => {
  const { id, product_name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const productId = Number(id);
  const [quantity, setQuantity] = useState(0);

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { data, isLoading, error } = useProductDetails({
    product_id: productId,
  });

  const headerContentOffset = insets.top;

  const productImages = data?.images ?? [];
  // console.log("product iiamges: ", productImages)
  const productInfo = data?.product;
  const descriptionUi = data?.descriptions ?? [];

  // console.log("description ui : ", descriptionUi);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 120],
      ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    );

    return {
      backgroundColor,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 60, 100],
        [0, 0, 1],
        Extrapolate.CLAMP,
      ),
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 80],
      ["rgba(0,0,0,0)", colors.border],
    );

    return {
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    };
  });

  if (isLoading) return <ProductDetailsSkeleton />;
  if (error) return <Text>Error loading product</Text>;

  const resolvedProductName =
    typeof product_name === "string" && product_name.trim().length > 0
      ? product_name
      : (data?.product?.product_name ?? "");

  const BASE_URL = "https://static-cdn.pestobazaar.com";

  const mediaList = productImages.map((item) => ({
    type: item.asset_type,
    image: item.s3_image_path ? BASE_URL + item.s3_image_path : null,
    video: item.video_path
      ? BASE_URL + "/product-video/" + item.video_path
      : null,
  }));
  const rawRatingValue = Number(productInfo?.avg_rating);
  const hasRating = Number.isFinite(rawRatingValue) && rawRatingValue > 0;
  const ratingValue = hasRating ? rawRatingValue : 0;
  const totalReviews = Number(productInfo?.total_reviews ?? 0);

  const handleAddToCart = () => {
    setQuantity(1);
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(prev - 1, 0));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* 🔥 HEADER */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top,
          },
          headerAnimatedStyle,
          borderAnimatedStyle,
        ]}
      >
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              <ChevronLeft size={23} color={colors.borderblack} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Animated.Text
                numberOfLines={2}
                style={[styles.titleText, titleAnimatedStyle]}
              >
                {resolvedProductName}
              </Animated.Text>
            </View>
          </View>

          {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              <Search size={23} color={colors.borderblack} />
            </TouchableOpacity>

            <View
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              <LucideShare2 size={23} color={colors.borderblack} />
            </View>
          </View>
        </View>
      </Animated.View>
      {/* 🔥 SCROLL CONTENT */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: headerContentOffset,
          paddingBottom: FOOTER_HEIGHT + insets.bottom + 24,
          gap: 20,
        }}
      >
        <ImageVideoCarousel data={mediaList} />

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "column", gap: 6 }}>
            <Text style={styles.productTitle}>{productInfo?.product_name}</Text>

            <View style={styles.priceBlock}>
              <View style={styles.priceHeaderRow}>
                <View style={styles.priceInfoColumn}>
                  <View style={styles.priceRow}>
                    <Text
                      style={[styles.sellingPriceText, { color: colors.text }]}
                    >
                      ₹1038
                    </Text>
                    <Text
                      style={[styles.discountText, { color: colors.primary }]}
                    >
                      46% OFF
                    </Text>
                  </View>

                  <Text
                    style={[styles.mrpText, { color: colors.textTertiary }]}
                  >
                    ₹2957{" "}
                    <Text
                      style={[
                        styles.mrpMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      MRP (Inclusive of all taxes)
                    </Text>
                  </Text>
                </View>

                {hasRating && (
                  <View style={styles.ratingContainer}>
                    <View
                      style={[
                        styles.ratingWrap,
                        {
                          backgroundColor: colors.backgroundgray,
                        },
                      ]}
                    >
                      <Star
                        size={14}
                        strokeWidth={1.8}
                        color={colors.starColor}
                        fill={colors.starColor}
                      />

                      <Text
                        style={[styles.ratingValueText, { color: colors.text }]}
                      >
                        {ratingValue.toFixed(1)}
                      </Text>

                      {totalReviews > 0 && (
                        <Text
                          style={[
                            styles.reviewCountText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          | {totalReviews}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>

            <Text
              style={{
                fontSize: 13,
                lineHeight: 18,
                color: colors.textTertiary,
              }}
            >
              {productInfo?.overview}
            </Text>
          </View>
        </View>

        {descriptionUi.length > 0 && (
          <View style={styles.descriptionSection}>
            {descriptionUi.map((item) => (
              <View key={item.id} style={styles.descriptionCard}>
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  {item.drop_name}
                </Text>

                <RenderHTML
                  contentWidth={width - 32}
                  source={{ html: item.drop_description || "" }}
                />
              </View>
            ))}
          </View>
        )}

        <HomeUsp />
      </Animated.ScrollView>

      {/* Footer container */}
      <View
        style={[
          styles.footercontainer,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.footerRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/cart")}
            style={[
              styles.viewCartButton,
              quantity > 0
                ? styles.footerHalfButton
                : styles.viewCartButtonCompact,
              {
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cartIconWrap}>
              <ShoppingCart size={24} color={colors.primary} />
              <View
                style={[styles.cartBadge, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[
                    styles.cartBadgeText,
                    { color: colors.textOnPrimary },
                  ]}
                >
                  2
                </Text>
              </View>
            </View>
            {quantity > 0 && (
              <Text style={[styles.viewCartText, { color: colors.text }]}>
                View Cart
              </Text>
            )}
          </TouchableOpacity>

          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAddToCart}
              style={[
                styles.footerButton,
                styles.footerButtonExpanded,
                { backgroundColor: colors.primary },
              ]}
            >
              {/* <ShoppingCart size={18} color={colors.textOnPrimary} /> */}
              <Text
                style={[
                  styles.footerButtonText,
                  { color: colors.textOnPrimary },
                ]}
              >
                Add To Cart
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.quantityBox,
                styles.footerHalfButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDecrease}
                style={styles.qtyAction}
              >
                <Minus size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>

              <View style={styles.qtyValueWrap}>
                <Text
                  style={[styles.qtyValueText, { color: colors.textOnPrimary }]}
                >
                  {quantity}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleIncrease}
                style={styles.qtyAction}
              >
                <Plus size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  header: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconContainer: {
    padding: 7,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderWidth: 0.5,
  },

  titleContainer: {
    flex: 1,
  },

  titleText: {
    fontSize: 15,
    fontWeight: "600",
  },

  footercontainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewCartButton: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  viewCartButtonCompact: {
    width: 52,
  },
  footerHalfButton: {
    flex: 1,
    paddingHorizontal: 14,
  },
  footerButton: {
    minHeight: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  footerButtonExpanded: {
    flex: 1,
  },
  cartIconWrap: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -7,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
  },
  footerButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  viewCartText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  quantityBox: {
    flex: 1,
    minHeight: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  qtyAction: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValueWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValueText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  priceBlock: {
    marginTop: 8,
    gap: 6,
  },
  priceHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  priceInfoColumn: {
    flex: 1,
    gap: 2,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 14,
  },
  descriptionCard: {
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  ratingWrap: {
    minHeight: 24,
    borderRadius: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  ratingValueText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  reviewCountText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  sellingPriceText: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
  },
  discountText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  mrpText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
    textDecorationLine: "line-through",
    flexWrap: "wrap",
  },
  mrpMetaText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
    textDecorationLine: "none",
  },
  productTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
});
