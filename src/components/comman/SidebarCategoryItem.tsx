// src/components/comman/SidebarCategoryItem.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Image } from "expo-image";
import { CategoryItem, AppMenuCategoryItem } from "../../types/home.types";

type SidebarItemType = CategoryItem | AppMenuCategoryItem;

type Props = {
  item: SidebarItemType;
  isActive: boolean;
  onPress: (item: any) => void;
  colors: any;
};

const SidebarCategoryItem: React.FC<Props> = ({
  item,
  isActive,
  onPress,
  colors,
}) => {
  const flipImg = "flip_image" in item ? item.flip_image : null;
  const normalImg =
    item.category_image ||
    item.s3_image_path ||
    ("s3_image_url" in item ? item.s3_image_url : null);

  const imageUrl = isActive
    ? flipImg || normalImg
    : normalImg || flipImg;

  const activeColor = colors?.primary || "#00875A";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Circle Image Wrapper */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: isActive ? `${activeColor}1A` : "#F2F4F7",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />
        ) : (
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Poppins_600SemiBold",
              color: isActive ? activeColor : "#757575",
            }}
          >
            {item.category_name?.[0]?.toUpperCase() ?? "?"}
          </Text>
        )}
      </View>

      {/* Category Title */}
      <Text
        numberOfLines={2}
        style={{
          marginTop: 4,
          fontSize: 9.5,
          fontFamily: isActive ? "Poppins_700Bold" : "Poppins_500Medium",
          color: isActive ? "#111111" : "#666666",
          textAlign: "center",
          lineHeight: 12,
          width: "100%",
        }}
      >
        {item.category_name}
      </Text>

      {/* Right Active Indicator Bar */}
      {isActive && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 6,
            bottom: 6,
            width: 4,
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            backgroundColor: activeColor,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

export default SidebarCategoryItem;
