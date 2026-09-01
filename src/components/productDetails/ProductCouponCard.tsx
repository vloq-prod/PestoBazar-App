import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react-native";
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

  // Format Terms & Conditions text string
  const buildTnCText = () => {
    const parts: string[] = [];

    if (item.discount_type === "percentage" && item.discount_value) {
      let offStr = `${item.discount_value}% off`;
      if (item.max_discount_amount && item.max_discount_amount > 0) {
        offStr += ` up to ₹${item.max_discount_amount}`;
      }
      parts.push(offStr);
    } else if (item.discount_value) {
      parts.push(`Flat ₹${item.discount_value} off`);
    }

    if (item.min_order_amount && item.min_order_amount > 0) {
      parts.push(`Min order ₹${item.min_order_amount}`);
    }

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
      <View style={{ padding: spacing(10) }}>
        {/* ── TOP ROW: Main Discount Title (Left) & Coupon Code Badge Box (Right) ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing(10),
          }}
        >
          {/* Main Top Title */}
          <Text
            style={{
              fontSize: font(13.5),
              fontFamily: "Poppins_700Bold",
              color: "#15803D",
              flex: 1,
            }}
          >
            {discountTitle}
          </Text>

          {/* Coupon Code Badge Box with Copy Icon (Click to Copy) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onCopy(item.code)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing(5),
              paddingHorizontal: spacing(8),
              paddingVertical: spacing(4),
              borderRadius: 6,
              borderWidth: 1,
              borderStyle: "dashed",
              backgroundColor: colors.backgroundgray || "#F3F4F6",
              borderColor: isCopied ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_700Bold",
                color: colors.text,
                letterSpacing: 0.5,
              }}
            >
              {item.code}
            </Text>
            {isCopied ? (
              <Check size={12} color={colors.primary} strokeWidth={2.5} />
            ) : (
              <Copy size={12} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── FULL DESCRIPTION ROW: Full width left-to-right text (item.title & descriptionText) ── */}
        {(!!item.title || !!descriptionText) && (
          <View style={{ marginTop: spacing(4) }}>
            <Text
              style={{
                fontSize: font(11.5),
                lineHeight: font(16.5),
              }}
            >
              {!!item.title && (
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                  }}
                >
                  {item.title}
                  {descriptionText ? ". " : ""}
                </Text>
              )}
              {!!descriptionText && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                  }}
                >
                  {descriptionText}
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* ── BOTTOM ROW: Terms & Conditions Toggle at Bottom Right ── */}
        <View
          style={{
            marginTop: spacing(2),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
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
                fontSize: font(11),
                fontFamily: "Poppins_500Medium",
                color: colors.primary,
              }}
            >
              Terms & Conditions
            </Text>
            {isExpanded ? (
              <ChevronUp size={13} color={colors.primary} />
            ) : (
              <ChevronDown size={13} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── EXPANDABLE TERMS & CONDITIONS ACCORDION ── */}
        {isExpanded && (
          <View
            style={{
              marginTop: spacing(6),
              paddingTop: spacing(6),
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
                lineHeight: font(16),
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
