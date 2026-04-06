import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";

// ─── Static data ──────────────────────────────────────────────────────────────

import image1 from "../../../assets/category/Ant.jpeg";
import image2 from "../../../assets/category/BadBugs.png";
import image3 from "../../../assets/category/cockroach.png";
import image4 from "../../../assets/category/FlyWood.png";
import image5 from "../../../assets/category/Lizard.png";
import image6 from "../../../assets/category/Mosquito.jpeg";
import image7 from "../../../assets/category/Rat.png";
import image8 from "../../../assets/category/Snake.png";
import image9 from "../../../assets/category/Termite.png";
import { useResponsive } from "../../utils/useResponsive";

type StaticCategory = {
  id: number;
  name: string;
  image: any;
};

const STATIC_CATEGORIES: StaticCategory[] = [
  { id: 1, name: "Ant", image: image1 },
  { id: 2, name: "Bad Bugs", image: image2 },
  { id: 3, name: "Cockroach", image: image3 },
  { id: 4, name: "Fly / Wood", image: image4 },
  { id: 5, name: "Lizard", image: image5 },
  { id: 6, name: "Mosquito", image: image6 },
  { id: 7, name: "Rat", image: image7 },
  { id: 8, name: "Snake", image: image8 },
  { id: 9, name: "Termite", image: image9 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

type Props = {
  onSelect?: (category: StaticCategory) => void;
  selectedId?: number;
  loading?: boolean;
};

const CategorySkeleton = ({
  itemSize,
  gap,
  colors,
}: {
  itemSize: number;
  gap: number;
  colors: ReturnType<typeof useTheme>["colors"];
}) => (
  <View>
    <FlatList
      data={Array.from({ length: 6 }, (_, index) => index)}
      keyExtractor={(item) => String(item)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap }}
      renderItem={() => (
        <View style={{ width: itemSize, alignItems: "center" }}>
          <View
            style={{
              width: itemSize,
              height: itemSize,
              borderRadius: itemSize / 2,
              borderWidth: 3,
              borderColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <View
              style={{
                width: itemSize - 12,
                height: itemSize - 12,
                borderRadius: (itemSize - 12) / 2,
                backgroundColor: colors.backgroundSkeleton,
              }}
            />
          </View>

          <View
            style={{
              width: itemSize * 0.9,
              height: 10,
              borderRadius: 999,
              marginTop: 10,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          <View
            style={{
              width: itemSize * 0.6,
              height: 8,
              borderRadius: 999,
              marginTop: 6,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />
        </View>
      )}
    />
  </View>
);

const CategoryListStatic: React.FC<Props> = ({
  onSelect,
  selectedId,
  loading = false,
}) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const itemSize = spacing(72);
  const imageSize = spacing(58);
  const gap = spacing(14);

  if (loading) {
    return <CategorySkeleton itemSize={itemSize} gap={gap} colors={colors} />;
  }

  const renderItem = ({ item }: { item: StaticCategory }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelect?.(item)}
        style={{
          width: itemSize,
          alignItems: "center",
          paddingVertical: spacing(2),
        }}
      >
        <View
          style={{
            width: itemSize,
            height: itemSize,
            borderRadius: itemSize / 2,
            borderWidth: isSelected ? 4 : 3,
            borderColor: isSelected
              ? "rgba(255,255,255,0.92)"
              : "rgba(255,255,255,0.38)",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isSelected
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.06)",
            shadowColor: "#000",
            shadowOpacity: isSelected ? 0.18 : 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: isSelected ? 5 : 3,
          }}
        >
          <View
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: isSelected
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.55)",
              backgroundColor: "rgba(255,255,255,0.16)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={item.image}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={{
            fontFamily: isSelected ? "Poppins_600SemiBold" : "Poppins_500Medium",
            fontSize: font(10),
            color: isSelected ? "#ffffff" : "rgba(255,255,255,0.88)",
            textAlign: "center",
            width: itemSize,
            lineHeight: font(14),
            marginTop: spacing(8),
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <FlatList
        data={STATIC_CATEGORIES}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap }}
      />
    </View>
  );
};

export default CategoryListStatic;
