import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { BannerItem } from "../../types/home.types";

interface Props {
  item: BannerItem;
  onPress?: (item: BannerItem) => void;
}

export default function HomeBottomBanner({ item, onPress }: Props) {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  if (!item) return null;

  return (
    <View style={{ paddingHorizontal: spacing(16), marginTop: spacing(10) }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
        style={{
          borderRadius: spacing(16),
          overflow: "hidden",
          padding: 2,

          borderWidth: 1,
          borderColor: colors.border,

          alignSelf: "flex-start",
        }}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            borderRadius: spacing(12),
            aspectRatio: 16 / 7,  
          }}
          resizeMode="cover" // keeps original proportions
        />
      </TouchableOpacity>
    </View>
  );
}
