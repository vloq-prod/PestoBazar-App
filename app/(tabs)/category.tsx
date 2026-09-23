import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  Extrapolation,
} from "react-native-reanimated";

import AppNavbar from "../../src/components/comman/AppNavbar";
import SidebarCategoryItem from "../../src/components/comman/SidebarCategoryItem";
import { useAppMenuCategories } from "../../src/hooks/homeHooks";
import { useTheme } from "../../src/theme";
import { AppMenuCategoryItem } from "../../src/types/home.types";
import { useResponsive } from "../../src/utils/useResponsive";

const SIDEBAR_WIDTH = 74;
const RIGHT_PADDING = 12;
const GRID_GAP = 8;
const GRID_COLUMNS = 3;

interface RightCategoryCardProps {
  item: AppMenuCategoryItem;
  parentItem?: AppMenuCategoryItem;
  cardWidth: number;
  bgColor: string;
  onNavigate: (item: AppMenuCategoryItem, parent?: AppMenuCategoryItem) => void;
}

const RightCategoryCard: React.FC<RightCategoryCardProps> = React.memo(
  ({ item, parentItem, cardWidth, bgColor, onNavigate }) => {
    const { colors } = useTheme();
    const { spacing, font } = useResponsive();
    const [isFlipping, setIsFlipping] = useState(false);
    const flipProgress = useSharedValue(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const navigateToCategory = () => {
      onNavigate(item, parentItem);

  // Reset flip 600ms after navigating so card is cleanly back in original state when user returns
      timeoutRef.current = setTimeout(() => {
        flipProgress.value = 0;
        setIsFlipping(false);
      }, 600);
    };

    const imageUrl = item.s3_image_url || item.category_image || item.s3_image_path;
    const rawFlipImage = "flip_image" in item ? (item as any).flip_image : null;
    
    const hasFlipImage = 
      typeof rawFlipImage === "string" && 
      rawFlipImage.trim() !== "" && 
      rawFlipImage !== "null" && 
      rawFlipImage !== "undefined" &&
      rawFlipImage !== imageUrl;

    const flipImageUrl = hasFlipImage ? rawFlipImage : null;

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
        opacity: flipProgress.value < 0.5 ? 1 : 0,
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
        opacity: flipProgress.value >= 0.5 ? 1 : 0,
        zIndex: flipProgress.value >= 0.5 ? 2 : 1,
      };
    });

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={{
          width: cardWidth,
          alignItems: "center",
          marginBottom: spacing(10),
        }}
      >
        <Animated.View
          style={[
            {
              width: cardWidth,
              height: Math.round(cardWidth * 0.9),
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
                style={{ width: "75%", height: "75%" }}
                contentFit="contain"
              />
            ) : (
              <Text
                style={{
                  fontSize: font(14),
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
                style={{ width: "75%", height: "75%" }}
                contentFit="contain"
              />
            ) : (
              <Text
                style={{
                  fontSize: font(14),
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
            fontSize: font(11),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            textAlign: "center",
            width: "100%",
            lineHeight: font(14),
          }}
        >
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.cardWidth === nextProps.cardWidth &&
    prevProps.bgColor === nextProps.bgColor,
);

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();

  const { categories, loading, error, refetch } = useAppMenuCategories();

  // Level 1 Root Categories (parent_id === 0) that HAVE subcategories
  const level1Roots = useMemo(() => {
    const allCats = categories || [];
    return allCats
      .filter((cat) => {
        if (cat.parent_id !== 0) return false;
        // Only include parents that have at least 1 child category
        return allCats.some((sub) => sub.parent_id === cat.id);
      })
      .sort((a, b) => (a.sequence ?? 99) - (b.sequence ?? 99));
  }, [categories]);

  const [selectedLevel1Id, setSelectedLevel1Id] = useState<number | null>(null);

  useEffect(() => {
    if (
      level1Roots.length > 0 &&
      (selectedLevel1Id === null ||
        !level1Roots.some((r) => r.id === selectedLevel1Id))
    ) {
      setSelectedLevel1Id(level1Roots[0].id);
    }
  }, [level1Roots, selectedLevel1Id]);

  const selectedLevel1 = useMemo(() => {
    return level1Roots.find((c) => c.id === selectedLevel1Id) || level1Roots[0];
  }, [level1Roots, selectedLevel1Id]);

  // Level 2 Categories under selected Level 1
  const level2Children = useMemo(() => {
    if (!selectedLevel1) return [];
    return (categories || []).filter(
      (cat) => cat.parent_id === selectedLevel1.id,
    );
  }, [categories, selectedLevel1]);

  // Group Level 2 items and their Level 3 children
  const level2Grouped = useMemo(() => {
    return level2Children.map((level2Item) => {
      const level3Children = (categories || []).filter(
        (cat) => cat.parent_id === level2Item.id,
      );
      return {
        level2Item,
        level3Children,
      };
    });
  }, [categories, level2Children]);

  // Separate Level 2 items that HAVE Level 3 children vs Level 2 items that DO NOT
  const sectionsWithLevel3 = useMemo(() => {
    return level2Grouped.filter((g) => g.level3Children.length > 0);
  }, [level2Grouped]);

  const directLevel2Only = useMemo(() => {
    return level2Grouped
      .filter((g) => g.level3Children.length === 0)
      .map((g) => g.level2Item);
  }, [level2Grouped]);

  // Calculate card dimensions for right pane
  const rightPaneWidth = windowWidth - SIDEBAR_WIDTH - RIGHT_PADDING * 2;
  const cardWidth = Math.floor(
    (rightPaneWidth - GRID_GAP * (GRID_COLUMNS - 1) - 1) / GRID_COLUMNS,
  );

  const navigateToCategory = (
    item: AppMenuCategoryItem,
    rootCategory?: AppMenuCategoryItem,
    isHeaderClick?: boolean,
  ) => {
    const root = isHeaderClick ? item : rootCategory || selectedLevel1;
    const subCatId = isHeaderClick ? 0 : item.id;

    router.push({
      pathname: "/(stack)/category/[slug]",
      params: {
        slug: String(root?.id || item.parent_id || item.id),
        name: root?.category_name || item.category_name,
        image:
          root?.s3_image_url ||
          root?.category_image ||
          item.s3_image_url ||
          item.category_image ||
          "",
        selectedSubCategoryId: String(subCatId),
      },
    });
  };

  const getDynamicLightColor = (id: number) => {
    const hue = (id * 137.5) % 360;
    return `hsl(${hue}, 65%, 96%)`;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavbar title="Categories" showBack />
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
        <AppNavbar title="Categories" showBack />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing(20),
          }}
        >
          <Text
            style={{
              color: colors.error,
              fontFamily: "Poppins_500Medium",
              marginBottom: spacing(12),
            }}
          >
            Unable to load categories
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              paddingHorizontal: spacing(16),
              paddingVertical: spacing(8),
              backgroundColor: colors.primary,
              borderRadius: spacing(6),
            }}
          >
            <Text style={{ color: "#FFF", fontFamily: "Poppins_600SemiBold" }}>
              Retry
            </Text>
          </TouchableOpacity>
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
      <AppNavbar title="Categories" showBack />

      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* LEFT SIDEBAR - LEVEL 1 CATEGORIES */}
        <View
          style={{
            width: SIDEBAR_WIDTH,
            backgroundColor: "#FFFFFF",
            borderRightWidth: 1,
            borderRightColor: "#EEEEEE",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing(6) }}
          >
            {level1Roots.map((cat) => (
              <SidebarCategoryItem
                key={cat.id}
                item={cat}
                isActive={cat.id === selectedLevel1?.id}
                onPress={(item) => setSelectedLevel1Id(item.id)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        {/* RIGHT CONTENT AREA - LEVEL 2 & LEVEL 3 */}
        <View style={{ flex: 1, paddingHorizontal: RIGHT_PADDING }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: spacing(12),
              paddingBottom: spacing(100),
            }}
          >
            {/* LEVEL 2 SECTIONS WITH LEVEL 3 CHILDREN */}
            {sectionsWithLevel3.map(({ level2Item, level3Children }) => (
              <View key={level2Item.id} style={{ marginBottom: spacing(18) }}>
                {/* LEVEL 2 HEADER */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigateToCategory(level2Item, undefined, true)
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: spacing(10),
                  }}
                >
                  <Text
                    style={{
                      fontSize: font(13.5),
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                    }}
                  >
                    {level2Item.category_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(2),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(11),
                        fontFamily: "Poppins_500Medium",
                        color: colors.primary,
                      }}
                    >
                      See All
                    </Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>

                {/* LEVEL 3 GRID (EXACTLY 3 COLUMNS PER ROW) */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: GRID_GAP,
                  }}
                >
                  {level3Children.map((level3Item) => (
                    <RightCategoryCard
                      key={level3Item.id}
                      item={level3Item}
                      parentItem={level2Item}
                      cardWidth={cardWidth}
                      bgColor={level3Item.category_bg_color || getDynamicLightColor(level3Item.id)}
                      onNavigate={navigateToCategory}
                    />
                  ))}
                </View>
              </View>
            ))}

            {/* LEVEL 2 ITEMS THAT DON'T HAVE LEVEL 3 CHILDREN */}
            {directLevel2Only.length > 0 && (
              <View style={{ marginBottom: spacing(18) }}>
                {sectionsWithLevel3.length > 0 && (
                  <Text
                    style={{
                      fontSize: font(13),
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                      marginBottom: spacing(10),
                    }}
                  >
                    Other Categories
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: GRID_GAP,
                  }}
                >
                  {directLevel2Only.map((level2Item) => (
                    <RightCategoryCard
                      key={level2Item.id}
                      item={level2Item}
                      parentItem={selectedLevel1}
                      cardWidth={cardWidth}
                      bgColor={level2Item.category_bg_color || getDynamicLightColor(level2Item.id)}
                      onNavigate={navigateToCategory}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
