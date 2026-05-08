import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Project Imports
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useUserOrderHistory } from "../../src/hooks/orderHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";

// Components
import OrderCard from "../../src/components/order/OrderCard";
import OrderSkeleton from "../../src/components/order/OrderSkeleton";

// Icons
import { ShoppingBag, Package, RotateCcw } from "lucide-react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

type TabType = "orders" | "returns";

const OrderScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const { userId } = useAppVisitorStore();

  const [activeTab, setActiveTab] = useState<TabType>("orders");

  const { data, isLoading, error, refetch, isRefetching } = useUserOrderHistory(
    {
      user_id: userId || "",
    },
  );

  const orders = data?.data?.order_master ?? [];

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/(stack)/orderdetails/[id]",
      params: { id: orderId },
    });
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[styles.emptyIcon, { backgroundColor: colors.primary + "12" }]}
        >
          <ShoppingBag size={40} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.emptyTitle,
            { color: colors.text, fontSize: font(18) },
          ]}
        >
          No Orders Yet
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: colors.textTertiary, fontSize: font(13) },
          ]}
        >
          Looks like you haven't placed any orders. Discover amazing products
          today!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          activeOpacity={0.7}
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.shopBtnText, { fontSize: font(14) }]}>
            Start Shopping
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const TabItem = ({ type, label, count, icon: Icon }: { type: TabType, label: string, count: number, icon: any }) => {
    const isActive = activeTab === type;
    return (
      <TouchableOpacity
        onPress={() => setActiveTab(type)}
        activeOpacity={0.8}
        style={[
          styles.tabItem,
          { 
            backgroundColor: isActive ? "#F5F5F5" : "transparent",
          }
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing(8) }}>
          <Icon size={16} color={isActive ? colors.text : colors.textTertiary} strokeWidth={isActive ? 2 : 1.5} />
          <Text
            style={{
              fontFamily: isActive ? "Poppins_600SemiBold" : "Poppins_400Regular",
              fontSize: font(13),
              color: isActive ? colors.text : colors.textTertiary,
            }}
          >
            {label}
          </Text>
          <View 
            style={[
              styles.countBadge, 
              { backgroundColor: isActive ? colors.text : colors.border }
            ]}
          >
            <Text 
              style={[
                styles.countText, 
                { 
                  fontSize: font(10), 
                  color: isActive ? colors.surface : colors.textTertiary 
                }
              ]}
            >
              {count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="My Orders" showBack />
        <View style={styles.emptyContainer}>
          <Text
            style={{
              color: "#EF4444",
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(15),
            }}
          >
            Oops! Failed to load orders.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
              }}
            >
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
      />

      {/* Refined Tab Switcher */}
      <View style={styles.tabsWrapper}>
        <View style={[styles.segmentedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TabItem 
            type="orders" 
            label="Orders" 
            count={orders.length} 
            icon={Package} 
          />
          
          <TabItem 
            type="returns" 
            label="Returns" 
            count={0} 
            icon={RotateCcw} 
          />
        </View>
      </View>

      <FlatList
        data={(isLoading ? [1, 2, 3, 4, 5] : orders) as any[]}
        keyExtractor={(item: any, index) =>
          isLoading ? `skeleton-${index}` : String(item.id)
        }
        renderItem={({ item }: { item: any }) => {
          if (isLoading) {
            return <OrderSkeleton colors={colors} />;
          }
          return (
            <OrderCard
              item={item}
              colors={colors}
              font={font}
              spacing={spacing}
              onPress={() => handleOrderPress(item.enc_order_id)}
            />
          );
        }}
        ListEmptyComponent={renderEmpty}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={[
          styles.listContent,
          !isLoading && orders.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  countBadge: {
    paddingHorizontal: 7,
    height: 18,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 14,
  },
  listContent: {
    paddingHorizontal: 13,
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
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
  },
});
