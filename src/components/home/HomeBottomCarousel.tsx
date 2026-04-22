import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { BannerItem } from "../../types/home.types";
import { useRouter } from "expo-router";

interface Props {
  item: BannerItem;
}

export default function HomeBottomBanner({ item }: Props) {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const router = useRouter();

  if (!item) return null;

  const handlePress = () => {
    const { app_redirect_key, app_redirect_value } = item;

    console.log("key:", app_redirect_key);
    console.log("value:", app_redirect_value);

    if (app_redirect_key === "products") {
      // router.push({
      //   pathname: "(stack)/product/[id]",
      //   params: {
      //     id: "slug",
      //     product_slug: app_redirect_value,
      //   },
      // });
      return;
    }

    if (app_redirect_key === "categories") {
      // router.push({
      //   pathname: "(tabs)/shop",
      //   params: {
      //     category_slug: app_redirect_value,
      //   },
      // });
      return;
    }
  };

  return (
    <View style={{ paddingHorizontal: spacing(16), marginTop: spacing(10) }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={{
          borderRadius: spacing(16),
          overflow: "hidden",
          padding: 2,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            borderRadius: spacing(12),
            aspectRatio: 16 / 7,
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}
