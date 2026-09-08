import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  Extrapolation,
} from "react-native-reanimated";
import { useCategoryWithSubcategories } from "../../hooks/homeHooks";
import { useTheme } from "../../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  CategoryItem,
  CategoryWithSubcategories,
} from "../../types/home.types";
import { useResponsive } from "../../utils/useResponsive";
import { ChevronRight } from "lucide-react-native";

const COLUMNS = 4;
const H_PADDING = 16;
const GAP = 10;

const getVisibleSubcategories = (subcategories: CategoryItem[]) =>
  subcategories.filter((item) => item.category_name).slice(0, 8);

// ─── Sub-category Card Item ──────────────────────────────────
interface SubCategoryCardProps {
  item: CategoryItem;
  index: number;
  mainCategoryId: number;
  mainCategoryName: string;
  mainCategoryDisplayImage?: string | null;
  cardSize: number;
}

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  item,
  index,
  mainCategoryId,
  mainCategoryName,
  mainCategoryDisplayImage,
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

  const bgColor = getDynamicLightColor(index, item.id);

  const navigateToCategory = () => {
    router.push({
      pathname: "/(stack)/category/[slug]",
      params: {
        slug: String(mainCategoryId),
        name: mainCategoryName,
        image: mainCategoryDisplayImage ?? "",
        selectedSubCategoryId: String(item.id),
      },
    });

    // Reset flip 600ms after navigating so card is cleanly back in original state when user returns
    timeoutRef.current = setTimeout(() => {
      flipProgress.value = 0;
      setIsFlipping(false);
    }, 600);
  };

  const imageUrl = item.category_image;
  const flipImageUrl = item.flip_image || item.category_image;

  const handlePress = () => {
    if (isFlipping) return;

    if (flipImageUrl) {
      setIsFlipping(true);
      flipProgress.value = withTiming(1, {
        duration: 280,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });

      // 3D Flip finishes in 280ms -> navigate immediately at 300ms
      timeoutRef.current = setTimeout(() => {
        navigateToCategory();
      }, 300);
    } else {
      navigateToCategory();
    }
  };

  const cardContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [1, 1.06, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
    };
  });

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipProgress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateValue}deg` }],
      opacity: flipProgress.value < 0.5 ? 1 : 0,
      zIndex: flipProgress.value < 0.5 ? 2 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 360],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateValue}deg` }],
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
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

// ─── Main Component ───────────────────────────────────────────
const CategoryCardSection = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  const { categoriesWithSubcategories, loading, error } =
    useCategoryWithSubcategories(0);

  // Precise item width
  const itemWidth =
    (screenWidth - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const cardSize = itemWidth;

  const visibleCategories = categoriesWithSubcategories.filter(
    (cat) => getVisibleSubcategories(cat.subcategories).length === 8,
  );

  // ── Sub-category card renderer ─────────────────────────────
  const createSubCategoryRenderer = (
    mainCategoryId: number,
    mainCategoryName: string,
    mainCategoryDisplayImage?: string | null,
  ) => {
    return ({ item, index }: { item: CategoryItem; index: number }) => (
      <SubCategoryCard
        item={item}
        index={index}
        mainCategoryId={mainCategoryId}
        mainCategoryName={mainCategoryName}
        mainCategoryDisplayImage={mainCategoryDisplayImage}
        cardSize={cardSize}
      />
    );
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ paddingHorizontal: H_PADDING }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonSection
            key={`sk-section-${i}`}
            itemWidth={itemWidth}
            cardSize={cardSize}
            spacing={spacing}
            bgColor={colors.backgroundSkeleton}
          />
        ))}
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <View style={{ paddingHorizontal: H_PADDING }}>
        <Text
          style={{
            fontSize: font(13),
            color: colors.textSecondary,
            fontFamily: "Poppins_400Regular",
          }}
        >
          Categories could not be loaded.
        </Text>
      </View>
    );
  }

  if (!visibleCategories.length) return null;

  // ── Render ────────────────────────────────────────────────
  return (
    <View style={{ paddingHorizontal: H_PADDING }}>
      {visibleCategories.map((category: CategoryWithSubcategories) => (
        <View key={category.mainCategoryId}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
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
              Shop by problem
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() =>
                  router.push({
                    pathname: "/(stack)/category/[slug]",
                    params: {
                      slug: String(category.mainCategoryId),
                      name: category.mainCategoryName,
                      image:
                        category.mainCategory?.category_image ||
                        category.mainCategory?.s3_image_path ||
                        "",
                    },
                  })
                }
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  View All
                </Text>
                <ChevronRight size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            key={`cat-${category.mainCategoryId}`}
            data={getVisibleSubcategories(category.subcategories)}
            renderItem={createSubCategoryRenderer(
              category.mainCategoryId,
              category.mainCategoryName,
              category.mainCategory?.category_image ||
                category.mainCategory?.s3_image_path ||
                "",
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={COLUMNS}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: GAP }}
            contentContainerStyle={{ paddingBottom: spacing(4) }}
          />
        </View>
      ))}
    </View>
  );
};

export default CategoryCardSection;
