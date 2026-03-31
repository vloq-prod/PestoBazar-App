import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../theme";
import React, { useState, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  StarIcon,
} from "lucide-react-native";
import { ListingItem } from "../../types/shop.types";

const CARD_WIDTH = (Dimensions.get("window").width - 16 * 2 - 12) / 2;

interface Props {
  item: ListingItem;
  mode?: "grid" | "list";
  onPress?: (item: ListingItem) => void;
  onAddToCart?: (item: ListingItem) => void;
}

const getDiscount = (mrp: string, selling: string) => {
  const m = parseFloat(mrp);
  const s = parseFloat(selling);
  if (!m || !s || m <= s) return null;
  return Math.round(((m - s) / m) * 100);
};

const ShopItemCard = ({ item, mode = "grid", onPress, onAddToCart }: Props) => {
  const { colors } = useTheme();
  const discount = getDiscount(item.mrp, item.selling_price);
  const rating = parseFloat(item.avg_rating);
  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");
  const inputRef = useRef<TextInput>(null);

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) setQty(parsed);
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

  // ── Shared: Qty Controller ─────────────────────────────────
  const QtyController = (
    <View
      className="flex-row items-center justify-between rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.primary, height: 40 }}
    >
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
          backgroundColor: qty === 1 ? "rgba(255,255,255,0.18)" : "transparent",
        }}
      >
        {qty === 1 ? (
          <Trash2 size={15} color="#fff" strokeWidth={2.2} />
        ) : (
          <Minus size={15} color="#fff" strokeWidth={2.5} />
        )}
      </TouchableOpacity>

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
  );

  // ── Shared: Add Button ─────────────────────────────────────
  const AddButton = (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        setQty(1);
        setInputVal("1");
        onAddToCart?.(item);
      }}
      activeOpacity={0.82}
      style={{ backgroundColor: colors.primary }}
      className="flex-row items-center justify-center gap-2 py-2.5 rounded-lg"
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
  );

  if (mode === "grid") {
    return (
      <TouchableOpacity
      className="flex-1"
        activeOpacity={0.88}
        onPress={() => onPress?.(item)}
        style={{ width: CARD_WIDTH, borderColor: colors.border}}
      >
        {/* Image + Rating Badge */}
        <View
          style={{
            overflow: "hidden",
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
          className="border rounded-lg"
        >
          <Image
            source={{ uri: item.image_path }}
            style={{
              width: "100%",
              aspectRatio: 1,
              backgroundColor: colors.surfaceElevated,
            }}
            className="rounded-lg"
            contentFit="cover"
          />
          {rating > 0 && (
            <View
              className="absolute bottom-2 left-2 flex-row items-center gap-1.5 px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: colors.primary }}
            >
              <StarIcon
                size={9}
                color={colors.background}
                fill={colors.background}
              />
              <Text
                style={{
                  fontSize: 10,
                  lineHeight: 15,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.textInverse,
                }}
              >
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Body */}
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
        <View className="mt-3">{qty === 0 ? AddButton : QtyController}</View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress?.(item)}
      className="flex-row gap-2 "
      style={{ marginBottom: 10 }}
    >
      <View style={{ position: "relative" }}>
        <View
          style={{
            width: 150,
            height: 150,
            minHeight: 150,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.image_path }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: colors.surfaceElevated,
            }}
            contentFit="cover"
          />
        </View>

        {/* Rating badge */}
        {rating > 0 && (
          <View
            className="absolute bottom-2 left-2 flex-row items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: colors.primary }}
          >
            <StarIcon
              size={9}
              color={colors.background}
              fill={colors.background}
            />
            <Text
              style={{
                fontSize: 10,
                lineHeight: 15,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textInverse,
              }}
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Right — Body */}
      <View
        className="flex-1"
        style={{ gap: 4, justifyContent: "space-between" }}
      >
        {/* Top */}
        <View style={{ gap: 3 }}>
          {/* Name */}
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              lineHeight: 18,
              fontFamily: "Poppins_500Medium",
              color: colors.text,
            }}
          >
            {item.product_name}
          </Text>

          {/* Overview */}
          {item.overview ? (
            <Text
              numberOfLines={2}
              style={{
                fontSize: 11,
                color: colors.textTertiary,
                lineHeight: 15,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {item.overview}
            </Text>
          ) : null}
        </View>

        {/* Bottom — Price + Cart */}
        <View style={{ gap: 8 }}>
          {/* Price row */}
          <View className="flex-row items-baseline" style={{ gap: 5 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
                lineHeight: 22,
              }}
            >
              ₹{parseInt(item.selling_price)}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                color: colors.textTertiary,
                textDecorationLine: "line-through",
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

          {/* Cart */}
          {qty === 0 ? AddButton : QtyController}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ShopItemCard);