import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BadgePercent } from "lucide-react-native";
import { B2BCartDiscount, B2BCartDiscountTier } from "../../types/cart.types";
import { useResponsive } from "../../utils/useResponsive";
import { useTheme } from "../../theme";

interface B2BCartDiscountCardProps {
  discountData?: B2BCartDiscount;
}

/**
 * Calculates percentage progress along the tier line connecting dots.
 * Exactly matches website Cart calculation.
 */
export const calculateTierProgress = (
  amount: number,
  tiers: B2BCartDiscountTier[]
): number => {
  if (!tiers || tiers.length === 0 || amount <= 0) return 0;
  if (amount < tiers[0].from_amount) return 0;
  if (amount >= (tiers[tiers.length - 1].from_amount ?? 0)) return 100;

  for (let i = 0; i < tiers.length - 1; i++) {
    const start = tiers[i].from_amount;
    const end = tiers[i + 1].from_amount;

    if (amount >= start && amount < end) {
      const segment = (amount - start) / Math.max(1, end - start);
      return ((i + segment) / (tiers.length - 1)) * 100;
    }
  }

  return 0;
};

export const B2BCartDiscountCard: React.FC<B2BCartDiscountCardProps> = ({
  discountData,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  // Brand green specified by user (#169957)
  const DARK_GREEN = "#169957";

  if (!discountData) return null;

  const tiers: B2BCartDiscountTier[] =
    discountData.allBracket || discountData.tiers || [];

  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  const currentCartAmount = Number(discountData.cart_amount || 0);
  const currentDiscountPercent = Number(discountData.discount_percent || 0);

  const progressPercent = Math.min(
    100,
    Math.max(0, calculateTierProgress(currentCartAmount, tiers))
  );

  const nextTierIndex = tiers.findIndex(
    (tier) => currentCartAmount < tier.from_amount
  );

  const formatAmount = (num: number | null | undefined): string => {
    if (num == null) return "";
    return Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  const getRangeDisplay = (
    from: number,
    to: number | null | undefined
  ): string => {
    if (to == null) {
      return `₹${formatAmount(from)}+`;
    }
    return `₹${formatAmount(from)}–₹${formatAmount(to)}`;
  };

  const renderFormattedMessage = (msg: string) => {
    if (!msg) return null;
    const parts = msg.split(
      /(₹\s*[\d,.]+(?:\.\d+)?|\d+(?:\.\d+)?%\s*(?:discount|OFF)?)/gi
    );
    return (
      <Text
        style={{
          fontSize: font(12.5),
          lineHeight: font(18),
          color: colors.textSecondary,
          fontFamily: "Poppins_400Regular",
        }}
        numberOfLines={2}
      >
        {parts.map((part, i) => {
          const isHighlight = part.startsWith("₹") || part.includes("%");
          return (
            <Text
              key={i}
              style={
                isHighlight
                  ? {
                      color:
                        currentDiscountPercent > 0
                          ? DARK_GREEN
                          : colors.primary,
                      fontFamily: "Poppins_700Bold",
                    }
                  : {
                      color: colors.textSecondary,
                      fontFamily: "Poppins_400Regular",
                    }
              }
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  // Inset calculation: line connects center of dot 1 to center of last dot
  const lineInsetPercent = `${50 / tiers.length}%`;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: spacing(14),
          borderRadius: spacing(12),
        },
      ]}
    >
      {/* ── Header Row (Clean Title, No Fake Status Pill) ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: colors.primary + "12" },
            ]}
          >
            <BadgePercent size={16} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.cardTitle,
              { fontSize: font(13.5), color: colors.text },
            ]}
          >
            Bulk Buyer Discount
          </Text>
        </View>

        {currentDiscountPercent > 0 && (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: DARK_GREEN + "14",
                borderColor: DARK_GREEN + "35",
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { fontSize: font(10.5), color: DARK_GREEN },
              ]}
            >
              {currentDiscountPercent}% OFF Unlocked
            </Text>
          </View>
        )}
      </View>

      {/* ── Headline / Motivation Message ── */}
      <View style={styles.messageRow}>
        {renderFormattedMessage(
          discountData.message ||
            "Shop more to unlock exclusive Bulk Buyer discounts!"
        )}
      </View>

      {/* ── Progress Stepper Track ── */}
      <View style={styles.stepperContainer}>
        {/* Connecting Background Line */}
        <View
          style={[
            styles.trackBackground,
            {
              backgroundColor: colors.border,
              left: lineInsetPercent as any,
              right: lineInsetPercent as any,
            },
          ]}
        >
          {/* Green Progress Fill */}
          <View
            style={[
              styles.trackFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: DARK_GREEN,
              },
            ]}
          />
        </View>

        {/* Tiers Grid */}
        <View style={styles.tiersGrid}>
          {tiers.map((tier, index) => {
            const isUnlocked = currentCartAmount >= tier.from_amount;
            const isNext = index === nextTierIndex;

            const discountDisplay = Number(tier.discount_percent).toFixed(
              Number(tier.discount_percent) % 1 === 0 ? 0 : 1
            );

            const rangeText = getRangeDisplay(tier.from_amount, tier.to_amount);

            return (
              <View key={index} style={styles.tierColumn}>
                {/* Dot with % symbol */}
                <View
                  style={[
                    styles.tierDot,
                    isUnlocked
                      ? {
                          backgroundColor: DARK_GREEN,
                          borderColor: DARK_GREEN,
                        }
                      : isNext
                      ? {
                          backgroundColor: colors.surface,
                          borderColor: colors.primary,
                          borderWidth: 2,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1.5,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.tierDotPercent,
                      {
                        fontSize: font(11.5),
                        color: isUnlocked
                          ? "#FFFFFF"
                          : isNext
                          ? colors.primary
                          : colors.textTertiary,
                      },
                    ]}
                  >
                    %
                  </Text>
                </View>

                {/* Discount % Text */}
                <Text
                  style={[
                    styles.tierPercentLabel,
                    {
                      fontSize: font(12),
                      color: isUnlocked
                        ? DARK_GREEN
                        : isNext
                        ? colors.text
                        : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {discountDisplay}% OFF
                </Text>

                {/* Range Label (Clear, readable price) */}
                <Text
                  style={[
                    styles.tierRangeLabel,
                    {
                      fontSize: font(10.5),
                      color: colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {rangeText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusPillText: {
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  messageRow: {
    marginBottom: 12,
  },
  stepperContainer: {
    position: "relative",
    marginTop: 2,
    marginBottom: 4,
  },
  trackBackground: {
    position: "absolute",
    top: 11.5,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    zIndex: 0,
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
  },
  tiersGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  tierColumn: {
    flex: 1,
    alignItems: "center",
  },
  tierDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  tierDotPercent: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
    textAlign: "center",
  },
  tierPercentLabel: {
    fontFamily: "Poppins_700Bold",
    marginTop: 5,
    textAlign: "center",
    includeFontPadding: false,
  },
  tierRangeLabel: {
    fontFamily: "Poppins_500Medium",
    marginTop: 2,
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default B2BCartDiscountCard;
