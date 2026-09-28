// components/CartItem/index.tsx

import { Text, View, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../theme";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useResponsive } from "../../utils/useResponsive";
import { CartItem as CartItemType } from "../../types/cart.types";
import { useRouter } from "expo-router";
import { useToast } from "../../context/ToastContext";

interface Props {
  item: CartItemType;

  onIncrease: (item: CartItemType) => void;
  onDecrease: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
  onChangeQty: (item: CartItemType, qty: number) => void;
}

const CartItem = ({
  item,

  onIncrease,
  onDecrease,
  onRemove,
  onChangeQty,
}: Props) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { spacing, font, wp } = useResponsive();
  const [inputQty, setInputQty] = useState(String(item.qty));

  const qty = item.qty;
  const imageSize = spacing(60);

  useEffect(() => {
    setInputQty(String(item.qty));
  }, [item.qty]);

  const handlePlusPress = () => {
    if (qty >= item.stock) {
      showToast(
        item.stock <= 0
          ? "This item is out of stock"
          : `Only ${item.stock} item${item.stock > 1 ? "s" : ""} available in stock`,
        "warning"
      );
      return;
    }
    onIncrease(item);
  };

  const formatPrice = (value: string | number) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

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
                      showToast(
                        item.stock <= 0
                          ? "This item is out of stock"
                          : `Only ${item.stock} item${item.stock > 1 ? "s" : ""} available in stock`,
                        "warning"
                      );
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
          <Text
            style={{
              fontSize: font(13.5),
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
            }}
          >
            ₹{formatPrice(item.price_per_piece)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CartItem;
