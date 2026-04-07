// components/CartItem/index.tsx

import { Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useResponsive } from "../../utils/useResponsive";
import { CartItem as CartItemType } from "../../types/cart.types";

interface Props {
  item: CartItemType;

  onIncrease: (item: CartItemType) => void;
  onDecrease: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
}

const CartItem = ({
  item,

  onIncrease,
  onDecrease,
  onRemove,
}: Props) => {
  const { colors } = useTheme();
  const { spacing, font, wp } = useResponsive();

  const qty = item.qty;
  const imageSize = wp(22);

  const formatPrice = (value: string | number) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing(12),
        paddingBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: spacing(12) }}>
        {/* Image */}
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: spacing(8),
            backgroundColor: colors.inputBackground,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{
              uri: item.s3_image_path,
            }}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: spacing(8),
            }}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View
          style={{
            flex: 1,
            gap: spacing(8),
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Title + Delete */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                fontSize: font(13),
                fontFamily: "Poppins_500Medium",
                color: colors.text,
              }}
            >
              {item.name}
            </Text>

            <TouchableOpacity onPress={() => onRemove(item)}>
              <Trash2 size={spacing(16)} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Price + Qty */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Price */}
            <View>
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                ₹{formatPrice(item.price_per_piece)}
              </Text>

              {/* <Text
                style={{
                  fontSize: font(11),
                  color: colors.textSecondary,
                }}
              >
                {item.size}
              </Text> */}
            </View>

            {/* Qty Stepper */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Minus */}
              <TouchableOpacity
                onPress={() => onDecrease(item)}
                disabled={qty <= 1}
                style={{
                  width: spacing(32),
                  height: spacing(32),
                  borderRadius: spacing(22),
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:
                    qty <= 1 ? colors.inputBackground : colors.primaryLight,
                }}
              >
                <Minus
                  size={spacing(13)}
                  color={qty <= 1 ? colors.textTertiary : colors.primary}
                />
              </TouchableOpacity>

              {/* Count */}
              <View
                style={{
                  paddingHorizontal: spacing(12),
                  minWidth: spacing(36),
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.primary,
                  }}
                >
                  {qty}
                </Text>
              </View>

              {/* Plus */}
              <TouchableOpacity
                onPress={() => onIncrease(item)}
                disabled={qty >= item.stock}
                style={{
                  width: spacing(32),
                  height: spacing(32),
                  borderRadius: spacing(22),
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:
                    qty >= item.stock
                      ? colors.inputBackground
                      : colors.primaryLight,
                }}
              >
                <Plus
                  size={spacing(13)}
                  color={
                    qty >= item.stock ? colors.textTertiary : colors.primary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItem;
