import React, { useMemo } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import {
  B2BProfileDealerData,
  B2BProfileStatusBadge,
} from "../../types/b2b.types";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

interface BulkBuyerDetailsCardProps {
  dealer: B2BProfileDealerData;
  statusBadge?: B2BProfileStatusBadge;
  containerStyle?: StyleProp<ViewStyle>;
}

export const BulkBuyerDetailsCard: React.FC<BulkBuyerDetailsCardProps> = ({
  dealer,
  statusBadge,
  containerStyle,
}) => {
  const { colors } = useTheme();
  const { font } = useResponsive();

  const formattedBusinessAddress = useMemo(() => {
    const parts = [
      dealer.business_address,
      dealer.business_city,
      dealer.business_state,
      dealer.business_pincode ? `${dealer.business_pincode}` : undefined,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  }, [dealer]);

  const formattedDeliveryAddress = useMemo(() => {
    if (
      dealer.delivery_same_as_business === "Yes" ||
      !dealer.delivery_address?.trim()
    ) {
      return "Same as the main business address";
    }
    const parts = [
      dealer.delivery_address,
      dealer.delivery_city,
      dealer.delivery_state,
      dealer.delivery_pincode ? `${dealer.delivery_pincode}` : undefined,
    ].filter(Boolean);
    return parts.length > 0
      ? parts.join(", ")
      : "Same as the main business address";
  }, [dealer]);

  const rawStatus = dealer.status || "Approved";
  const badgeLabel = statusBadge?.label || rawStatus;

  // Dynamic status badge coloring
  const { badgeColor, badgeBg, badgeBorder } = useMemo(() => {
    if (statusBadge?.color && statusBadge?.bg_color) {
      return {
        badgeColor: statusBadge.color,
        badgeBg: statusBadge.bg_color,
        badgeBorder: "rgba(8, 122, 84, 0.2)",
      };
    }
    const lower = rawStatus.toLowerCase();
    if (lower.includes("approv")) {
      return {
        badgeColor: "#087A54",
        badgeBg: "#E3F8EF",
        badgeBorder: "rgba(8, 122, 84, 0.25)",
      };
    }
    if (lower.includes("pend")) {
      return {
        badgeColor: "#D97706",
        badgeBg: "#FEF3C7",
        badgeBorder: "rgba(217, 119, 6, 0.25)",
      };
    }
    if (lower.includes("reject")) {
      return {
        badgeColor: "#DC2626",
        badgeBg: "#FEE2E2",
        badgeBorder: "rgba(220, 38, 38, 0.25)",
      };
    }
    return {
      badgeColor: "#087A54",
      badgeBg: "#E3F8EF",
      badgeBorder: "rgba(8, 122, 84, 0.25)",
    };
  }, [statusBadge, rawStatus]);

  // Label style matching input field labels (fontSize 12.5, colors.textSecondary)
  const itemLabelStyle = [
    styles.itemLabel,
    {
      fontSize: font(12),
      color: colors.textSecondary,
    },
  ];

  // Value style
  const itemValueStyle = [
    styles.itemValue,
    {
      fontSize: font(13),
      color: colors.text,
    },
  ];

  // Box style matching input box radius and borders
  const itemBoxStyle = [
    styles.gridItem,
    {
      backgroundColor: colors.surface ?? "#FFFFFF",
      borderColor: colors.border ?? "#E5E7EB",
    },
  ];

  const fullBoxStyle = [
    styles.gridItemFull,
    {
      backgroundColor: colors.surface ?? "#FFFFFF",
      borderColor: colors.border ?? "#E5E7EB",
    },
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {/* ── Section Title Row ── */}
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textSecondary, fontSize: font(17) },
          ]}
        >
          Bulk Buyer Details
        </Text>
      </View>

      {/* ── Business Header (Clean row) ── */}
      <View style={styles.businessHeader}>
        <View style={styles.businessHeaderLeft}>
          <Text
            style={[
              styles.businessName,
              { color: colors.text, fontSize: font(17.5) },
            ]}
            numberOfLines={2}
          >
            {dealer.business_name ||
              dealer.legal_business_name ||
              "Business Profile"}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: badgeBg, borderColor: badgeBorder },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: badgeColor, fontSize: font(11.5) },
            ]}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* ── Details Grid (100% width, Business Type & Bulk Buyer Category in 1 row) ── */}
      <View style={styles.grid}>
        {/* Row 1: Business Type & Bulk Buyer Category in 1 row */}
        <View style={styles.row}>
          <View style={itemBoxStyle}>
            <Text style={itemLabelStyle} numberOfLines={1}>
              Business Type
            </Text>
            <Text style={itemValueStyle} numberOfLines={2}>
              {dealer.business_type || "Not provided"}
            </Text>
          </View>
        </View>

        <View style={itemBoxStyle}>
          <Text style={itemLabelStyle} numberOfLines={1}>
            Bulk Buyer Category
          </Text>
          <Text style={itemValueStyle} numberOfLines={2}>
            {dealer.dealer_category || "Not provided"}
          </Text>
        </View>

        {/* Row 2: GSTIN & Years in Business in 1 row */}
        <View style={styles.row}>
          <View style={itemBoxStyle}>
            <Text style={itemLabelStyle} numberOfLines={1}>
              GSTIN
            </Text>
            <Text style={itemValueStyle} numberOfLines={1}>
              {dealer.gst_number || "Not provided"}
            </Text>
          </View>

          <View style={itemBoxStyle}>
            <Text style={itemLabelStyle} numberOfLines={1}>
              Years in Business
            </Text>
            <Text style={itemValueStyle} numberOfLines={1}>
              {dealer.years_in_business || "Not provided"}
            </Text>
          </View>
        </View>

        {/* Row 3: Business Address (Full Width) */}
        <View style={fullBoxStyle}>
          <Text style={itemLabelStyle}>Business Address</Text>
          <Text style={itemValueStyle}>{formattedBusinessAddress}</Text>
        </View>

        {/* Row 4: Delivery Address (Full Width) */}
        <View style={fullBoxStyle}>
          <Text style={itemLabelStyle}>Delivery Address</Text>
          <Text style={itemValueStyle}>{formattedDeliveryAddress}</Text>
        </View>
      </View>
    </View>
  );
};

export default BulkBuyerDetailsCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins_500Medium",
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 1,
    width: "100%",
  },
  businessHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  businessName: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 24,
  },
  appIdText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
  },
  grid: {
    width: "100%",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    gap: 10,
  },
  gridItem: {
    flex: 1,
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  gridItemFull: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemLabel: {
    fontFamily: "Poppins_500Medium",
    marginBottom: 4,
    marginLeft: 1,
  },
  itemValue: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 18,
    marginLeft: 1,
  },
});
