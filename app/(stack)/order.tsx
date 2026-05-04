import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Project Imports
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useUserOrderHistory } from "../../src/hooks/orderHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { OrderHistoryItem } from "../../src/types/order.types";

// Icons
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Download,
  MapPin,
  FileText,
  ChevronRight,
  Receipt
} from "lucide-react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  "Order Placed":       { color: "#3B82F6", bg: "#EFF6FF", icon: ShoppingBag },
  "Pickup Scheduled":   { color: "#F59E0B", bg: "#FFFBEB", icon: Clock },
  "Product Dispatched": { color: "#8B5CF6", bg: "#F5F3FF", icon: Package },
  "On Delivery":        { color: "#F97316", bg: "#FFF7ED", icon: Truck },
  "Product Delivered":  { color: "#10B981", bg: "#ECFDF5", icon: CheckCircle2 },
  Cancelled:            { color: "#EF4444", bg: "#FEF2F2", icon: XCircle },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { color: "#6B7280", bg: "#F3F4F6", icon: Package };

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

const OrderSkeleton = ({ colors }: { colors: any }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pulseAnim }]}>
      <View style={[styles.cardHeader, { borderBottomColor: colors.border + "60" }]}>
        <View style={{ width: 100, height: 16, borderRadius: 4, backgroundColor: colors.border }} />
        <View style={{ width: 60, height: 14, borderRadius: 4, backgroundColor: colors.border }} />
      </View>
      <View style={styles.cardBody}>
        <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: colors.border }} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ width: "60%", height: 16, borderRadius: 4, backgroundColor: colors.border }} />
          <View style={{ width: "40%", height: 14, borderRadius: 4, backgroundColor: colors.border }} />
          <View style={{ width: "80%", height: 12, borderRadius: 4, backgroundColor: colors.border, marginTop: 4 }} />
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border + "60", backgroundColor: colors.background + "40" }]}>
        <View style={{ flex: 1, height: 20, marginHorizontal: 24, borderRadius: 4, backgroundColor: colors.border }} />
        <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
        <View style={{ flex: 1, height: 20, marginHorizontal: 24, borderRadius: 4, backgroundColor: colors.border }} />
      </View>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Order Card (E-commerce Premium UI)
// ─────────────────────────────────────────────────────────────────────────────

interface OrderCardProps {
  item: OrderHistoryItem;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
  onPress: () => void;
}

const OrderCard = ({ item, colors, font, spacing, onPress }: OrderCardProps) => {
  const cfg = getStatusConfig(item.current_status);
  const Icon = cfg.icon;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[
        styles.card, 
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      {/* ── Header: Status & Date ── */}
      <View style={[styles.cardHeader, { borderBottomColor: colors.border + "60" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
            <Icon size={14} color={cfg.color} />
          </View>
          <Text style={[styles.statusText, { color: cfg.color, fontSize: font(12) }]}>
            {item.current_status}
          </Text>
        </View>
        <Text style={[styles.orderDate, { color: colors.textSecondary, fontSize: font(11) }]}>
          {item.created_at}
        </Text>
      </View>

      {/* ── Body: Product/Order Info ── */}
      <View style={styles.cardBody}>
        {/* Placeholder for Product Image / Package Icon */}
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.background }]}>
          <Package size={28} color={colors.textTertiary} strokeWidth={1.5} />
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={[styles.orderNo, { color: colors.text, fontSize: font(14) }]}>
                Order #{item.order_no}
              </Text>
              <Text style={[styles.amount, { color: colors.primary, fontSize: font(16) }]}>
                ₹{parseFloat(item.order_amount).toFixed(2)}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </View>

          {/* Inline Payment & Invoice */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Receipt size={10} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: font(10), fontFamily: "Poppins_500Medium" }}>
                {item.payment_type || "Prepaid"}
              </Text>
            </View>
            {item.invoice_no && (
              <>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border }} />
                <Text style={{ color: colors.textTertiary, fontSize: font(10), fontFamily: "Poppins_400Regular" }}>
                  Inv: {item.invoice_no}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Delivery Address (Full Row) */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, paddingHorizontal: 16, paddingBottom: 16 }}>
        <MapPin size={14} color={colors.textTertiary} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.addressText, { color: colors.textSecondary, fontSize: font(11) }]} numberOfLines={2}>
            <Text style={{ fontFamily: "Poppins_600SemiBold", color: colors.textSecondary }}>{item.full_name}</Text>
            {" • "}
            {[item.address, item.area, item.city, item.pincode].filter(Boolean).join(", ")}
          </Text>
        </View>
      </View>

      {/* ── Footer: Actions ── */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border + "60", backgroundColor: colors.background + "30" }]}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Download size={16} color={colors.textSecondary} />
          <Text style={[styles.actionBtnText, { color: colors.textSecondary, fontSize: font(12) }]}>
            Invoice
          </Text>
        </TouchableOpacity>

        <View style={{ width: 1, height: 24, backgroundColor: colors.border }} />

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={onPress}>
          <Eye size={16} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary, fontSize: font(12) }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

const OrderScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const { userId } = useAppVisitorStore();

  const { data, isLoading, error, refetch, isRefetching } = useUserOrderHistory({
    user_id: userId || "",
  });

  const orders = data?.data?.order_master ?? [];

  const handleOrderPress = (orderId: string) => {
    console.log("order id: ", orderId)
    router.push({
      pathname: "/(stack)/orderdetails/[id]",
      params: { id: orderId },
    });
  };

  // ── Empty State ──────────────────────────────────────────────────────────
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "12" }]}>
          <ShoppingBag size={40} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text, fontSize: font(18) }]}>
          No Orders Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textTertiary, fontSize: font(13) }]}>
          Looks like you haven't placed any orders. Discover amazing products today!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          activeOpacity={0.7}
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.shopBtnText, { fontSize: font(14) }]}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="My Orders" showBack />         
        <View style={styles.emptyContainer}>
          <Text style={{ color: "#EF4444", fontFamily: "Poppins_600SemiBold", fontSize: font(15) }}>
            Oops! Failed to load orders.
          </Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={{ color: colors.primary, fontFamily: "Poppins_600SemiBold", fontSize: font(13) }}>
              Retry Fetching
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar
        title="My Orders"
        showBack
        count={isLoading ? undefined : orders.length}
      />

      <FlatList
        data={isLoading ? [] : orders}
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : String(item.id)}
        ListHeaderComponent={
          <>
           
            {isLoading && (
              <View style={{ paddingTop: 16 }}>
                <OrderSkeleton colors={colors} />
                <OrderSkeleton colors={colors} />
                <OrderSkeleton colors={colors} />
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            colors={colors}
            font={font}
            spacing={spacing}
            onPress={() => handleOrderPress(item.enc_order_id)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={[
          styles.listContent,
          !isLoading && orders.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
  },
  
  // ── Card Styles (Premium E-commerce) ──
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: "Poppins_600SemiBold",
  },
  orderDate: {
    fontFamily: "Poppins_500Medium",
  },
  
  // ── Body ──
  cardBody: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  orderNo: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 20,
  },
  amount: {
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
  },
  addressText: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },
  
  // ── Footer ──
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
    gap: 8,
  },
  actionBtnText: {
    fontFamily: "Poppins_600SemiBold",
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  shopBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  shopBtnText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
  },
  
  // ── Error State ──
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  }
});