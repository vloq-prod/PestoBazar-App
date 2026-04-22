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
  loading?: boolean;
  onBannerPress?: (banner: BannerItem) => void;
}

// ─── Skeleton Banner ─────────────────────────────────────────────────────────

const SkeletonBanner = () => {
  const { colors } = useTheme();

  return (
    <View className="items-center">
      <View
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          borderRadius: 14,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

// ─── Skeleton Carousel ───────────────────────────────────────────────────────

const SkeletonCarousel = () => {
  return (
    <View className="flex-row px-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <View key={index} className="mr-4">
          <SkeletonBanner />
        </View>
      ))}
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
interface banner {
  app_redirect_key: string;
  app_redirect_value: string;
}
export default function SlidingBanners({
  onBannerPress,
  data,
  loading,
}: Props) {
  const { colors } = useTheme();

  const router = useRouter();

  const handleBannerPress = (banner: banner) => {
    const { app_redirect_key, app_redirect_value } = banner;

    console.log("app redite key : ", app_redirect_key);
    console.log("app redite value : ", app_redirect_value);
    if (app_redirect_key === "products") {
      router.push({
        pathname: "(stack)/product/[id]",
        params: {
          id: "slug",
          product_slug: app_redirect_value,
        },
      });
    }

    if (app_redirect_key === "categories") {
      router.push({
        pathname: "(tabs)/shop",
        params: {
          category_slug: app_redirect_value,
        },
      });
    }
  };
  // ✅ Skeleton Handling
  if (loading) {
    return <SkeletonCarousel />;
  }

  if (!data?.length) return null;

  // console.log("sliding data: ", data);
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
            className="self-center rounded-2xl overflow-hidden"
            style={{
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
