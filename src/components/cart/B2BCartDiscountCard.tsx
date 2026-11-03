import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tag } from "lucide-react-native";
import { B2BCartDiscount, B2BCartDiscountTier } from "../../types/cart.types";
import { useResponsive } from "../../utils/useResponsive";

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
  const { font, spacing } = useResponsive();

  if (!discountData) return null;

  const tiers: B2BCartDiscountTier[] =
    discountData.allBracket || discountData.tiers || [];

  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  const currentCartAmount = Number(discountData.cart_amount || 0);
  const progressPercent = Math.min(
    100,
    Math.max(0, calculateTierProgress(currentCartAmount, tiers))
  );

  const nextTierIndex = tiers.findIndex(
    (tier) => currentCartAmount < tier.from_amount
  );

  // Formats numbers with Indian comma format (e.g. 10,000)
  const formatAmount = (num: number | null | undefined): string => {
    if (num == null) return "";
    return Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const renderFormattedMessage = (msg: string) => {
    if (!msg) return null;
    const parts = msg.split(
      /(₹[\d,.]+(?:\.\d+)?|\d+(?:\.\d+)?%\s*(?:discount|OFF)?)/gi
    );
    return (
      <Text style={[styles.headlineText, { fontSize: font(13.5) }]}>
        {parts.map((part, i) => {
          const isHighlight = part.startsWith("₹") || part.includes("%");
          return (
            <Text
              key={i}
              style={
                isHighlight ? styles.highlightText : styles.normalHeadlineText
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
          padding: spacing(14),
          marginVertical: spacing(8),
          borderRadius: spacing(12),
        },
      ]}
    >
      {/* ── Top Badge ── */}
      <View style={styles.badgeWrapper}>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badgeText, { fontSize: font(9.5) }]}>
            Bulk Buyer CART DISCOUNT
          </Text>
        </View>
      </View>

      {/* ── Headline Row (Icon + Message) ── */}
      <View style={styles.headlineRow}>
        <View style={styles.iconContainer}>
          <Tag size={20} color="#4B32B1" strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          {renderFormattedMessage(
            discountData.message ||
              "Shop more to unlock exclusive Bulk Buyer discounts!"
          )}
        </View>
      </View>

      {/* ── Stepper / Progress Bar ── */}
      <View style={styles.stepperContainer}>
        {/* Connecting Background Line */}
        <View
          style={[
            styles.trackBackground,
            {
              left: lineInsetPercent as any,
              right: lineInsetPercent as any,
            },
          ]}
        >
          {/* Green Progress Fill */}
          <View
            style={[
              styles.trackFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>

        {/* Tiers Grid */}
        <View style={styles.tiersGrid}>
          {tiers.map((tier, index) => {
            const isUnlocked = currentCartAmount >= tier.from_amount;
            const isNext = index === nextTierIndex;

            const discountDisplay = Number(
              tier.discount_percent
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            });

            const rangeText =
              tier.to_amount === null || tier.to_amount === undefined
                ? `₹${formatAmount(tier.from_amount)}+`
                : `₹${formatAmount(tier.from_amount)}–₹${formatAmount(tier.to_amount)}`;

            return (
              <View key={index} style={styles.tierColumn}>
                {/* Outer Ring + Inner Dot */}
                <View
                  style={[
                    styles.tierRing,
                    isUnlocked
                      ? styles.tierRingUnlocked
                      : isNext
                      ? styles.tierRingNext
                      : styles.tierRingLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.tierDot,
                      isUnlocked
                        ? styles.tierDotUnlocked
                        : isNext
                        ? styles.tierDotNext
                        : styles.tierDotLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierDotPercent,
                        {
                          fontSize: font(11),
                          color: isUnlocked
                            ? "#FFFFFF"
                            : isNext
                            ? "#4B32B1"
                            : "#8B7FCE",
                        },
                      ]}
                    >
                      %
                    </Text>
                  </View>
                </View>

                {/* Discount % Text */}
                <Text
                  style={[
                    styles.tierPercentLabel,
                    {
                      fontSize: font(12),
                      color: isUnlocked
                        ? "#16A34A"
                        : isNext
                        ? "#1E2028"
                        : "#6E7280",
                    },
                  ]}
                >
                  {discountDisplay}% OFF
                </Text>

                {/* Range Label */}
                <Text
                  style={[
                    styles.tierRangeLabel,
                    { fontSize: font(10) },
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
    backgroundColor: "#F9F8FE",
    borderWidth: 1.2,
    borderColor: "#E2DCF8",
    shadowColor: "#5C3FC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeWrapper: {
    flexDirection: "row",
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: "#F2EDFF",
    borderWidth: 1,
    borderColor: "#DCD0F8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: "Poppins_700Bold",
    color: "#4B32B1",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  headlineText: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 20,
  },
  normalHeadlineText: {
    color: "#1E2028",
    fontFamily: "Poppins_600SemiBold",
  },
  highlightText: {
    color: "#4B32B1",
    fontFamily: "Poppins_700Bold",
  },
  stepperContainer: {
    position: "relative",
    marginTop: 2,
    marginBottom: 4,
  },
  trackBackground: {
    position: "absolute",
    top: 17,
    height: 4,
    backgroundColor: "#E2DCF8",
    borderRadius: 999,
    overflow: "hidden",
    zIndex: 0,
  },
  trackFill: {
    height: "100%",
    backgroundColor: "#16A34A",
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
  tierRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  tierRingUnlocked: {
    backgroundColor: "#DCFCE7",
  },
  tierRingNext: {
    backgroundColor: "#EDE9FE",
  },
  tierRingLocked: {
    backgroundColor: "transparent",
  },
  tierDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  tierDotUnlocked: {
    backgroundColor: "#16A34A",
  },
  tierDotNext: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4B32B1",
  },
  tierDotLocked: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: "#D2C7F7",
  },
  tierDotPercent: {
    fontFamily: "Poppins_700Bold",
  },
  tierPercentLabel: {
    fontFamily: "Poppins_700Bold",
    marginTop: 6,
    textAlign: "center",
  },
  tierRangeLabel: {
    fontFamily: "Poppins_500Medium",
    color: "#777B87",
    marginTop: 1.5,
    textAlign: "center",
  },
});

export default B2BCartDiscountCard;

