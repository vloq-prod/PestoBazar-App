// app/(tabs)/index.tsx
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
import { useHomeBanners } from "../../src/hooks/homeHooks";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import HomeBottomCarousel from "../../src/components/home/HomeBottomCarousel";
import BulkOrderFAB from "../../src/components/home/BulkOrderFAB";
import Testimonial from "../../src/components/home/Testimonial";
import HomeUsp from "../../src/components/home/HomeUsp";
import Branches from "../../src/components/home/Branches";
import { CategoryList } from "../../src/components/home/CategoryList";
import CategoryCardSection from "../../src/components/home/CategoryCardSection";
import AddToCartPreview from "../../src/components/cart/AddToCartPreview";
import { useNetworkStatus } from "../../src/hooks/useNetworkHooks";
import NoInternet from "../(stack)/nointernet";
import FeatureBanner from "../../src/components/home/FeatureBannerColumn";
import Footer from "../../src/components/home/Footer";
import RecentlyViewProducts from "../../src/components/home/RecentlyViewProducts";
import OurServices from "../../src/components/home/OurServices";
import { useAppVisitorStore } from "../../src/store/auth";

const SEARCH_HEIGHT = 56;
const CATEGORY_HEIGHT = 105;
const SCROLL_THRESHOLD = 10;
const TIMING_CONFIG = { duration: 280 };

export default function HomeScreen() {
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();

  const visitorId =  useAppVisitorStore((state) => state.visitorId);
  console.log("visitor id : ", visitorId)
  
  

  const { colors } = useTheme();
  const { slidingbanners, featureBanners, homeBottomBanners } =
    useHomeBanners();

  const lastScrollY = useSharedValue(0);
  const searchVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;

      if (currentY <= 0) {
        if (searchVisible.value !== 1)
          searchVisible.value = withTiming(1, TIMING_CONFIG);
      } else if (diff > SCROLL_THRESHOLD && searchVisible.value !== 0) {
        // scroll DOWN → hide both
        searchVisible.value = withTiming(0, TIMING_CONFIG);
      } else if (diff < -SCROLL_THRESHOLD && searchVisible.value !== 1) {
        // scroll UP → show both
        searchVisible.value = withTiming(1, TIMING_CONFIG);
      }

      lastScrollY.value = currentY;
    },
  });

  // search bar — unchanged
  const searchAnimStyle = useAnimatedStyle(() => ({
    height: interpolate(
      searchVisible.value,
      [0, 1],
      [0, SEARCH_HEIGHT],
      Extrapolate.CLAMP,
    ),
    opacity: interpolate(
      searchVisible.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP,
    ),
    overflow: "hidden",
  }));

  // category — same driver, hardcoded height so it always renders correctly
  const categoryAnimStyle = useAnimatedStyle(() => ({
    height: interpolate(
      searchVisible.value,
      [0, 1],
      [0, CATEGORY_HEIGHT],
      Extrapolate.CLAMP,
    ),
    opacity: interpolate(
      searchVisible.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP,
    ),
    overflow: "hidden",
  }));

  if (!isConnected) {
    return <NoInternet />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ── HEADER ── */}
      <LinearGradient
        colors={["#0c0225", "#2a0a6b", "#5f16e9", "#9333ea"]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ overflow: "hidden" }}
      >
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
        {/* ── Bright core glow — top-right inner ── */}
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
        {/* ── Deep indigo bloom — left ── */}
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

        <SafeAreaView edges={["top"]} className=" gap-2">
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          <HomeNavbar
            name="Guest"
            onNotificationPress={() => {}}
            onProfilePress={() => {}}
          />

          <Animated.View style={searchAnimStyle}>
            <AppSearchBar />
          </Animated.View>
        </SafeAreaView>

        <Animated.View style={categoryAnimStyle}>
          {/* <CategoryListStatic /> */}
          <CategoryList />
        </Animated.View>
      </LinearGradient>

      {/* ── SCROLL CONTENT ── */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 120,
            paddingTop: 16,
            gap: 30,
          }}
        >
          <SlidingBanners data={slidingbanners} />

          <CategoryCardSection />
          <HomeProduct />
          <FeatureBanner item={featureBanners?.[0]} />
          <DealsOfTheDay />
          <FeatureBanner item={featureBanners?.[1]} />
          <RecentlyViewProducts />
          <FeaturedProducts />
          <HomeBottomCarousel
            item={
              Array.isArray(homeBottomBanners)
                ? homeBottomBanners[0]
                : homeBottomBanners
            }
          />

          <View style={{ gap: 25 }}>
            <Testimonial />
            <HomeUsp />

            <OurServices />
            <Branches />
            <Footer />
          </View>
        </Animated.ScrollView>

        <AddToCartPreview visible={searchVisible} />

        <BulkOrderFAB visible={searchVisible} />
      </View>
    </View>
  );
}
