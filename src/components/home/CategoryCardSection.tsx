import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { useCategoryWithSubcategories } from "../../hooks/homeHooks";
import { useTheme } from "../../theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  CategoryItem,
  CategoryWithSubcategories,
} from "../../types/home.types";
import { useResponsive } from "../../utils/useResponsive";

const COLUMNS = 3;
const H_PADDING = 16;
const GAP = 10;

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

      {/* Grid — FlatList ensures always 3 columns on every device */}
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

  // ✅ Precise item width — same formula everywhere
  const itemWidth =
    (screenWidth - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const cardSize = itemWidth;

  const visibleCategories = categoriesWithSubcategories.filter(
    (cat) => cat.subcategories.length > 0,
  );

  // ── Sub-category card ──────────────────────────────────────
  const createSubCategoryRenderer = (
    mainCategoryId: number,
    mainCategoryName: string,
    mainCategoryImage?: string,
  ) =>
    function renderItem({ item }: { item: CategoryItem }) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flex: 1, alignItems: "center", marginBottom: GAP }}
          onPress={() =>
            router.push({
              pathname: "/(stack)/category/[slug]",
              params: {
                slug: String(mainCategoryId),
                name: mainCategoryName,
                image: mainCategoryImage ?? "",
                selectedSubCategoryId: String(item.id),
              },
            })
          }
        >
          <View
            style={{
              width: cardSize,
              height: cardSize,
              backgroundColor: colors.surface,
              borderRadius: spacing(12),
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: cardSize * 0.72, height: cardSize * 0.72 }}
              contentFit="contain"
            />
          </View>

          <Text
            numberOfLines={2}
            style={{
              marginTop: spacing(6),
              fontSize: font(11),
              color: colors.text,
              textAlign: "center",
              width: "90%",
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            {item.category_name}
          </Text>
        </TouchableOpacity>
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
        <View
          key={category.mainCategoryId}
          style={{ marginBottom: spacing(20) }}
        >
          <Text
            style={{
              fontSize: font(16),
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
              marginBottom: spacing(12),
            }}
          >
            {category.mainCategoryName}
          </Text>

          <FlatList
            key={`cat-${category.mainCategoryId}`}
            data={category.subcategories}
            renderItem={createSubCategoryRenderer(
              category.mainCategoryId,
              category.mainCategoryName,
              category.mainCategory.s3_image_path,
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
