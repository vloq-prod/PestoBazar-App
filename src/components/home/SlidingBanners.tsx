import React, { useState } from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.90;
const ITEM_HEIGHT = ITEM_WIDTH * 0.50;

interface Props {
  data: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonCarousel = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: ITEM_WIDTH + 40,
          height: ITEM_HEIGHT,
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
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Show skeleton immediately when data not yet arrived
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
    <View style={{ gap: 8,  }}>
      <Carousel
        width={SCREEN_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => {
              onBannerPress?.(item);
              handleBannerPress(item);
            }}
            style={{
              alignSelf: "center",
              borderRadius: 12,
              overflow: "hidden",
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              backgroundColor: colors.backgroundSkeleton,
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
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
