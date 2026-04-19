import { Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  item: any;
}

const SearchItem: React.FC<Props> = ({ item }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const sellingPrice = Number(item?.selling_price) || 0;
  const mrp = Number(item?.mrp) || 0;
  const discountPercentage =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;
  const productTitle = item?.size
    ? `${item.product_name} - ${item.size}`
    : item.product_name;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
    //   onPress={() => {
    //     router.push(`/product/${item.product_url}`);
    //   }}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: spacing(10),
        paddingHorizontal: spacing(4),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing(10),
      }}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.image_path }}
        style={{
          width: spacing(54),
          height: spacing(54),
          borderRadius: 12,
          backgroundColor: colors.backgroundgray,
        }}
        resizeMode="contain"
      />

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(13.5),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
            lineHeight: font(20),
          }}
        >
          {productTitle}
        </Text>

        {/* Price */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: spacing(4),
            flexWrap: "wrap",
          }}
        >
          <Text
            style={{
              fontSize: font(12),
              fontFamily: "Poppins_700Bold",
              color: colors.primary,
              lineHeight: font(17),
            }}
          >
            ₹{item.selling_price}
          </Text>

          {mrp > 0 ? (
            <Text
              style={{
                fontSize: font(11),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
                textDecorationLine: "line-through",
                lineHeight: font(16),
              }}
            >
              MRP ₹{item.mrp}
            </Text>
          ) : null}

          {discountPercentage > 0 ? (
            <LinearGradient
              colors={[
                colors.error + "30",
                colors.error + "18",
                colors.error + "08",
              ]}
              style={{
                borderRadius: 10,
                paddingHorizontal: spacing(8),
                paddingVertical: spacing(4),
              }}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <Text
                style={{
                  fontSize: font(10.5),
                  fontFamily: "Poppins_500Medium",
                  color: colors.error,
                  lineHeight: font(14),
                }}
              >
                {discountPercentage}% off
              </Text>
            </LinearGradient>
          ) : null}

          <View style={{ marginLeft: "auto", paddingLeft: spacing(4), paddingTop: 1 }}>
            <ChevronRight size={spacing(16)} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;
