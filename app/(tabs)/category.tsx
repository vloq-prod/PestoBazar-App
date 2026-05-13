import React from "react";
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

import AppNavbar from "../../src/components/comman/AppNavbar";
import { useCategoryWithSubcategories } from "../../src/hooks/homeHooks";
import { useTheme } from "../../src/theme";
import {
  CategoryItem,
  CategoryWithSubcategories,
} from "../../src/types/home.types";
import { useResponsive } from "../../src/utils/useResponsive";
import { ChevronRight } from "lucide-react-native";

const LOCAL_ASSETS: Record<string, any> = {
  HouseHold: require("../../assets/maincat/Household-pesticides.jpg"),
  "Household Pesticides": require("../../assets/maincat/Household-pesticides.jpg"),
  Agrochemicals: require("../../assets/maincat/Agrochemicals.jpg"),
  "Pest Equipment": require("../../assets/maincat/Pestequipment.jpg"),
  "Gardening tools and supplies": require("../../assets/maincat/Gardeningtoolsandsupplies.jpg"),

  Foggers: require("../../assets/FoggersandMachines/Foggers.png"),
  Machines: require("../../assets/FoggersandMachines/Machines.png"),
  Sprayers: require("../../assets/FoggersandMachines/Sprays.png"),
  snake: require("../../assets/HouseHold/Snake.png"),

  "Bugs Control": require("../../assets/HouseHold/Bugs Control.png"),
  Lizard: require("../../assets/HouseHold/Lizard.png"),
  Termite: require("../../assets/HouseHold/Termite.png"),
  Cockroach: require("../../assets/HouseHold/Cockroach.png"),
  Mosquito: require("../../assets/HouseHold/Mosquito.png"),
  Ant: require("../../assets/HouseHold/ant.png"),
  Fly: require("../../assets/HouseHold/Fly.png"),
  Rat: require("../../assets/HouseHold/rat.png"),
};

const getLocalImage = (name: string) => {
  if (!name) return null;

  const normalized = name.trim().toLowerCase();

  const foundKey = Object.keys(LOCAL_ASSETS).find((key) => {
    const k = key.toLowerCase();

    return normalized.includes(k) || k.includes(normalized);
  });

  return foundKey ? LOCAL_ASSETS[foundKey] : null;
};

const COLUMNS = 4;
const GAP = 10;
const H_PADDING = 16;

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
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

  const getDynamicLightColor = (id: number) => {
    const hue = (id * 137.5) % 360;
    return `hsl(${hue}, 75%, 96%)`;
  };

  const renderSubCategoryCard = (category: CategoryWithSubcategories) => {
    return ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          width: itemWidth,
          marginBottom: GAP,
          alignItems: "center",
        }}
        onPress={() =>
          router.push({
            pathname: "/(stack)/category/[slug]",
            params: {
              slug: String(category.mainCategoryId),
              name: category.mainCategoryName,
              image:
                getLocalImage(category.mainCategoryName) ??
                category.mainCategory.s3_image_path ??
                "",
              selectedSubCategoryId: String(item.id),
            },
          })
        }
      >
        <View
          style={{
            width: cardSize,
            height: cardSize,
            backgroundColor: getDynamicLightColor(item.id),
            borderRadius: spacing(12),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={
              getLocalImage(item.category_name) ?? {
                uri: item.s3_image_path,
              }
            }
            style={{
              width: cardSize * 0.88,
              height: cardSize * 0.72,
            }}
            contentFit="contain"
          />
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavbar
          title="Category"
          showBack
          showSearch
          showCart
          showNotification
        />

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
        <AppNavbar
          title="Category"
          showBack
          showSearch
          showCart
          showNotification
        />

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
      <AppNavbar
        title="Category"
        showBack
        showSearch
        showCart
        showNotification
      />

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
            (sub) => sub.category_name && sub.category_name,
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

                {/* <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: font(12),
                      fontFamily: "Poppins_500Medium",
                    }}
                  >
                    {visibleSubcategories.length} Items
                  </Text>

                  <ChevronRight
                    size={14}
                    color={colors.primary}
                  />
                </TouchableOpacity> */}
              </View>

              {/* ALL SUBCATEGORY ITEMS */}
              <FlatList
                data={visibleSubcategories}
                renderItem={renderSubCategoryCard(category)}
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
