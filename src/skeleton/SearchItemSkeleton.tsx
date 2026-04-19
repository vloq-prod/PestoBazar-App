import { View } from "react-native";
import React from "react";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

const SearchItemSkeleton = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing(10),
        paddingHorizontal: spacing(4),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing(10),
      }}
    >
      {/* Image Skeleton */}
      <View
        style={{
          width: spacing(54),
          height: spacing(54),
          borderRadius: 12,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />

      {/* Text Skeleton */}
      <View style={{ flex: 1 }}>
        {/* Title */}
        <View
          style={{
            width: "80%",
            height: spacing(12),
            borderRadius: 4,
            backgroundColor: colors.backgroundSkeleton,
          }}
        />

        {/* Price Row */}
        <View
          style={{
            flexDirection: "row",
            marginTop: spacing(6),
            gap: spacing(6),
          }}
        >
          <View
            style={{
              width: 50,
              height: spacing(10),
              borderRadius: 4,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View
            style={{
              width: 40,
              height: spacing(10),
              borderRadius: 4,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View
            style={{
              width: 30,
              height: spacing(10),
              borderRadius: 4,
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
        </View>
      </View>

      {/* Right Icon Skeleton */}
      <View
        style={{
          width: spacing(16),
          height: spacing(16),
          borderRadius: 8,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

export default SearchItemSkeleton;
