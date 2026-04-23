import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
} from "react-native";
import { useDeals } from "../../hooks/homeHooks";
import { DealItem } from "../../types/home.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import ProductCard, { SkeletonCard } from "../ProductCard/ProductCard";
import { useRouter } from "expo-router";

const SKELETON_COUNT = 2;

const DealsOfTheDay: React.FC = () => {
  const { deals, loading } = useDeals();
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const CARD_SPACING = spacing(10);
  const EDGE_PADDING = spacing(16);
  const CARD_WIDTH = spacing(310);
  const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DealItem>) => (
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
        onPress={() =>
          router.push({
            pathname: "(stack)/product/[id]",
            params: {
              id: item.id,
              product_name: item.product_name,
            },
          })
        }
      />
    ),
    [CARD_WIDTH],
  );

  const keyExtractor = useCallback((item: DealItem) => String(item.id), []);

  const ItemSeparator = useCallback(
    () => <View style={{ width: CARD_SPACING }} />,
    [CARD_SPACING],
  );

  const contentContainerStyle = {
    paddingHorizontal: EDGE_PADDING,
  };

  return (
    <View style={[styles.section, { gap: spacing(12) }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingHorizontal: EDGE_PADDING }]}>
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: font(22),
            color: colors.text,
            includeFontPadding: false,
          }}
        >
          Deals of the Day
        </Text>
      </View>

      {/* ── Cards / Skeleton ── */}
      {loading ? (
        <View
          style={[
            styles.skeletonRow,
            {
              paddingHorizontal: EDGE_PADDING,
              gap: CARD_SPACING,
            },
          ]}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} cardWidth={CARD_WIDTH} />
          ))}
        </View>
      ) : (
        <FlatList
          data={deals}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          ItemSeparatorComponent={ItemSeparator}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
};

export default React.memo(DealsOfTheDay);

const styles = StyleSheet.create({
  section: {
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonRow: {
    flexDirection: "row",
  },
});
