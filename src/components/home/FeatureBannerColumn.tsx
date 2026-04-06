import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";

interface Props {
  item?: BannerItem;
  loading?: boolean;
  onPress?: (item: BannerItem) => void;
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

export default function FeatureBanner({
  item,
  loading,
  onPress,
}: Props) {
  const { colors } = useTheme();

  // ✅ Skeleton State
  if (loading) {
    return <SkeletonBanner />;
  }

  // ✅ No Data
  if (!item) return null;

  return (
    <View className="px-4">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
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
          source={{ uri: item.s3_image_path }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          className="rounded-xl"
        />
      </TouchableOpacity>
    </View>
  );
}