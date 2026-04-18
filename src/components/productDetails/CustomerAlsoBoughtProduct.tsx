import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useCustomerAlsoBought } from "../../hooks/productDetailsHook";
import ItemCard from "../comman/ItemCard";
import { useAddToCart } from "../../hooks/cartHooks";
import { useAppVisitorStore } from "../../store/auth";

// ─── Skeleton Card ───────────────────────────────────────────────
const SkeletonCard = ({
  spacing,
  colors,
}: {
  spacing: (n: number) => number;
  colors: any;
}) => {
  const cardWidth = spacing(158);
  return (
    <View
      style={{
        width: cardWidth,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing(14),
        padding: spacing(10),
        gap: spacing(8),
      }}
    >
      {/* image skeleton */}
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: spacing(10),
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      {/* title skeleton */}
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
      {/* price skeleton */}
      <View
        style={{
          height: spacing(14),
          borderRadius: spacing(6),
          backgroundColor: colors.backgroundSkeleton,
          width: "45%",
        }}
      />
      {/* button skeleton */}
      <View
        style={{
          height: spacing(36),
          borderRadius: spacing(10),
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────
interface Props {
  productId: number;
}

const BASE_URL = "https://static-cdn.pestobazaar.com";

const CustomerAlsoBoughtProduct = ({ productId }: Props) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const { addToCart } = useAddToCart();
  const visitorId = useAppVisitorStore((s) => s.visitorId);

  const { products, loading } = useCustomerAlsoBought({
    product_id: productId,
  });
  // console.log("products: ", products);

  // hide section if no data and not loading
  if (!loading && products.length === 0) return null;

  const cardWidth = spacing(158);

  return (
    <View style={{ gap: spacing(14) }}>
      {/* ── Section Header ── */}
      <View style={{ paddingHorizontal: spacing(16), gap: spacing(3) }}>
        <Text
          style={{
            fontSize: font(18),
            fontFamily: "Poppins_700Bold",
            color: colors.text,
            lineHeight: font(22),
          }}
        >
          Customer Also Bought
        </Text>
        <Text
          style={{
            fontSize: font(12),
            fontFamily: "Poppins_400Regular",
            color: colors.textSecondary,
            lineHeight: font(18),
          }}
        >
          Frequently Bought Together by Other Customers
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
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} spacing={spacing} colors={colors} />
            ))
          : products.map((item) => {
              const updatedItem = {
                ...item,
                s3_image_path: item.s3_image_path
                  ? `${BASE_URL}${item.s3_image_path}`
                  : null,
              };

              return (
                <View
                  key={item.product_variation_id}
                  style={{ width: cardWidth }}
                >
                  <ItemCard
                    item={updatedItem as any}
                    onAddToCart={(item, qty) =>
                      addToCart({
                        visitor_id: visitorId,
                        product_id: item.id,
                        qty,
                      })
                    }
                  />
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
};

export default CustomerAlsoBoughtProduct;

const styles = StyleSheet.create({});
