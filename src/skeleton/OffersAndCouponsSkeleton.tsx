import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

// ─── Single Shimmer Bone ──────────────────────────────────────
export const SkeletonBone = ({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) => {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.95]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundSkeleton,
        },
        animStyle,
        style,
      ]}
    />
  );
};

// ─── Free Gift Offers Skeleton ──────────────────────────────
export const FreeGiftOffersSkeleton = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  return (
    <View
      style={{
        marginHorizontal: spacing(16),
        marginTop: spacing(12),
        borderWidth: 1.2,
        borderColor: colors.border,
        borderRadius: spacing(12),
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      {/* Header Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing(11),
          paddingHorizontal: spacing(14),
          gap: spacing(10),
          backgroundColor: colors.background,
        }}
      >
        <SkeletonBone width={30} height={30} borderRadius={15} />
        <SkeletonBone width="50%" height={16} borderRadius={6} />
      </View>

      {/* Divider Skeleton */}
      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* Body Skeleton */}
      <View style={{ padding: spacing(14), gap: spacing(14) }}>
        <SkeletonBone width="75%" height={14} borderRadius={4} />

        {/* Product Item Row Skeleton */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(12),
          }}
        >
          {/* Product Image */}
          <SkeletonBone
            width={spacing(65)}
            height={spacing(65)}
            borderRadius={spacing(8)}
          />

          {/* Product Info */}
          <View style={{ flex: 1, gap: spacing(6) }}>
            <SkeletonBone width="85%" height={14} borderRadius={4} />
            <SkeletonBone width="40%" height={12} borderRadius={4} />
          </View>

          {/* Badge Tag */}
          <SkeletonBone width={45} height={22} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

// ─── Available Coupons Skeleton ──────────────────────────────
export const AvailableCouponsSkeleton = () => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  return (
    <View
      style={{
        marginHorizontal: spacing(16),
        marginTop: spacing(12),
        borderWidth: 1.2,
        borderColor: colors.border,
        borderRadius: spacing(12),
        backgroundColor: colors.surface,
        overflow: "hidden",
      }}
    >
      {/* Header Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing(11),
          paddingHorizontal: spacing(14),
          gap: spacing(10),
          backgroundColor: colors.background,
        }}
      >
        <SkeletonBone width={30} height={30} borderRadius={15} />
        <SkeletonBone width="55%" height={16} borderRadius={6} />
      </View>

      {/* Divider Skeleton */}
      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* Body Skeleton */}
      <View style={{ padding: spacing(14), gap: spacing(12) }}>
        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(12),
            gap: spacing(10),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                gap: spacing(10),
              }}
            >
              <SkeletonBone width={38} height={38} borderRadius={8} />
              <View style={{ flex: 1, gap: spacing(6) }}>
                <SkeletonBone width="60%" height={15} borderRadius={4} />
                <SkeletonBone width="40%" height={12} borderRadius={4} />
              </View>
            </View>
            <SkeletonBone width={70} height={30} borderRadius={6} />
          </View>
          <SkeletonBone width="80%" height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};
