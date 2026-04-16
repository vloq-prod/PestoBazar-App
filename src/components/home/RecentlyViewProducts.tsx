import { Text, View, ScrollView } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import ItemCard from "../comman/ItemCard";
import { useAppVisitorStore } from "../../store/auth";
import { useQuery } from "@tanstack/react-query";
import { getRecentlyViewed } from "../../api/home.api";

// ─── Skeleton Card ───────────────────────────────────────────────
const SkeletonCard = ({
  spacing,
  colors,
}: {
  spacing: (n: number) => number;
  colors: any;
}) => (
  <View
    style={{
      width: spacing(158),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing(14),
      padding: spacing(10),
      gap: spacing(8),
    }}
  >
    <View
      style={{
        width: "100%",
        aspectRatio: 1,
        borderRadius: spacing(10),
        backgroundColor: colors.backgroundSkeleton,
      }}
    />
    <View
      style={{
        height: spacing(12),
        borderRadius: spacing(6),
        backgroundColor: colors.backgroundSkeleton,
        width: "80%",
      }}
    />
    <View
      style={{
        height: spacing(10),
        borderRadius: spacing(6),
        backgroundColor: colors.backgroundSkeleton,
        width: "55%",
      }}
    />
    <View
      style={{
        height: spacing(14),
        borderRadius: spacing(6),
        backgroundColor: colors.backgroundSkeleton,
        width: "45%",
      }}
    />
    <View
      style={{
        height: spacing(36),
        borderRadius: spacing(10),
        backgroundColor: colors.backgroundSkeleton,
      }}
    />
  </View>
);

const RecentlyViewProducts = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const { data, isLoading } = useQuery({
    queryKey: ["recently-viewed", visitorId],
    queryFn: () =>
      getRecentlyViewed({
        visitor_id: visitorId!,
        user_id: "0",
      }),
    enabled: !!visitorId,
    select: (res) => res?.data?.recently_viewed ?? [],
  });

  const products = data ?? [];

    // console.log("products recenntyly viewed..........", products)
  if (!isLoading && products.length === 0) return null;

  const cardWidth = spacing(158);

  return (
    <View style={{ gap: spacing(14) }}>
      {/* ── Section Header ── */}
      <View style={{ paddingHorizontal: spacing(16), gap: spacing(3) }}>
        <Text
          style={{
            fontSize: font(18),
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
            lineHeight: font(22),
          }}
        >
          Recently Viewed
        </Text>
      </View>

      {/* ── Horizontal Scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing(16),
          gap: spacing(10),
          paddingBottom: spacing(4),
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} spacing={spacing} colors={colors} />
            ))
          : products.map((item, index) => {
              return (
                <View key={index} style={{ width: cardWidth }}>
                  <ItemCard key={index} item={item as any} />
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
};

export default RecentlyViewProducts;
