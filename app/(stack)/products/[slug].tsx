import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Clipboard,
  type LayoutChangeEvent,
} from "react-native";
import { DeepLinkURLBuilder } from "../../../src/deep-linking";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path, Defs, Pattern, Rect } from "react-native-svg";
import {
  useProductDetails,
  useSaveRecentlyViewed,
} from "../../../src/hooks/productDetailsHook";
import { useFreeProducts } from "../../../src/hooks/offerHooks";
import { useTheme } from "../../../src/theme";
import {
  ChevronLeft,
  Search,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  LucideShare2,
  Gift,
  Tag,
  ChevronDown,
  ChevronUp,
  BadgePercent,
  Copy,
  Check,
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
import {
  useAddToCart,
  useCartCount,
  useProductQuantity,
} from "../../../src/hooks/cartHooks";
import { useAppVisitorStore } from "../../../src/store/auth";
import { useResponsive } from "../../../src/utils/useResponsive";
import type { ProductVariation } from "../../../src/types/productdetails.types";
import type {
  ActiveCoupon,
  FreeRewardProduct,
  OfferRule,
} from "../../../src/types/offer.types";

import ImageVideoCarousel from "../../../src/components/comman/ImageVideoCarousel";
import HomeUsp from "../../../src/components/home/HomeUsp";
import ProductDetailsSkeleton from "../../../src/skeleton/ProductDetails";
import {
  FreeGiftOffersSkeleton,
  AvailableCouponsSkeleton,
} from "../../../src/skeleton/OffersAndCouponsSkeleton";
import DescriptionAccordion from "../../../src/components/productDetails/DescriptionAccordion";
import ReviewSection from "../../../src/components/productDetails/ReviewSection";
import ProductDescription from "../../../src/components/productDetails/ProductDescription";
import DeliveryInfoCard from "../../../src/components/productDetails/DeliveryInfoCard";
import CustomerAlsoBoughtProduct from "../../../src/components/productDetails/CustomerAlsoBoughtProduct";
import ProductCouponCard from "../../../src/components/productDetails/ProductCouponCard";
import ProductComparisonSection from "../../../src/components/productDetails/ProductComparisonSection";
import RecommendedProducts from "../../../src/components/productDetails/RecommendedProducts";
import { useProductComparison } from "../../../src/hooks/productComparison.hooks";
import SeeAllProductsButton from "../../../src/components/comman/SeeAllProductsButton";

import ProductDescriptionSheet from "../../../src/modals/shop/CommonBottomSheet";
import PincodeModal from "../../../src/modals/PincodeSheet";
import RecentlyViewProducts from "../../../src/components/home/RecentlyViewProducts";
import Branches from "../../../src/components/home/Branches";

// ─── Constants ────────────────────────────────────────────────
const FOOTER_HEIGHT = 112;
const BASE_URL = "https://static-cdn.pestobazaar.com";

// ─── Helper Components ────────────────────────────────────────
const FilledWavyDivider = ({
  color = "#E8FDF0",
  height = 6,
}: {
  color?: string;
  height?: number;
}) => {
  const patternId = `wave-divider-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <View style={{ height, width: "100%", marginTop: -0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={patternId}
            x="0"
            y="0"
            width="20"
            height={height + 20}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M 0,${height / 2} Q 5,${height * 1.5} 10,${height / 2} T 20,${height / 2} L 20,0 L 0,0 Z`}
              fill={color}
            />
          </Pattern>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
        />
      </Svg>
    </View>
  );
};

const ProductDetails = () => {
  const {
    id,
    product_name,
    product_slug,
    slug,
    variation_id,
    scrollToReview,
    section,
  } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const { visitorId, userId } = useAppVisitorStore((state) => state);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const reviewSectionY = useRef(0);

  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showAllFreeProducts, setShowAllFreeProducts] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCoupon = useCallback((code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  }, []);

  const rawId =
    typeof id === "number"
      ? id
      : typeof id === "string" && !isNaN(Number(id))
        ? Number(id)
        : undefined;
  const productId = rawId && rawId > 0 ? rawId : undefined;

  const rawVarId =
    typeof variation_id === "number"
      ? variation_id
      : typeof variation_id === "string" && !isNaN(Number(variation_id))
        ? Number(variation_id)
        : rawId && rawId > 0
          ? rawId
          : undefined;
  const variationId = rawVarId && rawVarId > 0 ? rawVarId : undefined;

  const getValidSlug = (val: unknown): string | undefined =>
    typeof val === "string" &&
    val.trim().length > 0 &&
    val !== "slug" &&
    val !== "undefined" &&
    isNaN(Number(val))
      ? val
      : undefined;

  const productSlug = getValidSlug(slug) || getValidSlug(product_slug);

  // console.log("product slug: ", productSlug);
  console.log("product product id: ", productId, "variation_id: ", variationId);

  // ─── Animation Values ───────────────────────────────────────
  const scrollY = useSharedValue(0);

  // ─── API Calls ──────────────────────────────────────────────
  const { data, isLoading, error } = useProductDetails({
    ...(productId ? { product_id: productId } : {}),
    ...(variationId ? { variation_id: variationId } : {}),
    ...(productSlug ? { product_slug: productSlug } : {}),
  });
  const { addToCart, loading: isCartLoading } = useAddToCart();
  const { saveRecentlyViewed } = useSaveRecentlyViewed();
  const { data: cartCountData } = useCartCount({
    user_id: userId ?? 0,
    visitor_id: visitorId!,
  });

  // ─── Data Extraction ────────────────────────────────────────
  const productInfo = data?.product;
  const productImages = data?.images ?? [];
  const descriptionUi = data?.descriptions ?? [];
  const variationmaster = data?.variationmaster;
  const selectedVariation = data?.variation;
  const realProductId = selectedVariation?.id ?? variationmaster?.[0]?.id;
  const comparisonVariationId =
    realProductId ?? variationId ?? (id ? Number(id) : 0);
  const {
    data: comparisonResponse,
    isLoading: isComparisonLoading,
    error: comparisonError,
  } = useProductComparison(comparisonVariationId);

  useEffect(() => {
    if (comparisonResponse) {
      console.log("=== Comparison API Response ===", {
        variationId: comparisonVariationId,
        has_comparison: comparisonResponse?.data?.has_comparison,
        productsCount: comparisonResponse?.data?.products?.length,
      });
    }
    if (comparisonError) {
      console.log("=== Comparison API Error ===", comparisonError);
    }
  }, [comparisonResponse, comparisonError, comparisonVariationId]);

  console.log("product details id: ", realProductId);
  const quantity = useProductQuantity(realProductId ?? productId);

  // Free products API integration
  const { data: freeProductsData, isLoading: isOffersLoading } =
    useFreeProducts(selectedVariation?.id);

  useEffect(() => {
    if (freeProductsData?.data) {
      console.log(
        "=== active_coupons ===",
        JSON.stringify(freeProductsData.data.active_coupons, null, 2),
      );
      console.log(
        "=== free_products ===",
        JSON.stringify(
          freeProductsData.data.primary_offer?.free_products,
          null,
          2,
        ),
      );
    }
  }, [freeProductsData]);

  // Extract free products list across all rules and rule groups
  const freeProducts = React.useMemo(() => {
    if (!freeProductsData?.data) return [];

    const list: FreeRewardProduct[] = [];
    const seenIds = new Set<string | number>();

    const addFreeProducts = (products?: FreeRewardProduct[]) => {
      if (!Array.isArray(products)) return;
      products.forEach((p) => {
        const key = `${p.product_id}-${p.variation_id || p.reward_id || p.sku}`;
        if (p && !seenIds.has(key)) {
          seenIds.add(key);
          list.push(p);
        }
      });
    };

    // 1. Primary offer
    if (freeProductsData.data.primary_offer?.free_products) {
      addFreeProducts(freeProductsData.data.primary_offer.free_products);
    }

    // 2. Rules list
    if (Array.isArray(freeProductsData.data.rules)) {
      freeProductsData.data.rules.forEach((rule) => {
        addFreeProducts(rule.free_products);
      });
    }

    // 3. Rule groups
    const rg = freeProductsData.data.rule_groups;
    if (rg) {
      Object.values(rg).forEach((groupRules) => {
        if (Array.isArray(groupRules)) {
          groupRules.forEach((rule) => {
            addFreeProducts(rule.free_products);
          });
        }
      });
    }

    return list;
  }, [freeProductsData]);

  // Extract active coupons list
  const activeCoupons = React.useMemo(() => {
    return freeProductsData?.data?.active_coupons ?? [];
  }, [freeProductsData]);

  // Extract offer rules with their free products across primary_offer, rules, and rule_groups
  const offerRules = React.useMemo(() => {
    if (!freeProductsData?.data) return [];
    const list: OfferRule[] = [];
    const seenIds = new Set<string | number>();

    const addRule = (rule?: OfferRule | null) => {
      if (!rule) return;
      const id = rule.rule_id || rule.rule_code || rule.offer_message;
      if (
        !seenIds.has(id) &&
        (rule.offer_message ||
          (rule.free_products && rule.free_products.length > 0))
      ) {
        seenIds.add(id);
        list.push(rule);
      }
    };

    if (freeProductsData.data.primary_offer) {
      addRule(freeProductsData.data.primary_offer);
    }

    if (Array.isArray(freeProductsData.data.rules)) {
      freeProductsData.data.rules.forEach(addRule);
    }

    const rg = freeProductsData.data.rule_groups;
    if (rg) {
      Object.values(rg).forEach((groupRules) => {
        if (Array.isArray(groupRules)) {
          groupRules.forEach(addRule);
        }
      });
    }

    return list;
  }, [freeProductsData]);

  // Helper to parse and render offer message dynamically with styled numbers/prices and green FREE text
  const renderOfferMessage = (message: string) => {
    if (!message) return null;

    const renderMessageNumbers = (text: string, baseKey: number) => {
      const priceRegex = /((?:₹\s*)?[0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/g;
      const parts = text.split(priceRegex);

      return parts.map((part, index) => {
        const isMatch = priceRegex.test(part);
        priceRegex.lastIndex = 0;

        if (isMatch) {
          return (
            <Text
              key={`${baseKey}-${index}`}
              style={{
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
              }}
            >
              {part}
            </Text>
          );
        }
        return part;
      });
    };

    const parts = message.split(/(FREE)/i);

    return parts.map((part, index) => {
      if (part.toUpperCase() === "FREE") {
        return (
          <Text
            key={index}
            style={{
              color: colors.textSecondary,
              fontFamily: "Poppins_700Bold",
            }}
          >
            {part}
          </Text>
        );
      }
      return renderMessageNumbers(part, index);
    });
  };

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

  const selectedComboId = variationmaster?.some(
    (item) => item.id === realProductId,
  )
    ? realProductId
    : variationmaster?.some((item) => item.id === variationId)
      ? variationId
      : variationmaster?.[0]?.id;

  const mediaList = React.useMemo(() => {
    return productImages.map((item) => ({
      type: item.asset_type,
      image: item.s3_image_path ? BASE_URL + item.s3_image_path : null,
      video: item.video_path
        ? BASE_URL + "/product-video/" + item.video_path
        : null,
    }));
  }, [productImages]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(async () => {
    try {
      const activeSlug =
        productSlug ||
        getValidSlug(productInfo?.slug) ||
        getValidSlug(productInfo?.product_slug) ||
        (typeof slug === "string" ? slug : "product");

      const fallbackUrl = DeepLinkURLBuilder.product(activeSlug);
      const message = DeepLinkURLBuilder.createShareMessage(
        resolvedProductName,
        fallbackUrl,
      );

      await Share.share({
        message,
        url: fallbackUrl, // url is iOS only, but good practice
        title: resolvedProductName, // Android only
      });
    } catch (error) {
      console.error("Error sharing product:", error);
    }
  }, [productSlug, productInfo, slug, resolvedProductName]);

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
    if (!realProductId) return;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId!,
      product_id: realProductId,
      qty: 1,
    });
  }, [realProductId, visitorId, addToCart]);

  const handleIncrease = useCallback(() => {
    if (!realProductId) return;
    const nextQty = quantity + 1;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId!,
      product_id: realProductId,
      qty: nextQty,
    });
  }, [quantity, realProductId, visitorId, addToCart]);

  const handleDecrease = useCallback(() => {
    if (!realProductId) return;
    const nextQty = Math.max(quantity - 1, 0);
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId!,
      product_id: realProductId,
      qty: nextQty,
    });
  }, [quantity, realProductId, visitorId, addToCart]);

  // ─── Modal / Sheet Handlers ─────────────────────────────────
  const openDescriptionSheet = useCallback(() => {
    setIsDescriptionVisible(true);
  }, []);

  const closeDescriptionSheet = useCallback(() => {
    setIsDescriptionVisible(false);
  }, []);

  const openPincodeModal = useCallback(() => setShowPincodeModal(true), []);
  const closePincodeModal = useCallback(() => setShowPincodeModal(false), []);

  const shouldScrollToReview =
    scrollToReview === "true" ||
    scrollToReview === "1" ||
    section === "reviews";

  const scrollToReviews = useCallback(() => {
    if (reviewSectionY.current <= 0) return;
    scrollViewRef.current?.scrollTo({
      y: Math.max(reviewSectionY.current - insets.top - 56, 0),
      animated: true,
    });
  }, [insets.top]);

  const handleReviewSectionLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const yPos = event.nativeEvent.layout.y;
      if (yPos > 0) {
        reviewSectionY.current = yPos;
        if (shouldScrollToReview) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(yPos - insets.top - 56, 0),
              animated: true,
            });
          }, 200);
        }
      }
    },
    [shouldScrollToReview, insets.top],
  );

  // ─── Effects ────────────────────────────────────────────────
  useEffect(() => {
    if (!realProductId || !visitorId) return;
    saveRecentlyViewed({ product_id: realProductId, visitor_id: visitorId });
  }, [realProductId, visitorId]);

  useEffect(() => {
    if (!shouldScrollToReview || isLoading || !realProductId) return;
    const timer = setTimeout(() => {
      if (reviewSectionY.current > 0) {
        scrollToReviews();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [shouldScrollToReview, isLoading, realProductId, scrollToReviews]);

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
            {/* <TouchableOpacity
              onPress={() => router.push("/search")}
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <Search size={23} color={colors.borderblack} />
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <LucideShare2 size={23} color={colors.borderblack} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ── */}
      <Animated.ScrollView
        ref={scrollViewRef}
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
        <View style={{ gap: 10 }}>
          <ImageVideoCarousel data={mediaList} title={resolvedProductName} />

          <View style={{ paddingHorizontal: spacing(16), gap: spacing(10) }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {hasRating && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={scrollToReviews}
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
                </TouchableOpacity>
              )}

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
            </View>

            {/* Product name */}
            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
                lineHeight: font(22),
                includeFontPadding: false,
              }}
            >
              {productInfo?.product_name}
            </Text>

            {/* Price */}
            <View style={{}}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(7),
                  alignSelf: "flex-start",
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

              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: spacing(8),
                  }}
                >
                  <Text
                    style={{
                      fontSize: font(25),
                      fontFamily: "Poppins_700Bold",
                      color: colors.primary,
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
                </View>
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

            {/* ── View Full Comparison Button ── */}
            {comparisonResponse?.data?.has_comparison &&
              comparisonResponse?.data?.products?.length > 0 && (
                <SeeAllProductsButton
                  products={comparisonResponse.data.products}
                  label="View full comparison"
                  style={{
                    marginHorizontal: 0,
                    marginVertical: 0,
                    marginTop: spacing(4),
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/(stack)/product-comparison/[variationId]",
                      params: { variationId: String(comparisonVariationId) },
                    })
                  }
                />
              )}
          </View>
        </View>

        {/* ── Variants ── */}
        {!!variationmaster?.length &&
          productInfo?.listing_type?.toLowerCase() !== "combo" && (
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
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing(8),
                }}
              >
                {variationmaster.map((item) => {
                  const isSelected = item.id === selectedComboId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      onPress={() => {
                        if (item.id === selectedComboId) return;
                        router.replace({
                          pathname: "/(stack)/products/[slug]",
                          params: {
                            slug: item.slug || productSlug,
                            id: String(item.id),
                            variation_id: String(item.id),
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
                          color: isSelected
                            ? colors.text
                            : colors.textSecondary,
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

        {/* ── Free Gift UI Section ── */}
        {!isLoading &&
          !error &&
          (isOffersLoading ? (
            <FreeGiftOffersSkeleton />
          ) : offerRules && offerRules.length > 0 ? (
            <View
              style={{
                marginHorizontal: spacing(16),
                marginTop: spacing(12),
                borderWidth: 1.2,
                borderColor: "#A7F3D0", // Soft light green border
                borderRadius: spacing(12),
                backgroundColor: colors.surface,
                overflow: "hidden", // Clips header's background to rounded corners
              }}
            >
              {/* Section Header */}
              <View
                style={{
                  backgroundColor: "#E8FDF0", // Soft success green
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing(11),
                  paddingHorizontal: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#10B981",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Gift size={15} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: "#06563F",
                    flex: 1,
                  }}
                >
                  Free Gift Offers ({offerRules.length})
                </Text>
              </View>

              {/* Divider Line connecting sides */}
              <FilledWavyDivider color="#E8FDF0" />

              {/* Rules & Products List */}
              <View style={{ padding: spacing(14), gap: spacing(12) }}>
                {(showAllFreeProducts
                  ? offerRules
                  : offerRules.slice(0, 1)
                ).map((rule, ruleIdx) => {
                  const IconComponent =
                    rule.rule_type === "CART_VALUE" ? ShoppingCart : Tag;
                  const ruleProducts =
                    rule.free_products && rule.free_products.length > 0
                      ? rule.free_products
                      : ruleIdx === 0
                        ? freeProducts
                        : [];

                  return (
                    <View
                      key={rule.rule_id || rule.rule_code || ruleIdx}
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: spacing(12),
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: spacing(12),
                        gap: spacing(12),
                      }}
                    >
                      {/* Offer Message Header */}
                      {rule.offer_message ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing(6),
                          }}
                        >
                          <Tag size={14} color={colors.primary} />
                          <Text
                            style={{
                              flex: 1,
                              fontSize: font(12),
                              fontFamily: "Poppins_600SemiBold",
                              color: colors.text,
                              lineHeight: font(17),
                            }}
                          >
                            {renderOfferMessage(rule.offer_message)}
                          </Text>
                        </View>
                      ) : null}

                      {/* Free Products under this Rule */}
                      {ruleProducts.length > 0 && (
                        <View style={{ gap: spacing(12) }}>
                          {ruleProducts.map((item, itemIdx) => {
                            const imageUri = item.s3_image_path?.startsWith(
                              "http",
                            )
                              ? item.s3_image_path
                              : `https://static-cdn.pestobazaar.com${item.s3_image_path}`;

                            return (
                              <View
                                key={
                                  item.reward_id || item.product_id || itemIdx
                                }
                                style={{
                                  flexDirection: "row",
                                  backgroundColor: "transparent",
                                  gap: spacing(12),
                                  alignItems: "center",
                                }}
                              >
                                {/* Image */}
                                <View
                                  style={{
                                    width: spacing(60),
                                    height: spacing(60),
                                    borderRadius: spacing(8),
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    backgroundColor: colors.background,
                                    overflow: "hidden",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Image
                                    source={{ uri: imageUri }}
                                    style={{
                                      width: spacing(50),
                                      height: spacing(50),
                                    }}
                                    contentFit="contain"
                                  />
                                </View>

                                {/* Content */}
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    numberOfLines={2}
                                    style={{
                                      fontSize: font(12),
                                      fontFamily: "Poppins_600SemiBold",
                                      color: colors.text,
                                      lineHeight: font(16),
                                    }}
                                  >
                                    {item.product_name}
                                  </Text>

                                  <Text
                                    style={{
                                      fontSize: font(10.5),
                                      fontFamily: "Poppins_400Regular",
                                      color: colors.textSecondary,
                                      marginTop: spacing(2),
                                    }}
                                  >
                                    {item.size
                                      ? `${item.size} • `
                                      : item.variation
                                        ? `${item.variation} • `
                                        : ""}
                                    {item.free_quantity
                                      ? `${item.free_quantity} unit`
                                      : "1 unit"}
                                  </Text>
                                </View>

                                {/* Green FREE badge tag */}
                                <View
                                  style={{
                                    borderWidth: 1,
                                    borderColor: "#10B981",
                                    borderRadius: 6,
                                    paddingHorizontal: spacing(10),
                                    paddingVertical: spacing(4),
                                    backgroundColor: "#10B98110",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: font(11),
                                      fontFamily: "Poppins_700Bold",
                                      color: "#10B981",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Free
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* View All / View Less Toggle */}
                {offerRules.length > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAllFreeProducts(!showAllFreeProducts)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: spacing(4),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(12),
                        fontFamily: "Poppins_600SemiBold",
                        color: "#10B981",
                      }}
                    >
                      {showAllFreeProducts
                        ? "View Less"
                        : `View All (${offerRules.length} Offers)`}
                    </Text>
                    {showAllFreeProducts ? (
                      <ChevronUp size={16} color="#10B981" />
                    ) : (
                      <ChevronDown size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null)}

        {/* ── Active Coupons Section ── */}
        {!isLoading &&
          !error &&
          (isOffersLoading ? (
            <AvailableCouponsSkeleton />
          ) : activeCoupons && activeCoupons.length > 0 ? (
            <View
              style={{
                marginHorizontal: spacing(16),
                marginTop: spacing(12),
                borderWidth: 1.2,
                borderColor: colors.primary + "50", // Primary themed border
                borderRadius: spacing(12),
                backgroundColor: colors.surface,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <View
                style={{
                  backgroundColor: colors.primary + "15", // Light primary background
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing(11),
                  paddingHorizontal: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tag size={15} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.primary,
                    flex: 1,
                  }}
                >
                  Available Coupons ({activeCoupons.length})
                </Text>
              </View>

              {/* Wavy Divider Line */}
              <FilledWavyDivider color={colors.primary + "15"} />

              {/* Coupons Body */}
              <View style={{ padding: spacing(14), gap: spacing(12) }}>
                {(showAllCoupons
                  ? activeCoupons
                  : activeCoupons.slice(0, 1)
                ).map((coupon) => (
                  <ProductCouponCard
                    key={coupon.promo_code_id || coupon.code}
                    item={coupon}
                    onCopy={handleCopyCoupon}
                    isCopied={copiedCode === coupon.code}
                  />
                ))}

                {activeCoupons.length > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAllCoupons(!showAllCoupons)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: spacing(6),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(12),
                        fontFamily: "Poppins_600SemiBold",
                        color: colors.primary,
                      }}
                    >
                      {showAllCoupons
                        ? "View Less"
                        : `View All (${activeCoupons.length} Coupons)`}
                    </Text>
                    {showAllCoupons ? (
                      <ChevronUp size={16} color={colors.primary} />
                    ) : (
                      <ChevronDown size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null)}

        {/* ── Delivery ── */}
        <View style={{ gap: spacing(10) }}>
          <DeliveryInfoCard
            variationId={realProductId ?? 0}
            onOpenPincode={openPincodeModal}
          />
        </View>

        {/* ── Description ── */}
        {!!rawDescriptionHtml && (
          <ProductDescription
            html={rawDescriptionHtml}
            onReadMore={openDescriptionSheet}
          />
        )}

        <ProductComparisonSection
          data={comparisonResponse?.data}
          isLoading={isComparisonLoading}
        />

        {/* ── More Info Accordion ── */}
        {descriptionUi.length > 0 && (
          <DescriptionAccordion data={descriptionUi} />
        )}

        {/* ── USP ── */}
        <HomeUsp />

        {/* ── Recommended Products (Tagged Products) ── */}
        {!!(productInfo?.id || realProductId || productId) && (
          <RecommendedProducts
            productId={Number(productInfo?.id ?? realProductId ?? productId)}
          />
        )}

        {/* ── Related + Recent ── */}
        {realProductId !== undefined && (
          <>
            <CustomerAlsoBoughtProduct productId={realProductId} />
            <RecentlyViewProducts />
          </>
        )}

        {/* ── Reviews ── */}
        {realProductId !== undefined && (
          <View onLayout={handleReviewSectionLayout}>
            <ReviewSection product_id={realProductId} />
          </View>
        )}
      </Animated.ScrollView>

      {/* ── Footer ── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
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
                  {cartCountData?.data ?? 0}
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
              disabled={isCartLoading}
              onPress={handleAddToCart}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.primary,
                  flex: 1,
                  opacity: isCartLoading ? 0.7 : 1,
                },
              ]}
            >
              {isCartLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: colors.textOnPrimary },
                  ]}
                >
                  Add To Cart
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.stepper,
                styles.halfBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isCartLoading ? 0.8 : 1,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isCartLoading}
                onPress={handleDecrease}
                style={styles.stepperBtn}
              >
                <Minus size={18} color={colors.textOnPrimary} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                {isCartLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.textOnPrimary}
                  />
                ) : (
                  <Text
                    style={[styles.stepperVal, { color: colors.textOnPrimary }]}
                  >
                    {quantity}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isCartLoading}
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
        visible={isDescriptionVisible}
        onClose={closeDescriptionSheet}
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
  headerTitle: { fontSize: 13, fontFamily: "Poppins_500Medium" },

  // Footer
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    paddingHorizontal: 20,
  },

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
