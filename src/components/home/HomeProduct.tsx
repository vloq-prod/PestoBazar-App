// src/components/home/HomeProduct.tsx
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useHomeProduct } from "../../hooks/homeHooks";
import ItemCard, { ItemData } from "../comman/ItemCard";
import { useTheme } from "../../theme";
import { ChevronRight } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

// ── Skeleton Card ──
const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={{ width: CARD_WIDTH, gap: 8 }}>
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_WIDTH,
          borderRadius: 14,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
      <View
        style={{
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.backgroundSkeleton,
          width: "80%",
        }}
      />
      <View
        style={{
          height: 10,
          borderRadius: 6,
          backgroundColor: colors.backgroundSkeleton,
          width: "55%",
        }}
      />
      <View
        style={{
          height: 10,
          borderRadius: 6,
          backgroundColor: colors.backgroundSkeleton,
          width: "40%",
        }}
      />
      <View
        style={{
          height: 36,
          borderRadius: 6,
          backgroundColor: colors.backgroundSkeleton,
        }}
      />
    </View>
  );
};

// ── Skeleton Section ──
const SkeletonSection = () => {
  return (
    <View style={{ gap: 14 }}>
      {/* Skeleton header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 3,
              height: 20,
              borderRadius: 2,
              backgroundColor: "#e0d9f3",
            }}
          />
          <View
            style={{
              height: 16,
              width: 130,
              borderRadius: 8,
              backgroundColor: "#e8e8e8",
            }}
          />
        </View>
        <View
          style={{ height: 13, width: 60, borderRadius: 8, backgroundColor: "#e8e8e8" }}
        />
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
      }}
    >
      {/* Left: accent bar + title */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text
          style={{
            fontSize: 19,
            color: colors.text,
            fontFamily: "Poppins_600SemiBold",
            lineHeight: 26,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Right: View All */}
      <TouchableOpacity
        onPress={onViewAll}
        activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
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
        <ChevronRight size={15} color={colors.primary} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
};

// ── Main ──
const HomeProduct = () => {
  const { sections, loading, error, refetch } = useHomeProduct();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ gap: 28 }}>
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          alignItems: "center",
          borderRadius: 16,
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
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              fontFamily: "Poppins_500Medium",
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 20 }}>
      {sections.map((section, sIndex) => (
        <View key={sIndex} style={{ gap: 14 }}>
          <SectionHeader
            title={section.title}
            onViewAll={() => console.log("view all", section.title)}
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
