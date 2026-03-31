import React from "react";
import { View, TouchableOpacity, Image, Dimensions } from "react-native";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";

const { width } = Dimensions.get("window");

interface Props {
  item: BannerItem;
  onPress?: (item: BannerItem) => void;
}

export default function HomeBottomBanner({ item, onPress }: Props) {
  const { colors } = useTheme();

  if (!item) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
        style={{
          width: width * 0.94,
          height: 160,
          alignSelf: "center",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colors.surfaceElevated,
        }}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
    </View>
  );
}
