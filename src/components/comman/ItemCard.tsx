// src/components/home/ItemCard.tsx
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 12) / 2;

export interface ItemData {
  id: number;
  slug: string;
  product_name: string;
  selling_price: string;
  mrp: string;
  avg_rating: string;
  total_reviews: number;
  s3_image_path: string;
  overview?: string;
}

interface Props {
  item: ItemData;
  onPress?: (item: ItemData) => void;
  onAddToCart?: (item: ItemData) => void;
}

const getDiscount = (mrp: string, selling: string) => {
  const m = parseFloat(mrp);
  const s = parseFloat(selling);
  if (!m || !s || m <= s) return null;
  return Math.round(((m - s) / m) * 100);
};

export default function ItemCard({ item, onPress, onAddToCart }: Props) {
  const { colors } = useTheme();
  const discount = getDiscount(item.mrp, item.selling_price);
  const rating = parseFloat(item.avg_rating);
  const [qty, setQty] = useState(0);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress?.(item)}
      style={{ width: CARD_WIDTH , borderColor: colors.border}}
      className="border p-2 rounded-2xl"
    
    >
      {/* ── Image ── */}
      <View
        style={{ borderColor: colors.border }}
        className="rounded-2xl overflow-hidden border"
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: CARD_WIDTH,
            height: CARD_WIDTH,
            backgroundColor: colors.surfaceElevated,
          }}
          contentFit="cover"
        />
        {discount && (
          <View
            style={{ backgroundColor: colors.secondary }}
            className="absolute top-2.5 right-0 pl-2.5 pr-2 py-1 rounded-l-2xl"
          >
            <Text
              className="text-white"
              style={{
                fontSize: 10,
                fontWeight: "700",
                fontFamily: "Poppins_700Bold",
                letterSpacing: 0.2,
              }}
            >
              {discount}% off
            </Text>
          </View>
        )}

        {rating > 0 && (
          <>
            <View
              className="absolute bottom-2 left-2 flex flex-row items-center"
              style={{
                gap: 4,
                backgroundColor: colors.primary,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                marginRight: 5,
              }}
            >
              <Ionicons name="star" size={12} color={colors.background} />

              <Text
                className="text-white"
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                {rating.toFixed(1)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Body ── fixed heights = uniform cards */}
      <View className="px-0.5 pt-2" style={{ gap: 3 }}>
        {/* Name — fixed 2 line height */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
            lineHeight: 18,
            height: 36, // 2 × 18px — always 2 line space
            fontFamily: "Poppins_600SemiBold",
          }}
        >
          {item.product_name}
        </Text>

        {/* Overview — fixed 2 line height */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            lineHeight: 15,
            height: 30, // 2 × 15px — always 2 line space
            fontFamily: "Poppins_400Regular",
          }}
        >
          {item.overview ?? ""}
        </Text>

        {/* Price */}
        <View className="flex-row items-baseline" style={{ gap: 5 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
              fontFamily: "Poppins_700Bold",
            }}
          >
            ₹{parseInt(item.selling_price)}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.textTertiary,
              textDecorationLine: "line-through",
              fontFamily: "Poppins_400Regular",
            }}
          >
            ₹{parseInt(item.mrp)}
          </Text>
        </View>
        <View  className="flex-row items-center"></View>
      </View>

      {/* ── Add to Cart ── */}
      {qty === 0 ? (
        // ➕ Add Button
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setQty(1);
            onAddToCart?.(item);
          }}
          activeOpacity={0.82}
          style={{ backgroundColor: colors.primary }}
          className="py-2.5 items-center mt-2 rounded-xl"
        >
          <Text className="text-white font-semibold">+ Add To Cart</Text>
        </TouchableOpacity>
      ) : (
        // 🔄 Quantity Controller
        <View
          className="flex-row items-center justify-between mt-2 rounded-md px-3 py-2"
          style={{ backgroundColor: colors.primary }}
        >
          {/* Minus */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              if (qty === 1) {
                setQty(0);
              } else {
                setQty(qty - 1);
              }
            }}
          >
            <Text className="text-white text-lg font-bold">−</Text>
          </TouchableOpacity>

          {/* Quantity */}
          <Text className="text-white font-semibold">{qty}</Text>

          {/* Plus */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setQty(qty + 1);
              onAddToCart?.(item);
            }}
          >
            <Text className="text-white text-lg font-bold">+</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
