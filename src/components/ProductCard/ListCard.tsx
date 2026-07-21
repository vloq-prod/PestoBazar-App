import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Plus, Minus, Trash2, StarIcon, Tag } from "lucide-react-native";
import { ListingItem } from "../../types/shop.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart, useProductQuantity } from "../../hooks/cartHooks";

interface Props {
  item: ListingItem;
  onAddToCart?: (item: ListingItem, qty: number) => void;
}

const ListCard: React.FC<Props> = ({ item, onAddToCart }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const router = useRouter();
  const { visitorId, userId } = useAppVisitorStore((s) => s);
  const { addToCart, loading } = useAddToCart();

  const qty = useProductQuantity(item.id);
  const [inputVal, setInputVal] = useState("1");

  React.useEffect(() => {
    setInputVal(qty === 0 ? "1" : String(qty));
  }, [qty]);

  const price = Number(item.selling_price);
  const mrp = Number(item.mrp);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const rating = Number(item.avg_rating);
  const showRating = rating > 0;

  const formatPrice = (val: number) => {
    const fixed = val.toFixed(2);
    return fixed.endsWith(".00") ? String(Math.trunc(val)) : fixed;
  };

  const getStarType = (index: number, r: number) => {
    if (index <= Math.floor(r)) return "full";
    if (index === Math.ceil(r) && r % 1 !== 0) return "half";
    return "empty";
  };

  const handleQtyInput = (val: string) => {
    setInputVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      addToCart(
        { user_id: userId ?? 0, visitor_id: visitorId, product_id: item.id, qty: parsed },
        {
          onError: () => {
            setInputVal(String(qty));
          },
        },
      );
    }
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart({ user_id: userId ?? 0, visitor_id: visitorId, product_id: item.id, qty: 1 });
    onAddToCart?.(item, 1);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty <= 1 ? 0 : qty - 1;
    addToCart({ user_id: userId ?? 0, visitor_id: visitorId, product_id: item.id, qty: nextQty });
    onAddToCart?.(item, nextQty);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty + 1;
    addToCart({ user_id: userId ?? 0, visitor_id: visitorId, product_id: item.id, qty: nextQty });
    onAddToCart?.(item, nextQty);
  };

  const imgSize = spacing(100);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "(stack)/product/[id]",
          params: { id: item.id, product_name: item.product_name },
        })
      }
      style={{
        flexDirection: "row",
        gap: spacing(10),
        marginBottom: spacing(10),
        alignItems: "center",
      }}
    >
      {/* ── IMAGE BLOCK ── */}
      <View
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: spacing(12),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceElevated,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Image
          source={{ uri: item.image_path }}
          style={{ width: "88%", aspectRatio: 1 }}
          contentFit="contain"
        />

        {/* Discount badge */}
        {discount && (
          <View
            style={{
              position: "absolute",
              top: spacing(5),
              left: spacing(5),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: spacing(6),
              height: spacing(18),
              borderRadius: spacing(5),
              backgroundColor: colors.saleRed,
            }}
          >
            <Tag size={spacing(9)} color={colors.textInverse} strokeWidth={2.2} />
            <Text
              style={{
                marginLeft: spacing(3),
                fontSize: font(9),
                color: colors.textInverse,
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
              }}
            >
              {discount}%
            </Text>
          </View>
        )}
      </View>

      {/* ── RIGHT CONTENT ── */}
      <View style={{ flex: 1, gap: spacing(3) }}>
        {/* Name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            lineHeight: font(16),
          }}
        >
          {item.product_name}
        </Text>

        {/* Rating */}
        {showRating && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2) }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => {
                const type = getStarType(i, rating);
                return (
                  <StarIcon
                    key={i}
                    size={spacing(9)}
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
                fontSize: font(9),
                color: colors.textTertiary,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {rating.toFixed(1)}
              {/* {item.  > 0 ? ` · ${item.total_reviews}` : ""} */}
            </Text>
          </View>
        )}

        {/* Price row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(4) }}>
          <Text
            style={{
              fontSize: font(15),
              fontFamily: "Poppins_700Bold",
              color: colors.text,
              includeFontPadding: false,
            }}
          >
            ₹{formatPrice(price)}
          </Text>
          {discount && (
            <Text
              style={{
                fontSize: font(9),
                fontFamily: "Poppins_400Regular",
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                includeFontPadding: false,
              }}
            >
              ₹{formatPrice(mrp)}
            </Text>
          )}
        </View>

        {/* ── CART CONTROL — right aligned ── */}
        <View style={{ alignItems: "flex-end", marginTop: spacing(2) }}>
          {qty === 0 ? (
            /* Small ADD pill — same as grid */
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={loading}
              onPress={handleAddToCart}
              style={{
                minWidth: spacing(52),
                height: spacing(28),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: spacing(8),
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.background,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(10),
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    includeFontPadding: false,
                  }}
                >
                  Add
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            /* Inline stepper pill — same as grid */
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                borderRadius: spacing(8),
                height: spacing(28),
              }}
            >
              <TouchableOpacity
                disabled={loading}
                onPress={handleDecrement}
                style={{
                  width: spacing(28),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              >
                {qty === 1 ? (
                  <Trash2 size={spacing(12)} color="#fff" />
                ) : (
                  <Minus size={spacing(12)} color="#fff" strokeWidth={2.5} />
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
                  fontSize: font(12),
                  fontFamily: "Poppins_600SemiBold",
                  minWidth: spacing(20),
                  padding: 0,
                  height: "100%",
                }}
              />

              <TouchableOpacity
                disabled={loading}
                onPress={handleIncrement}
                style={{
                  width: spacing(28),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <Plus size={spacing(12)} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ListCard);