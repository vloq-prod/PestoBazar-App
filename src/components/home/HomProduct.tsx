// src/components/home/HomeProduct.tsx
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useHomeProduct } from "../../hooks/homeHooks";
import ItemCard, { ItemData } from "../comman/ItemCard";
import { useTheme } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

// ── Skeleton Card ──
const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={{ width: CARD_WIDTH, gap: 8 }}>
      <View style={{ width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 14, backgroundColor: colors.surfaceElevated }} />
      <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.surfaceElevated, width: "80%" }} />
      <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.surfaceElevated, width: "55%" }} />
      <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.surfaceElevated, width: "40%" }} />
      <View style={{ height: 36, borderRadius: 6, backgroundColor: colors.surfaceElevated }} />
    </View>
  );
};

// ── Skeleton Section ──
const SkeletonSection = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View className="flex-row justify-between items-center px-4">
        <View style={{ height: 16, width: 130, borderRadius: 8, backgroundColor: colors.surfaceElevated }} />
        <View style={{ height: 13, width: 60, borderRadius: 8, backgroundColor: colors.surfaceElevated }} />
      </View>
      <FlatList
        horizontal
        data={[1, 2, 3]}
        keyExtractor={(i) => String(i)}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={() => <SkeletonCard />}
      />
    </View>
  );
};

// ── Section Header ──
const SectionHeader = ({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-between px-4">
      {/* Left: accent bar + title */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
    
        <Text
          style={{
            fontSize: 20,
            color: colors.text,
            fontFamily: "Poppins_700Bold",
            letterSpacing: 0.1,
          }}
        >
          {title}
        </Text>
      </View>

    </View>
  );
};

// ── Main ──
const HomeProduct = () => {
  const { sections, loading, error, refetch } = useHomeProduct();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ gap: 24 }}>
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="mx-4 items-center rounded-xl"
        style={{
          padding: 24,
          borderWidth: 0.5,
          borderColor: colors.border,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            fontFamily: "Poppins_400Regular",
            textAlign: "center",
          }}
        >
          Failed to load products
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.8}
          style={{ backgroundColor: colors.primary }}
          className="px-5 py-2 rounded-2xl"
        >
          <Text
            className="text-white"
            style={{
              fontSize: 12,
              fontFamily: "Poppins_500Medium",
              fontWeight: "500",
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 24 }}>
      {sections.map((section, sIndex) => (
        <View key={sIndex} style={{ gap: 12 }}>
          <SectionHeader
            title={section.title}
            onViewAll={() => console.log("View All →", section.title)}
          />
          <FlatList
            horizontal
            data={section.products}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <ItemCard
                item={item as ItemData}
                onPress={(p) => console.log("press", p.slug)}
                onAddToCart={(p) => console.log("cart", p.id)}
              />
            )}
          />
        </View>
      ))}
    </View>
  );
};

export default HomeProduct;