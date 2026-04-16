import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useCategory } from "../../hooks/homeHooks";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

 
import image1 from "../../../assets/category/category4.png";
 
import image2 from "../../../assets/category/category2.png";
import image3 from "../../../assets/category/category5.png";
 
import image4 from "../../../assets/category/category1.png";
import image5 from "../../../assets/category/category3.png";

const formatCategoryName = (name: string) => {
  if (!name) return "";
  return name.replace(/control/gi, "").trim();
};

const formatCategoryDisplayName = (name: string) => {
  const formatted = formatCategoryName(name);

  if (/^agrochemicals$/i.test(formatted)) {
    return "Agro\nChemicals";
  }

  return formatted;
};

const CATEGORY_IMAGES = [image1, image2, image3, image4, image5];

export const CategoryList: React.FC = () => {
  const { categories, loading, error } = useCategory(0);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const CARD_RADIUS = spacing(16);

  // ✅ responsive sizes
  const ITEM_SIZE = spacing(62);
  const IMAGE_SIZE = spacing(50);

  // ✅ memoized renderItem
  const renderItem = useCallback(
    ({ item, index }: any) => (
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
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
    
          }}
        >
          <Image
            source={CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            color: colors.textInverse,
            textAlign: "center",
            width: ITEM_SIZE,
            marginTop: spacing(6),
          }}
        >
          {formatCategoryDisplayName(item.category_name)}
        </Text>
      </TouchableOpacity>
    ),
    [CARD_RADIUS, ITEM_SIZE, IMAGE_SIZE, colors, font, router, spacing],
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



  console.log("djalfjasdlf;k", categories)

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
            gap: spacing(12),
          }}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
};
