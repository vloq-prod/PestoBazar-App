import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import {
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
} from "lucide-react-native";

import { ReturnHistoryItem } from "../../types/order.types";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; text: string }> =
  {
    "Pending": { color: "#F59E0B", bg: "#FEF3C7", icon: RotateCcw, text: "Return pending" },
    "Approved": { color: "#3B82F6", bg: "#EFF6FF", icon: Package, text: "Return approved" },
    "Completed": {
      color: "#10B981",
      bg: "#ECFDF5",
      icon: CheckCircle2,
      text: "Return completed",
    },
    "Rejected": { color: "#EF4444", bg: "#FEF2F2", icon: XCircle, text: "Return rejected" },
    "Failed": { color: "#EF4444", bg: "#FEF2F2", icon: XCircle, text: "Return failed" },
    "Return Placed": { color: "#F59E0B", bg: "#FEF3C7", icon: RotateCcw, text: "Return placed" },
  };

export const getReturnStatusConfig = (status: string) => {
  const normalized = (status || "").trim();
  const lower = normalized.toLowerCase();

  const foundKey = Object.keys(STATUS_CONFIG).find(
    (k) => k.toLowerCase() === lower
  );
  if (foundKey) {
    return STATUS_CONFIG[foundKey];
  }

  if (lower.includes("reject") || lower.includes("fail") || lower.includes("cancel")) {
    return STATUS_CONFIG["Rejected"];
  }
  if (lower.includes("complete") || lower.includes("deliver") || lower.includes("refund")) {
    return STATUS_CONFIG["Completed"];
  }
  if (lower.includes("pending") || lower.includes("placed")) {
    return STATUS_CONFIG["Pending"];
  }
  if (lower.includes("approve")) {
    return STATUS_CONFIG["Approved"];
  }

  return { color: "#6B7280", bg: "#F3F4F6", icon: Clock, text: status || "Return update" };
};

interface ReturnCardProps {
  item: ReturnHistoryItem;
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
  const cfg = getReturnStatusConfig(item.return_status || "Pending");
  const StatusIcon = cfg.icon;

  const returnDate = item.return_at
    ? item.return_at.split("T")[0]
    : "N/A";

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* ── Top Header Section ── */}
      <View style={styles.headerSection}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={[
                styles.statusText,
                {
                  color: colors.text,
                  fontSize: font(15),
                  includeFontPadding: false,
                  textAlignVertical: "center",
                },
              ]}
            >
              {cfg.text}
            </Text>
            <View
              style={[
                styles.statusIconWrap,
                { backgroundColor: cfg.bg },
              ]}
            >
              <StatusIcon size={12} color={cfg.color} strokeWidth={2.5} />
            </View>
          </View>
          <Text
            style={[
              styles.dateText,
              { color: colors.textSecondary, fontSize: font(11) },
            ]}
          >
            Placed at {returnDate}
          </Text>
        </View>

        {/* Right Info: Price */}
        <Text
          style={[
            styles.priceText,
            { color: colors.text, fontSize: font(16) },
          ]}
        >
          ₹{item.return_price ? parseFloat(String(item.return_price)).toFixed(0) : "0"}
        </Text>
      </View>

      {/* ── Middle: Product Images Row ── */}
      {item.product_images && item.product_images.length > 0 && (
        <View style={styles.imageRow}>
          {item.product_images.slice(0, 4).map((imgUrl, idx) => {
            const isLast = idx === 3 && item.product_images!.length > 4;
            return (
              <View key={`img-${idx}`} style={styles.imageContainer}>
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.productImage}
                />
                {isLast && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={[styles.moreImagesText, { fontSize: font(12) }]}>
                      +{item.product_images!.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── Footer Actions Section ── */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Text
            style={[
              styles.actionBtnText,
              { color: colors.primary, fontSize: font(13), fontFamily: "Poppins_600SemiBold" },
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
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  statusText: {
    fontFamily: "Poppins_700Bold",
  },
  statusIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 0,
  },
  priceText: {
    fontFamily: "Poppins_700Bold",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  imageContainer: {
    position: "relative",
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    color: "#FFF",
    fontFamily: "Poppins_700Bold",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  actionBtnText: {
    fontFamily: "Poppins_700Bold",
  },
});
