// app/(tabs)/index.tsx

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "../../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, ShoppingCart } from "lucide-react-native";
import { useRouter } from "expo-router";
import profile from "../../assets/profile.jpeg";
import { useResponsive } from "../../src/utils/useResponsive";
import { useCartCount } from "../../src/hooks/cartHooks";
import { Feather } from "@expo/vector-icons";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import HomeProduct from "../../src/components/home/HomeProduct";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";
import image1 from "../../assets/category/category4.png";
import image2 from "../../assets/category/category2.png";
import image3 from "../../assets/category/category5.png";
import image4 from "../../assets/category/category1.png";
import image5 from "../../assets/category/category3.png";

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
  useAnimatedStyle,
  withDelay,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import HomeBottomCarousel from "../../src/components/home/HomeBottomCarousel";
import BulkOrderFAB from "../../src/components/home/BulkOrderFAB";
import Testimonial from "../../src/components/home/Testimonial";
import HomeUsp from "../../src/components/home/HomeUsp";
import Branches from "../../src/components/home/Branches";
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
  useCategory,
} from "../../src/hooks/homeHooks";
import { Image } from "expo-image";

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
};

const IconButton = ({ icon, onPress }: IconButtonProps) => {
  const { spacing } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: spacing(38),
        height: spacing(38),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </TouchableOpacity>
  );
};

const HomeNavbar: React.FC<{ name?: string; isLight?: boolean }> = React.memo(
  ({ name = "Guest", isLight = false }) => {
    const router = useRouter();
    const { font, spacing } = useResponsive();
    const { colors } = useTheme();

    const { userName, userId, visitorId, userAvatar } = useAppVisitorStore(
      (state) => state,
    );

    const { data: cartCountData } = useCartCount({
      user_id: userId ?? 0,
      visitor_id: visitorId || "",
    });

    const cartCount = cartCountData?.data || 0;

    const ICON_SIZE = spacing(20);
    const textColor = isLight ? colors.text : colors.textInverse;
    const subtitleColor = isLight ? colors.textSecondary : colors.textInverse;

    const handleMoveToCart = () => {
      router.push("/(stack)/cart");
    };

    return (
      <View className="flex-row justify-between items-center px-4 ">
        {/* LEFT */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity>
            <Image
              source={userAvatar ? { uri: userAvatar } : profile}
              style={{
                width: spacing(45),
                height: spacing(45),
                borderRadius: spacing(22),
              }}
            />
          </TouchableOpacity>

          <View>
            {!userId ? (
              <View>
                <Text
                  style={{
                    fontSize: font(15),
                    color: textColor,
                    fontFamily: "Poppins_700Bold",
                  }}
                >
                  Hii Guest 👋
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text
                    style={{
                      fontSize: font(11),
                      color: subtitleColor,
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    Welcome to Pestobazaar
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: font(12),
                    color: subtitleColor,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Welcome back 👋
                </Text>

                <Text
                  style={{
                    fontSize: font(18),
                    color: textColor,
                    fontWeight: "700",
                    lineHeight: font(22),
                    fontFamily: "Poppins_700Bold",
                  }}
                >
                  {userName}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* RIGHT */}
        <View className="flex-row items-center">
          <IconButton
            onPress={() => {}}
            icon={<Bell size={ICON_SIZE} color={textColor} />}
          />
          <TouchableOpacity
            onPress={handleMoveToCart}
            style={{
              width: spacing(40),
              height: spacing(40),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View>
              <ShoppingCart size={ICON_SIZE} color={textColor} />
              {cartCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -spacing(6),
                    top: -spacing(5),
                    backgroundColor: "#FF3B30", // Bright red
                    borderRadius: 10,
                    minWidth: spacing(16),
                    height: spacing(16),
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: font(9),
                      fontWeight: "700",
                    }}
                  >
                    {cartCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

// ─────────────────────────────────────────────
// SEARCH BAR COMPONENTS
// ─────────────────────────────────────────────

const SEARCH_HINTS = [
  "Rat Control",
  "Mosquito Control",
  "Termite Control",
  "Fly Control",
  "Ant Control",
  "Cockroach Control",
  "Lizard Control",
  "Bed Bugs Control",
  "Snake Control",
];

const CHAR_DELAY = 60;
const ERASE_DELAY = 40;
const PAUSE = 1200;

const FadeChar = ({ char, index, totalLength, phase }: any) => {
  const { font } = useResponsive();
  const { colors } = useTheme();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (phase === "typing") {
      opacity.value = withDelay(
        index * CHAR_DELAY,
        withTiming(1, { duration: 200 }),
      );
    } else {
      const reverseIndex = totalLength - index - 1;
      opacity.value = withDelay(
        reverseIndex * ERASE_DELAY,
        withTiming(0, { duration: 150 }),
      );
    }
  }, [index, opacity, phase, totalLength]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: font(12),
          color: colors.primary,
          fontWeight: "700",
        },
        animatedStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

const AppSearchBar = React.memo(({ onPress }: any) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();

  const [hintIndex, setHintIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "erasing">("typing");

  const text = SEARCH_HINTS[hintIndex];
  const characters = text.split("");

  useEffect(() => {
    setPhase("typing");
  }, [hintIndex]);

  useEffect(() => {
    let t: any;
    if (phase === "typing") {
      t = setTimeout(
        () => {
          setPhase("erasing");
        },
        text.length * CHAR_DELAY + PAUSE,
      );
    } else {
      t = setTimeout(
        () => {
          setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
        },
        text.length * ERASE_DELAY + 200,
      );
    }
    return () => clearTimeout(t);
  }, [phase, text]);

  const HEIGHT = spacing(42);

  return (
    <View
      className="flex-row items-center gap-3 "
      style={{ paddingHorizontal: 16 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => (onPress ? onPress() : router.push("(stack)/shop"))}
        className="flex-1 flex-row items-center border"
        style={{
          height: HEIGHT,
          borderRadius: spacing(12),
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingHorizontal: spacing(12),
        }}
      >
        <View
          style={{
            width: spacing(30),
            height: spacing(30),
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../assets/Pestobazaarlogosmall.png")}
            style={{
              width: "78%",
              height: "78%",
            }}
            resizeMode="contain"
          />
        </View>

        <View className="flex-row items-center  py-3 flex-1 ml-2">
          <Text
            style={{
              fontSize: font(12),
              color: colors.textTertiary,
            }}
          >
            Search by{" "}
          </Text>

          <View className="flex-row">
            {characters.map((char, index) => (
              <FadeChar
                key={`${char}-${index}`}
                char={char}
                index={index}
                totalLength={characters.length}
                phase={phase}
              />
            ))}
          </View>
        </View>

        <Feather name="search" size={spacing(18)} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
});

// ─────────────────────────────────────────────
// CATEGORY LIST COMPONENTS
// ─────────────────────────────────────────────

const formatCategoryName = (name: string) => {
  if (!name) return "";
  return name.replace(/control/gi, "").trim();
};

const formatCategoryDisplayName = (name: string) => {
  const formatted = formatCategoryName(name);
  if (/^agrochemicals$/i.test(formatted)) {
    return "Agro\nChemicals";
  }
  return formatted;
};

const CATEGORY_IMAGES = [image1, image2, image3, image4, image5];

const SkeletonRow = ({ ITEM_SIZE }: any) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  return (
    <View className="flex-row" style={{ paddingHorizontal: spacing(16) }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={{
            alignItems: "center",
            marginRight: spacing(14),
          }}
        >
          <View
            style={{
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              borderRadius: ITEM_SIZE / 2,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View
            style={{
              width: ITEM_SIZE,
              height: spacing(10),
              borderRadius: spacing(4),
              backgroundColor: colors.backgroundSkeleton,
              marginTop: spacing(6),
            }}
          />
          <View
            style={{
              width: ITEM_SIZE * 0.6,
              height: spacing(10),
              borderRadius: spacing(4),
              backgroundColor: colors.backgroundSkeleton,
              marginTop: spacing(4),
            }}
          />
        </View>
      ))}
    </View>
  );
};

const CategoryList: React.FC = React.memo(() => {
  const { categories, loading, error } = useCategory(0);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const CARD_RADIUS = spacing(16);
  const ITEM_SIZE = spacing(58);
  const IMAGE_SIZE = spacing(50);

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <TouchableOpacity
        activeOpacity={0.75}
        className="items-center"
        onPress={() =>
          router.push({
            pathname: "/(stack)/category/[slug]",
            params: {
              slug: item.id,
              name: item.category_name,
              image: item.s3_image_path,
            },
          })
        }
      >
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
          }}
        >
          <Image
            source={CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            contentFit="contain"
          />
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            color: colors.textInverse,
            textAlign: "center",
            width: ITEM_SIZE,
            marginTop: spacing(4),
          }}
        >
          {formatCategoryDisplayName(item.category_name)}
        </Text>
      </TouchableOpacity>
    ),
    [CARD_RADIUS, ITEM_SIZE, IMAGE_SIZE, colors, font, router, spacing],
  );

  if (error) {
    return (
      <View className="px-4 py-3">
        <Text style={{ color: colors.textTertiary, fontSize: font(12) }}>
          Unable to load categories.
        </Text>
      </View>
    );
  }

  return (
    <View className="">
      {loading ? (
        <SkeletonRow ITEM_SIZE={ITEM_SIZE} />
      ) : (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: spacing(16),
            gap: spacing(12),
          }}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
});

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

  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 80],
            [0, -62],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const navbarOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP),
    };
  });

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
  const fabVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY; // ✅ Update scrollY for header animation

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
  // ─────────────────────────────────────────────

  const NAVBAR_HEIGHT = 44;
  const SEARCH_HEIGHT = 42;
  const CATEGORY_HEIGHT = 86;
  const TOP_PADDING = 10;
  const GAP = 10;

  const HEADER_HEIGHT =
    insets.top +
    TOP_PADDING +
    NAVBAR_HEIGHT +
    GAP +
    SEARCH_HEIGHT +
    GAP +
    CATEGORY_HEIGHT;

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
      case "feature_banner_1":
        return <MemoFeatureBanner item={item.data} />;
      case "recently_viewed":
        return <MemoRecentlyViewProducts />;
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
      {/* ANIMATED HEADER */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: colors.primary,
            height: HEADER_HEIGHT,
          },
          headerStyle,
        ]}
      >
        <View
          style={{
            paddingTop: insets.top + TOP_PADDING,
        
            gap: GAP,
            flex: 1,
          }}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          {/* Only Animate Navbar Opacity */}
          <Animated.View style={navbarOpacityStyle}>
            <HomeNavbar name="Guest" isLight={false} />
          </Animated.View>

          <AppSearchBar />

          <CategoryList />
        </View>
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
          paddingTop: HEADER_HEIGHT + 13,
          paddingBottom: insets.bottom + 120,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* FLOATING ELEMENTS (Animations Preserved) */}
      <AddToCartPreview horizontalPosition="left" visible={fabVisible} />
      <BulkOrderFAB pbandroid={12} pbios={90} visible={fabVisible} />
    </View>
  );
}
