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
  StatusBar as RNStatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, ShoppingCart } from "lucide-react-native";
import { router, useRouter } from "expo-router";
import { useResponsive } from "../../src/utils/useResponsive";
import { useCartCount } from "../../src/hooks/cartHooks";
import { useUnreadNotificationCount } from "../../src/hooks/useNotifications";
import { Feather } from "@expo/vector-icons";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import HomeProduct from "../../src/components/home/HomeProduct";
import CustomSections from "../../src/components/home/CustomSections";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";

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
import PromoBanner from "../../src/components/home/PromoBanner";
import NoInternet from "../(stack)/nointernet";
import FeatureBanner from "../../src/components/home/FeatureBannerColumn";
import Footer from "../../src/components/home/Footer";
import RecentlyViewProducts from "../../src/components/home/RecentlyViewProducts";
import OurServices from "../../src/components/home/OurServices";
import Diy from "../../src/components/diy/diy";
import { useQueryClient } from "@tanstack/react-query";
import { useNetworkStatus } from "../../src/hooks/useNetworkHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { useDiyListing } from "../../src/hooks/diyHooks";

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
  useAppMainBanner,
  useAppHeaderBanner,
} from "../../src/hooks/homeHooks";
import { Image } from "expo-image";

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
  badgeCount?: number;
};

const IconButton = ({ icon, onPress, badgeCount }: IconButtonProps) => {
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
      <View>
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View
            style={{
              position: "absolute",
              right: -spacing(4),
              top: -spacing(4),
              backgroundColor: "#FF3B30",
              borderRadius: 8,
              minWidth: spacing(14),
              height: spacing(14),
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 2,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 8,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {badgeCount}
            </Text>
          </View>
        )}
      </View>
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

    const { data: unreadCountData } = useUnreadNotificationCount({
      user_id: userId || undefined,
      visitor_id: visitorId || undefined,
    });

    const cartCount = cartCountData?.data || 0;
    const unreadCount = unreadCountData?.data?.unread_count ?? 0;

    const ICON_SIZE = spacing(24);
    const textColor = isLight ? colors.text : colors.textInverse;
    const subtitleColor = isLight ? colors.textSecondary : colors.textInverse;

    const handleMoveToCart = () => {
      router.push("/(stack)/cart");
    };

    return (
      <View className="flex-row justify-between items-center px-4 ">
        {/* LEFT */}
        <View className="flex-row items-center gap-3">
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
            onPress={() => router.push("/(stack)/notifications")}
            icon={<Bell size={ICON_SIZE} color={textColor} />}
            badgeCount={unreadCount}
          />
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/profile")}
          >
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={{
                  width: spacing(45),
                  height: spacing(45),
                  borderRadius: spacing(22),
                }}
              />
            ) : (
              <View
                style={{
                  width: spacing(45),
                  height: spacing(45),
                  borderRadius: spacing(22),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="user" size={spacing(24)} color={textColor} />
              </View>
            )}
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
            source={require("../../app/AppIcons/playstore.png")}
            style={{
              width: "78%",
              height: "78%",
            }}
            contentFit="contain"
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
  return name;
};

const formatCategoryDisplayName = (name: string) => {
  const formatted = formatCategoryName(name);
  if (/^agrochemicals$/i.test(formatted)) {
    return "Agro\nChemicals";
  }
  return formatted;
};


const SkeletonRow = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const { width } = useWindowDimensions();
  const H_PAD = spacing(10);
  const itemWidth = (width - H_PAD * 2) / 5;
  const IMAGE_SIZE = spacing(52);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: H_PAD,
        marginTop: spacing(8),
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={{
            width: itemWidth,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: spacing(12),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View
            style={{
              width: itemWidth * 0.75,
              height: spacing(8),
              borderRadius: spacing(4),
              backgroundColor: colors.backgroundSkeleton,
              marginTop: spacing(6),
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
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  const displayCategories = useMemo(
    () => (categories ? categories.slice(0, 5) : []),
    [categories],
  );

  const H_PAD = spacing(10);
  const itemWidth = (screenWidth - H_PAD * 2) / 5;
  const IMAGE_SIZE = spacing(52);

  if (error) {
    return (
      <View className="px-4 py-3">
        <Text style={{ color: colors.textTertiary, fontSize: font(12) }}>
          Unable to load categories.
        </Text>
      </View>
    );
  }

  if (loading) {
    return <SkeletonRow />;
  }

  if (!displayCategories.length) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: H_PAD,
        marginTop: spacing(8),
      }}
    >
      {displayCategories.map((item) => (
        <TouchableOpacity
          key={item.id.toString()}
          activeOpacity={0.75}
          style={{
            width: itemWidth,
            alignItems: "center",
          }}
          onPress={() =>
            router.push({
              pathname: "/(stack)/category/[slug]",
              params: {
                slug: item.id,
                name: item.category_name,
                image: item.category_image ?? "",
              },
            })
          }
        >
          <View
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {item.category_image ? (
              <>
                {/* Soft Spread Black Silhouette Layer */}
                <Image
                  source={{ uri: item.category_image }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 3,
                    left: 0,
                    transform: [{ scale: 1.05 }],
                    opacity: 0.22,
                    tintColor: "#000000",
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                {/* Core Black Silhouette Drop Shadow Layer */}
                <Image
                  source={{ uri: item.category_image }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 2,
                    left: 0,
                    opacity: 0.35,
                    tintColor: "#000000",
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                {/* Foreground Image */}
                <Image
                  source={{ uri: item.category_image }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </>
            ) : (
              <Text
                style={{
                  fontSize: font(16),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.textInverse,
                  textShadowColor: "rgba(0, 0, 0, 0.6)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {item.category_name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            )}
          </View>
          <Text
            numberOfLines={2}
            style={{
              fontSize: font(10),
              color: colors.textInverse,
              textAlign: "center",
              width: itemWidth,
              marginTop: spacing(4),
              lineHeight: font(14),
              fontFamily: "Poppins_500Medium",
            }}
          >
            {formatCategoryDisplayName(item.category_name)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ─────────────────────────────────────────────
// MEMOIZED COMPONENTS
// ─────────────────────────────────────────────

const MemoSlidingBanners = React.memo(SlidingBanners);
const MemoCategoryCardSection = React.memo(CategoryCardSection);
const MemoHomeProduct = React.memo(HomeProduct);
const MemoCustomSections = React.memo(CustomSections);
const MemoFeatureBanner = React.memo(FeatureBanner);
const MemoRecentlyViewProducts = React.memo(RecentlyViewProducts);
const MemoHomeBottomCarousel = React.memo(HomeBottomCarousel);
const MemoTestimonial = React.memo(Testimonial);
const MemoHomeUsp = React.memo(HomeUsp);
const MemoOurServices = React.memo(OurServices);
const MemoDiy = React.memo(Diy);
const MemoBranches = React.memo(Branches);
const MemoFooter = React.memo(Footer);

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const userId = useAppVisitorStore((state) => state.userId);
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  useEffect(() => {
    console.log("user_id:", userId, "visitor_id:", visitorId);
  }, [userId, visitorId]);
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 40],
      [0, 0.25],
      Extrapolation.CLAMP,
    );
    const elevation = interpolate(
      scrollY.value,
      [0, 40],
      [0, 8],
      Extrapolation.CLAMP,
    );

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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity,
      shadowRadius: 8,
      elevation,
    };
  });

  const navbarOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP),
    };
  });

  const { slidingbanners, featureBanners, homeBottomBanners } =
    useHomeBanners();
    console.log("slidingbanners",slidingbanners)
  const { banners: mainBanners } = useAppMainBanner();
  const { banners: headerBanners } = useAppHeaderBanner();
  const { sections: homeProducts } = useHomeProduct();
  const { deals } = useDeals();
  const { featured } = useFeatured();
  const { testimonials } = useTestimonial();
  const { uspList } = useUsp();
  const { branches } = useBranch();
  const { recentlyViewed } = useRecentlyViewed(visitorId || "", userId || "");
  const { products: diyProducts } = useDiyListing();
  const [visibleSectionsCount, setVisibleSectionsCount] = useState(4);
  const promoHeight = useSharedValue(0);

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setBarStyle("light-content", true);
      if (Platform.OS === "android") {
        RNStatusBar.setBackgroundColor("transparent", true);
        RNStatusBar.setTranslucent(true);
      }
    }, [])
  );

  const rawMainBannerUri =
    mainBanners?.[0]?.s3_image_url ||
    mainBanners?.[0]?.mobile_banner_url ||
    mainBanners?.[0]?.desktop_banner_url ||
    mainBanners?.[0]?.s3_image_path ||
    "";

  const rawHeaderBannerUri =
    headerBanners?.[0]?.s3_image_url ||
    headerBanners?.[0]?.mobile_banner_url ||
    headerBanners?.[0]?.desktop_banner_url ||
    headerBanners?.[0]?.s3_image_path ||
    "";

  // Retain last known valid URLs so returning to screen or re-rendering never loses images
  const [persistedMainBannerUri, setPersistedMainBannerUri] = useState("");
  const [persistedHeaderBannerUri, setPersistedHeaderBannerUri] = useState("");

  useEffect(() => {
    if (rawMainBannerUri && rawMainBannerUri !== persistedMainBannerUri) {
      setPersistedMainBannerUri(rawMainBannerUri);
      Image.prefetch(rawMainBannerUri);
    }
  }, [rawMainBannerUri, persistedMainBannerUri]);

  useEffect(() => {
    if (rawHeaderBannerUri && rawHeaderBannerUri !== persistedHeaderBannerUri) {
      setPersistedHeaderBannerUri(rawHeaderBannerUri);
      Image.prefetch(rawHeaderBannerUri);
    }
  }, [rawHeaderBannerUri, persistedHeaderBannerUri]);

  const mainBannerImageUri = rawMainBannerUri || persistedMainBannerUri;
  const headerBannerImageUri = rawHeaderBannerUri || persistedHeaderBannerUri;

  const mainBannerSource = useMemo(
    () => (mainBannerImageUri ? { uri: mainBannerImageUri } : null),
    [mainBannerImageUri],
  );

  const headerBannerSource = useMemo(
    () => (headerBannerImageUri ? { uri: headerBannerImageUri } : null),
    [headerBannerImageUri],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSectionsCount(20);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show promo banner smoothly after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      promoHeight.value = withTiming(106, { duration: 800 });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Smoothly hide promo banner after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (promoHeight.value > 0) {
        promoHeight.value = withTiming(0, { duration: 1000 });
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const lastScrollY = useSharedValue(0);
  const fabVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;

      // Hide promo banner as soon as user scrolls
      if (currentY > 5 && promoHeight.value > 0) {
        promoHeight.value = withTiming(0, { duration: 300 });
      }

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

  const NAVBAR_HEIGHT = spacing(44);
  const SEARCH_HEIGHT = spacing(42);
  const CATEGORY_HEIGHT = spacing(88);
  const CATEGORY_MARGIN_TOP = spacing(8);
  const TOP_PADDING = Platform.OS === "android" ? spacing(10) : 0;
  const BOTTOM_PADDING = spacing(5);
  const GAP = spacing(10);

  const HEADER_HEIGHT_BASE =
    insets.top +
    TOP_PADDING +
    NAVBAR_HEIGHT +
    GAP +
    SEARCH_HEIGHT +
    GAP +
    CATEGORY_MARGIN_TOP +
    CATEGORY_HEIGHT +
    BOTTOM_PADDING;

  const animatedHeaderContainerStyle = useAnimatedStyle(() => {
    return {
      height: HEADER_HEIGHT_BASE + promoHeight.value,
    };
  });

  const promoAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "relative", // Now sits inside header naturally at top
      height: promoHeight.value,
      overflow: "hidden",
      justifyContent: "flex-end", // Aligns content to bottom so the wave slides down first
      zIndex: 10, // above heroImage
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
      { id: "custom_sections" },
      { id: "feature_banner_0", data: featureBanners?.[0] },
      ...(diyProducts && diyProducts.length > 0
        ? [{ id: "diy", data: diyProducts }]
        : []),
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
      diyProducts,
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
        return (
          <View>
            {!!headerBannerSource && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  const headerBanner = headerBanners?.[0];
                  if (!headerBanner) return;
                  if (headerBanner.banner_type === "products") {
                    const isNumeric = !isNaN(Number(headerBanner.redirect));
                    router.push({
                      pathname: "/(stack)/products/[slug]",
                      params: isNumeric
                        ? { id: headerBanner.redirect, slug: "product" }
                        : { slug: headerBanner.redirect, id: "slug" },
                    });
                  } else if (headerBanner.banner_type === "categories") {
                    router.push({
                      pathname: "/(stack)/shop",
                      params: { category_slug: headerBanner.redirect },
                    });
                  }
                }}
              >
                <Image
                  key={`header-banner-${headerBannerImageUri}-${isFocused}`}
                  source={headerBannerSource}
                  style={{ width: "100%", height: 140, marginTop: -1 }}
                  contentFit="fill"
                  cachePolicy="memory-disk"
                  priority="high"
                />
              </TouchableOpacity>
            )}
            <View style={{ marginTop: 15 }}>
              <MemoSlidingBanners data={item.data} />
            </View>
          </View>
        );
      case "category_card_section":
        return <MemoCategoryCardSection />;
      case "home_product":
        return <MemoHomeProduct />;
      case "custom_sections":
        return <MemoCustomSections />;
      case "feature_banner_0":
        return <MemoFeatureBanner item={item.data} />;
      case "diy":
        return <MemoDiy products={item.data} />;
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
  }, [headerBannerSource, headerBannerImageUri, isFocused, headerBanners]);

  if (!isConnected) {
    return <NoInternet onRetry={async () => { await queryClient.refetchQueries(); }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ANIMATED HEADER (Unified with Promo) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: colors.primary,
            overflow: "hidden",
          },
          headerStyle,
          animatedHeaderContainerStyle,
        ]}
      >
        {/* Full Header Background Image from API */}
        {!!mainBannerSource && (
          <View
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          >
            <Image
              key={`main-banner-${mainBannerImageUri}-${isFocused}`}
              source={mainBannerSource}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
          </View>
        )}

        {/* Seamless Promo Banner Top Section */}
        <Animated.View style={promoAnimatedStyle}>
          <PromoBanner />
        </Animated.View>

        <View
          style={{
            paddingTop: insets.top + TOP_PADDING,
            paddingBottom: BOTTOM_PADDING,
            gap: GAP,
            flex: 1,
          }}
        >
          {isFocused && (
            <>
              <RNStatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
              />
              <StatusBar
                style="light"
                backgroundColor="transparent"
                translucent
              />
            </>
          )}

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
        keyExtractor={useCallback((item: any) => item.id, [])}
        renderItem={renderItem}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT_BASE,
          paddingBottom: 50,
        }}
        ListHeaderComponent={useCallback(() => <Animated.View style={{ height: promoHeight }} />, [promoHeight])}
        ItemSeparatorComponent={useCallback(() => <View style={{ height: 15 }} />, [])}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      {/* FLOATING ELEMENTS (Animations Preserved) */}
      <AddToCartPreview horizontalPosition="left" />
      <BulkOrderFAB pbandroid={12} pbios={90} visible={fabVisible} />
    </View>
  );
}
