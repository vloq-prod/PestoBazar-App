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
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { ProductItem } from "../../types/home.types";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../store/auth";
import { useAddToCart, useProductQuantity } from "../../hooks/cartHooks";

export default function ItemCard({
  item,
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

  const qty = useProductQuantity(item.id);
  const [inputVal, setInputVal] = useState("1");

  React.useEffect(() => {
    setInputVal(qty === 0 ? "1" : String(qty));
  }, [qty]);

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
          onError: () => {
            setInputVal(String(qty));
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

  // ── Add to cart action ──────────────────────────────────────
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: 1,
    });
    onAddToCart?.(item, 1);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty <= 1 ? 0 : qty - 1;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: nextQty,
    });
    onAddToCart?.(item, nextQty);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation();
    const nextQty = qty + 1;
    addToCart({
      user_id: userId ?? 0,
      visitor_id: visitorId,
      product_id: item.id,
      qty: nextQty,
    });
    onAddToCart?.(item, nextQty);
  };

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
        flex: 1,

        // backgroundColor: colors.error,
      }}
    >
      {/* ── IMAGE BLOCK (with floating cart control) ── */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: spacing(14),
          overflow: "hidden",
          backgroundColor: colors.surfaceElevated,
        }}
      >
        <Image
          source={{ uri: item.s3_image_path }}
          style={{
            width: "90%",

            aspectRatio: 1,
          }}
          contentFit="contain"
        />

        {/* Discount badge — top left */}
        {discount && (
          <View
            style={{
              position: "absolute",
              top: spacing(8),
              left: spacing(8),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: spacing(8),
              height: spacing(22),
              borderRadius: spacing(7),
              backgroundColor: colors.saleRed,
            }}
          >
            <Tag
              size={spacing(10)}
              color={colors.textInverse}
              strokeWidth={2.2}
            />

            <Text
              style={{
                marginLeft: spacing(4),
                fontSize: font(10),
                color: colors.textInverse,
                fontFamily: "Poppins_600SemiBold",
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {discount}%
            </Text>
          </View>
        )}

        {/* ── FLOATING CART CONTROL — bottom right of image ── */}
        <View
          style={{
            position: "absolute",
            bottom: spacing(6),
            right: spacing(6),
          }}
        >
          {qty === 0 ? (
            /* Single + button */
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={loading}
              onPress={handleAddToCart}
              style={{
                minWidth: spacing(42),
                height: spacing(30),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing(5),
                borderRadius: spacing(10),
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.background,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
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
                </>
              )}
            </TouchableOpacity>
          ) : (
            /* Inline stepper pill */
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                borderRadius: spacing(10),
                height: spacing(30),
              }}
            >
              {/* Decrement / Trash */}
              <TouchableOpacity
                disabled={loading}
                onPress={handleDecrement}
                style={{
                  width: spacing(30),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              >
                {qty === 1 ? (
                  <Trash2 size={spacing(13)} color="#fff" />
                ) : (
                  <Minus size={spacing(13)} color="#fff" strokeWidth={2.5} />
                )}
              </TouchableOpacity>

              {/* Qty input */}
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
                  minWidth: spacing(22),
                  padding: 0,
                  height: "100%",
                }}
              />

              {/* Increment */}
              <TouchableOpacity
                disabled={loading}
                onPress={handleIncrement}
                style={{
                  width: spacing(30),
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <Plus size={spacing(13)} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── CONTENT BELOW IMAGE ── */}
      <View style={{ paddingTop: spacing(3) }}>
        {/* Price row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing(4),
          }}
        >
          <Text
            style={{
              fontSize: font(16),
              color: colors.text,
              fontFamily: "Poppins_700Bold",
              includeFontPadding: false,
            }}
          >
            ₹{Number(item.selling_price)}
          </Text>

          {discount && (
            <Text
              style={{
                fontSize: font(9),
                color: colors.textTertiary,
                textDecorationLine: "line-through",
                fontFamily: "Poppins_400Regular",
                includeFontPadding: false,
              }}
            >
              ₹{item.mrp}
            </Text>
          )}
        </View>

        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: font(11),
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            marginTop: spacing(1),
            lineHeight: font(16),
          }}
        >
          {item.product_name}
        </Text>

        {/* Rating */}
        {showRating && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(3),
            }}
          >
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

            {item.total_reviews > 0 && (
              <Text
                style={{
                  fontSize: font(10),
                  marginTop: spacing(1),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {item.total_reviews}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
