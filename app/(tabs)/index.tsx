// app/(tabs)/index.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../src/theme";
import HomeNavbar from "../../src/components/home/HomeNavbar";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AppSearchBar from "../../src/components/home/AppSearchBar";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import HomeProduct from "../../src/components/home/HomeProduct";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import HomeBottomCarousel from "../../src/components/home/HomeBottomCarousel";
import BulkOrderFAB from "../../src/components/home/BulkOrderFAB";
import Testimonial from "../../src/components/home/Testimonial";
import HomeUsp from "../../src/components/home/HomeUsp";
import Branches from "../../src/components/home/Branches";
import { CategoryList } from "../../src/components/home/CategoryList";
import CategoryCardSection from "../../src/components/home/CategoryCardSection";
import AddToCartPreview from "../../src/components/cart/AddToCartPreview";
import NoInternet from "../(stack)/nointernet";
import FeatureBanner from "../../src/components/home/FeatureBannerColumn";
import Footer from "../../src/components/home/Footer";
import RecentlyViewProducts from "../../src/components/home/RecentlyViewProducts";
import OurServices from "../../src/components/home/OurServices";

import { useNetworkStatus } from "../../src/hooks/useNetworkHooks";
import { useAppVisitorStore } from "../../src/store/auth";

// ── CENTRALIZED API HOOKS ──
import {
  useHomeBanners,
  useHomeProduct,
  useDeals,
  useFeatured,
  useTestimonial,
  useUsp,
  useBranch,
  useRecentlyViewed,
} from "../../src/hooks/homeHooks";

// ── PERFORMANCE OPTIMIZATION: Memoize all heavy components ──
const MemoSlidingBanners = React.memo(SlidingBanners);
const MemoCategoryCardSection = React.memo(CategoryCardSection);
const MemoHomeProduct = React.memo(HomeProduct);
const MemoFeatureBanner = React.memo(FeatureBanner);
const MemoDealsOfTheDay = React.memo(DealsOfTheDay);
const MemoRecentlyViewProducts = React.memo(RecentlyViewProducts);
const MemoFeaturedProducts = React.memo(FeaturedProducts);
const MemoHomeBottomCarousel = React.memo(HomeBottomCarousel);
const MemoTestimonial = React.memo(Testimonial);
const MemoHomeUsp = React.memo(HomeUsp);
const MemoOurServices = React.memo(OurServices);
const MemoBranches = React.memo(Branches);
const MemoFooter = React.memo(Footer);

const SCROLL_THRESHOLD = 15;
const TIMING_CONFIG = { duration: 250 };

// Approx heights to calculate the exact translation required for the header
const SEARCH_HEIGHT = 56;
const CATEGORY_HEIGHT = 105;
const MAX_TRANSLATE = 193; // Precisely calculated to match content heights

export default function HomeScreen() {
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const visitorId = useAppVisitorStore((state) => state.visitorId);
  const { colors } = useTheme();

  // ── PERFORMANCE OPTIMIZATION: Centralize API Calls ──
  const { slidingbanners, featureBanners, homeBottomBanners } =
    useHomeBanners();
  const { sections: homeProducts } = useHomeProduct();
  const { deals } = useDeals();
  const { featured } = useFeatured();
  const { testimonials } = useTestimonial();
  const { uspList } = useUsp();
  const { branches } = useBranch();
  const { recentlyViewed } = useRecentlyViewed(visitorId || "");

  const [visibleSectionsCount, setVisibleSectionsCount] = useState(4);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSectionsCount(14);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const lastScrollY = useSharedValue(0);
  const searchVisible = useSharedValue(1);

  const [isScrolled, setIsScrolled] = useState(false);

  useAnimatedReaction(
    () => searchVisible.value,
    (currentValue, previousValue) => {
      if (
        currentValue < 0.5 &&
        (previousValue === null || previousValue >= 0.5)
      ) {
        runOnJS(setIsScrolled)(true);
      } else if (
        currentValue >= 0.5 &&
        (previousValue === null || previousValue < 0.5)
      ) {
        runOnJS(setIsScrolled)(false);
      }
    },
  );

  // ── PERFORMANCE OPTIMIZATION: 1:1 Native Scroll-Linked Header ──
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const contentHeight = event.contentSize.height;
      const layoutHeight = event.layoutMeasurement.height;
      const maxScrollY = contentHeight - layoutHeight;

      const diff = currentY - lastScrollY.value;

      // If at the very top, always show header
      if (currentY <= 0) {
        searchVisible.value = 1;
      } else if (maxScrollY > 0 && currentY >= maxScrollY - 10) {
        // If we are at the very bottom, keep it hidden to prevent bounce issues
        searchVisible.value = 0;
      } else {
        // Calculate exact proportion of scroll to hide/show 1:1 with finger
        const delta = diff / MAX_TRANSLATE;
        const newValue = searchVisible.value - delta;

        // Clamp strictly between 0 (hidden) and 1 (visible)
        searchVisible.value = Math.max(0, Math.min(1, newValue));
      }

      lastScrollY.value = currentY;
    },
    // Snap to nearest state when user stops dragging
    onEndDrag: (event) => {
      const currentY = event.contentOffset.y;
      const contentHeight = event.contentSize.height;
      const layoutHeight = event.layoutMeasurement.height;
      const maxScrollY = contentHeight - layoutHeight;

      // If we are near the bottom, stay hidden
      if (maxScrollY > 0 && currentY >= maxScrollY - 20) {
        searchVisible.value = withTiming(0, TIMING_CONFIG);
        return;
      }

      if (searchVisible.value > 0 && searchVisible.value < 1) {
        searchVisible.value = withTiming(
          searchVisible.value > 0.5 ? 1 : 0,
          TIMING_CONFIG,
        );
      }
    },
    // Snap to nearest state when scroll momentum finishes
    onMomentumEnd: (event) => {
      const currentY = event.contentOffset.y;
      const contentHeight = event.contentSize.height;
      const layoutHeight = event.layoutMeasurement.height;
      const maxScrollY = contentHeight - layoutHeight;

      // If we are near the bottom, stay hidden
      if (maxScrollY > 0 && currentY >= maxScrollY - 20) {
        searchVisible.value = withTiming(0, TIMING_CONFIG);
        return;
      }

      if (searchVisible.value > 0 && searchVisible.value < 1) {
        searchVisible.value = withTiming(
          searchVisible.value > 0.5 ? 1 : 0,
          TIMING_CONFIG,
        );
      }
    },
  });

  // ── HEADER ANIMATIONS ──
  const headerTranslateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          searchVisible.value,
          [0, 1],
          [-MAX_TRANSLATE, 0],
          Extrapolate.CLAMP,
        ),
      },
    ],
    // Fades out the entire gradient smoothly as it scrolls up
    opacity: interpolate(
      searchVisible.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  const fadeAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      searchVisible.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  // Drops down from above the screen once the main header is mostly scrolled away
  const stickyNavbarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          searchVisible.value,
          [0.4, 0],
          [-(insets.top + 70), 0],
          Extrapolate.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      searchVisible.value,
      [0.4, 0],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  const HEADER_HEIGHT = insets.top + 70 + MAX_TRANSLATE;

  // ── PERFORMANCE OPTIMIZATION: Stable Props for Virtualized List ──
  const sections = useMemo(
    () => [
      { id: "sliding_banners", data: slidingbanners },
      { id: "category_card_section" },
      { id: "home_product", data: homeProducts },
      { id: "feature_banner_0", data: featureBanners?.[0] },
      { id: "deals_of_the_day", data: deals },
      { id: "feature_banner_1", data: featureBanners?.[1] },
      { id: "recently_viewed", data: recentlyViewed },
      { id: "featured_products", data: featured },
      {
        id: "home_bottom_carousel",
        data: Array.isArray(homeBottomBanners)
          ? homeBottomBanners[0]
          : homeBottomBanners,
      },
      { id: "testimonial", data: testimonials },
      { id: "home_usp", data: uspList },
      { id: "our_services" },
      { id: "branches", data: branches },
      { id: "footer" },
    ],
    [
      slidingbanners,
      homeProducts,
      featureBanners,
      deals,
      recentlyViewed,
      featured,
      homeBottomBanners,
      testimonials,
      uspList,
      branches,
    ],
  );

  const visibleSections = useMemo(
    () => sections.slice(0, visibleSectionsCount),
    [sections, visibleSectionsCount],
  );

  const renderItem = useCallback(({ item }: any) => {
    switch (item.id) {
      case "sliding_banners":
        return <MemoSlidingBanners data={item.data} />;
      case "category_card_section":
        return <MemoCategoryCardSection />;
      case "home_product":
        return <MemoHomeProduct />;
      case "feature_banner_0":
        return <MemoFeatureBanner item={item.data} />;
      // case "deals_of_the_day":
      //   // return <MemoDealsOfTheDay />;
      case "feature_banner_1":
        return <MemoFeatureBanner item={item.data} />;
      case "recently_viewed":
        return <MemoRecentlyViewProducts />;
      // case "featured_products":
      //   // return <MemoFeaturedProducts />;
      case "home_bottom_carousel":
        return <MemoHomeBottomCarousel item={item.data} />;
      case "testimonial":
        return <MemoTestimonial />;
      case "home_usp":
        return <MemoHomeUsp />;
      case "our_services":
        return <MemoOurServices />;
      case "branches":
        return <MemoBranches />;
      case "footer":
        return <MemoFooter />;
      default:
        return null;
    }
  }, []);

  if (!isConnected) {
    return <NoInternet />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── STICKY NAVBAR (Slides Down) ── */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: insets.top,
            height: insets.top + 70,
            backgroundColor: "white",

            borderBottomWidth: 1,
            borderColor: colors.border || "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
            justifyContent: "center",
            zIndex: 100,
          },
          stickyNavbarStyle,
        ]}
      >
        <HomeNavbar
          name="Guest"
          isLight={true}
          onNotificationPress={() => {}}
          onProfilePress={() => {}}
        />
      </Animated.View>

      {/* ── HEADER BACKGROUND & SEARCH (Translates UP & Fades Out) ── */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 90 },
          headerTranslateStyle,
        ]}
      >
        <LinearGradient
          colors={["#0c0225", "#2a0a6b", "#5f16e9", "#9333ea"]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ overflow: "hidden", paddingBottom: 16 }}
        >
          {/* Background Blobs */}
          <View
            style={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: "rgba(139,92,246,0.22)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: -10,
              right: 20,
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "rgba(167,139,250,0.15)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 100,
              left: -60,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(109,40,217,0.28)",
            }}
          />

          <SafeAreaView edges={["top"]} style={{ gap: 8 }}>
            <StatusBar
              barStyle={isScrolled ? "dark-content" : "light-content"}
              backgroundColor="transparent"
              translucent
            />

            {/* ORIGINAL NAVBAR: Scrolls up with gradient */}
            <View style={{ height: 70, justifyContent: "center" }}>
              <HomeNavbar
                name="Guest"
                isLight={false}
                onNotificationPress={() => {}}
                onProfilePress={() => {}}
              />
            </View>

            <Animated.View style={fadeAnimStyle}>
              <AppSearchBar />
            </Animated.View>
          </SafeAreaView>

          <Animated.View style={[{ marginTop: 8 }, fadeAnimStyle]}>
            <CategoryList />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* ── SCROLL CONTENT ── */}
      <View style={{ flex: 1, zIndex: 1, overflow: "hidden" }}>
        {/* Removed extra Animated.View wrapper. Animation applied directly to FlatList. */}
        {/* marginBottom compensates for translateY to prevent bottom gap */}
        <Animated.FlatList
          data={visibleSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT - 12,
            paddingBottom: insets.bottom + 120,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>

      {/* Floating Elements */}
      <AddToCartPreview visible={searchVisible} horizontalPosition="left" />
      <BulkOrderFAB visible={searchVisible} pbandroid={12} pbios={90} />
    </View>
  );
}
