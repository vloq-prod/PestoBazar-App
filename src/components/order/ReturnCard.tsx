import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  Package,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
} from "lucide-react-native";
import { ReturnRefundItem } from "../../types/order.types";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> =
  {
    "Pending": { color: "#F59E0B", bg: "#FEF3C7", icon: RotateCcw },
    "Approved": { color: "#3B82F6", bg: "#EFF6FF", icon: Package },
    "Completed": {
      color: "#10B981",
      bg: "#ECFDF5",
      icon: CheckCircle2,
    },
    "Rejected": { color: "#EF4444", bg: "#FEF2F2", icon: XCircle },
    "Failed": { color: "#EF4444", bg: "#FEF2F2", icon: XCircle },
  };

export const getReturnStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { color: "#6B7280", bg: "#F3F4F6", icon: RotateCcw };

interface ReturnCardProps {
  item: ReturnRefundItem;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
  onPress: () => void;
}

const ReturnCard = ({
  item,
  colors,
  font,
  spacing,
  onPress,
}: ReturnCardProps) => {
  const cfg = getReturnStatusConfig(item.refund_status || "Pending");
  const StatusIcon = cfg.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* ── Top: Icon + Order Info + Status ── */}
      <View style={styles.topSection}>
        <View style={styles.packageIconWrap}>
          <RotateCcw size={22} color={"#525252"} strokeWidth={1.5} />
        </View>

        {/* Center: Order no + date */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={[
                styles.orderLabel,
                { color: colors.text, fontSize: font(12) },
              ]}
            >
              Order :
            </Text>
            <Text
              style={[
                styles.orderNo,
                { color: colors.text, fontSize: font(13) },
              ]}
            >
              #{item.order_no}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={[
                styles.orderLabel,
                { color: colors.text, fontSize: font(10) },
              ]}
            >
              Requested :
            </Text>
            <Text
              style={[
                styles.amount,
                { color: colors.text, fontSize: font(9) },
              ]}
              numberOfLines={1}
            >
              {item.refund_created_at ? item.refund_created_at.substring(0, 10) : "N/A"}
            </Text>
          </View>
        </View>

        {/* Right: Status badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: cfg.bg,
              borderColor: cfg.color + "30",
              alignSelf: "flex-start",
            },
          ]}
        >
          <StatusIcon size={10} color={cfg.color} />
          <Text
            style={[
              styles.statusText,
              { color: cfg.color, fontSize: font(10) },
            ]}
          >
            {item.refund_status || "Pending"}
          </Text>
        </View>
      </View>

      {/* ── Info Row: 3 Columns ── */}
      <View style={styles.infoRow}>
        {/* Col 1: Refund Amount */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Refund Amount
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            ₹{item.refund_amount ? parseFloat(item.refund_amount).toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* Col 2: Total Refunded */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Total Refunded
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            ₹{item.total_refunded_amount ? parseFloat(item.total_refunded_amount).toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* Col 3: Gateway */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Gateway
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {item.gateway || "N/A"}
          </Text>
        </View>
      </View>

      {/* ── Footer: Invoice | View Details ── */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background + "30",
          },
        ]}
      >
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Download size={14} color={colors.textSecondary} />
          <Text
            style={[
              styles.actionBtnText,
              { color: colors.text, fontSize: font(12) },
            ]}
          >
            Invoice
          </Text>
        </TouchableOpacity>

        <View
          style={{ width: 1, height: "100%", backgroundColor: colors.border }}
        />

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Text
            style={[
              styles.actionBtnText,
              { color: colors.primary, fontSize: font(12) },
            ]}
          >
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ReturnCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  packageIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F3",
    marginRight: 10,
  },
  orderLabel: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 14,
  },
  orderNo: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 20,
  },
  amount: {
    fontFamily: "Poppins_700Bold",
    marginTop: 1,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: "Poppins_600SemiBold",
  },
  divider: {
    height: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  infoCol: {
    alignItems: "center",
    gap: 3,
  },
  infoLabel: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  infoValue: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 7,
  },
  actionBtnText: {
    fontFamily: "Poppins_600SemiBold",
  },
});
