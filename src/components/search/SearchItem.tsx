import { Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

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
        {/* Title */}
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

        {/* 🔥 Price Row (FIXED ALIGNMENT) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center", // ✅ IMPORTANT FIX
            marginTop: spacing(4),
          }}
        >
          {/* Left Side (Price + MRP + Offer) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(6),
              flexShrink: 1,
            }}
          >
            {/* Selling Price */}
            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_700Bold",
                color: colors.primary,
              }}
            >
              ₹{sellingPrice}
            </Text>

            {/* MRP */}
            {mrp > 0 && (
              <Text
                style={{
                  fontSize: font(11),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textSecondary,
                  textDecorationLine: "line-through",
                }}
              >
                MRP: ₹{mrp}
              </Text>
            )}

            {/* ✅ New Offer UI (No Gradient) */}
            {discountPercentage > 0 && (
              <View
                style={{
                  borderWidth: 0.5,
                  borderRadius: spacing(20),
                  borderColor: colors.error + "80",
                  backgroundColor: colors.error + "12",
                  paddingVertical: spacing(2),
                  paddingHorizontal: spacing(8),
                }}
              >
                <Text
                  style={{
                    fontSize: font(10.5),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.error,
                    includeFontPadding: false,
                  }}
                >
                  {discountPercentage}% off
                </Text>
              </View>
            )}
          </View>

          {/* Right Arrow */}
          <View
            style={{
              marginLeft: "auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronRight
              size={spacing(16)}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;