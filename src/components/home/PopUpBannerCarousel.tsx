import React, { useMemo } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme";
import { PopupBannerImage } from "../../types/home.types";
import { triggerHaptic } from "../../utils/haptics";

const ASPECT_RATIO = 0.5; // Clean 2:1 ratio matching modern popup banner styling (e.g. 1600x800)

interface Props {
  data?: PopupBannerImage[];
  onBannerPress?: (banner: PopupBannerImage) => void;
}

export default function PopUpBannerCarousel({ data, onBannerPress }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // 85% screen width card with tight spacing between banners
  const CARD_WIDTH = SCREEN_WIDTH * 0.85;
  const CARD_HEIGHT = CARD_WIDTH * ASPECT_RATIO;
  // Tuned offset to keep a clean ~8-10px gap while keeping peek on both sides
  const PARALLAX_OFFSET = Math.round(SCREEN_WIDTH * 0.22 - 8);

  // Sort images in ascending order by sequence
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }, [data]);

  // If 2 items, replicate to 4 so loop + left/right adjacent peek functions smoothly
  const carouselData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    if (sortedData.length === 2) {
      return [...sortedData, ...sortedData];
    }
    return sortedData;
  }, [sortedData]);

  if (!sortedData || sortedData.length === 0) {
    return null;
  }

  const handleBannerPress = (banner: PopupBannerImage) => {
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
  };

  const renderBannerItem = (item: PopupBannerImage) => {
    const imageUri = item.url || "";

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: CARD_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => handleBannerPress(item)}
          style={{
            borderRadius: 14,
            overflow: "hidden",
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: colors.backgroundSkeleton,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      </View>
    );
  };

  // If single banner image, render centered directly without carousel overhead
  if (sortedData.length === 1) {
    return (
      <View style={{ width: SCREEN_WIDTH, height: CARD_HEIGHT, marginVertical: 8 }}>
        {renderBannerItem(sortedData[0])}
      </View>
    );
  }

  // Multiple banner images -> Auto-playing carousel with left & right peek
  return (
    <View style={{ width: SCREEN_WIDTH, height: CARD_HEIGHT, marginVertical: 8 }}>
      <Carousel
        width={SCREEN_WIDTH}
        height={CARD_HEIGHT}
        data={carouselData}
        loop={true}
        autoPlay={true}
        autoPlayInterval={3000}
        scrollAnimationDuration={650}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.96,
          parallaxScrollingOffset: PARALLAX_OFFSET,
          parallaxAdjacentItemScale: 0.88,
        }}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]).failOffsetY([-5, 5]);
        }}
        renderItem={({ item }) => renderBannerItem(item)}
      />
    </View>
  );
}
