// app/(tabs)/index.tsx
import { View, StatusBar } from "react-native";
import { useTheme } from "../../src/theme";
import HomeNavbar from "../../src/components/home/HomeNavbar";
import { SafeAreaView } from "react-native-safe-area-context";
import AppSearchBar from "../../src/components/home/AppSearchBar";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import HomProduct from "../../src/components/home/HomProduct";
import { useHomeBanners } from "../../src/hooks/homeHooks";
import FeatureBannerColumn from "../../src/components/home/FeatureBannerColumn";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import CategoryList from "../../src/components/home/CategoryList";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";
import MiniCart from "../../src/components/home/MiniCart";
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
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";
import Testimonial from "../../src/components/home/Testimonial";
const SEARCH_HEIGHT = 56;
const SCROLL_THRESHOLD = 10;
const TIMING_CONFIG = { duration: 280 };

export default function HomeScreen() {
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
        searchVisible.value = withTiming(0, TIMING_CONFIG);
      } else if (diff < -SCROLL_THRESHOLD && searchVisible.value !== 1) {
        searchVisible.value = withTiming(1, TIMING_CONFIG);
      }

      lastScrollY.value = currentY;
    },
  });

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

  return (
    <View style={{ flex: 1 }}>
      {/* ── HEADER ── */}
      <View style={{ backgroundColor: colors.primary, paddingBottom: 10 }}>
        <SafeAreaView edges={["top"]} className=" gap-2">
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary}
          />

          <HomeNavbar
            name="Guest"
            onCartPress={() => {}}
            onNotificationPress={() => {}}
            onProfilePress={() => {}}
          />

          {/* <AppNavbar {...navbarConfig.home} /> */}
          <Animated.View style={searchAnimStyle}>
            <View style={{ paddingHorizontal: 16 }}>
              <AppSearchBar />
            </View>
          </Animated.View>
        </SafeAreaView>

        <CategoryList />
      </View>

      {/* ── SCROLL CONTENT ── */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 80,
            paddingTop: 16,
            gap: 30,
          }}
        >
          <SlidingBanners data={slidingbanners} />
          <HomProduct />
          <FeatureBannerColumn data={featureBanners} />
          <DealsOfTheDay />
          <FeaturedProducts />
          <HomeBottomCarousel
            item={
              Array.isArray(homeBottomBanners)
                ? homeBottomBanners[0]
                : homeBottomBanners
            }
          />
          <Testimonial />
        </Animated.ScrollView>

        {/* <MiniCart /> */}
        {/* <BulkOrderFAB scrollVisible={searchVisible} /> */}
      </View>
    </View>
  );
}
