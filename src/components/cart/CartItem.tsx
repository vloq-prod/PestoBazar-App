// components/CartItem/index.tsx

import { Text, View, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../theme";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useResponsive } from "../../utils/useResponsive";
import { CartItem as CartItemType } from "../../types/cart.types";
import { useRouter } from "expo-router";

interface Props {
  item: CartItemType;
  isB2B?: boolean;
  onIncrease: (item: CartItemType) => void;
  onDecrease: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
  onChangeQty: (item: CartItemType, qty: number) => void;
}

const CartItem = ({
  item,
  isB2B: isB2BProp,
  onIncrease,
  onDecrease,
  onRemove,
  onChangeQty,
}: Props) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { spacing, font, wp } = useResponsive();
  const [inputQty, setInputQty] = useState(String(item.qty));

  const qty = item.qty;
  const imageSize = spacing(60);

  useEffect(() => {
    setInputQty(String(item.qty));
  }, [item.qty]);

  const handlePlusPress = () => {
    if (qty >= item.stock) {
      return;
    }
    onIncrease(item);
  };

  const parsePrice = (value: string | number | undefined | null): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatPrice = (value: string | number) => {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  const cartMoney = (val: any) => {
    const num = Number(val || 0);
    if (!Number.isFinite(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isB2B =
    isB2BProp ??
    (item.is_b2b_user === "Yes" ||
      String(item.is_b2b_user || "").toLowerCase() === "yes" ||
      item.price_exclusive_gst !== undefined);

  const itemDiscountPercent = parseFloat(String(item.discount_percentage || 0));
  const hasB2BDiscount = itemDiscountPercent > 0;

  const unitPrice = parsePrice(item.price_per_piece);
  const currentQty =
    inputQty && Number(inputQty) > 0 ? Number(inputQty) : Number(item.qty) || 1;
  const totalPrice =
    unitPrice > 0 ? unitPrice * currentQty : parsePrice(item.total_price);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        backgroundColor: "transparent",
        paddingHorizontal: spacing(14),
        paddingVertical: spacing(10),
      }}
      onPress={() =>
        router.push({
          pathname: "/(stack)/products/[slug]",
          params: {
            slug: item.slug,
            id: item.variation_id,
            product_name: item.name,
          },
        })
      }
    >
      <View style={{ flexDirection: "row", gap: spacing(12), alignItems: "center" }}>
        {/* Image */}
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: spacing(8),
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Image
            source={{
              uri: item.s3_image_path,
            }}
            style={{
              width: imageSize - spacing(6),
              height: imageSize - spacing(6),
            }}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View
          style={{
            flex: 1,
            gap: spacing(4),
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              fontSize: font(12),
              fontFamily: "Poppins_500Medium",
              color: colors.text,
              lineHeight: font(16),
            }}
          >
            {item.name}
          </Text>
          {item.size ? (
            <Text
              style={{
                fontSize: font(10.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size}
            </Text>
          ) : null}
        </View>

        {/* Right Action & Price Column */}
        <View style={{ alignItems: "flex-end", gap: spacing(8) }}>
          {/* Stepper row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(8) }}>
            {/* Stepper capsule */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: 6,
                backgroundColor: colors.primary + "05",
                height: spacing(30),
              }}
            >
              {/* Minus */}
              <TouchableOpacity
                onPress={() => {
                  if (qty > 1) {
                    onDecrease(item);
                  } else {
                    onRemove(item);
                  }
                }}
                style={{
                  width: spacing(30),
                  height: spacing(30),
                  justifyContent: "center",
                  alignItems: "center",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {qty > 1 ? (
                  <Minus size={12} color={colors.primary} />
                ) : (
                  <Trash2 size={12} color={colors.error} />
                )}
              </TouchableOpacity>

              {/* Count */}
              <View
                style={{
                  width: spacing(28),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  value={inputQty}
                  keyboardType="number-pad"
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    setInputQty(cleaned);
                  }}
                  onBlur={() => {
                    let newQty = Number(inputQty);
                    if (!newQty || newQty < 1) newQty = 1;
                    if (newQty > item.stock) {
                      newQty = Math.max(1, item.stock);
                    }
                    setInputQty(String(newQty));
                    onChangeQty(item, newQty);
                  }}
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_600SemiBold",
                    textAlign: "center",
                    color: colors.text,
                    padding: 0,
                    margin: 0,
                  }}
                />
              </View>

              {/* Plus */}
              <TouchableOpacity
                onPress={handlePlusPress}
                style={{
                  width: spacing(30),
                  height: spacing(30),
                  justifyContent: "center",
                  alignItems: "center",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Plus
                  size={12}
                  color={qty >= item.stock ? colors.textSecondary : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          {isB2B ? (
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: font(13.5),
                  fontFamily: "Poppins_700Bold",
                  color: colors.text,
                }}
              >
                ₹{cartMoney(hasB2BDiscount ? item.post_discount_amount : (item.line_total_exclusive_gst || totalPrice))}
              </Text>
              <Text
                style={{
                  fontSize: font(9.5),
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                }}
              >
                Excl. GST
              </Text>
            </View>
          ) : (
            <Text
              style={{
                fontSize: font(13.5),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
              }}
            >
              ₹{formatPrice(totalPrice)}
            </Text>
          )}
        </View>
      </View>

      {/* ── B2B Pricing Breakdown (Web Style) ── */}
      {isB2B && (
        <View
          style={{
            marginTop: spacing(10),
            backgroundColor: colors.backgroundgray,
            borderRadius: spacing(8),
            padding: spacing(10),
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* 1. Price */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: font(10.5),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Price
              </Text>
              <Text
                style={{
                  fontSize: font(11.5),
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                  marginTop: 2,
                }}
              >
                ₹{cartMoney(item.price_exclusive_gst ?? unitPrice)}{" "}
                <Text
                  style={{
                    fontSize: font(8.5),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: font(9.5),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                ₹{cartMoney(item.price_inclusive_gst ?? item.price_per_piece)} Incl. GST
              </Text>
            </View>

            {/* 2. Base Amount */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: font(10.5),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Base Amount
              </Text>
              <Text
                style={{
                  fontSize: font(11.5),
                  color: colors.text,
                  fontFamily: "Poppins_600SemiBold",
                  marginTop: 2,
                }}
              >
                ₹{cartMoney(item.line_total_exclusive_gst ?? (Number(item.price_exclusive_gst ?? unitPrice) * currentQty))}{" "}
                <Text
                  style={{
                    fontSize: font(8.5),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: font(9.5),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                ₹{cartMoney(item.line_total_inclusive_gst ?? totalPrice)} Incl. GST
              </Text>
            </View>

            {/* 3. Total Amount / Discount */}
            <View style={{ flex: 1.1, alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontSize: font(10.5),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  Total Amount
                </Text>
                {hasB2BDiscount && (
                  <View
                    style={{
                      backgroundColor: "#10B98115",
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 4,
                      borderWidth: 0.5,
                      borderColor: "#10B98140",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(9),
                        color: "#10B981",
                        fontFamily: "Poppins_700Bold",
                      }}
                    >
                      {itemDiscountPercent}%
                    </Text>
                  </View>
                )}
              </View>

              {hasB2BDiscount && (
                <Text
                  style={{
                    fontSize: font(9.5),
                    color: "#10B981",
                    fontFamily: "Poppins_600SemiBold",
                    marginTop: 2,
                  }}
                >
                  Discount: ₹{cartMoney(item.discounted_amount)}
                </Text>
              )}

              <Text
                style={{
                  fontSize: font(12),
                  color: colors.text,
                  fontFamily: "Poppins_700Bold",
                  marginTop: hasB2BDiscount ? 1 : 2,
                }}
              >
                ₹{cartMoney(hasB2BDiscount ? item.post_discount_amount : (item.line_total_exclusive_gst ?? totalPrice))}{" "}
                <Text
                  style={{
                    fontSize: font(8.5),
                    color: colors.textSecondary,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Excl. GST
                </Text>
              </Text>

              <Text
                style={{
                  fontSize: font(9.5),
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 1,
                }}
              >
                GST: ₹{cartMoney(hasB2BDiscount ? item.post_discount_gst_amount : item.gst_amount)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartItem;
