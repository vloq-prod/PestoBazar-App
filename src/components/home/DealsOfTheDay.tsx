import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ListRenderItemInfo,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useDeals } from "../../hooks/homeHooks";
import { DealItem } from "../../types/home.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price: string): string =>
  `₹${parseFloat(price).toLocaleString("en-IN")}`;

const getExpiryLabel = (
  dateStr: string,
): { label: string; urgent: boolean } => {
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return { label: "Expired", urgent: true };
  if (diffH < 1) return { label: "Ends in < 1h", urgent: true };
  if (diffH < 24) return { label: `Ends in ${diffH}h`, urgent: true };
  if (diffD === 1) return { label: "Ends tomorrow", urgent: false };
  return { label: `Ends in ${diffD}d`, urgent: false };
};

const StarRating: React.FC<{
  rating: string;
  size?: number;
  color: string;
}> = ({ rating, size = 11, color }) => {
  const val = parseFloat(rating) || 0;
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = val >= i;
        const half = !filled && val >= i - 0.5;
        return (
          <Text key={i} style={{ fontSize: size, color: color }}>
            {filled ? "★" : half ? "⯨" : "☆"}
          </Text>
        );
      })}
    </View>
  );
};

// ─── Image Carousel (inside card) ───────────────────────────────────────────

const ImageCarousel: React.FC<{
  images: string[];
  width: number;
  height: number;
  accentColor: string;
}> = ({ images, width, height, accentColor }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const allImages = images.length > 0 ? images : [""];

  return (
    <View style={{ width, height, position: "relative" }}>
      <Carousel
        width={width}
        height={height}
        data={allImages}
        loop={allImages.length > 1}
        autoPlay={allImages.length > 1}
        autoPlayInterval={3000}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }: { item: string }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height, borderRadius: 0 }}
            resizeMode="cover"
          />
        )}
      />

      {/* Dot indicators */}
      {allImages.length > 1 && (
        <View style={styles.dotsRow}>
          {allImages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? accentColor : "rgba(255,255,255,0.5)",
                  width: i === activeIndex ? 14 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const DealCard: React.FC<{ item: DealItem; cardWidth: number }> = ({
  item,
  cardWidth,
}) => {
  const { colors } = useTheme();
  const { getResponsiveFontSize } = useResponsive();

  const IMG_WIDTH = cardWidth * 0.42;
  const CARD_HEIGHT = 190;

  const { label: expiryLabel, urgent } = getExpiryLabel(item.expiry_date);

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.primary,
        },
      ]}
    >
      {/* ── Left: Image Carousel ── */}
      <View
        style={{
          width: IMG_WIDTH,
          height: CARD_HEIGHT,
          overflow: "hidden",
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      >
        <ImageCarousel
          images={item.images ?? [item.s3_image_path]}
          width={IMG_WIDTH}
          height={CARD_HEIGHT}
          accentColor={colors.primary}
        />
      </View>

      {/* ── Right: Product Info ── */}
      <View
        style={[
          styles.infoPanel,
          {
            backgroundColor: colors.cardBackground,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          },
        ]}
      >
        {/* Product name */}
        <Text
          numberOfLines={2}
          style={[
            styles.productName,
            {
              color: colors.text,
              fontFamily: "Poppins_600SemiBold",
              fontSize: getResponsiveFontSize(14),
            },
          ]}
        >
          {item.product_name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating
            rating={item.avg_rating}
            color={colors.warning}
            size={getResponsiveFontSize(11)}
          />
          <Text
            style={{
              fontSize: getResponsiveFontSize(10),
              color: colors.textSecondary,
              fontFamily: "Poppins_400Regular",
              marginLeft: 4,
            }}
          >
            ({parseFloat(item.avg_rating).toFixed(1)})
          </Text>
        </View>

        {/* Prices */}
        <View style={styles.priceRow}>
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: getResponsiveFontSize(16),
              color: colors.primary,
            }}
          >
            {formatPrice(item.selling_price)}
          </Text>
          {parseFloat(item.mrp) > parseFloat(item.selling_price) && (
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: getResponsiveFontSize(11),
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                marginLeft: 6,
                alignSelf: "flex-end",
                marginBottom: 2,
              }}
            >
              {formatPrice(item.mrp)}
            </Text>
          )}
        </View>

        {/* Overview */}
        {item.overview ? (
          <Text
            numberOfLines={2}
            style={{
              fontFamily: "Poppins_300Light",
              fontSize: getResponsiveFontSize(10),
              color: colors.textSecondary,
              lineHeight: 15,
              marginBottom: 8,
            }}
          >
            {item.overview}
          </Text>
        ) : null}

        {/* Expiry */}
        <View
          style={[
            styles.expiryBadge,
            {
              backgroundColor: urgent
                ? "rgba(225,3,32,0.1)"
                : "rgba(58,40,108,0.08)",
              borderColor: urgent ? colors.secondary : colors.primaryMuted,
            },
          ]}
        >
          <View
            style={[
              styles.expiryDot,
              { backgroundColor: urgent ? colors.secondary : colors.primary },
            ]}
          />
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: getResponsiveFontSize(9),
              color: urgent ? colors.secondary : colors.primary,
              letterSpacing: 0.3,
            }}
          >
            {expiryLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ cardWidth: number }> = ({ cardWidth }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          height: 190,
          overflow: "hidden",
        },
      ]}
    >
      <View
        style={[
          styles.skeletonBlock,
          {
            width: "42%",
            height: "100%",
            backgroundColor: colors.backgroundSkeleton,
          },
        ]}
      />
      <View style={{ flex: 1, padding: 12, gap: 8 }}>
        {[60, 90, 50, 70, 40].map((w, i) => (
          <View
            key={i}
            style={[
              styles.skeletonLine,
              { width: `${w}%`, backgroundColor: colors.backgroundSkeleton },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const DealsOfTheDay: React.FC = () => {
  const { deals, loading } = useDeals();
  const { colors } = useTheme();
  const { wp, getResponsiveFontSize } = useResponsive();

  const CARD_WIDTH = wp(88); // 88% screen width → shows ~8% of next card
  const SEPARATOR = wp(3);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DealItem>) => (
      <DealCard item={item} cardWidth={CARD_WIDTH} />
    ),
    [CARD_WIDTH],
  );

  const renderSkeleton = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <View key={i} style={{ marginRight: i < 2 ? SEPARATOR : 0 }}>
        <SkeletonCard cardWidth={CARD_WIDTH} />
      </View>
    ));

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: "Poppins_700Bold",
              fontSize: getResponsiveFontSize(20),
            },
          ]}
        >
          Deals of the Day
        </Text>
      </View>

      {/* Cards */}
      {loading ? (
        <View style={[styles.listContent, { paddingLeft: SEPARATOR }]}>
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={deals}
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

export default DealsOfTheDay;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  headerAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  headerTitle: {
    flex: 1,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    // shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoPanel: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  discountBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 6,
  },
  discountText: {
    letterSpacing: 0.5,
  },
  productName: {
    lineHeight: 19,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  expiryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  expiryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotsRow: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  listContent: {
    flexDirection: "row",
  },
  skeletonBlock: {
    borderRadius: 0,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
  },
});
