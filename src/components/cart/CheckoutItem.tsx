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
  const { spacing, font, wp } = useResponsive();
  const imageSize = wp(22);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: spacing(12),
          paddingBottom: spacing(10),

        }}
      >
        {/* ── Image ── */}
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: spacing(8),
            backgroundColor: colors.inputBackground,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.s3_image_path ? BASE_URL + item.s3_image_path : undefined }}
            style={{ width: imageSize, height: imageSize }}
            resizeMode="cover"
          />
        </View>

        {/* ── Content ── */}
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            gap: spacing(8),
          }}
        >
          {/* Name */}
          <Text
            numberOfLines={2}
            style={{
              fontSize: font(13),
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
                fontSize: font(12),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              {item.size}{"  "}
              <Text style={{ color: colors.textTertiary }}>·</Text>{"  "}
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
                  fontSize: font(15),
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

      {/* Divider */}
      {!isLast && (
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginBottom: spacing(10),
          }}
        />
      )}
    </>
  );
};

export default React.memo(CheckoutItem);