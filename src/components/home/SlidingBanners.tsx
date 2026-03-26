import { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { useBanner } from "../../hooks/homeHooks";
import { BannerItem } from "../../types/home.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.96;
const ITEM_HEIGHT = ITEM_WIDTH;
const SIDE_GAP = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

// ── Animated Shimmer Skeleton ──
const SkeletonCard = () => {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <View style={{ paddingHorizontal: SIDE_GAP, gap: 10 }}>
      {/* Main banner skeleton */}
      <Animated.View
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          borderRadius: 14,
          backgroundColor: colors.surfaceElevated,
          opacity,
        }}
      />
    </View>
  );
};

interface Props {
  onBannerPress?: (banner: BannerItem) => void;
}

export default function SlidingBanners({ onBannerPress }: Props) {
  const { colors } = useTheme();
  const { banners, loading } = useBanner();
  const [activeIndex, setActiveIndex] = useState(0);

  const data = banners?.sliding_banners ?? [];
  const faeturebaners = banners?.featured_banner ?? [];
  const homeBottomBanners = banners?.home_bottom_banners ?? [];

  if (loading) return <SkeletonCard />;

  // ── Empty ──
  if (!data.length) return null;

  return (
    <View style={{ gap: 10 }}>
      <Carousel
        width={SCREEN_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3000}
        scrollAnimationDuration={800}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.88,
          parallaxScrollingOffset: 50,
          parallaxAdjacentItemScale: 0.88,
        }}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 14,
              overflow: "hidden",
              alignSelf: "center",
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
