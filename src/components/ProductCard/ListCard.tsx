import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { ListingItem } from "../../types/shop.types";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart } from "../../hooks/cartHooks";

export default function ListCard({
  item,

  onAddToCart,
}: {
  item: ListingItem;
  onAddToCart?: (item: any, qty: number) => void;
}) {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();
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
    if (!isNaN(parsed) && parsed > 0) {
      addToCart(
        {
          user_id: userId ?? 0,
          visitor_id: visitorId,
          product_id: item.id,
          qty: parsed,
        },
        {
          onSuccess: (data) => {
            if (data.status === 1) {
              setQty(parsed);
            } else {
              setInputVal(String(qty));
            }
          },
        },
      );
    }
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
        alignItems: "stretch",
      }}
    >
      {/* left content  */}
      <View
        style={{
          borderRadius: spacing(12),
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.image_path }}
          style={{
            width: imgSize,
            height: imgSize,
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
      <View
        style={{ flex: 1, gap: spacing(6), justifyContent: "space-between" }}
      >
        <View style={{ gap: 5 }}>
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
                      color={
                        type === "empty" ? colors.border : colors.starColor
                      }
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
        </View>

        {/* BUTTON */}
        {qty === 0 ? (
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={loading}
            onPress={(e) => {
              e.stopPropagation();
              const newQty = 1;
              addToCart(
                {
                  user_id: userId ?? 0,
                  visitor_id: visitorId,
                  product_id: item.id,
                  qty: newQty,
                },
                {
                  onSuccess: (data) => {
                    if (data.status === 1) {
                      setQty(newQty);
                      setInputVal("1");
                    }
                  },
                },
              );
              onAddToCart?.(item, newQty);
            }}
            style={{
              backgroundColor: colors.primary,
              borderRadius: spacing(10),
              height: spacing(36),
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: font(12),
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Add to Cart
              </Text>
            )}
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
              opacity: loading ? 0.8 : 1,
            }}
          >
            <TouchableOpacity
              disabled={loading}
              onPress={(e) => {
                e.stopPropagation();
                const nextQty = qty <= 1 ? 0 : qty - 1;
                addToCart(
                  {
                    user_id: userId ?? 0,
                    visitor_id: visitorId,
                    product_id: item.id,
                    qty: nextQty,
                  },
                  {
                    onSuccess: (data) => {
                      if (data.status === 1) {
                        setQty(nextQty);
                        setInputVal(nextQty === 0 ? "1" : String(nextQty));
                      }
                    },
                  },
                );
                onAddToCart?.(item, nextQty);
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
              editable={!loading}
              style={{
                flex: 1,
                textAlign: "center",
                color: "#fff",
                fontSize: font(13),
              }}
            />

            <TouchableOpacity
              disabled={loading}
              onPress={(e) => {
                e.stopPropagation();
                const nextQty = qty + 1;
                addToCart(
                  {
                    user_id: userId ?? 0,
                    visitor_id: visitorId,
                    product_id: item.id,
                    qty: nextQty,
                  },
                  {
                    onSuccess: (data) => {
                      if (data.status === 1) {
                        setQty(nextQty);
                        setInputVal(String(nextQty));
                      }
                    },
                  },
                );
                onAddToCart?.(item, nextQty);
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
