import React, { useState } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import TopImage from "../../../assets/Top_banner.svg"

const SIDE_PADDING = 16 ;
const ASPECT_RATIO = 0.5;

interface Props {
  data: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonCarousel = () => {
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const IMAGE_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
  const IMAGE_HEIGHT = IMAGE_WIDTH * ASPECT_RATIO;

  return (
    <View style={{ paddingHorizontal: SIDE_PADDING }}>
      <View
        style={{
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          borderRadius: 14,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────────
export default function SlidingBanners({ data, onBannerPress }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const IMAGE_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
  const IMAGE_HEIGHT = IMAGE_WIDTH * ASPECT_RATIO;

  if (!data?.length) {
    return <SkeletonCarousel />;
  }

  const handleBannerPress = (banner: BannerItem) => {
    const { app_redirect_key, app_redirect_value } = banner;

    if (app_redirect_key === "products") {
      router.push({
        pathname: "(stack)/product/[id]",
        params: { id: "slug", product_slug: app_redirect_value },
      });
    }

    if (app_redirect_key === "categories") {
      router.push({
        pathname: "(stack)/shop",
        params: { category_slug: app_redirect_value },
      });
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Carousel
        width={SCREEN_WIDTH}           // ← full width scroll unit
        height={IMAGE_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          // paddingHorizontal yahan — image chhota, scroll full width
          <View style={{ paddingHorizontal: SIDE_PADDING }}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => {
                onBannerPress?.(item);
                handleBannerPress(item);
              }}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                backgroundColor: colors.backgroundSkeleton,
              }}
            >
              <Image
                source={TopImage}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {data.map((item, index) => (
          <View
            key={`${item.s3_image_path}-${index}`}
            style={{
              width: activeIndex === index ? 16 : 6,
              height: 6,
              borderRadius: 999,
              backgroundColor:
                activeIndex === index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}