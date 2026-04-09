// components/ProductCard/ProductInfo.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { formatPrice, getDiscountPercent } from "../../utils/productHelpers";

interface ProductInfoProps {
  name: string;
  overview?: string | null;
  mrp: string;
  sellingPrice: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  overview,
  mrp,
  sellingPrice,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const discount = getDiscountPercent(mrp, sellingPrice);
  const hasMrp = parseFloat(mrp) > parseFloat(sellingPrice);

  return (
    <View
      style={[
        styles.container,
        {
          gap: spacing(4),
          backgroundColor: colors.surfaceElevated,
        },
      ]}
    >
      {/* Name */}
      <Text
        numberOfLines={2}
        style={[
          styles.name,
          {
            fontFamily: "Poppins_500Medium",
            fontSize: font(14),
            color: colors.text,
            lineHeight: font(20),
          },
        ]}
      >
        {name}
      </Text>

      {/* Overview */}
      {!!overview && (
        <Text
          numberOfLines={2}
          style={[
            styles.overview,
            {
              fontFamily: "Poppins_400Regular",
              fontSize: font(12),
              color: colors.textTertiary,
              lineHeight: font(18),
            },
          ]}
        >
          {overview}
        </Text>
      )}

      {/* Price row */}
      <View style={[styles.priceRow, { gap: spacing(5) }]}>
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: font(20),
            color: colors.text,
            lineHeight: font(28),
          }}
        >
          {formatPrice(sellingPrice)}
        </Text>

        {hasMrp && (
          <>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(13),
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                lineHeight: font(28),
              }}
            >
              {formatPrice(mrp)}
            </Text>

            {discount > 0 && (
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: font(13),
                  color: colors.error,
                  lineHeight: font(28),
                  letterSpacing: 0.2,
                }}
              >
                {discount}% off
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default React.memo(ProductInfo);

const styles = StyleSheet.create({
  container: {},
  name: {},
  overview: {},
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});
