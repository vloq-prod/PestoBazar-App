import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { ProductItem } from "../../types/home.types";
import { useRouter } from "expo-router";
import { useToast } from "../../context/ToastContext";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart } from "../../hooks/cartHooks";

export default function ItemCard({
  item,
  onPress,
  onAddToCart,
}: {
  item: ProductItem;
  onPress?: (item: any) => void;
  onAddToCart?: (item: ProductItem, qty: number) => void;
}) {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();

  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState("1");

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
              // Reset inputVal to current qty if failed
              setInputVal(String(qty));
            }
          },
        },
      );
    }
  };

  const getStarType = (index: number, rating: number) => {
    if (index <= Math.floor(rating)) return "full";
    if (index === Math.ceil(rating) && rating % 1 !== 0) return "half";
    return "empty";
  };

  const discount =
    Number(item.mrp) > Number(item.selling_price)
      ? Math.round(
          ((Number(item.mrp) - Number(item.selling_price)) / Number(item.mrp)) *
            100,
        )
      : null;

  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
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
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing(14),
        padding: spacing(10),
      }}
    >
      <View>
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: spacing(10),
            backgroundColor: colors.surfaceElevated,
          }}
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

        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            color: colors.textTertiary,
            height: font(28),
          }}
        >
          {item.overview || ""}
        </Text>
      </View>

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
            {/* Stars */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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

            {/* Reviews */}
            {item.total_reviews > 0 && (
              <Text
                style={{
                  fontSize: font(11),
                  color: colors.textTertiary,
                }}
              >
                ({item.total_reviews})
              </Text>
            )}
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
            ₹{item.mrp}
          </Text>
        </View>
      </View>

      {/* BUTTON */}
      <View style={{ marginTop: spacing(8) }}>
        {qty === 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading}
            onPress={() => {
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
              onAddToCart?.(item, 1);
            }}
            style={{
              backgroundColor: colors.primary,
              justifyContent: "center",
              borderRadius: spacing(10),
              alignItems: "center",
              height: spacing(36),
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: colors.background,
                  fontSize: font(12),
                  fontFamily: "Poppins_500Medium",
                  includeFontPadding: false,
                  textAlignVertical: "center",
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
              onPress={() => {
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
                <Trash2 size={spacing(14)} color={colors.background} />
              ) : (
                <Minus size={spacing(14)} color={colors.background} />
              )}
            </TouchableOpacity>

            <TextInput
              value={inputVal}
              onChangeText={handleQtyInput}
              keyboardType="number-pad"
              editable={!loading}
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: font(13),
                flex: 1,
              }}
            />

            <TouchableOpacity
              disabled={loading}
              onPress={() => {
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
