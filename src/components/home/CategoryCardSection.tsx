import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  Extrapolation,
} from "react-native-reanimated";
import { useCustomCategorySections } from "../../hooks/customSection.hooks";
import { useTheme } from "../../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  CustomCategoryItem,
  CustomCategorySection,
  CustomSection,
} from "../../types/customSection.types";
import { useResponsive } from "../../utils/useResponsive";

const COLUMNS = 4;
const ROWS = 2;
const ITEMS_PER_PAGE = COLUMNS * ROWS; // 8 items per page (4 cols x 2 rows)
const H_PADDING = 16;
const GAP = 10;

// ─── Sub-category Card Item ──────────────────────────────────
export interface SubCategoryCardProps {
  item: CustomCategoryItem;
  index: number;
  sectionTitle: string;
  parentCategoryId?: number;
  cardSize: number;
}

export const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  item,
  index,
  sectionTitle,
  parentCategoryId,
  cardSize,
}) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const [isFlipping, setIsFlipping] = useState(false);
  const flipProgress = useSharedValue(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getDynamicLightColor = (idx: number, id: number) => {
    const hue = ((idx + id) * 137.5) % 360;
    return `hsl(${hue}, 75%, 96%)`;
  };

  const bgColor = item.category_bg_color || getDynamicLightColor(index, item.id);

  const navigateToCategory = () => {
    const targetParentId =
      item.parent_id > 0
        ? item.parent_id
        : parentCategoryId && parentCategoryId > 0
        ? parentCategoryId
        : item.id;

    router.push({
      pathname: "/(stack)/category/[slug]",
      params: {
        slug: String(targetParentId),
        name: sectionTitle || item.category_name,
        image: item.category_image || item.s3_image_path || "",
        selectedSubCategoryId: String(item.id),
      },
    });

    // Reset flip 600ms after navigating so card is cleanly back in original state when user returns
    timeoutRef.current = setTimeout(() => {
      flipProgress.value = 0;
      setIsFlipping(false);
    }, 600);
  };

  const imageUrl = item.category_image || item.s3_image_path;
  const flipImageUrl = item.flip_image;
  const hasFlipImage = !!flipImageUrl;

  const handlePress = () => {
    if (isFlipping) return;

    if (hasFlipImage) {
      setIsFlipping(true);
      flipProgress.value = withTiming(1, {
        duration: 280,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });

      // 3D Flip finishes in 280ms -> navigate at 300ms
      timeoutRef.current = setTimeout(() => {
        navigateToCategory();
      }, 300);
    } else {
      // Immediate direct navigation when flip_image is null/empty
      navigateToCategory();
    }
  };

  const cardContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [1, 1.18, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [0, -6, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const frontStyle = useAnimatedStyle(() => {
    const rotateYVal = interpolate(
      flipProgress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP,
    );
    const rotateZVal = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [0, -10, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateYVal}deg` },
        { rotateZ: `${rotateZVal}deg` },
      ],
      backfaceVisibility: "hidden",
      opacity: interpolate(
        flipProgress.value,
        [0, 0.46, 0.54, 1],
        [1, 1, 0, 0],
        Extrapolation.CLAMP,
      ),
      zIndex: flipProgress.value < 0.5 ? 2 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateYVal = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 360],
      Extrapolation.CLAMP,
    );
    const rotateZVal = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [0, 10, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateYVal}deg` },
        { rotateZ: `${rotateZVal}deg` },
      ],
      backfaceVisibility: "hidden",
      opacity: interpolate(
        flipProgress.value,
        [0, 0.46, 0.54, 1],
        [0, 0, 1, 1],
        Extrapolation.CLAMP,
      ),
      zIndex: flipProgress.value >= 0.5 ? 2 : 1,
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ flex: 1, alignItems: "center", marginBottom: GAP }}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: bgColor,
            borderRadius: spacing(12),
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          },
          cardContainerStyle,
        ]}
      >
        {/* Front face (category_image) */}
        <Animated.View
          style={[
            {
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
            },
            frontStyle,
          ]}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: cardSize * 0.88, height: cardSize * 0.72 }}
              contentFit="contain"
            />
          ) : (
            <Text
              style={{
                fontSize: font(16),
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
              }}
            >
              {item.category_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          )}
        </Animated.View>

        {/* Back face (flip_image) */}
        <Animated.View
          style={[
            {
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
            },
            backStyle,
          ]}
        >
          {flipImageUrl ? (
            <Image
              source={{ uri: flipImageUrl }}
              style={{ width: cardSize * 0.88, height: cardSize * 0.72 }}
              contentFit="contain"
            />
          ) : (
            <Text
              style={{
                fontSize: font(16),
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
              }}
            >
              {item.category_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          )}
        </Animated.View>
      </Animated.View>

      <Text
        numberOfLines={2}
        style={{
          marginTop: spacing(6),
          fontSize: font(10),
          color: colors.text,
          textAlign: "center",
          width: "90%",
          fontFamily: "Poppins_500Medium",
        }}
      >
        {item.category_name}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Skeleton Item ────────────────────────────────────────────
const SkeletonItem = ({
  cardSize,
  itemWidth,
  spacing,
  bgColor,
}: {
  cardSize: number;
  itemWidth: number;
  spacing: (n: number) => number;
  bgColor: string;
}) => (
  <View style={{ flex: 1, alignItems: "center", marginBottom: GAP }}>
    <View
      style={{
        width: cardSize,
        height: cardSize,
        borderRadius: spacing(12),
        backgroundColor: bgColor,
      }}
    />
    <View style={{ marginTop: spacing(6), alignItems: "center", gap: 4 }}>
      <View
        style={{
          width: itemWidth * 0.72,
          height: spacing(10),
          borderRadius: spacing(5),
          backgroundColor: bgColor,
        }}
      />
      <View
        style={{
          width: itemWidth * 0.48,
          height: spacing(10),
          borderRadius: spacing(5),
          backgroundColor: bgColor,
        }}
      />
    </View>
  </View>
);

// ─── Skeleton Section ─────────────────────────────────────────
const SkeletonSection = ({
  itemWidth,
  cardSize,
  spacing,
  bgColor,
}: {
  itemWidth: number;
  cardSize: number;
  spacing: (n: number) => number;
  bgColor: string;
}) => {
  const skeletonData = Array.from({ length: COLUMNS * 2 }, (_, i) => ({
    id: i,
  }));

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Heading skeleton */}
      <View
        style={{
          width: itemWidth * 1.5,
          height: spacing(16),
          borderRadius: spacing(6),
          backgroundColor: bgColor,
          marginBottom: spacing(12),
        }}
      />

      {/* Grid — FlatList ensures always 4 columns on every device */}
      <FlatList
        data={skeletonData}
        keyExtractor={(item) => `sk-${item.id}`}
        numColumns={COLUMNS}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={() => (
          <SkeletonItem
            cardSize={cardSize}
            itemWidth={itemWidth}
            spacing={spacing}
            bgColor={bgColor}
          />
        )}
      />
    </View>
  );
};

// ─── Reusable Category Section Block ─────────────────────────
export const CategorySectionBlock: React.FC<{
  section: CustomSection | CustomCategorySection;
}> = ({ section }) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const { width: screenWidth } = useWindowDimensions();

  const [activePageIndex, setActivePageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const sectionId =
    (section as any).id ?? (section as any).section_id ?? section.section_title;

  const itemWidth = Math.floor(
    (screenWidth - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
  );
  const cardSize = itemWidth;

  const categories = useMemo(
    () => section.categories?.filter((cat) => cat.category_name) || [],
    [section.categories],
  );

  const pages = useMemo(() => {
    const chunks: CustomCategoryItem[][] = [];
    for (let i = 0; i < categories.length; i += ITEMS_PER_PAGE) {
      chunks.push(categories.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [categories]);

  useEffect(() => {
    setActivePageIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [sectionId]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      if (index >= 0 && index < pages.length && index !== activePageIndex) {
        setActivePageIndex(index);
      }
    },
    [pages.length, screenWidth, activePageIndex],
  );

  if (categories.length === 0) return null;

  const renderPage = ({
    item: pageItems,
    index: pageIndex,
  }: {
    item: CustomCategoryItem[];
    index: number;
  }) => {
    const row1 = pageItems.slice(0, COLUMNS);
    const row2 = pageItems.slice(COLUMNS, ITEMS_PER_PAGE);

    return (
      <View style={{ width: screenWidth, paddingHorizontal: H_PADDING }}>
        {/* Row 1 (up to 4 items) */}
        <View style={{ flexDirection: "row", gap: GAP }}>
          {row1.map((cat, itemIndex) => (
            <View key={cat.id} style={{ width: cardSize }}>
              <SubCategoryCard
                item={cat}
                index={pageIndex * ITEMS_PER_PAGE + itemIndex}
                sectionTitle={section.section_title}
                parentCategoryId={(section as any).parent_category_id}
                cardSize={cardSize}
              />
            </View>
          ))}
        </View>

        {/* Row 2 (up to 4 items, only rendered if present) */}
        {row2.length > 0 && (
          <View style={{ flexDirection: "row", gap: GAP }}>
            {row2.map((cat, itemIndex) => (
              <View key={cat.id} style={{ width: cardSize }}>
                <SubCategoryCard
                  item={cat}
                  index={pageIndex * ITEMS_PER_PAGE + COLUMNS + itemIndex}
                  sectionTitle={section.section_title}
                  parentCategoryId={(section as any).parent_category_id}
                  cardSize={cardSize}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ marginBottom: spacing(16) }}>
      <View
        style={{
          paddingHorizontal: H_PADDING,
          marginBottom: spacing(12),
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
          }}
        >
          {section.section_title}
        </Text>
        {!!section.section_description && (
          <Text
            style={{
              fontSize: 11,
              lineHeight: 18,
              color: colors.textSecondary,
              fontFamily: "Poppins_400Regular",
              marginTop: 2,
            }}
          >
            {section.section_description}
          </Text>
        )}
      </View>

      {/* ── Category Grid (4 columns x 2 rows per page) ── */}
      {pages.length > 1 ? (
        <FlatList
          ref={flatListRef}
          data={pages}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(_, index) => `cat-page-${sectionId}-${index}`}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * screenWidth,
              animated: true,
            });
          }}
          renderItem={renderPage}
        />
      ) : (
        renderPage({ item: pages[0], index: 0 })
      )}

      {/* ── Pagination Dots (Only if more than 8 categories / > 1 page) ── */}
      {pages.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: spacing(6),
          }}
        >
          {pages.map((_, dotIndex) => {
            const isActive = activePageIndex === dotIndex;
            return (
              <TouchableOpacity
                key={`dot-${dotIndex}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({
                    index: dotIndex,
                    animated: true,
                  });
                  setActivePageIndex(dotIndex);
                }}
              >
                <View
                  style={{
                    width: isActive ? 16 : 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.borderStrong,
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ─── Main Component (Deprecated / Handled by CustomSections) ──
const CategoryCardSection = () => {
  return null;
};

export default CategoryCardSection;
