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
import {
  useEstimatedDelivery,
  useProductDetails,
} from "../../../src/hooks/productDetailsHook";
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
import HomeUsp from "../../../src/components/home/HomeUsp";
import ProductDetailsSkeleton from "../../../src/skeleton/ProductDetails";
import type { ProductVariation } from "../../../src/types/productdetails.types";
import { useAddToCart, useCart } from "../../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../../src/store/auth";
import DescriptionAccordion from "../../../src/components/productDetails/DescriptionAccordion";
import ReviewSection from "../../../src/components/productDetails/ReviewSection";
import ProductDescription from "../../../src/components/productDetails/ProductDescription";
import DeliveryInfoCard from "../../../src/components/productDetails/DeliveryInfoCard";
import CustomerAlsoBoughtProduct from "../../../src/components/productDetails/CustomerAlsoBoughtProduct";
import SaveRecentlyViewedProduct from "../../../src/components/productDetails/saveRecentlyViewedProduct";
import DocumentButtons from "../../../src/components/productDetails/DocumentButtons";

const FOOTER_HEIGHT = 112;

const ProductDetails = () => {
  const { id, product_name } = useLocalSearchParams();
  const visitorId = useAppVisitorStore((state) => state.visitorId);
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

  const { addToCart } = useAddToCart();

  const { data: cartData } = useCart({
    user_id: 0,
    visitor_id: visitorId!,
  });

  const headerContentOffset = insets.top;

  const productImages = data?.images ?? [];
  const productInfo = data?.product;
  // console.log("product info : ", productInfo);
  const descriptionUi = data?.descriptions ?? [];
  const combos = data?.combos;
  const selectedVariation = data?.variation;

  const pricing = data?.pricing;

  const sellingPrice = Number(pricing?.selling_price ?? 0);
  const mrpPrice = Number(pricing?.mrp ?? 0);

  // const selectedCombo = data?.selectedCombo;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollY.value,
      [0, 120],
      ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    ),
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 60, 100],
      [0, 0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: 1,
    borderBottomColor: interpolateColor(
      scrollY.value,
      [0, 80],
      ["rgba(0,0,0,0)", colors.border],
    ),
  }));

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

  const discountPercentage =
    mrpPrice > 0 && sellingPrice > 0 && mrpPrice > sellingPrice
      ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
      : 0;
  const rawDescriptionHtml = productInfo?.description ?? "";

  const formatPrice = (value: number) => {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);

    return value.toFixed(2).replace(/\.?0+$/, "");
  };

  const selectedComboId = combos?.some((item) => item.id === productId)
    ? productId
    : combos?.[0]?.id;

  const getComboLabel = (item: ProductVariation) => {
    if (item?.size?.trim()) return item.size.trim();
    const weightWithUnit = [item?.actual_weight, item?.unit_of_measure]
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .join(" ")
      .trim();
    return weightWithUnit || "Option";
  };

  const handleAddToCart = () => {
    setQuantity(1);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: 1,
    });
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: newQty,
    });
  };

  const handleDecrease = () => {
    const newQty = Math.max(quantity - 1, 0);
    setQuantity(newQty);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: newQty,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ── HEADER ── */}
      <Animated.View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top },
          headerAnimatedStyle,
          borderAnimatedStyle,
        ]}
      >
        <View style={styles.header}>
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

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              <Search size={23} color={colors.borderblack} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              <LucideShare2 size={23} color={colors.borderblack} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ── SCROLL CONTENT ── */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerContentOffset,
          paddingBottom: FOOTER_HEIGHT + insets.bottom + 24,
          gap: 20,
        }}
      >
        {/* Carousel */}
        <ImageVideoCarousel data={mediaList} />

        {/* ── Product Info ── */}
        <View style={{ paddingHorizontal: 16, gap: 6 }}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {productInfo?.product_name}
          </Text>

          {/* Price + Rating row */}
          <View style={styles.priceBlock}>
            <View style={styles.priceHeaderRow}>
              <View style={styles.priceRow}>
                <Text style={[styles.sellingPriceText, { color: colors.text }]}>
                  ₹{formatPrice(sellingPrice)}
                </Text>
                {discountPercentage > 0 && (
                  <Text
                    style={[styles.discountText, { color: colors.primary }]}
                  >
                    {discountPercentage}% OFF
                  </Text>
                )}
              </View>

              {hasRating && (
                <View style={styles.ratingContainer}>
                  <View
                    style={[
                      styles.ratingWrap,
                      { backgroundColor: colors.backgroundgray },
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
                        | {totalReviews} Reviews
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            {mrpPrice > 0 && (
              <Text style={[styles.mrpText, { color: colors.textTertiary }]}>
                ₹{formatPrice(mrpPrice)}{" "}
                <Text
                  style={[styles.mrpMetaText, { color: colors.textSecondary }]}
                >
                  MRP (Inclusive of all taxes)
                </Text>
              </Text>
            )}
          </View>

          {/* Overview */}
          {!!productInfo?.overview && (
            <Text
              style={{
                fontSize: 13,
                lineHeight: 18,
                color: colors.textTertiary,
              }}
            >
              {productInfo.overview}
            </Text>
          )}
        </View>

        {/* ── Combo Variants ── */}
        {!!combos?.length && (
          <View style={styles.comboSection}>
            <Text style={[styles.comboLabel, { color: colors.textSecondary }]}>
              Select Variant
            </Text>
            <View style={styles.comboList}>
              {combos.map((item) => {
                const isSelected = item.id === selectedComboId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (item.id === productId) return;
                      router.replace({
                        pathname: "(stack)/product/[id]",
                        params: {
                          id: item.id,
                          product_name: resolvedProductName,
                        },
                      });
                    }}
                    style={[
                      styles.comboPill,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "12"
                          : colors.background,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.comboPillText,
                        {
                          color: isSelected
                            ? colors.primary
                            : colors.textSecondary,
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                        },
                      ]}
                    >
                      {getComboLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Variation Details Card ── */}
        <View>
          <View style={{ marginHorizontal: 16 }}>
            <View
              style={[
                styles.variationCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundgray,
                },
              ]}
            >
              {/* LEFT: SKU */}
              <View style={styles.leftBlock}>
                <Text style={[styles.variationKey, { color: colors.text }]}>
                  SKU#
                </Text>
                <Text style={[styles.variationVal, { color: colors.text }]}>
                  {selectedVariation?.sku || "-"}
                </Text>
              </View>

              {/* RIGHT: STOCK */}
              <View style={styles.rightBlock}>
                <Text style={[styles.variationKey, { color: colors.text }]}>
                  Stock
                </Text>

                <View style={[styles.stockBadge]}>
                  <View
                    style={[styles.stockDot, { backgroundColor: "#22C55E" }]}
                  />
                  <Text style={[styles.stockText, { color: "#16A34A" }]}>
                    In Stock
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <DocumentButtons />
        </View>

        {!!rawDescriptionHtml && (
          <ProductDescription html={rawDescriptionHtml} />
        )}

        {/* ── Descriptions ── */}
        {descriptionUi.length > 0 && (
          <DescriptionAccordion data={descriptionUi} />
        )}

        <HomeUsp />

        <DeliveryInfoCard variationId={selectedVariation?.id ?? 0} />

        <CustomerAlsoBoughtProduct productId={productId} />
        <SaveRecentlyViewedProduct productId={productId} />
        <ReviewSection product_id={productId} />
      </Animated.ScrollView>

      {/* ── FOOTER ── */}
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
          {/* Cart icon / View Cart */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/cart")}
            style={[
              styles.viewCartButton,
              quantity > 0
                ? styles.footerHalfButton
                : styles.viewCartButtonCompact,
              { borderColor: colors.border },
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
                  {cartData?.data.cart.cart_count}
                </Text>
              </View>
            </View>
            {quantity > 0 && (
              <Text style={[styles.viewCartText, { color: colors.text }]}>
                View Cart
              </Text>
            )}
          </TouchableOpacity>

          {/* Add To Cart / Qty stepper */}
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
                { backgroundColor: colors.primary },
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
  // ── Header ──
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
  titleContainer: { flex: 1 },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Price ──
  productTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  priceBlock: {
    marginTop: 4,
    gap: 4,
  },
  priceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
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

  // ── Rating ──
  ratingContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  ratingWrap: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingValueText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  reviewCountText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
  },

  // ── Combos ──
  comboSection: {
    paddingHorizontal: 16,
    gap: 10,
  },
  comboLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  comboList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  comboPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  comboPillText: {
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },

  productDescriptionSection: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  productDescriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  productDescriptionAccent: {
    width: 4,
    height: 20,
    borderRadius: 999,
  },
  productDescriptionTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },

  // ── Variation Card ──
  variationCard: {
    flexDirection: "row", // ✅ keep row
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  leftBlock: {
    flex: 1,
    gap: 2,
  },

  rightBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },

  variationKey: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    opacity: 0.6,
  },

  variationVal: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  stockText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },

  // ── Footer ──
  footercontainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
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
  },
  viewCartButtonCompact: { width: 52 },
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
  footerButtonExpanded: { flex: 1 },
  cartIconWrap: {
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
});
