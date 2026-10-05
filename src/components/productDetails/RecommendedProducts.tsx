import { Dimensions, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useTaggedProducts } from "../../hooks/productDetailsHook";
import { getImageUrl } from "../../utils/imageUtils";
import ItemCard from "../comman/ItemCard";

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

interface Props {
  productId: number;
}

const RecommendedProducts = ({ productId }: Props) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const { products: rawProducts, loading } = useTaggedProducts(productId);

  // Hide section if no data and not loading
  if (!loading && (!rawProducts || rawProducts.length === 0)) return null;

  // De-duplicate products by variation/product ID
  const seenIds = new Set<number | string>();
  const uniqueProducts: any[] = [];
  for (const item of rawProducts ?? []) {
    const id = item.product_variation_id || item.product_id || item.id;
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      uniqueProducts.push(item);
    }
  }

  // Maximum 6 products (3 columns x 2 rows grid like CustomSections)
  const displayProducts = uniqueProducts.slice(0, 6).map((item) => {
    const slug = item.slug || (item.url ? item.url.split("/").pop() : "") || "";
    const s3Path = getImageUrl(item.s3_image_path) || undefined;

    return {
      ...item,
      id: item.product_variation_id || item.id,
      product_id: item.product_id || item.id,
      product_variation_id: item.product_variation_id || item.id,
      slug: slug,
      product_slug: slug || item.url,
      s3_image_path: s3Path,
      mrp: String(item.mrp ?? 0),
      selling_price: String(item.selling_price ?? 0),
    };
  });

  return (
    <View style={{ gap: spacing(14) }}>
      {/* ── Section Header ── */}
      <View style={{ paddingHorizontal: spacing(16) }}>
        <Text
          style={{
            fontSize: font(15),
            fontFamily: "Poppins_700Bold",
            color: colors.text,
            lineHeight: font(22),
          }}
        >
          Recommended Products
        </Text>
        <Text
          style={{
            fontSize: font(11),
            fontFamily: "Poppins_400Regular",
            color: colors.textSecondary,
            lineHeight: font(18),
          }}
        >
          Useful products to complement your needs.
        </Text>
      </View>

      {/* ── 3 Columns Grid ── */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: PADDING,
          columnGap: GAP,
          rowGap: 12,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <View key={`skeleton-rec-${i}`} style={{ width: ITEM_WIDTH }}>
                <SkeletonCard colors={colors} />
              </View>
            ))
          : displayProducts.map((item, index) => (
              <View key={`rec-${item.id}-${index}`} style={{ width: ITEM_WIDTH }}>
                <ItemCard item={item as any} />
              </View>
            ))}
      </View>
    </View>
  );
};

export default RecommendedProducts;
