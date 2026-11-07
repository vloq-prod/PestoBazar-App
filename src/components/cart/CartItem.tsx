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
      String(item.is_b2b_user || "").toLowerCase() === "yes");

  const itemDiscountPercent = parseFloat(String(item.discount_percentage || 0));
  const hasB2BDiscount = itemDiscountPercent > 0;

  const unitPrice = parsePrice(item.price_per_piece);
  const currentQty =
    inputQty && Number(inputQty) > 0 ? Number(inputQty) : Number(item.qty) || 1;
  const totalPrice =
    unitPrice > 0 ? unitPrice * currentQty : parsePrice(item.total_price);

  const rawBaseAmount = hasB2BDiscount
    ? (item.post_discount_amount ?? item.line_total_exclusive_gst ?? totalPrice)
    : (item.line_total_exclusive_gst ?? (Number(item.price_exclusive_gst ?? unitPrice) * currentQty));
  const baseAmount = parsePrice(rawBaseAmount);

  const rawGstAmount = hasB2BDiscount
    ? (item.post_discount_gst_amount ?? item.gst_amount)
    : (item.post_discount_gst_amount ?? item.gst_amount);
  const gstAmount = parsePrice(rawGstAmount);

  let gstRate = parseFloat(String(item.tax_percent || 0));
  if (gstRate <= 0 && baseAmount > 0 && gstAmount > 0) {
    gstRate = Math.round((gstAmount / baseAmount) * 100);
  }
  const gstRateStr =
    gstRate > 0
      ? gstRate % 1 === 0
        ? `${gstRate}%`
        : `${gstRate.toFixed(1)}%`
      : "0%";

  const itemQty = Number(item.qty) || 1;
  const unitPriceExclGst =
    item.price_exclusive_gst !== undefined && item.price_exclusive_gst !== null
      ? parsePrice(item.price_exclusive_gst)
      : item.price_exclusive_gst_amount !== undefined && item.price_exclusive_gst_amount !== null
      ? parsePrice(item.price_exclusive_gst_amount)
      : baseAmount > 0
      ? baseAmount / itemQty
      : unitPrice;

  const displayBaseAmount =
    currentQty === itemQty ? baseAmount : unitPriceExclGst * currentQty;
  const unitGst = gstAmount > 0 ? gstAmount / itemQty : 0;
  const displayGstAmount =
    currentQty === itemQty ? gstAmount : unitGst * currentQty;

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
          {item.size || isB2B ? (
            <Text
              style={{
                fontSize: font(10.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size ? item.size : ""}
              {item.size && isB2B ? "  •  " : ""}
              {isB2B ? `₹${cartMoney(unitPriceExclGst)}` : ""}
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

          {/* Price / Total & GST */}
          {isB2B ? (
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                {hasB2BDiscount && (
                  <View
                    style={{
                      backgroundColor: "#10B98115",
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: font(8.5),
                        color: "#10B981",
                        fontFamily: "Poppins_700Bold",
                      }}
                    >
                      {itemDiscountPercent}% OFF
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    fontSize: font(13.5),
                    fontFamily: "Poppins_700Bold",
                    color: colors.text,
                  }}
                >
                  ₹{cartMoney(displayBaseAmount)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: font(10),
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                + ₹{cartMoney(displayGstAmount)} GST ({gstRateStr})
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
    </TouchableOpacity>
  );
};

export default CartItem;
