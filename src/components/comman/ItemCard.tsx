// src/components/home/ItemCard.tsx
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import { useState, useRef } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react-native";

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
  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");
  const inputRef = useRef<TextInput>(null);

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      setQty(parsed);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal);
    if (isNaN(parsed) || parsed <= 0) {
      setQty(0);
      setInputVal("1");
    } else {
      setQty(parsed);
      setInputVal(String(parsed));
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress?.(item)}
      style={{ width: CARD_WIDTH, borderColor: colors.border }}
      className=""
    >
      {/* ── Image ── */}

      <View
        style={{
          overflow: "hidden",
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        className="border rounded-lg"
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: colors.surfaceElevated,
          }}
          className="rounded-lg"
          contentFit="cover"
        />
      </View>

      {/* ── Body ── */}
      <View className="px-0.5 pt-2" style={{ gap: 3 }}>
        <View className="flex-row items-end justify-between">
          <View className="flex-row items-baseline" style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
                lineHeight: 23,
              }}
            >
              ₹{parseInt(item.selling_price)}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_500Medium",
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                lineHeight: 20,
                marginBottom: 1,
              }}
            >
              ₹{parseInt(item.mrp)}
            </Text>
            {discount && (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_500Medium",
                  color: colors.error,
                  letterSpacing: 0.2,
                  lineHeight: 20,
                }}
              >
                {discount}% off
              </Text>
            )}
          </View>
        </View>
        {/* Name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14,
            lineHeight: 18,
            height: 36,
            fontFamily: "Poppins_500Medium",
            color: colors.text,
          }}
        >
          {item.product_name}
        </Text>

        {/* Overview */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            lineHeight: 14,
            height: 28,
            fontFamily: "Poppins_400Regular",
          }}
        >
          {item.overview ?? ""}
        </Text>

        {/* Price row */}
      </View>

      {/* ── Add to Cart / Qty Controller ── */}
      {qty === 0 ? (
        /* Add to Cart Button */
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setQty(1);
            setInputVal("1");
            onAddToCart?.(item);
          }}
          activeOpacity={0.82}
          style={{ backgroundColor: colors.primary }}
          className="flex-row items-center justify-center gap-2 py-2.5 mt-3 rounded-lg"
        >
          <ShoppingCart size={14} color="#fff" strokeWidth={2.5} />
          <Text
            style={{
              color: "#fff",
              fontFamily: "Poppins_500Medium",
              fontSize: 13,
              lineHeight: 22,
            }}
          >
            Add To Cart
          </Text>
        </TouchableOpacity>
      ) : (
        /* Quantity Controller */
        <View
          className="flex-row items-center justify-between mt-3 rounded-lg overflow-hidden"
          style={{
            backgroundColor: colors.primary,
            height: 40,
          }}
        >
          {/* Delete (qty=1) or Minus */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              if (qty <= 1) {
                setQty(0);
                setInputVal("1");
              } else {
                const next = qty - 1;
                setQty(next);
                setInputVal(String(next));
              }
            }}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                qty === 1 ? "rgba(255,255,255,0.18)" : "transparent",
            }}
          >
            {qty === 1 ? (
              <Trash2 size={15} color="#fff" strokeWidth={2.2} />
            ) : (
              <Minus size={15} color="#fff" strokeWidth={2.5} />
            )}
          </TouchableOpacity>

          {/* Editable Quantity Input */}
          <TextInput
            ref={inputRef}
            value={inputVal}
            onChangeText={handleQtyInput}
            onBlur={handleInputBlur}
            maxLength={3}
            keyboardType="number-pad"
            selectTextOnFocus
            style={{
              flex: 1,
              textAlign: "center",
              color: "#fff",
              fontFamily: "Poppins_600SemiBold",
              fontSize: 14,
              paddingVertical: 0,
              height: 40,
            }}
          />

          {/* Plus */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              const next = qty + 1;
              setQty(next);
              setInputVal(String(next));
              onAddToCart?.(item);
            }}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={15} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
