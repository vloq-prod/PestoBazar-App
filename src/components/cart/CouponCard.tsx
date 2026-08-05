import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { BadgePercent, Lock, Check } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { ApplicableCoupon, NearbyCoupon } from "../../types/promocoupon.types";

interface CouponCardProps {
  item: ApplicableCoupon | NearbyCoupon;
  isApplied?: boolean;
  isLocked?: boolean;
  isApplyingOrRemoving?: boolean;
  disabled?: boolean;
  onToggle?: (code: string) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
  item,
  isApplied = false,
  isLocked = false,
  isApplyingOrRemoving = false,
  disabled = false,
  onToggle,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  // Type helper to check if this is a NearbyCoupon
  const isNearbyCoupon = (coupon: any): coupon is NearbyCoupon => {
    return "required_more_amount" in coupon;
  };

  return (
    <View
      style={[
        styles.couponCard,
        {
          backgroundColor: colors.surface,
          borderColor: isApplied ? colors.primary : colors.border,
          borderWidth: isApplied ? 1.5 : 1,
          opacity: isLocked ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.cardMain}>
        {/* Top Row: Icon + Savings Message & Code Badge */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              {isLocked ? (
                <Lock size={16} color={colors.textSecondary} />
              ) : (
                <BadgePercent size={20} color="#15803D" />
              )}
            </View>
            <View style={styles.topTextWrapper}>
              {isLocked && isNearbyCoupon(item) ? (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.savingsText,
                    {
                      fontSize: font(12.5),
                      color: colors.warning,
                    },
                  ]}
                >
                  Add ₹{item.required_more_amount} more to unlock
                </Text>
              ) : (
                <Text
                  style={[
                    styles.savingsText,
                    {
                      fontSize: font(13.5),
                      color: "#15803D",
                    },
                  ]}
                >
                  You save ₹{(item as ApplicableCoupon).discount_amount}
                </Text>
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.subtitle,
                  {
                    fontSize: font(12),
                    color: colors.text,
                    fontFamily: "Poppins_700Bold",
                  },
                ]}
              >
                {item.title}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.codeBadge,
              {
                backgroundColor: colors.backgroundgray,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.codeText,
                {
                  fontSize: font(12),
                  color: isLocked ? colors.textSecondary : colors.text,
                },
              ]}
            >
              {item.code}
            </Text>
          </View>
        </View>

        {/* Middle Divider */}
        <View style={[styles.divider, { borderColor: colors.border }]} />

        {/* Bottom Row: Description/Terms & Action (Apply/Applied/Locked) */}
        <View style={styles.bottomRow}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              {
                fontFamily: "Poppins_400Regular",
                fontSize: font(12),
                color: colors.textSecondary,
                flex: 1,
                marginRight: spacing(8),
              },
            ]}
          >
            {item.description ||
              item.message ||
              (isLocked ? "Add more items to unlock." : "Coupon available for this cart.")}
          </Text>

          {isLocked ? (
            <View
              style={[
                styles.applyBtn,
                {
                  backgroundColor: colors.backgroundgray,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.applyText,
                  {
                    fontSize: font(12),
                    color: colors.textSecondary,
                  },
                ]}
              >
                Locked
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onToggle?.(item.code)}
              style={[
                styles.applyBtn,
                {
                  backgroundColor: isApplied ? colors.primary + "15" : "transparent",
                  borderColor: colors.primary,
                  borderWidth: 1,
                  opacity: disabled && !isApplyingOrRemoving ? 0.5 : 1,
                },
              ]}
              disabled={disabled || isApplyingOrRemoving}
            >
              {isApplyingOrRemoving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : isApplied ? (
                <View style={styles.appliedRow}>
                  <Check
                    size={13}
                    color={colors.primary}
                    strokeWidth={3}
                  />
                  <Text
                    style={[
                      styles.applyText,
                      {
                        fontSize: font(12),
                        color: colors.primary,
                      },
                    ]}
                  >
                    Applied
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.applyText,
                    { fontSize: font(12), color: colors.primary },
                  ]}
                >
                  Apply
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CouponCard;

const styles = StyleSheet.create({
  couponCard: {
    borderRadius: 10,
  },
  cardMain: {
    padding: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  topTextWrapper: {
    flex: 1,
  },
  savingsText: {
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    fontFamily: "Poppins_700Bold",
    letterSpacing: 0.5,
  },
  divider: {
    borderStyle: "dashed",
    borderWidth: 1,
    height: 0,
    width: "100%",
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
  },
  applyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  applyText: {
    fontFamily: "Poppins_700Bold",
  },
  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
