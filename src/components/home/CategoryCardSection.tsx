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
import { ChevronRight } from "lucide-react-native";

// ─── Local Assets Mapping ──────────────────────────────────────
const LOCAL_ASSETS: Record<string, any> = {
  // Main Categories (from assets/maincat/)

  HouseHold: require("../../../assets/maincat/Household-pesticides.jpg"),
  "Household Pesticides": require("../../../assets/maincat/Household-pesticides.jpg"),
  Agrochemicals: require("../../../assets/maincat/Agrochemicals.jpg"),
  "Pest Equipment": require("../../../assets/maincat/Pestequipment.jpg"),
  "Gardening tools and supplies": require("../../../assets/maincat/Gardeningtoolsandsupplies.jpg"),

  // FoggersandMachines Subcategories
  Foggers: require("../../../assets/FoggersandMachines/Foggers.png"),
  Machines: require("../../../assets/FoggersandMachines/Machines.png"),
  Sprays: require("../../../assets/FoggersandMachines/Sprays.png"),
  sprayers: require("../../../assets/FoggersandMachines/Sprays.png"),

  // HouseHold Subcategories (Handles both singular and plural)
  "Bugs Control": require("../../../assets/HouseHold/Bugs Control.png"),
  "Bug Control": require("../../../assets/HouseHold/Bugs Control.png"),
  Lizard: require("../../../assets/HouseHold/Lizard.png"),
  Lizards: require("../../../assets/HouseHold/Lizard.png"),
  Termite: require("../../../assets/HouseHold/Termite.png"),
  Termites: require("../../../assets/HouseHold/Termite.png"),
  Cockroach: require("../../../assets/HouseHold/Cockroach.png"),
  Cockroaches: require("../../../assets/HouseHold/Cockroach.png"),
  Mosquito: require("../../../assets/HouseHold/Mosquito.png"),
  Mosquitoes: require("../../../assets/HouseHold/Mosquito.png"),
  Ant: require("../../../assets/HouseHold/ant.png"),
  Ants: require("../../../assets/HouseHold/ant.png"),
  Fly: require("../../../assets/HouseHold/Fly.png"),
  Flies: require("../../../assets/HouseHold/Fly.png"),
  Snake: require("../../../assets/HouseHold/Snake.png"),
  Snakes: require("../../../assets/HouseHold/Snake.png"),
  Rat: require("../../../assets/HouseHold/rat.png"),
  Rats: require("../../../assets/HouseHold/rat.png"),
};

const getLocalImage = (name: string) => {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();

  // Try exact match or common variations
  const foundKey = Object.keys(LOCAL_ASSETS).find((key) => {
    const k = key.toLowerCase();
    // Exact match
    if (k === normalized) return true;
    // Handle "Control" suffix variations (e.g. "Ant Control" matches "Ant")
    if (normalized.includes(k) || k.includes(normalized)) return true;
    return false;
  });

  return foundKey ? LOCAL_ASSETS[foundKey] : null;
};

const COLUMNS = 4;
const H_PADDING = 16;
const GAP = 10;

const getVisibleSubcategories = (subcategories: CategoryItem[]) =>
  subcategories
    .filter((item) => !/snake/i.test(item.category_name || ""))
    .slice(0, 8);

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

  // ✅ Precise item width — same formula everywhere
  const itemWidth =
    (screenWidth - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const cardSize = itemWidth;

  const visibleCategories = categoriesWithSubcategories.filter(
    (cat) => getVisibleSubcategories(cat.subcategories).length >= 8,
  );

  // ── Sub-category card ──────────────────────────────────────
  const createSubCategoryRenderer = (
    mainCategoryId: number,
    mainCategoryName: string,
    mainCategoryImage?: string,
  ) => {
    const getDynamicLightColor = (index: number, id: number) => {
      const hue = ((index + id) * 137.5) % 360;
      return `hsl(${hue}, 75%, 96%)`;
    };

    return ({ item, index }: { item: CategoryItem; index: number }) => {
      const bgColor = getDynamicLightColor(index, item.id);

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
                image:
                  getLocalImage(mainCategoryName) ?? mainCategoryImage ?? "",
                selectedSubCategoryId: String(item.id),
              },
            })
          }
        >
          <View
            style={{
              width: cardSize,
              height: cardSize,
              backgroundColor: bgColor,
              borderRadius: spacing(12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={
                getLocalImage(item.category_name) ?? { uri: item.s3_image_path }
              }
              style={{ width: cardSize * 0.9, height: cardSize * 0.72 }}
              contentFit="contain"
            />
          </View>

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
                        getLocalImage(category.mainCategoryName) ??
                        category.mainCategory.s3_image_path ??
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
