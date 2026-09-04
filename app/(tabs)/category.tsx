import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

import AppNavbar from "../../src/components/comman/AppNavbar";
import { useCategoryWithSubcategories } from "../../src/hooks/homeHooks";
import { useTheme } from "../../src/theme";
import {
  CategoryItem,
  CategoryWithSubcategories,
} from "../../src/types/home.types";
import { useResponsive } from "../../src/utils/useResponsive";

const COLUMNS = 4;
const GAP = 10;
const H_PADDING = 16;

interface CategoryScreenSubCardProps {
  item: CategoryItem;
  mainCategoryId: number;
  mainCategoryName: string;
  mainCategoryDisplayImage?: string | null;
  itemWidth: number;
  cardSize: number;
}

const CategoryScreenSubCard: React.FC<CategoryScreenSubCardProps> = ({
  item,
  mainCategoryId,
  mainCategoryName,
  mainCategoryDisplayImage,
  itemWidth,
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

  const getDynamicLightColor = (id: number) => {
    const hue = (id * 137.5) % 360;
    return `hsl(${hue}, 75%, 96%)`;
  };

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

    timeoutRef.current = setTimeout(() => {
      flipProgress.value = 0;
      setIsFlipping(false);
    }, 600);
  };

  const handlePress = () => {
    if (isFlipping) return;

    if (item.flip_image) {
      setIsFlipping(true);
      flipProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });

      timeoutRef.current = setTimeout(() => {
        navigateToCategory();
      }, 450);
    } else {
      navigateToCategory();
    }
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity: flipProgress.value >= 0.5 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  const imageUrl = item.category_image;
  const flipImageUrl = item.flip_image;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        width: itemWidth,
        marginBottom: GAP,
        alignItems: "center",
      }}
      onPress={handlePress}
    >
      <View
        style={{
          width: cardSize,
          height: cardSize,
          backgroundColor: getDynamicLightColor(item.id),
          borderRadius: spacing(12),
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Front Face (category_image) */}
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
              style={{
                width: cardSize * 0.88,
                height: cardSize * 0.72,
              }}
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

        {/* Back Face (flip_image) */}
        {!!flipImageUrl && (
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
            <Image
              source={{ uri: flipImageUrl }}
              style={{
                width: cardSize * 0.88,
                height: cardSize * 0.72,
              }}
              contentFit="contain"
            />
          </Animated.View>
        )}
      </View>

      <Text
        numberOfLines={2}
        style={{
          marginTop: spacing(6),
          width: "92%",
          textAlign: "center",
          color: colors.text,
          fontSize: font(10),
          fontFamily: "Poppins_500Medium",
        }}
      >
        {item.category_name}
      </Text>
    </TouchableOpacity>
  );
};

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { width } = useWindowDimensions();

  const { categoriesWithSubcategories, loading, error } =
    useCategoryWithSubcategories(0);

  const itemWidth = (width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const cardSize = itemWidth;

  // only categories having subcategories
  const visibleCategories = categoriesWithSubcategories.filter(
    (category: CategoryWithSubcategories) =>
      category.subcategories.filter((item) => item.category_name).length > 0,
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavbar title="Category" showBack />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavbar title="Category" showBack />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.error,
              fontFamily: "Poppins_500Medium",
            }}
          >
            Unable to load categories
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      edges={["top"]}
    >
      <AppNavbar title="Category" showBack />

      <FlatList
        data={visibleCategories}
        keyExtractor={(item) => item.mainCategoryId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PADDING,
          paddingTop: spacing(14),
          paddingBottom: spacing(100),
        }}
        renderItem={({ item: category }) => {
          const visibleSubcategories = category.subcategories.filter(
            (sub) => sub.category_name,
          );

          return (
            <View style={{ marginBottom: spacing(22) }}>
              {/* CATEGORY TITLE */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: spacing(12),
                }}
              >
                <Text
                  style={{
                    fontSize: font(16),
                    color: colors.text,
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  {category.mainCategoryName}
                </Text>
              </View>

              {/* ALL SUBCATEGORY ITEMS */}
              <FlatList
                data={visibleSubcategories}
                renderItem={({ item }) => (
                  <CategoryScreenSubCard
                    item={item}
                    mainCategoryId={category.mainCategoryId}
                    mainCategoryName={category.mainCategoryName}
                    mainCategoryDisplayImage={
                      category.mainCategory?.category_image ||
                      category.mainCategory?.s3_image_path ||
                      ""
                    }
                    itemWidth={itemWidth}
                    cardSize={cardSize}
                  />
                )}
                keyExtractor={(sub) => sub.id.toString()}
                numColumns={COLUMNS}
                scrollEnabled={false}
                columnWrapperStyle={{
                  gap: GAP,
                }}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
