import { Dimensions, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import ItemCard from "../comman/ItemCard";
import { useAppVisitorStore } from "../../store/auth";
import { useQuery } from "@tanstack/react-query";
import { getRecentlyViewed } from "../../api/home.api";
import type { RecentlyViewedItem } from "../../types/home.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PADDING = 16;
const GAP = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;

// ─── Skeleton Card (matches ItemCard grid UI) ───────────────────────
const SkeletonCard = ({ colors }: { colors: any }) => (
  <View style={{ width: ITEM_WIDTH, gap: 6 }}>
    <View
      style={{
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: colors.backgroundSkeleton,
      }}
    />
    <View
      style={{
        height: 10,
        width: "80%",
        backgroundColor: colors.backgroundSkeleton,
        borderRadius: 4,
      }}
    />
    <View
      style={{
        height: 8,
        width: "55%",
        backgroundColor: colors.backgroundSkeleton,
        borderRadius: 4,
      }}
    />
    <View
      style={{
        height: 32,
        backgroundColor: colors.backgroundSkeleton,
        borderRadius: 8,
        marginTop: 2,
      }}
    />
  </View>
);

const BASE_URL = "https://static-cdn.pestobazaar.com";

const RecentlyViewProducts = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { visitorId, userId } = useAppVisitorStore((state) => state);

  const { data, isLoading } = useQuery({
    queryKey: ["recently-viewed", visitorId],
    queryFn: () =>
      getRecentlyViewed({
        visitor_id: visitorId!,
        user_id: userId ?? "0",
      }),
    enabled: !!visitorId,
    select: (res) => res?.data?.recently_viewed ?? [],
  });

  const rawProducts = data ?? [];

  if (!isLoading && rawProducts.length === 0) return null;

  // De-duplicate recently viewed products by unique variation/product ID
  const seenIds = new Set<number | string>();
  const uniqueProducts: RecentlyViewedItem[] = [];
  for (const item of rawProducts) {
    const id = item.product_variation_id || item.id;
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      uniqueProducts.push(item);
    }
  }

  // Maximum 6 products (3 columns x 2 rows grid like CustomSections)
  const displayProducts = uniqueProducts.slice(0, 6).map((item) => {
    const slug = (item.url ? item.url.split("/").pop() : "") || "";
    const s3Path = item.s3_image_path
      ? item.s3_image_path.startsWith("http")
        ? item.s3_image_path
        : `${BASE_URL}${item.s3_image_path}`
      : undefined;

    return {
      ...item,
      id: item.product_variation_id || item.id,
      product_id: item.product_variation_id || item.id,
      slug: slug,
      product_slug: slug || item.url,
      s3_image_path: s3Path,
    };
  });

  return (
    <View style={{ gap: spacing(14) }}>
      {/* ── Section Header ── */}
      <View style={{ paddingHorizontal: spacing(16), gap: spacing(1) }}>
        <Text
          style={{
            fontSize: font(15),
            fontFamily: "Poppins_700Bold",
            color: colors.text,
            lineHeight: font(22),
          }}
        >
          Recently Viewed
        </Text>
        <Text
          style={{
            fontSize: font(11),
            lineHeight: 18,
            color: colors.textSecondary,
            fontFamily: "Poppins_400Regular",
          }}
        >
          Browse The Collection You Viewed
        </Text>
      </View>

      {/* ── 3 Columns x 2 Rows Grid (Like CustomSections) ── */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: PADDING,
          columnGap: GAP,
          rowGap: 12,
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <View key={`skeleton-${i}`} style={{ width: ITEM_WIDTH }}>
                <SkeletonCard colors={colors} />
              </View>
            ))
          : displayProducts.map((item: any, index: number) => (
              <View key={`recent-${item.id}-${index}`} style={{ width: ITEM_WIDTH }}>
                <ItemCard item={item as any} />
              </View>
            ))}
      </View>
    </View>
  );
};

export default RecentlyViewProducts;
