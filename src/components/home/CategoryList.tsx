import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useCategory } from "../../hooks/homeHooks";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

const formatCategoryName = (name: string) => {
  if (!name) return "";
  return name.replace(/control/gi, "").trim();
};

export const CategoryList: React.FC = () => {
  const { categories, loading, error } = useCategory(0);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();

  // ✅ responsive sizes
  const ITEM_SIZE = spacing(66);
  const IMAGE_SIZE = spacing(58);

  // ✅ memoized renderItem
  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        activeOpacity={0.75}
        className="items-center"
        onPress={() =>
          router.push({
            pathname: "/(stack)/category/[slug]",
            params: {
              slug: item.id,
              name: item.category_name,
              image: item.s3_image_path,
            },
          })
        }
      >
        {/* Outer Circle */}
        <View
          style={{
            borderRadius: ITEM_SIZE / 2,
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: IMAGE_SIZE / 2,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Image
              source={{ uri: item.s3_image_path }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Title */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(12),
            color: colors.textInverse,
            textAlign: "center",
            width: ITEM_SIZE,
            marginTop: spacing(6),
          }}
        >
          {formatCategoryName(item.category_name)}
        </Text>
      </TouchableOpacity>
    ),
    [colors, spacing, font],
  );

  const SkeletonRow = ({ ITEM_SIZE }: any) => {
    const { colors } = useTheme();
    const { spacing } = useResponsive();

    return (
      <View className="flex-row" style={{ paddingHorizontal: spacing(16) }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={{
              alignItems: "center",
              marginRight: spacing(14),
            }}
          >
            {/* Circle */}
            <View
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                borderRadius: ITEM_SIZE / 2,
                backgroundColor: colors.backgroundSkeleton,
              }}
            />

            {/* Text Line 1 */}
            <View
              style={{
                width: ITEM_SIZE,
                height: spacing(10),
                borderRadius: spacing(4),
                backgroundColor: colors.backgroundSkeleton,
                marginTop: spacing(6),
              }}
            />

            {/* Text Line 2 */}
            <View
              style={{
                width: ITEM_SIZE * 0.6,
                height: spacing(10),
                borderRadius: spacing(4),
                backgroundColor: colors.backgroundSkeleton,
                marginTop: spacing(4),
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  // ❌ error state
  if (error) {
    return (
      <View className="px-4 py-3">
        <Text style={{ color: colors.textTertiary, fontSize: font(12) }}>
          Unable to load categories.
        </Text>
      </View>
    );
  }

  return (
    <View className="py-1">
      {loading ? (
        <SkeletonRow ITEM_SIZE={ITEM_SIZE} />
      ) : (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()} // ✅ FIXED
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: spacing(16),
            gap: spacing(25),
          }}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE + spacing(14),
            offset: (ITEM_SIZE + spacing(14)) * index,
            index,
          })}
        />
      )}
    </View>
  );
};
