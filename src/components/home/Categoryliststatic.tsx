import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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
        style={styles.itemWrapper}
        // className="bg-red-600"
      >
        <View
          style={[
            styles.imageCircle,
            {
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: colors.surface,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Image source={item.image} style={styles.image} contentFit="cover" />
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.label,
            {
              fontFamily: isSelected
                ? "Poppins_600SemiBold"
                : "Poppins_500Medium",
              fontSize: getResponsiveFontSize(10),
              color: isSelected ? colors.primary : colors.text,
            },
          ]}
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
      />
    </View>
  );
};

export default CategoryListStatic;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  itemWrapper: {
    alignItems: "center",
  },

  imageCircle: {
    width: 90,
    height: 56,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  label: {
    textAlign: "center",
    lineHeight: 14,
  },
});
