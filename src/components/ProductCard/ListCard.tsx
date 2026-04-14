import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

export default function ListCard({
  item,

  onAddToCart,
}: {
  item: any;
  onAddToCart?: (item: any, qty: number) => void;
}) {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();

  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");

  const price = Number(item.selling_price);
  const mrp = Number(item.mrp);
  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const getStarType = (index: number, rating: number) => {
    if (index <= Math.floor(rating)) return "full";
    if (index === Math.ceil(rating) && rating % 1 !== 0) return "half";
    return "empty";
  };

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) setQty(parsed);
  };

  const imgSize = spacing(130);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "(stack)/product/[id]",
          params: {
            id: item.id,
            product_name: item.product_name,
          },
        })
      }
      style={{
        flexDirection: "row",
        gap: spacing(8),
        marginBottom: spacing(10),
      }}
    >
      {/* ─── IMAGE ─── */}
      <View>
        <Image
          source={{ uri: item.image_path }}
          style={{
            width: imgSize,
            height: imgSize,
            borderRadius: spacing(12),
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
          }}
          contentFit="cover"
        />

        {/* DISCOUNT BADGE (same as grid) */}
        {discount && (
          <View
            style={{
              position: "absolute",
              top: spacing(5),
              left: spacing(5),
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

      {/* ─── RIGHT CONTENT ─── */}
      <View style={{ flex: 1, gap: spacing(6) }}>
        {/* NAME + OVERVIEW */}
        <View style={{ gap: spacing(3) }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(13),
              lineHeight: font(19),
              color: colors.text,
            }}
          >
            {item.product_name}
          </Text>

          {item.overview ? (
            <Text
              numberOfLines={2}
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                lineHeight: font(16),
                color: colors.textTertiary,
              }}
            >
              {item.overview}
            </Text>
          ) : null}
        </View>

        {showRating && (
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
          </View>
        )}

        {/* PRICE */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: spacing(5),
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(15),
              color: colors.primary,
            }}
          >
            ₹{price.toLocaleString("en-IN")}
          </Text>

          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(11),
              color: colors.textTertiary,
              textDecorationLine: "line-through",
            }}
          >
            ₹{mrp.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* BUTTON */}
        {qty === 0 ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={(e) => {
              e.stopPropagation();
              setQty(1);
              setInputVal("1");
              onAddToCart?.(item, 1);
            }}
            style={{
              backgroundColor: colors.primary,
              borderRadius: spacing(10),
              height: spacing(36),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
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
              onPress={(e) => {
                e.stopPropagation();
                if (qty <= 1) {
                  setQty(0);
                  setInputVal("1");
                  onAddToCart?.(item, 0);
                } else {
                  const nextQty = qty - 1;
                  setQty(nextQty);
                  setInputVal(String(nextQty));
                  onAddToCart?.(item, nextQty);
                }
              }}
              style={{ width: spacing(36), alignItems: "center" }}
            >
              {qty === 1 ? (
                <Trash2 size={spacing(14)} color="#fff" />
              ) : (
                <Minus size={spacing(14)} color="#fff" />
              )}
            </TouchableOpacity>

            <TextInput
              value={inputVal}
              onChangeText={(val) => handleQtyInput(val)}
              keyboardType="number-pad"
              style={{
                flex: 1,
                textAlign: "center",
                color: "#fff",
                fontSize: font(13),
              }}
            />

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setQty(qty + 1);
                setInputVal(String(qty + 1));
                onAddToCart?.(item, qty + 1);
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
}
