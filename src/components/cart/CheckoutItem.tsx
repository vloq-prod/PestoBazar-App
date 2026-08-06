import React from "react";
import { View, Text, Image } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

const BASE_URL = "https://static-cdn.pestobazaar.com";


interface CheckoutItemProps {
  item: {
    id: number;
    name: string;
    size: string;
    qty: number;
    price_per_piece: string | number;
    actual_price: string | number;
    total_price: string | number;
    s3_image_path: string;
  };
  isLast?: boolean;
}

const fmt = (value: string | number) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

const CheckoutItem = ({ item, isLast }: CheckoutItemProps) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const imageSize = spacing(52);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: spacing(10),
          paddingTop: spacing(8),
          paddingBottom: spacing(8),
          alignItems: "center",
        }}
      >
        {/* ── Image ── */}
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: spacing(8),
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.s3_image_path ? BASE_URL + item.s3_image_path : undefined }}
            style={{ width: imageSize - spacing(4), height: imageSize - spacing(4) }}
            resizeMode="contain"
          />
        </View>

        {/* ── Content ── */}
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: spacing(3),
          }}
        >
          {/* Name */}
          <Text
            numberOfLines={1}
            style={{
              fontSize: font(12.5),
              fontFamily: "Poppins_500Medium",
              color: colors.text,
            }}
          >
            {item.name}
          </Text>

          {/* Size · Qty + Price */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Size + Qty */}
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size ? `${item.size}  ·  ` : ""}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                }}
              >
                Qty: {item.qty}
              </Text>
            </Text>

            {/* Price */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: font(13.5),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                ₹{fmt(item.total_price)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Edge-to-Edge Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginHorizontal: -12,
        }}
      />
    </>
  );
};

export default React.memo(CheckoutItem);