import React from "react";
import { View, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH * 0.84;
const ITEM_HEIGHT = ITEM_WIDTH * 0.48;

interface Props {
  data: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

interface BannerRedirect {
  app_redirect_key: string;
  app_redirect_value: string;
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

  // ✅ Show skeleton immediately when data not yet arrived
  if (!data?.length) {
    return <SkeletonCarousel />;
  }

  const handleBannerPress = (banner: BannerRedirect) => {
    const { app_redirect_key, app_redirect_value } = banner;

    if (app_redirect_key === "products") {
      router.push({
        pathname: "(stack)/product/[id]",
        params: { id: "slug", product_slug: app_redirect_value },
      });
    }

    if (app_redirect_key === "categories") {
      router.push({
        pathname: "(tabs)/shop",
        params: { category_slug: app_redirect_value },
      });
    }
  };

  return (
    <View>
      <Carousel
        width={SCREEN_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={650}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 70,
          parallaxAdjacentItemScale: 0.88,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => handleBannerPress(item)}
            style={{
              alignSelf: "center",
              borderRadius: 16,
              overflow: "hidden",
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              backgroundColor: colors.backgroundSkeleton,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 5,
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
    </View>
  );
}
