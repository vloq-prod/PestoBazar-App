import { Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { ArrowUpLeft } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

interface Props {
  item: any;
}

const SearchItem: React.FC<Props> = ({ item }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();

  const price = Number(item?.selling_price) || 0;
  const mrp = Number(item?.mrp) || 0;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : null;

  const formatPrice = (val: number) => {
    const fixed = val.toFixed(2);
    return fixed.endsWith(".00") ? String(Math.trunc(val)) : fixed;
  };

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "(stack)/product/[id]",
          params: {
            id: "slug",
            product_slug: item.product_url,
          },
        })
      }
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: spacing(12),
        backgroundColor: colors.surface,
      }}
    >
      {/* Product Image Thumbnail */}
      <View
        style={{
          width: spacing(40),
          height: spacing(40),
          borderRadius: spacing(8),
          overflow: "hidden",
          backgroundColor: colors.inputBackground || "#F5F5F5",
          marginRight: spacing(12),
        }}
      >
        <Image
          source={{ uri: item.image_path }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>

      {/* Product Info */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: font(14),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            includeFontPadding: false,
          }}
        >
          {item.product_name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(6), marginTop: spacing(4) }}>
          <Text
            style={{
              fontSize: font(13),
              fontFamily: "Poppins_600SemiBold",
              color: colors.textSecondary,
              includeFontPadding: false,
            }}
          >
            ₹{formatPrice(price)}
          </Text>

          {discount && (
            <Text
              style={{
                fontSize: font(11),
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                fontFamily: "Poppins_400Regular",
                includeFontPadding: false,
              }}
            >
              ₹{formatPrice(mrp)}
            </Text>
          )}
        </View>
      </View>

      {/* Arrow Icon */}
      <ArrowUpLeft size={18} color={colors.textTertiary || colors.border} style={{ marginLeft: spacing(10) }} />
    </TouchableOpacity>
  );
};

export default SearchItem;
