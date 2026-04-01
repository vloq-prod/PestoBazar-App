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
};

const CategoryListStatic: React.FC<Props> = ({ onSelect, selectedId }) => {
  const { colors } = useTheme();
  const { getResponsiveFontSize } = useResponsive();

  const renderItem = ({ item }: { item: StaticCategory }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onSelect?.(item)}
        style={{ alignItems: "center", gap: 8 }}
      >
        {/* Outer glow ring */}
        <View
          style={{
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: isSelected
              ? "rgba(167,139,250,0.3)"
              : "rgba(167,139,250,0.15)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Frosted glass circle */}
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              overflow: "hidden",
              borderWidth: 1.5,
              borderColor: isSelected
                ? "rgba(255,255,255,0.7)"
                : "rgba(255,255,255,0.28)",
              backgroundColor: "rgba(255,255,255,0.13)",
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
            fontSize: getResponsiveFontSize(10),
            color: isSelected ? "#ffffff" : "rgba(255,255,255,0.88)",
            textAlign: "center",
            width: 66,
            lineHeight: 14,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingVertical: 4 }}>
      <FlatList
        data={STATIC_CATEGORIES}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
      />
    </View>
  );
};

export default CategoryListStatic;

