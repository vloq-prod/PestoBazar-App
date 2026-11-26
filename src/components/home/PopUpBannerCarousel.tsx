import React, { useCallback, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Extrapolation, interpolate } from "react-native-reanimated";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";
import { PopupBannerImage } from "../../types/home.types";
import { triggerHaptic } from "../../utils/haptics";

// Recommended Banner Image Size: 1400×980 px or 1000×700 px (10:7 / 0.7 ratio; ~680×480 px also fits)
const ASPECT_RATIO = 0.7;
const BORDER_RADIUS = 22;
const ACTIVE_SCALE = 1.0;
const ADJACENT_SCALE = 0.85;
const CARD_GAP = 12;
const AUTO_PLAY_INTERVAL = 5000;

// Critically-damped spring gives Blinkit/iOS-style silky deceleration with zero bounce
const CAROUSEL_WITH_ANIMATION = {
  type: "spring" as const,
  config: {
    duration: 460,
    dampingRatio: 1,
    overshootClamping: true,
  },
};

interface Props {
  data?: PopupBannerImage[];
  onBannerPress?: (banner: PopupBannerImage) => void;
}

interface BannerSlideItemProps {
  item: PopupBannerImage;
  slideWidth: number;
  containerHeight: number;
  cardWidth: number;
  cardHeight: number;
  backgroundColor: string;
  borderColor: string;
  onPress: (item: PopupBannerImage) => void;
}

const BannerSlideItem = React.memo(function BannerSlideItem({
  item,
  slideWidth,
  containerHeight,
  cardWidth,
  cardHeight,
  backgroundColor,
  borderColor,
  onPress,
}: BannerSlideItemProps) {
  const imageUri = item.url || "";

  return (
    <View
      style={{
        width: slideWidth,
        height: containerHeight,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.94}
        onPress={() => onPress(item)}
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: BORDER_RADIUS,
          overflow: "hidden",
          backgroundColor,
          borderWidth: 1.5,
          borderColor,
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    </View>
  );
});

export default function PopUpBannerCarousel({ data, onBannerPress }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Exact Blinkit proportions: 72% active card width, ~42-45px side peek, 12px gap
  const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.72);
  const CARD_HEIGHT = Math.round(CARD_WIDTH * ASPECT_RATIO);
  const CONTAINER_HEIGHT = CARD_HEIGHT;
  // Center-to-center step equals Carousel `width` so finger drag tracks 1:1 pixel-for-pixel
  const CARD_STEP_DISTANCE = Math.round(
    CARD_WIDTH * ((ACTIVE_SCALE + ADJACENT_SCALE) / 2) + CARD_GAP,
  );
  const CENTER_OFFSET = (SCREEN_WIDTH - CARD_STEP_DISTANCE) / 2;

  const solidBorderColor = colors.borderStrong;

  // Sort images in ascending order by sequence
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }, [data]);

  const customAnimation = useCallback(
    (value: number) => {
      "worklet";
      const absValue = Math.abs(value);
      const translateX = value * CARD_STEP_DISTANCE + CENTER_OFFSET;
      const scale = interpolate(
        absValue,
        [0, 1],
        [ACTIVE_SCALE, ADJACENT_SCALE],
        Extrapolation.CLAMP,
      );
      const zIndex = Math.round(
        interpolate(absValue, [0, 1], [100, 10], Extrapolation.CLAMP),
      );

      return {
        transform: [{ translateX }, { scale }],
        zIndex,
      };
    },
    [CARD_STEP_DISTANCE, CENTER_OFFSET],
  );

  const handleBannerPress = useCallback(
    (banner: PopupBannerImage) => {
      triggerHaptic(35);
      onBannerPress?.(banner);

      let key = banner.app_redirect_key;
      let value = banner.app_redirect_value;

      if (!key && banner.redirect && banner.redirect !== "/") {
        const clean = banner.redirect.trim();
        if (clean.includes("/products/")) {
          key = "products";
          value = clean.split("/products/").pop()?.split(/[?#\s]/)[0] ?? "";
        } else if (clean.includes("/categories/")) {
          key = "categories";
          value = clean.split("/categories/").pop()?.split(/[?#\s]/)[0] ?? "";
        } else if (clean.includes("/brands/")) {
          key = "brands";
          value = clean.split("/brands/").pop()?.split(/[?#\s]/)[0] ?? "";
        } else if (clean.startsWith("/")) {
          try {
            router.push(clean as any);
          } catch {}
          return;
        }
      }

      if (key === "products" || key === "product") {
        if (!value) return;
        const isNumeric = !isNaN(Number(value));
        router.push({
          pathname: "/(stack)/products/[slug]",
          params: isNumeric
            ? { id: value, slug: "product" }
            : { slug: value, id: "slug" },
        });
        return;
      }

      if (key === "categories" || key === "category") {
        if (!value) return;
        router.push({
          pathname: "/(stack)/shop",
          params: { category_slug: value },
        });
        return;
      }

      if (key === "brands" || key === "brand") {
        if (!value) return;
        router.push({
          pathname: "/(stack)/shop",
          params: { brand_slug: value },
        });
        return;
      }
    },
    [onBannerPress, router],
  );

  if (!sortedData || sortedData.length === 0) {
    return null;
  }

  // If single banner image, render full padded card without carousel overhead
  if (sortedData.length === 1) {
    const singleCardWidth = SCREEN_WIDTH - 32;
    const singleCardHeight = Math.round(singleCardWidth * ASPECT_RATIO);

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: singleCardHeight,
        }}
      >
        <BannerSlideItem
          item={sortedData[0]}
          slideWidth={SCREEN_WIDTH}
          containerHeight={singleCardHeight}
          cardWidth={singleCardWidth}
          cardHeight={singleCardHeight}
          backgroundColor={colors.backgroundSkeleton}
          borderColor={solidBorderColor}
          onPress={handleBannerPress}
        />
      </View>
    );
  }

  // Multiple banner images -> Blinkit-style 1:1 swipe + 5s smooth auto-scroll carousel
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: CONTAINER_HEIGHT,
      }}
    >
      <Carousel
        width={CARD_STEP_DISTANCE}
        height={CONTAINER_HEIGHT}
        style={{ width: SCREEN_WIDTH, overflow: "hidden" }}
        data={sortedData}
        loop={true}
        autoFillData={true}
        autoPlay={true}
        autoPlayInterval={AUTO_PLAY_INTERVAL}
        withAnimation={CAROUSEL_WITH_ANIMATION}
        customAnimation={customAnimation}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-8, 8]).failOffsetY([-12, 12]);
        }}
        renderItem={({ item }) => (
          <BannerSlideItem
            item={item}
            slideWidth={CARD_STEP_DISTANCE}
            containerHeight={CONTAINER_HEIGHT}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            backgroundColor={colors.backgroundSkeleton}
            borderColor={solidBorderColor}
            onPress={handleBannerPress}
          />
        )}
      />
    </View>
  );
}
