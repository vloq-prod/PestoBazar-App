import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Line } from "react-native-svg";
import { BadgePercent, Copy, Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import type { ActiveCoupon } from "../../types/offer.types";

interface ProductCouponCardProps {
  item: ActiveCoupon;
  onCopy: (code: string) => void;
  isCopied: boolean;
}

export const ProductCouponCard: React.FC<ProductCouponCardProps> = ({
  item,
  onCopy,
  isCopied,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const [isExpanded, setIsExpanded] = useState(false);

  const discountTitle =
    item.discount_amount && item.discount_amount > 0
      ? `You save ₹${item.discount_amount}`
      : item.discount_type === "percentage"
        ? `Get ${item.discount_value}% OFF`
        : `Flat ₹${item.discount_value} OFF`;

  const descriptionText =
    item.description ||
    item.message ||
    (item.min_order_amount && item.min_order_amount > 0
      ? `Applicable on minimum order of ₹${item.min_order_amount}`
      : item.max_discount_amount && item.max_discount_amount > 0
        ? `Maximum discount up to ₹${item.max_discount_amount}`
        : "Special discount coupon available for this cart.");

  // Format Terms & Conditions text string as: "10% off up to ₹100.00 · Valid till 2026-08-30 10:59:00"
  const buildTnCText = () => {
    const parts: string[] = [];

    // 1. Discount & Max Limit
    if (item.discount_type === "percentage" && item.discount_value) {
      let offStr = `${item.discount_value}% off`;
      if (item.max_discount_amount && item.max_discount_amount > 0) {
        offStr += ` up to ₹${item.max_discount_amount}`;
      }
      parts.push(offStr);
    } else if (item.discount_value) {
      parts.push(`Flat ₹${item.discount_value} off`);
    }

    // 2. Min Order
    if (item.min_order_amount && item.min_order_amount > 0) {
      parts.push(`Min order ₹${item.min_order_amount}`);
    }

    // 3. Valid Till
    if (item.valid_till) {
      parts.push(`Valid till ${item.valid_till}`);
    }

    if (parts.length > 0) {
      return parts.join(" · ");
    }

    return item.description || item.message || "Standard coupon terms apply.";
  };

  const tncText = buildTnCText();

  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: "#FBFBFE",
        borderColor: "#D1D5DB",
        borderWidth: 1,
      }}
    >
      <View style={{ padding: spacing(12) }}>
        {/* Top Row: Icon + Savings Message & Title on Left, COPY Button on Right */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              marginRight: spacing(10),
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: spacing(10),
              }}
            >
              <BadgePercent size={20} color="#15803D" />
            </View>
            <View style={{ flex: 1 }}>
              {/* Discount Title */}
              <Text
                style={{
                  fontSize: font(13.5),
                  fontFamily: "Poppins_700Bold",
                  color: "#15803D",
                }}
              >
                {discountTitle}
              </Text>

              {/* Coupon Title */}
              {!!item.title && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    marginTop: 1,
                  }}
                >
                  {item.title}
                </Text>
              )}
            </View>
          </View>

          {/* COPY Button at Top Right */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onCopy(item.code)}
            style={{
              paddingHorizontal: spacing(14),
              paddingVertical: spacing(6),
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 70,
            }}
          >
            {isCopied ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Check size={13} color={colors.primary} strokeWidth={3} />
                <Text
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_700Bold",
                    color: colors.primary,
                  }}
                >
                  Copied
                </Text>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Copy size={13} color={colors.primary} />
                <Text
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_700Bold",
                    color: colors.primary,
                  }}
                >
                  COPY
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dedicated Coupon Description Block */}
        {!!descriptionText && (
          <Text
            numberOfLines={2}
            style={{
              fontSize: font(12),
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              marginTop: spacing(6),
              lineHeight: font(17),
            }}
          >
            {descriptionText}
          </Text>
        )}

        {/* Middle Dashed Divider — Edge-to-Edge SVG Dashed Line (------ ------ ------) */}
        <View
          style={{
            marginHorizontal: -spacing(12),
            marginVertical: spacing(12),
            height: 1,
            overflow: "hidden",
          }}
        >
          <Svg height="2" width="100%">
            <Line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="#D1D5DB"
              strokeWidth="1.2"
              strokeDasharray="6, 4"
            />
          </Svg>
        </View>

        {/* Bottom Row: Code Badge Box at Bottom Left & Toggle Terms & Conditions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing(10),
          }}
        >
          {/* Coupon Code Badge Box at Bottom Left */}
          <View
            style={{
              paddingHorizontal: spacing(10),
              paddingVertical: spacing(6),
              borderRadius: 6,
              borderWidth: 1,
              backgroundColor: colors.backgroundgray,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: font(12),
                fontFamily: "Poppins_700Bold",
                color: colors.text,
                letterSpacing: 0.5,
              }}
            >
              {item.code}
            </Text>
          </View>

          {/* Toggle Terms & Conditions Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsExpanded((prev) => !prev)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_500Medium",
                color: colors.primary,
              }}
            >
              Terms & Conditions
            </Text>
            {isExpanded ? (
              <ChevronUp size={14} color={colors.primary} />
            ) : (
              <ChevronDown size={14} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Expandable Terms & Conditions Section (Accordion) ── */}
        {isExpanded && (
          <View
            style={{
              marginTop: spacing(8),
            }}
          >
            {/* Formatted T&C Text String */}
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11.5),
                color: colors.text,
                lineHeight: font(17),
              }}
            >
              {tncText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProductCouponCard;
