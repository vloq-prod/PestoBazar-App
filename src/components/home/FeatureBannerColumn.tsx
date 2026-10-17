import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";
import { useRouter } from "expo-router";
import { getBannerImageUrl } from "../../utils/imageUtils";

interface Props {
  item?: BannerItem;
  loading?: boolean;
  onPress?: (item: BannerItem) => void;
}

interface BannerRedirect {
  app_redirect_key: string;
  app_redirect_value: string;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonBanner = () => {
  const { colors } = useTheme();

  return (
    <View className="px-4">
      <View
        className="rounded-2xl"
        style={{
          width: "100%",
          height: 99,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FeatureBanner({ item, loading, onPress }: Props) {
  const { colors } = useTheme();
  const router = useRouter();

  // ✅ Skeleton State
  if (loading) {
    return <SkeletonBanner />;
  }

  // ✅ No Data
  if (!item) return null;

  const imageUri = getBannerImageUrl(item);
  if (!imageUri) return null;

  const handleBannerNavigation = ({
    app_redirect_key,
    app_redirect_value,
  }: BannerRedirect) => {
    if (!app_redirect_key || !app_redirect_value) return;

    if (app_redirect_key === "products") {
      const isNumeric = !isNaN(Number(app_redirect_value));
      router.push({
        pathname: "/(stack)/products/[slug]",
        params: isNumeric
          ? { id: app_redirect_value, slug: "product" }
          : { slug: app_redirect_value, id: "slug" },
      });
      return;
    }

    if (app_redirect_key === "categories") {
      router.push({
        pathname: "/(stack)/shop",
        params: {
          category_slug: app_redirect_value,
        },
      });
      return;
    }
  };

  return (
    <View className="px-4">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          onPress?.(item);
          handleBannerNavigation(item);
        }}
        className="rounded-2xl overflow-hidden"
        style={{
          width: "100%",
          height: 99,
          borderWidth: 1,
          padding: 2,
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: "100%", borderRadius: 12 }}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    </View>
  );
}
