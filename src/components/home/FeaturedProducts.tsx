import React, { useCallback } from "react";
import { View, Text, FlatList, ListRenderItemInfo } from "react-native";
import { useFeatured } from "../../hooks/homeHooks";
import { FeaturedItem } from "../../types/home.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import ProductCard, { SkeletonCard } from "../comman/ProductCard";

// ─── Main ─────────────────────────────────────────────────────────────────────

const FeaturedProducts: React.FC = () => {
  const { featured, loading } = useFeatured();
  const { colors } = useTheme();
  const { wp, getResponsiveFontSize: fs } = useResponsive();

  const CARD_WIDTH = wp(82);
  const SEPARATOR = wp(3.5);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeaturedItem>) => (
      <ProductCard
        item={{
          id: item.id,
          product_name: item.product_name,
          mrp: item.mrp,
          selling_price: item.selling_price,
          overview: item.overview,
          expiry_date: item.expiry_date,
          s3_image_path: item.s3_image_path,
          images: item.images,
        }}
        cardWidth={CARD_WIDTH}
        onPress={() => {
          // TODO: navigate to product detail using item.slug
        }}
      />
    ),
    [CARD_WIDTH],
  );

  return (
    <View style={{ gap: 10 }}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4">
        <View>
          <Text
            style={{
              fontSize: 24,
              color: colors.text,
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            Featured Products
          </Text>
        </View>
      </View>

      {/* ── Cards ── */}
      {loading ? (
        <View
          className="flex-row"
          style={{ paddingLeft: SEPARATOR, gap: SEPARATOR }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} cardWidth={CARD_WIDTH} />
          ))}
        </View>
      ) : (
        <FlatList
          data={featured}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SEPARATOR }}
          ItemSeparatorComponent={() => <View style={{ width: SEPARATOR }} />}
          snapToInterval={CARD_WIDTH + SEPARATOR}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      )}
    </View>
  );
};

export default FeaturedProducts;
