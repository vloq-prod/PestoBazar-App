import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  DimensionValue,
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

const SkeletonBlock = ({
  width,
  height,
  borderRadius,
  backgroundColor,
}: {
  width: DimensionValue;
  height: number;
  borderRadius: number;
  backgroundColor: string;
}) => (
  <View
    style={{
      width,
      height,
      borderRadius,
      backgroundColor,
    }}
  />
);

const CategoryCardSection = () => {
  const { colors } = useTheme();
  const { spacing, font, width, isTablet } = useResponsive();
  const router = useRouter();
  const { categoriesWithSubcategories, loading, error } =
    useCategoryWithSubcategories(0);
  const horizontalPadding = 16;
  const itemGap = 10;

//   console.log("Categories with Subcategories:", categoriesWithSubcategories);

  const visibleCategories = categoriesWithSubcategories.filter(
    (category) => category.subcategories.length > 0,
  );

  const columns = isTablet ? 5 : 3;
  const itemWidth =
    (width - horizontalPadding * 2 - itemGap * (columns - 1)) / columns;
  const cardSize = itemWidth;

  type SubCategoryRenderArgs = {
    item: CategoryItem;
    index: number;
  };

  const renderSkeletonItem = (_: unknown, index: number) => {
    const isLastColumn = (index + 1) % columns === 0;

    return (
      <View
        key={`skeleton-item-${index}`}
        style={{
          width: itemWidth,
          alignItems: "center",
          marginRight: isLastColumn ? 0 : itemGap,
          marginBottom: itemGap,
        }}
      >
        <SkeletonBlock
          width={cardSize}
          height={cardSize}
          borderRadius={spacing(12)}
          backgroundColor={colors.backgroundSkeleton}
        />
        <View style={{ marginTop: spacing(6), alignItems: "center", gap: 4 }}>
          <SkeletonBlock
            width={itemWidth * 0.72}
            height={spacing(10)}
            borderRadius={spacing(5)}
            backgroundColor={colors.backgroundSkeleton}
          />
          <SkeletonBlock
            width={itemWidth * 0.48}
            height={spacing(10)}
            borderRadius={spacing(5)}
            backgroundColor={colors.backgroundSkeleton}
          />
        </View>
      </View>
    );
  };

  const createSubCategoryRenderer = (
    mainCategoryId: number,
    mainCategoryName: string,
    mainCategoryImage?: string,
  ) => {
    function renderSubCategoryItem({ item, index }: SubCategoryRenderArgs) {
      const isLastColumn = (index + 1) % columns === 0;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: itemWidth,
            alignItems: "center",
            marginRight: isLastColumn ? 0 : itemGap,
            marginBottom: itemGap,
          }}
          onPress={() => {
            router.push({
              pathname: "/(stack)/category/[slug]",
              params: {
                slug: String(mainCategoryId),
                name: mainCategoryName,
                image: mainCategoryImage ?? "",
                selectedSubCategoryId: String(item.id),
              },
            });
          }}
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
              style={{
                width: cardSize * 0.72,
                height: cardSize * 0.72,
                borderRadius: spacing(8),
              }}
              contentFit="contain"
            />
          </View>

          <Text
            style={{
              marginTop: spacing(6),
              fontSize: font(11),
              color: colors.text,
              textAlign: "center",
              width: "90%",
              fontFamily: "Poppins_600SemiBold",
            }}
            numberOfLines={2}
          >
            {item.category_name}
          </Text>
        </TouchableOpacity>
      );
    }

    return renderSubCategoryItem;
  };

  if (loading) {
    return (
      <View style={{ paddingHorizontal: horizontalPadding }}>
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <View key={`skeleton-section-${sectionIndex}`}>
            <SkeletonBlock
              width={itemWidth * 1.5}
              height={spacing(16)}
              borderRadius={spacing(6)}
              backgroundColor={colors.backgroundSkeleton}
            />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: spacing(12),
              }}
            >
              {Array.from({ length: columns * 2 }).map(renderSkeletonItem)}
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingHorizontal: horizontalPadding }}>
        <Text
          style={{
            fontSize: font(18),
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
          }}
        >
          Shop by Category
        </Text>
        <Text style={{ color: colors.text, marginTop: spacing(12) }}>
          Categories could not be loaded.
        </Text>
      </View>
    );
  }

  if (!visibleCategories.length) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: horizontalPadding }}>
      {visibleCategories.map((category: CategoryWithSubcategories) => (
        <View key={category.mainCategoryId}>
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
            key={`category-${category.mainCategoryId}-${columns}`}
            data={category.subcategories}
            renderItem={createSubCategoryRenderer(
              category.mainCategoryId,
              category.mainCategoryName,
              category.mainCategory.s3_image_path,
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={columns}
            scrollEnabled={false}
            columnWrapperStyle={{
              justifyContent: "flex-start",
            }}
            contentContainerStyle={{
              paddingBottom: spacing(4),
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default CategoryCardSection;
