import React, { useMemo } from "react";
import { View, Text, useWindowDimensions, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useAppVisitorStore } from "../../store/auth";
import { getRecentlyViewed } from "../../api/home.api";
import { getImageUrl } from "../../utils/imageUtils";
import ItemCard from "../comman/ItemCard";

// ─── Skeleton Card (matches ItemCard UI) ───────────────────────
const SkeletonCard = ({ width, colors }: { width: number; colors: any }) => (
  <View style={{ width, gap: 6 }}>
    <View
      style={{
        width: "100%",
        aspectRatio: 1.15,
        borderRadius: 10,
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
        height: 28,
        backgroundColor: colors.backgroundSkeleton,
        borderRadius: 8,
        marginTop: 2,
      }}
    />
  </View>
);

const CartRecentlyViewed: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { width } = useWindowDimensions();
  const { visitorId, userId } = useAppVisitorStore((state) => state);

  const { data, isLoading } = useQuery({
    queryKey: ["recently-viewed", visitorId, userId],
    queryFn: () =>
      getRecentlyViewed({
        visitor_id: visitorId || "",
        user_id: userId ? String(userId) : "",
      }),
    enabled: !!(visitorId || userId),
    select: (res) => res?.data?.recently_viewed ?? [],
  });

  const rawProducts = data ?? [];

  // De-duplicate recently viewed products by unique variation/product ID
  const displayProducts = useMemo(() => {
    const seenIds = new Set<number | string>();
    const uniqueProducts: any[] = [];
    for (const item of rawProducts) {
      const id = item.product_variation_id || item.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        const slug = (item.url ? item.url.split("/").pop() : "") || "";
        const s3Path = getImageUrl(item.s3_image_path || item.image_path) || undefined;

        uniqueProducts.push({
          ...item,
          id,
          product_id: id,
          slug,
          product_slug: slug || item.url,
          s3_image_path: s3Path,
        });
      }
    }
    // Maximum 6 products in carousel
    return uniqueProducts.slice(0, 6);
  }, [rawProducts]);

  if (!isLoading && displayProducts.length === 0) {
    return null;
  }

  const BOX_PADDING = spacing(12);
  const itemWidth = Math.round(spacing(98));

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing(14),
        borderWidth: 1,
        borderColor: colors.border,
        padding: BOX_PADDING,
        gap: spacing(12),
        overflow: "hidden",
      }}
    >
      {/* ── Box Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(6) }}>
            <History size={16} color={colors.primary} />
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(13.5),
                color: colors.text,
              }}
            >
              Recently Viewed
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(10.5),
              color: colors.textSecondary,
            }}
          >
            Products you recently checked out
          </Text>
        </View>
      </View>

      {/* ── Horizontal Scroll of Products ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing(10),
          paddingRight: spacing(4),
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`recent-skeleton-${i}`} width={itemWidth} colors={colors} />
            ))
          : displayProducts.map((item, index) => (
              <View key={`recent-${item.id}-${index}`} style={{ width: itemWidth }}>
                <ItemCard item={item as any} />
              </View>
            ))}
      </ScrollView>
    </View>
  );
};

export default React.memo(CartRecentlyViewed);
