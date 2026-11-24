import React from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { BannerItem } from "../../types/home.types";
import { useRouter } from "expo-router";
import { getBannerImageUrl } from "../../utils/imageUtils";
import { triggerHaptic } from "../../utils/haptics";

interface Props {
  item: BannerItem;
}

export default function HomeBottomBanner({ item }: Props) {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  if (!item) return null;

  const bannerItem = Array.isArray(item) ? item[0] : item;
  if (!bannerItem) return null;

  // Use mobile_banner_url as primary, with fallbacks
  const imageUri =
    bannerItem.mobile_banner_url ||
    bannerItem.s3_image_url ||
    bannerItem.desktop_banner_url ||
    bannerItem.s3_image_path ||
    "";

  if (!imageUri) return null;

  const BANNER_WIDTH = SCREEN_WIDTH - spacing(32);
  const BANNER_HEIGHT = BANNER_WIDTH * (7 / 16); // Clean 16:7 aspect ratio

  const handlePress = () => {
    let key = bannerItem.app_redirect_key;
    let value = bannerItem.app_redirect_value;

    const rawRedirect = bannerItem.redirect || "";
    const cleanRedirect = rawRedirect.replace(/^Home-Bottom[\t\s]*/i, "").trim();

    if (!key && cleanRedirect && cleanRedirect !== "/") {
      if (cleanRedirect.includes("/products/")) {
        key = "products";
        value = cleanRedirect.split("/products/").pop()?.split(/[?#\s]/)[0] ?? "";
      } else if (cleanRedirect.includes("/categories/")) {
        key = "categories";
        value = cleanRedirect.split("/categories/").pop()?.split(/[?#\s]/)[0] ?? "";
      } else if (cleanRedirect.includes("/brands/")) {
        key = "brands";
        value = cleanRedirect.split("/brands/").pop()?.split(/[?#\s]/)[0] ?? "";
      } else if (cleanRedirect.startsWith("/")) {
        try {
          router.push(cleanRedirect as any);
        } catch {}
        return;
      }
    }

    if (key === "products" || key === "product") {
      if (!value) return;
      const isNumeric = !isNaN(Number(value));
      router.push({
        pathname: "/(stack)/products/[slug]",
        params: isNumeric
          ? { id: value, slug: "product" }
          : { slug: value, id: "slug" },
      });
      return;
    }

    if (key === "categories" || key === "category") {
      if (!value) return;
      router.push({
        pathname: "/(stack)/shop",
        params: {
          category_slug: value,
        },
      });
      return;
    }

    if (key === "brands" || key === "brand") {
      if (!value) return;
      router.push({
        pathname: "/(stack)/shop",
        params: {
          brand_slug: value,
        },
      });
      return;
    }
  };

  return (
    <View style={{ paddingHorizontal: spacing(16), marginTop: spacing(14), marginBottom: spacing(6) }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          triggerHaptic(35);
          handlePress();
        }}
        style={{
          width: "100%",
          height: BANNER_HEIGHT,
          borderRadius: spacing(16),
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSkeleton,
        }}
      >
        <Image
          source={{
            uri: imageUri,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    </View>
  );
}
