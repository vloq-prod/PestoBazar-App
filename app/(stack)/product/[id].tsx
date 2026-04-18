import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useProductDetails,
  useSaveRecentlyViewed,
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
import { useAddToCart, useCart } from "../../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../../src/store/auth";
import { useResponsive } from "../../../src/utils/useResponsive";
import type { ProductVariation } from "../../../src/types/productdetails.types";

import ImageVideoCarousel from "../../../src/components/comman/ImageVideoCarousel";
import HomeUsp from "../../../src/components/home/HomeUsp";
import ProductDetailsSkeleton from "../../../src/skeleton/ProductDetails";
import DescriptionAccordion from "../../../src/components/productDetails/DescriptionAccordion";
import ReviewSection from "../../../src/components/productDetails/ReviewSection";
import ProductDescription from "../../../src/components/productDetails/ProductDescription";
import DeliveryInfoCard from "../../../src/components/productDetails/DeliveryInfoCard";
import CustomerAlsoBoughtProduct from "../../../src/components/productDetails/CustomerAlsoBoughtProduct";
import DocumentButtons from "../../../src/components/productDetails/DocumentButtons";
import ProductDescriptionSheet from "../../../src/modals/shop/CommonBottomSheet";
import PincodeModal from "../../../src/modals/PincodeSheet";
import RecentlyViewProducts from "../../../src/components/home/RecentlyViewProducts";
import BottomSheet from "@gorhom/bottom-sheet";

// ─── Constants ────────────────────────────────────────────────
const FOOTER_HEIGHT = 112;
const BASE_URL = "https://static-cdn.pestobazaar.com";

const ProductDetails = () => {
  // ─── Hooks ──────────────────────────────────────────────────
  const { id, product_name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  // ─── Refs ───────────────────────────────────────────────────
  const descriptionSheetRef = useRef<BottomSheet>(null);

  // ─── Local State ────────────────────────────────────────────
  const [quantity, setQuantity] = useState(0);
  const [showPincodeModal, setShowPincodeModal] = useState(false);

  // ─── Derived IDs ────────────────────────────────────────────
  const productId = Number(id);

  // ─── Animation Values ───────────────────────────────────────
  const scrollY = useSharedValue(0);

  // ─── API Calls ──────────────────────────────────────────────
  const { data, isLoading, error } = useProductDetails({
    product_id: productId,
  });
  const { addToCart } = useAddToCart();
  const { saveRecentlyViewed } = useSaveRecentlyViewed();
  const { data: cartData } = useCart({ user_id: 0, visitor_id: visitorId! });

  // ─── Data Extraction ────────────────────────────────────────
  const productInfo = data?.product;
  const productImages = data?.images ?? [];
  const descriptionUi = data?.descriptions ?? [];
  const combos = data?.combos;
  const selectedVariation = data?.variation;
  const pricing = data?.pricing;

  // ─── Derived Values ─────────────────────────────────────────
  const sellingPrice = Number(pricing?.selling_price ?? 0);
  const mrpPrice = Number(pricing?.mrp ?? 0);

  const rawRatingValue = Number(productInfo?.avg_rating);
  const hasRating = Number.isFinite(rawRatingValue) && rawRatingValue > 0;
  const ratingValue = hasRating ? rawRatingValue : 0;
  const totalReviews = Number(productInfo?.total_reviews ?? 0);
  const rawDescriptionHtml = productInfo?.description ?? "";

  const discountPercentage =
    mrpPrice > 0 && sellingPrice > 0 && mrpPrice > sellingPrice
      ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
      : 0;

  const resolvedProductName =
    typeof product_name === "string" && product_name.trim().length > 0
      ? product_name
      : (productInfo?.product_name ?? "");

  const selectedComboId = combos?.some((c) => c.id === productId)
    ? productId
    : combos?.[0]?.id;

  const mediaList = productImages.map((item) => ({
    type: item.asset_type,
    image: item.s3_image_path ? BASE_URL + item.s3_image_path : null,
    video: item.video_path
      ? BASE_URL + "/product-video/" + item.video_path
      : null,
  }));

  // ─── Helpers ────────────────────────────────────────────────
  const formatPrice = (value: number) => {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  };

  const getComboLabel = (item: ProductVariation) => {
    if (item?.size?.trim()) return item.size.trim();
    const weightWithUnit = [item?.actual_weight, item?.unit_of_measure]
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .join(" ")
      .trim();
    return weightWithUnit || "Option";
  };

  // ─── Scroll Animations ──────────────────────────────────────
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
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

  // ─── Cart Handlers ──────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    setQuantity(1);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: 1,
    });
  }, [productId, visitorId]);

  const handleIncrease = useCallback(() => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: newQty,
    });
  }, [quantity, productId, visitorId]);

  const handleDecrease = useCallback(() => {
    const newQty = Math.max(quantity - 1, 0);
    setQuantity(newQty);
    addToCart({
      user_id: 0,
      visitor_id: visitorId!,
      product_id: productId,
      qty: newQty,
    });
  }, [quantity, productId, visitorId]);

  // ─── Modal / Sheet Handlers ─────────────────────────────────
  const openDescriptionSheet = useCallback(() => {
    descriptionSheetRef.current?.snapToIndex(0);
  }, []);

  const openPincodeModal = useCallback(() => setShowPincodeModal(true), []);
  const closePincodeModal = useCallback(() => setShowPincodeModal(false), []);

  // ─── Effects ────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || !visitorId) return;
    saveRecentlyViewed({ product_id: productId, visitor_id: visitorId });
  }, [productId, visitorId]);


  const HEADER_HEIGHT = insets.top; 
  // ─── Guards ─────────────────────────────────────────────────
  if (isLoading) return <ProductDetailsSkeleton />;
  if (error) return <Text>Error loading product</Text>;

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ── Header ── */}
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
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <ChevronLeft size={23} color={colors.borderblack} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Animated.Text
                numberOfLines={2}
                style={[styles.headerTitle, titleAnimatedStyle]}
              >
                {resolvedProductName}
              </Animated.Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <Search size={23} color={colors.borderblack} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <LucideShare2 size={23} color={colors.borderblack} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ── */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
           paddingTop: HEADER_HEIGHT, 
          paddingBottom: FOOTER_HEIGHT + insets.bottom + 24,
          gap: spacing(24), // ✅ consistent section gap
        }}
      >
        {/* Carousel — no horizontal padding, full bleed */}
        <ImageVideoCarousel data={mediaList} />

        {/* ── Badges + Name + Price ── */}
        <View style={{ paddingHorizontal: spacing(16), gap: spacing(10) }}>
          {/* Badges row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing(6),
              }}
            >
              {discountPercentage > 0 && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderRadius: spacing(20),
                    borderColor: colors.error + "80",
                    backgroundColor: colors.error + "12",
                    paddingVertical: spacing(3),
                    paddingHorizontal: spacing(10),
                  }}
                >
                  <Text
                    style={{
                      fontSize: font(12),
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.error,
                      includeFontPadding: false,
                    }}
                  >
                    {discountPercentage}% off
                  </Text>
                </View>
              )}
              <View
                style={{
                  borderWidth: 0.5,
                  borderRadius: spacing(20),
                  borderColor: colors.success + "80",
                  backgroundColor: colors.success + "12",
                  paddingVertical: spacing(3),
                  paddingHorizontal: spacing(10),
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(4),
                }}
              >
                <View
                  style={{
                    width: spacing(6),
                    height: spacing(6),
                    borderRadius: spacing(3),
                    backgroundColor: colors.success,
                  }}
                />
                <Text
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_500Medium",
                    color: colors.success,
                    includeFontPadding: false,
                  }}
                >
                  In Stock
                </Text>
              </View>
            </View>

            {hasRating && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(4),
                }}
              >
                <Star
                  size={font(14)}
                  strokeWidth={1.8}
                  color={colors.starColor}
                  fill={colors.starColor}
                />
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                  }}
                >
                  {ratingValue.toFixed(1)}
                </Text>
                {totalReviews > 0 && (
                  <Text
                    style={{
                      fontSize: font(12),
                      fontFamily: "Poppins_400Regular",
                      color: colors.textSecondary,
                      includeFontPadding: false,
                    }}
                  >
                    | {totalReviews} Reviews
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Product name */}
          <Text
            style={{
              fontSize: font(15),
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
              lineHeight: font(22),
              includeFontPadding: false,
            }}
          >
            {productInfo?.product_name}
          </Text>

          {/* Price */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: spacing(8),
            }}
          >
            <Text
              style={{
                fontSize: font(22),
                fontFamily: "Poppins_700Bold",
                color: colors.text,
                includeFontPadding: false,
              }}
            >
              ₹{formatPrice(sellingPrice)}
            </Text>
            {mrpPrice > 0 && mrpPrice !== sellingPrice && (
              <Text
                style={{
                  fontSize: font(18),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textTertiary,
                  textDecorationLine: "line-through",
                  includeFontPadding: false,
                }}
              >
                ₹{formatPrice(mrpPrice)}
              </Text>
            )}
            {mrpPrice > 0 && (
              <Text
                style={{
                  fontSize: font(11),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textTertiary,
                  includeFontPadding: false,
                }}
              >
                Inclusive of all taxes
              </Text>
            )}
          </View>

          {/* Overview */}
          {!!productInfo?.overview && (
            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_400Regular",
                lineHeight: font(20),
                color: colors.textSecondary,
                includeFontPadding: false,
              }}
            >
              {productInfo.overview}
            </Text>
          )}
        </View>

        {/* ── Variants ── */}
        {!!combos?.length && (
          <View style={{ paddingHorizontal: spacing(16), gap: spacing(12) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: font(14),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                }}
              >
                Select Variant
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(5),
                }}
              >
                <Text
                  style={{
                    fontSize: font(10),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textTertiary,
                    includeFontPadding: false,
                  }}
                >
                  SKU#
                </Text>
                <Text
                  style={{
                    fontSize: font(11),
                    fontFamily: "Poppins_500Medium",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                  }}
                >
                  {selectedVariation?.sku || "—"}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing(8),
              }}
            >
              {combos.map((item) => {
                const isSelected = item.id === selectedComboId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
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
                    style={{
                      paddingVertical: spacing(8),
                      paddingHorizontal: spacing(20),
                      borderRadius: spacing(8),
                      borderWidth: isSelected ? 1.5 : 0.5,
                      borderColor: isSelected ? colors.text : colors.border,
                      backgroundColor: isSelected
                        ? colors.background
                        : colors.backgroundgray,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(13),
                        fontFamily: isSelected
                          ? "Poppins_600SemiBold"
                          : "Poppins_400Regular",
                        color: isSelected ? colors.text : colors.textSecondary,
                        includeFontPadding: false,
                      }}
                    >
                      {getComboLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Delivery + Docs ── */}
        <View style={{ gap: spacing(10) }}>
          <DeliveryInfoCard
            variationId={selectedVariation?.id ?? 0}
            onOpenPincode={openPincodeModal}
          />
          <DocumentButtons />
        </View>

        {/* ── Description ── */}
        {!!rawDescriptionHtml && (
          <ProductDescription
            html={rawDescriptionHtml}
            onReadMore={openDescriptionSheet}
          />
        )}

        {/* ── More Info Accordion ── */}
        {descriptionUi.length > 0 && (
          <DescriptionAccordion data={descriptionUi} />
        )}

        {/* ── USP ── */}
        <HomeUsp />

        {/* ── Related + Recent ── */}
        <CustomerAlsoBoughtProduct productId={productId} />
        <RecentlyViewProducts />

        {/* ── Reviews ── */}
        <ReviewSection product_id={productId} />
      </Animated.ScrollView>

      {/* ── Footer ── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.footerRow}>
          {/* Cart button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/cart")}
            style={[
              styles.cartBtn,
              quantity > 0 ? styles.halfBtn : styles.cartBtnCompact,
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

          {/* Add to cart / Stepper */}
          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAddToCart}
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary, flex: 1 },
              ]}
            >
              <Text
                style={[styles.primaryBtnText, { color: colors.textOnPrimary }]}
              >
                Add To Cart
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.stepper,
                styles.halfBtn,
                { backgroundColor: colors.primary },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDecrease}
                style={styles.stepperBtn}
              >
                <Minus size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={[styles.stepperVal, { color: colors.textOnPrimary }]}
                >
                  {quantity}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleIncrease}
                style={styles.stepperBtn}
              >
                <Plus size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Modals ── */}
      <ProductDescriptionSheet
        ref={descriptionSheetRef}
        html={rawDescriptionHtml}
      />
      <PincodeModal
        visible={showPincodeModal}
        onClose={closePincodeModal}
        variationId={selectedVariation?.id ?? 0}
      />
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  // Header
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  header: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    padding: 7,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderWidth: 0.5,
  },
  headerTitle: { fontSize: 15, fontWeight: "600" },

  // Footer
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  cartBtn: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cartBtnCompact: { width: 52 },
  halfBtn: { flex: 1, paddingHorizontal: 14 },
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
  viewCartText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },

  primaryBtn: {
    minHeight: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 18,
    includeFontPadding: false,
  },

  stepper: {
    minHeight: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperVal: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
});
