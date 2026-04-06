import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { ListingItem } from "../../../types/shop.types";
import { useTheme } from "../../../theme";
import { useResponsive } from "../../../utils/useResponsive";

interface Props {
  item: ListingItem;
  onPress?: (item: ListingItem) => void;
  onAddToCart?: (item: ListingItem) => void;
}

const ListingGridCard: React.FC<Props> = ({ item, onPress, onAddToCart }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");

  // ✅ Clean calculations
  const price = Number(item.selling_price);
  const mrp = Number(item.mrp);

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) setQty(parsed);
  };

  const getStarType = (index: number, rating: number) => {
    if (index <= Math.floor(rating)) return "full";
    if (index === Math.ceil(rating) && rating % 1 !== 0) return "half";
    return "empty";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
      style={{
        flex: 1,
        borderWidth: 1,
        justifyContent: "space-between",
        borderColor: colors.border,
        borderRadius: spacing(14),
        padding: spacing(10),
      }}
    >
      {/* IMAGE */}
      <View>
        <Image
          source={{ uri: item.image_path }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: spacing(10),
            backgroundColor: colors.surfaceElevated,
          }}
          contentFit="cover"
        />

        {discount && (
          <View
            style={{
              position: "absolute",
              top: -spacing(3),
              left: -spacing(3),
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(4),
              paddingHorizontal: spacing(8),
              paddingVertical: spacing(4),
              borderRadius: spacing(6),
              backgroundColor: colors.error,
            }}
          >
            <Tag size={spacing(13)} color={colors.textInverse} />
            <Text
              style={{
                fontSize: font(12),
                color: colors.textInverse,
                fontWeight: "600",
              }}
            >
              {discount}%
            </Text>
          </View>
        )}
      </View>

      {/* TITLE */}
      <View style={{ marginTop: spacing(6) }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(13),
            fontWeight: "600",
            color: colors.text,
            height: font(34),
          }}
        >
          {item.product_name}
        </Text>

        {item.overview ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: font(11),
              color: colors.textTertiary,
              height: font(28),
            }}
          >
            {item.overview}
          </Text>
        ) : null}
      </View>

      {/* RATING */}
      <View
        style={{
          marginTop: spacing(4),
          minHeight: spacing(16),
          justifyContent: "center",
        }}
      >
        {showRating ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(4),
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {[1, 2, 3, 4, 5].map((i) => {
                const type = getStarType(i, rating);

                return (
                  <StarIcon
                    key={i}
                    size={spacing(12)}
                    color={type === "empty" ? colors.border : colors.starColor}
                    fill={
                      type === "full"
                        ? colors.starColor
                        : type === "half"
                          ? colors.starColor
                          : "none"
                    }
                    style={type === "half" ? { opacity: 0.5 } : {}}
                  />
                );
              })}
            </View>

            <Text
              style={{
                fontSize: font(11),
                color: colors.textSecondary,
              }}
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* PRICE */}
      <View
        style={{
          flexDirection: "row",
          marginTop: spacing(4),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: spacing(4),
          }}
        >
          <Text
            style={{
              fontSize: font(15),
              color: colors.primary,
              includeFontPadding: false,
              lineHeight: font(18),
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            ₹{Number(item.selling_price)}
          </Text>

          <Text
            style={{
              fontSize: font(11),
              color: colors.textTertiary,
              textDecorationLine: "line-through",
              includeFontPadding: false,
              lineHeight: font(14),
              fontFamily: "Poppins_400Regular",
            }}
          >
            ₹{mrp}
          </Text>
        </View>
      </View>

      {/* BUTTON */}
      <View style={{ marginTop: spacing(8) }}>
        {qty === 0 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setQty(1);
              setInputVal("1");
              onAddToCart?.(item);
            }}
            style={{
              backgroundColor: colors.primary,
              justifyContent: "center",
              borderRadius: spacing(10),
              alignItems: "center",
              height: spacing(36),
            }}
          >
            <Text
              style={{
                color: colors.background,
                fontSize: font(12),
                fontFamily: "Poppins_500Medium",
              }}
            >
              Add to Cart
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.primary,
              borderRadius: spacing(10),
              height: spacing(36),
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (qty <= 1) {
                  setQty(0);
                  setInputVal("1");
                } else {
                  setQty(qty - 1);
                  setInputVal(String(qty - 1));
                }
              }}
              style={{ width: spacing(36), alignItems: "center" }}
            >
              {qty === 1 ? (
                <Trash2 size={spacing(14)} color={colors.background} />
              ) : (
                <Minus size={spacing(14)} color={colors.background} />
              )}
            </TouchableOpacity>

            <TextInput
              value={inputVal}
              onChangeText={handleQtyInput}
              keyboardType="number-pad"
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: font(13),
                flex: 1,
              }}
            />

            <TouchableOpacity
              onPress={() => {
                setQty(qty + 1);
                setInputVal(String(qty + 1));
              }}
              style={{ width: spacing(36), alignItems: "center" }}
            >
              <Plus size={spacing(14)} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ListingGridCard);
