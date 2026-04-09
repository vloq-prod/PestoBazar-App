// components/ProductCard/ProductCard.tsx

import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import ProductMedia from "./ProductMedia";
import ProductInfo from "./ProductInfo";
import ProductTimer from "./ProductTimer";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { resolveImages } from "../../utils/productHelpers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductCardItem {
  id: number;
  product_name: string;
  mrp: string;
  selling_price: string;
  overview?: string | null;
  expiry_date: string;
  s3_image_path?: string;
  images?: string[];
}

interface ProductCardProps {
  item: ProductCardItem;
  cardWidth: number;
  onPress?: () => void;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({ item, cardWidth, onPress }) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  const images = resolveImages(item.images, item.s3_image_path);

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          borderRadius: spacing(16),
        },
      ]}
    >
      <ProductMedia images={images} cardWidth={cardWidth} />

      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.border,
            marginHorizontal: spacing(12),
          },
        ]}
      />

      <View
        style={[
          styles.infoSection,
          {
            paddingHorizontal: spacing(12),
            paddingTop: spacing(10),
            paddingBottom: spacing(12),
            gap: spacing(8),
          },
        ]}
      >
        <ProductInfo
          name={item.product_name}
          overview={item.overview}
          mrp={item.mrp}
          sellingPrice={item.selling_price}
        />

        <ProductTimer expiryDate={item.expiry_date} onPress={handlePress} />
      </View>
    </View>
  );
};

export default React.memo(ProductCard);

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ cardWidth: number }> = (
  ({ cardWidth }) => {
    const { colors } = useTheme();
    const { spacing } = useResponsive();

    const pad = spacing(8);
    const thumbW = spacing(52);
    const gap = spacing(8);
    const imgSize = cardWidth - pad * 2 - thumbW - gap;

    return (
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            borderRadius: spacing(16),
          },
        ]}
      >
        {/* Media skeleton */}
        <View
          style={[
            styles.skeletonMediaRow,
            { padding: pad, gap },
          ]}
        >
          <View
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: spacing(12),
              backgroundColor: colors.backgroundSkeleton,
            }}
          />
          <View style={{ width: thumbW, gap: spacing(6) }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width: thumbW,
                  height: thumbW,
                  borderRadius: spacing(8),
                  backgroundColor: colors.backgroundSkeleton,
                }}
              />
            ))}
          </View>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.border,
              marginHorizontal: spacing(12),
            },
          ]}
        />

        {/* Info skeleton */}
        <View
          style={[
            styles.infoSection,
            {
              paddingHorizontal: spacing(12),
              paddingTop: spacing(12),
              paddingBottom: spacing(12),
              gap: spacing(10),
            },
          ]}
        >
          {[75, 55, 45, 100].map((w, i) => (
            <View
              key={i}
              style={{
                height: i === 2 ? spacing(28) : spacing(10),
                width: `${w}%`,
                borderRadius: spacing(4),
                backgroundColor: colors.backgroundSkeleton,
              }}
            />
          ))}

          {/* Timer skeleton */}
          <View style={{ gap: spacing(6) }}>
            <View
              style={{
                height: spacing(8),
                width: "40%",
                borderRadius: spacing(4),
                backgroundColor: colors.backgroundSkeleton,
              }}
            />
            <View style={[styles.skeletonTimerRow, { gap: spacing(6) }]}>
              <View style={[styles.skeletonTimerUnits, { gap: spacing(3) }]}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: spacing(38),
                      height: spacing(40),
                      borderRadius: spacing(8),
                      backgroundColor: colors.backgroundSkeleton,
                    }}
                  />
                ))}
              </View>
              <View
                style={{
                  flex: 1,
                  height: spacing(36),
                  borderRadius: spacing(8),
                  backgroundColor: colors.backgroundSkeleton,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  infoSection: {},
  skeletonMediaRow: {
    flexDirection: "row",
  },
  skeletonTimerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonTimerUnits: {
    flexDirection: "row",
    alignItems: "center",
  },
});