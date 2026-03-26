import React from "react";
import { View, TouchableOpacity, Image, Dimensions } from "react-native";
import { useTheme } from "../../theme";
import { BannerItem } from "../../types/home.types";

const { width } = Dimensions.get("window");

interface Props {
  data: BannerItem[];
  onPress?: (item: BannerItem) => void;
}

export default function FeatureBannerColumn({ data, onPress }: Props) {
  const { colors } = useTheme();

  if (!data?.length) return null;

  return (
    <View
      className="p-5 gap-2"
    >
      {data.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.9}
          onPress={() => onPress?.(item)}
          style={{
            width: "100%",
            height: 120,
            borderWidth: 1,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border
          }}
        >
          <Image
            source={{ uri: item.s3_image_path }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}