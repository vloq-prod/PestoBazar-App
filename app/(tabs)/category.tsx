import { useEffect } from "react";
import {
  ActivityIndicator,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import AppNavbar from "../../src/components/comman/AppNavbar";
import { useCategory } from "../../src/hooks/homeHooks";
import { useTheme } from "../../src/theme";
import { CategoryItem } from "../../src/types/home.types";
import { useResponsive } from "../../src/utils/useResponsive";

import image1 from "../../assets/maincat/Household-pesticides.jpg";
import image2 from "../../assets/maincat/Froggersandmachines.jpg";
import image3 from "../../assets/maincat/Pestequipment.jpg";
import image4 from "../../assets/maincat/Agrochemicals.jpg";
import image5 from "../../assets/maincat/Gardeningtoolsandsupplies.jpg";

type CategoryCardData = {
  image: ImageSourcePropType;
  description: string;
};

type CategoryCardProps = {
  item: CategoryItem;
  data: CategoryCardData;
  index: number;
  cardHeight: number;
  borderRadius: number;
  padding: number;
  titleFontSize: number;
  titleLineHeight: number;
  rowGap: number;
  iconSize: number;
  iconContainerSize: number;
  itemCountColor: string;
  backgroundColor: string;
};

const categoryData: Record<string, CategoryCardData> = {
  "household-pesticides": {
    image: image1,
    description:
      "Effective solutions to control common household pests. Keep your home clean and hygienic.",
  },
  "foggers-machines": {
    image: image2,
    description:
      "Advanced fogging machines for large areas. Ensures deep and efficient pest control.",
  },
  "pest-control-equipment": {
    image: image3,
    description:
      "Professional tools for pest control work. Built for durability and performance.",
  },
  agrochemicals: {
    image: image4,
    description:
      "High-quality agrochemicals for crops. Improves yield and plant protection.",
  },
  "gardening-tools-supplies": {
    image: image5,
    description:
      "Essential gardening tools and supplies. Maintain healthy and beautiful plants.",
  },
};

const fallbackCategoryData: CategoryCardData = {
  image: image1,
  description: "Explore pest control and gardening essentials.",
};

function CategoryCard({
  item,
  data,
  index,
  cardHeight,
  borderRadius,
  padding,
  titleFontSize,
  titleLineHeight,
  iconSize,
  iconContainerSize,
  itemCountColor,
  backgroundColor,
}: CategoryCardProps) {
  const translateX = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 100;
    translateX.value = withDelay(delay, withTiming(0, { duration: 420 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 420 }));
  }, [index, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        animatedStyle,
        {
          height: cardHeight,
          borderRadius,
          backgroundColor,
        },
      ]}
    >
      <View style={[styles.mediaLayer, { borderRadius }]}>
        <Image source={data.image} style={styles.image} contentFit="cover" />
        <View style={styles.overlay} />
      </View>

      <View style={[styles.content, { padding }]}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                fontSize: titleFontSize,
                lineHeight: titleLineHeight,
              },
            ]}
          >
            {item.category_name}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.itemCount, { color: itemCountColor }]}
          >
            1200 Items
          </Text>
        </View>

        <View style={[styles.bottomRow, { columnGap: 10 }]}>
          <Text numberOfLines={2} style={styles.description}>
            {data.description}
          </Text>

          <View
            style={[
              styles.iconContainer,
              {
                width: iconContainerSize,
                height: iconContainerSize,
                borderRadius: iconContainerSize / 2,
              },
            ]}
          >
            <ChevronRight size={iconSize} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { hp, scale, font } = useResponsive();
  const insets = useSafeAreaInsets();
  const { categories, loading, error } = useCategory(0);

  const cardHeight = hp(20);
  const borderRadius = scale(18);
  const contentPadding = scale(14);
  const titleFontSize = font(15);
  const titleLineHeight = font(21);
  const rowGap = scale(10);
  const iconContainerSize = scale(32);
  const iconSize = scale(20);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppNavbar
          title="Category"
          showBack
          showSearch
          showCart
          showNotification
        />

        {loading ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text
              style={[styles.feedbackText, { color: colors.textSecondary }]}
            >
              Loading categories...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.feedbackContainer}>
            <Text style={[styles.feedbackText, { color: colors.error }]}>
              Unable to load categories right now.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + scale(60),
              },
            ]}
          >
            <View style={[styles.grid, { rowGap: scale(10) }]}>
              {categories.map((item, index) => (
                <CategoryCard
                  key={item.id}
                  item={item}
                  data={categoryData[item.slug] ?? fallbackCategoryData}
                  index={index}
                  cardHeight={cardHeight}
                  borderRadius={borderRadius}
                  padding={contentPadding}
                  titleFontSize={titleFontSize}
                  titleLineHeight={titleLineHeight}
                  rowGap={rowGap}
                  iconSize={iconSize}
                  iconContainerSize={iconContainerSize}
                  itemCountColor={colors.textTertiary}
                  backgroundColor={colors.background}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderCurve: "continuous",
  },
  mediaLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  itemCount: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flexShrink: 0,
  },
  description: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
});
