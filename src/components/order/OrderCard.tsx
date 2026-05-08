import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Download,
  MapPin,
} from "lucide-react-native";
import { OrderHistoryItem } from "../../types/order.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers & Config
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> =
  {
    "Order Placed": { color: "#6B7280", bg: "#F3F4F6", icon: ShoppingBag },
    "Pickup Scheduled": { color: "#6B7280", bg: "#F3F4F6", icon: Clock },
    "Product Dispatched": { color: "#3B82F6", bg: "#EFF6FF", icon: Package },
    "On Delivery": { color: "#3B82F6", bg: "#EFF6FF", icon: Truck },
    "Product Delivered": {
      color: "#10B981",
      bg: "#ECFDF5",
      icon: CheckCircle2,
    },
    Cancelled: { color: "#EF4444", bg: "#FEF2F2", icon: XCircle },
  };

export const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { color: "#6B7280", bg: "#F3F4F6", icon: Package };

// ─────────────────────────────────────────────────────────────────────────────
// Order Card Component
// ─────────────────────────────────────────────────────────────────────────────

interface OrderCardProps {
  item: OrderHistoryItem;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
  onPress: () => void;
}

const OrderCard = ({
  item,
  colors,
  font,
  spacing,
  onPress,
}: OrderCardProps) => {
  const cfg = getStatusConfig(item.current_status);
  const StatusIcon = cfg.icon;

  const addressParts = [item.address, item.area, item.city, item.pincode]
    .filter(Boolean)
    .join(", ");

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
          <Package size={22} color={"#525252"} strokeWidth={1.5} />
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
              Order Date :
            </Text>
            <Text
              style={[
                styles.amount,
                { color: colors.text, fontSize: font(9) },
              ]}
              numberOfLines={1}
            >
              {item.created_at}
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
            {item.current_status}
          </Text>
        </View>
      </View>

      {/* ── Info Row: 3 Columns ── */}
      <View style={styles.infoRow}>
        {/* Col 1: Order Price */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Order Price
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            ₹{parseFloat(item.order_amount).toFixed(2)}
          </Text>
        </View>

        {/* Col 2: Invoice No */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Invoice No
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {item.invoice_no || "—"}
          </Text>
        </View>

        {/* Col 3: Payment */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.infoLabel,
              { color: colors.textSecondary, fontSize: font(10) },
            ]}
          >
            Payment
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {item.payment_type || "COD"}
          </Text>
        </View>
      </View>

      {/* ── Address ── */}
      {/* <View
        style={[
          styles.addressRow,
          {
            paddingTop: spacing(3),
          },
        ]}
      >
        <View
          style={[
            styles.addressIconWrap,
            { backgroundColor: colors.primary + "10" },
          ]}
        >
          <MapPin size={11} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.addressText,
            { color: colors.textSecondary, fontSize: font(11) },
          ]}
          numberOfLines={2}
        >
          <Text
            style={{ fontFamily: "Poppins_600SemiBold", color: colors.text }}
          >
            {item.full_name}
          </Text>
          {addressParts ? `  •  ${addressParts}` : ""}
        </Text>
      </View> */}

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

export default OrderCard;

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
  infoColDivider: {
    width: 1,
    height: 28,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  addressIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  addressText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
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
