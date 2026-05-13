import { Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Tag } from "lucide-react-native";
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
      activeOpacity={0.88}
      style={{ flex: 1 }}
    >
      {/* IMAGE BLOCK WITH FLOATING DISCOUNT BADGE */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: spacing(14),
          overflow: "hidden",
          backgroundColor: colors.surfaceElevated,
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: item.image_path }}
          style={{
            width: "90%",
            aspectRatio: 1,
          }}
          contentFit="contain"
        />

        {/* Discount badge */}
        {discount && (
          <View
            style={{
              position: "absolute",
              top: spacing(8),
              left: spacing(8),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: spacing(8),
              height: spacing(22),
              borderRadius: spacing(7),
              backgroundColor: colors.saleRed,
            }}
          >
            <Tag
              size={spacing(10)}
              color={colors.textInverse}
              strokeWidth={2.2}
            />
            <Text
              style={{
                marginLeft: spacing(4),
                fontSize: font(10),
                color: colors.textInverse,
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {discount}%
            </Text>
          </View>
        )}
      </View>

      {/* INFO BELOW IMAGE */}
      <View style={{ paddingTop: spacing(3) }}>
        {/* Price row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(4),
          }}
        >
          <Text
            style={{
              fontSize: font(16),
              color: colors.text,
              fontFamily: "Poppins_700Bold",
              includeFontPadding: false,
            }}
          >
            ₹{formatPrice(price)}
          </Text>

          {discount && (
            <Text
              style={{
                fontSize: font(9),
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

        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            marginTop: spacing(1),
            lineHeight: font(16),
          }}
        >
          {item.product_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;
