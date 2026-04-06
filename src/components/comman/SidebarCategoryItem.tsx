// src/components/category/SidebarCategoryItem.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Image } from "expo-image";
import { CategoryItem } from "../../types/home.types";

type Props = {
  item: CategoryItem;
  isActive: boolean;
  onPress: (item: CategoryItem) => void;
  colors: any;
};

const SidebarCategoryItem: React.FC<Props> = ({
  item,
  isActive,
  onPress,
  colors,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
        gap: 6,
        backgroundColor: isActive ? colors.primary + "15" : "transparent",
        borderLeftWidth: 3,
        borderLeftColor: isActive ? colors.primary : "transparent",
        position: "relative",
      }}
    >
      {/* Image circle */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: isActive ? 2 : 1.5,
          borderColor: isActive ? colors.primary : colors.border,
          backgroundColor: colors.border,
          // Subtle shadow on active
          shadowColor: isActive ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: isActive ? 4 : 0,
        }}
      >
        {item.s3_image_path ? (
          <Image
            source={{ uri: item.s3_image_path }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          // Fallback: first letter of category name
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive ? colors.primary + "20" : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_600SemiBold",
                color: isActive ? colors.primary : colors.textSecondary,
              }}
            >
              {item.category_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      {/* Category name */}
      <Text
        numberOfLines={2}
        style={{
          fontSize: 10,
          fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular",
          color: isActive ? colors.primary : colors.textSecondary,
          textAlign: "center",
          lineHeight: 14,
        }}
      >
        {item.category_name}
      </Text>

      {/* Active dot indicator */}
      {isActive && (
        <View
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

export default SidebarCategoryItem;