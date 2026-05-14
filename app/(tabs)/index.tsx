// app/(tabs)/index.tsx

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../src/theme";
import HomeNavbar from "../../src/components/home/HomeNavbar";

import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  type SharedValue,
  interpolate,
  Extrapolation,
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

// ─────────────────────────────────────────────
// MEMOIZED COMPONENTS
// ─────────────────────────────────────────────

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

export default function HomeScreen() {
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const { colors } = useTheme();

  // ─────────────────────────────────────────────
  // API DATA
  // ─────────────────────────────────────────────

  const { slidingbanners, featureBanners, homeBottomBanners } =
    useHomeBanners();

  const { sections: homeProducts } = useHomeProduct();

  const { deals } = useDeals();

  const { featured } = useFeatured();

  const { testimonials } = useTestimonial();

  const { uspList } = useUsp();

  const { branches } = useBranch();

  const { recentlyViewed } = useRecentlyViewed(visitorId || "");

  // ─────────────────────────────────────────────
  // LAZY SECTION LOAD
  // ─────────────────────────────────────────────

  const [visibleSectionsCount, setVisibleSectionsCount] = useState(4);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSectionsCount(14);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // ─────────────────────────────────────────────
  // SCROLL ANIMATION
  // ─────────────────────────────────────────────

  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const fabVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;

      // Hide FAB on scroll down, show on scroll up
      if (currentY > lastScrollY.value && currentY > 150) {
        fabVisible.value = withTiming(0, { duration: 200 });
      } else if (currentY < lastScrollY.value) {
        fabVisible.value = withTiming(1, { duration: 200 });
      }
      lastScrollY.value = currentY;
    },
  });

  // ─────────────────────────────────────────────
  // HEADER HEIGHTS
  // FIX: These values must match actual rendered component heights
  // so wrapper height == content height → no dead space → gap: 10 = true 10px gap
  //
  // HomeNavbar: image is spacing(45), row renders ≈ 48px
  // AppSearchBar: HEIGHT = spacing(42), outer View ≈ 42px
  // CategoryList FlatList: ≈ 95px
  // ─────────────────────────────────────────────

  const NAVBAR_EXPANDED = 52;
  const NAVBAR_COLLAPSED = 52;

  const SEARCH_EXPANDED = 42;
  const CATEGORY_EXPANDED = 95;
  const GAPS = 20;
  const TOP_PADDING = 10; // Space between status bar and content
  const BOTTOM_PADDING = 10; // Extra space at the bottom of the header

  const HEADER_HEIGHT =
    insets.top +
    TOP_PADDING +
    NAVBAR_EXPANDED +
    SEARCH_EXPANDED +
    CATEGORY_EXPANDED +
    GAPS +
    BOTTOM_PADDING;

  // ─────────────────────────────────────────────
  // ANIMATED STYLES
  // ─────────────────────────────────────────────

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 100],
        [SEARCH_EXPANDED, 0],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -10],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [0, 100],
            [1, 0.95],
            Extrapolation.CLAMP,
          ),
        },
      ],
      overflow: "hidden",
    };
  });

  const categoryAnimatedStyle = useAnimatedStyle(() => {
    const startScroll = 40;
    const endScroll = 140;
    return {
      height: interpolate(
        scrollY.value,
        [startScroll, endScroll],
        [CATEGORY_EXPANDED, 0],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        scrollY.value,
        [startScroll, startScroll + 50],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [startScroll, endScroll],
            [0, -20],
            Extrapolation.CLAMP,
          ),
        },
      ],
      overflow: "hidden",
    };
  });

  const navbarContentAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 100],
        [NAVBAR_EXPANDED, NAVBAR_COLLAPSED],
        Extrapolation.CLAMP,
      ),
    };
  });

  const totalHeaderHeightAnimatedStyle = useAnimatedStyle(() => {
    const navbarH = interpolate(
      scrollY.value,
      [0, 100],
      [NAVBAR_EXPANDED, NAVBAR_COLLAPSED],
      Extrapolation.CLAMP,
    );
    const searchH = interpolate(
      scrollY.value,
      [0, 100],
      [SEARCH_EXPANDED, 0],
      Extrapolation.CLAMP,
    );
    const categoryH = interpolate(
      scrollY.value,
      [40, 140],
      [CATEGORY_EXPANDED, 0],
      Extrapolation.CLAMP,
    );
    const gap1 = interpolate(
      scrollY.value,
      [0, 80],
      [10, 0],
      Extrapolation.CLAMP,
    );
    const gap2 = interpolate(
      scrollY.value,
      [40, 120],
      [10, 0],
      Extrapolation.CLAMP,
    );

    return {
      height:
        insets.top +
        TOP_PADDING +
        navbarH +
        searchH +
        categoryH +
        gap1 +
        gap2 +
        BOTTOM_PADDING,
    };
  });

  const navbarAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(
        scrollY.value,
        [0, 80],
        [0, 0.08],
        Extrapolation.CLAMP,
      ),
      elevation: interpolate(
        scrollY.value,
        [0, 80],
        [0, 4],
        Extrapolation.CLAMP,
      ),
    };
  });

  // ─────────────────────────────────────────────
  // SECTIONS
  // ─────────────────────────────────────────────

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
      //   return <MemoDealsOfTheDay />;
      case "feature_banner_1":
        return <MemoFeatureBanner item={item.data} />;
      case "recently_viewed":
        return <MemoRecentlyViewProducts />;
      // case "featured_products":
      //   return <MemoFeaturedProducts />;
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

  if (!isConnected) return <NoInternet />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "#0c0225",
            overflow: "hidden",
          },
          navbarAnimatedStyle,
          totalHeaderHeightAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={["#0c0225", "#2a0a6b", "#5f16e9", "#9333ea"]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ overflow: "hidden" }}
        >
          {/* BLOBS */}
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
              top: 100,
              left: -60,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(109,40,217,0.28)",
            }}
          />

          {/*
            FIX: gap: 10 between all three sections.
            Previously justifyContent: "center" on NavbarWrapper and SearchWrapper
            caused extra dead space above/below content → visually unequal gaps.
            Now wrapper heights match component heights → gap: 10 = true 10px visual gap.
          */}
          <View
            style={{
              paddingTop: insets.top + TOP_PADDING,
              gap: 10,
              paddingBottom: BOTTOM_PADDING,
            }}
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />

            {/* NAVBAR — no justifyContent, height matches content */}
            <Animated.View style={navbarContentAnimatedStyle}>
              <HomeNavbar
                name="Guest"
                isLight={false}
                onNotificationPress={() => {}}
                onProfilePress={() => {}}
              />
            </Animated.View>

            {/* SEARCH — no justifyContent, height matches content */}
            <Animated.View style={searchAnimatedStyle}>
              <AppSearchBar />
            </Animated.View>

            {/* CATEGORY */}
            <Animated.View style={categoryAnimatedStyle}>
              <CategoryList />
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* CONTENT */}
      <Animated.FlatList
        data={visibleSections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 10,
          paddingBottom: insets.bottom + 120,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* FLOATING ELEMENTS */}
      <AddToCartPreview horizontalPosition="left" visible={fabVisible} />
      <BulkOrderFAB pbandroid={12} pbios={90} visible={fabVisible} />
    </View>
  );
}
