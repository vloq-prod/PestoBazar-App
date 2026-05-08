import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";

// Project Imports
import AppNavbar from "../../../src/components/comman/AppNavbar";
import CancelOrderModal from "../../../src/components/comman/CancelOrderModal";
import OrderStatusTracker from "../../../src/components/comman/OrderStatusTracker";
import OrderItemCard from "../../../src/components/order/OrderItemCard";
import { useViewOrder } from "../../../src/hooks/orderHooks";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";

// Icons
import {
  ShoppingBag,
  Calendar,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Receipt,
  Star,
  CreditCard,
  User,
  Phone,
  FileText,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react-native";
import { getStatusConfig } from "../../../src/components/order/OrderCard";
import Footer from "../../../src/components/home/Footer";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const num = Number(price);
  if (isNaN(num)) return price;
  // If it's a whole number, return it without decimals.
  // Otherwise, return it with decimals (up to 2), but remove trailing zeros.
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

const WavyDivider = ({ color, spacing }: { color: string; spacing: any }) => {
  return (
    <View
      style={{ height: 10, overflow: "hidden", marginVertical: spacing(8) }}
    >
      <Svg height="10" width="1000">
        <Path
          d="M0 5 Q 3 1, 6 5 T 12 5 T 18 5 T 24 5 T 30 5 T 36 5 T 42 5 T 48 5 T 54 5 T 60 5 T 66 5 T 72 5 T 78 5 T 84 5 T 90 5 T 96 5 T 102 5 T 108 5 T 114 5 T 120 5 T 126 5 T 132 5 T 138 5 T 144 5 T 150 5 T 156 5 T 162 5 T 168 5 T 174 5 T 180 5 T 186 5 T 192 5 T 198 5 T 204 5 T 210 5 T 216 5 T 222 5 T 228 5 T 234 5 T 240 5 T 246 5 T 252 5 T 258 5 T 264 5 T 270 5 T 276 5 T 282 5 T 288 5 T 294 5 T 300 5 T 306 5 T 312 5 T 318 5 T 324 5 T 330 5 T 336 5 T 342 5 T 348 5 T 354 5 T 360 5 T 366 5 T 372 5 T 378 5 T 384 5 T 390 5 T 396 5 T 402 5 T 408 5 T 414 5 T 420 5 T 426 5 T 432 5 T 438 5 T 444 5 T 450 5 T 456 5 T 462 5 T 468 5 T 474 5 T 480 5 T 486 5 T 492 5 T 498 5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
};

/** Matches checkout.tsx SectionTitle style */
const SectionLabel = ({ title, colors, font, spacing, first }: any) => (
  <View
    style={{
      marginBottom: spacing(14),
    }}
  >
    <Text
      style={{
        fontFamily: "Poppins_600SemiBold",
        letterSpacing: 1,
        textTransform: "uppercase",
        fontSize: font(10.5),
        color: colors.textSecondary,
      }}
    >
      {title}
    </Text>
  </View>
);

/** Integrated Order Info & Address card */
const OrderDetailsSummary = ({ orderData, colors, font, spacing }: any) => {
  const maskedMobile = (mobile: string) => {
    if (!mobile) return "N/A";
    const str = String(mobile);
    if (str.length <= 5) return str;
    return str.substring(0, 5) + "XXXXX";
  };

  const IconWrapper = ({ icon: Icon, bg = colors.backgroundgray }: any) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: bg,
      }}
    >
      <Icon size={16} color={colors.textSecondary} />
    </View>
  );

  return (
    <View
      style={[
        styles.ticketCard,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingVertical: 5,

          marginBottom: spacing(20),
        },
      ]}
    >
      {/* 1. Profile Section (With Border) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,

          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 12,
        }}
      >
        <IconWrapper icon={User} />
        <View style={{ marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(14),
              color: colors.text,
              includeFontPadding: false,
            }}
          >
            {orderData?.order_delivery_info?.full_name || "N/A"}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(12),
              color: colors.textSecondary,
              includeFontPadding: false,
              marginTop: 2,
            }}
          >
            {maskedMobile(orderData?.order_delivery_info?.mobile)}
          </Text>
        </View>
      </View>

      {/* 2. Payment Method */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={CreditCard} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.tetx,
                includeFontPadding: false,
              }}
            >
              Payment Method
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              Payment Via:{" "}
              {orderData?.order?.payment_type?.toUpperCase() || "PREPAID"}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Deliver To Address */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={MapPin} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
                includeFontPadding: false,
              }}
            >
              Deliver To
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_delivery_info?.address},{" "}
              {orderData?.order_delivery_info?.city}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_delivery_info?.state_name} -{" "}
              {orderData?.order_delivery_info?.pincode}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Bill To Address */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={Receipt} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.tetx,
                includeFontPadding: false,
              }}
            >
              Bill To
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_billing_info?.address},{" "}
              {orderData?.order_billing_info?.city}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_billing_info?.state_name} -{" "}
              {orderData?.order_billing_info?.pincode}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

const OrderDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const [isCancelModalVisible, setIsCancelModalVisible] = React.useState(false);

  const { data, isLoading, error } = useViewOrder({
    order_id: id || "",
  });

  console.log(" order id enc : ", id);

  const orderData = data?.data;
  const currentStatus = orderData?.order?.current_status || "Order Placed";

  if (!id) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <AppNavbar title="Order Details" showBack />
        <View style={styles.center}>
          <Text style={{ color: colors.textTertiary, fontSize: font(14) }}>
            No Order ID provided.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="Order Details" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: spacing(12),
              fontSize: font(14),
              fontFamily: "Poppins_400Regular",
            }}
          >
            Loading Details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="Order Details" showBack />
        <View style={styles.center}>
          <Text
            style={{
              color: "#EF4444",
              fontSize: font(16),
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            Oops! Error loading details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusCfg = getStatusConfig(currentStatus);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar
        title={`#${orderData?.order?.order_no || ""}`}
        subtitle={orderData?.order?.created_at}
        showBack
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingVertical: spacing(20),
            paddingBottom: 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing(16) }}>
          {/* ── 2. Tracker ──────────────────────────────────── */}

        <OrderStatusTracker
          currentStatus={currentStatus}
          colors={colors}
          font={font}
          spacing={spacing}
        />

        {/* ── 5. Payment Summary (Moved up) ──────────────────────────── */}
        <View
          style={[
            styles.ticketCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,

              marginBottom: spacing(20),
            },
          ]}
        >
          {/* Internal Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundgray,
                }}
              >
                <Receipt size={16} color={colors.textSecondary} />
              </View>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(14),
                  color: colors.text,
                }}
              >
                Bill Summary
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.backgroundgray,
                paddingVertical: spacing(5),
                paddingHorizontal: spacing(8),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing(6),
              }}
            >
              <Download
                size={16}
                color={colors.textSecondary}
                strokeWidth={2}
              />
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(8.5),
                    color: colors.text,
                    lineHeight: font(8),
                  }}
                >
                  Download
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(8.5),
                    color: colors.text,
                    lineHeight: font(8),
                  }}
                >
                  Invoice
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                Item Total
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                ₹{formatPrice(orderData?.order?.order_amount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                Shipping
              </Text>
              {orderData?.order?.shipping_charge === "0" ? (
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color: "#10B981", // Green for FREE
                  }}
                >
                  FREE
                </Text>
              ) : (
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(12.5),
                    color: colors.text,
                  }}
                >
                  + ₹{formatPrice(orderData?.order?.shipping_charge)}
                </Text>
              )}
            </View>

            {orderData?.order?.cod_charges !== "0" && (
              <View style={styles.summaryRow}>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.text,
                  }}
                >
                  COD Charges
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color:
                      Number(orderData?.order?.cod_charges) > 0
                        ? "#EF4444"
                        : colors.text,
                  }}
                >
                  + ₹{formatPrice(orderData?.order?.cod_charges)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                GST (Govt. Taxes)
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12.5),
                  color: colors.text,
                }}
              >
                + ₹{formatPrice(orderData?.order?.shipping_gst || "0")}
              </Text>
            </View>
          </View>

          <WavyDivider color={colors.border} spacing={spacing} />

          <View
            style={[
              styles.cardContent,
              { marginTop: 0, marginBottom: spacing(8) },
            ]}
          >
            <View style={styles.summaryRow}>
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(14),
                    color: colors.textSecondary,
                  }}
                >
                  Grand Total
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(10),
                    color: colors.textSecondary,
                    marginTop: -1,
                  }}
                >
                  Payment by{" "}
                  {orderData?.order?.payment_type?.toLowerCase() === "cash"
                    ? "Cash"
                    : "Prepaid"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(20),
                    color: colors.text,
                  }}
                >
                  ₹{formatPrice(orderData?.order?.paid_amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <OrderDetailsSummary
          orderData={orderData}
          colors={colors}
          font={font}
          spacing={spacing}
        />

        {/* ── 4. Items ──────────────────────────────────── */}
        <SectionLabel
          title="Items Ordered"
          colors={colors}
          font={font}
          spacing={spacing}
        />
        <View>
          {orderData?.order_detail?.map((item: any, index: number) => (
            <OrderItemCard
              key={item.id}
              item={item}
              orderData={orderData}
              isLast={index === (orderData?.order_detail?.length ?? 0) - 1}
              colors={colors}
              font={font}
              spacing={spacing}
            />
          ))}
        </View>

        {/* ── 5. Support & Actions ────────────────────────── */}
        <View
          style={{
            marginTop: spacing(20),
            marginBottom: spacing(32),
            paddingHorizontal: 0,
          }}
        >
          <SectionLabel
            title="Need Help?"
            colors={colors}
            font={font}
            spacing={spacing}
          />
          <View
            style={[
              styles.infoQuadrantCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: spacing(16),
                gap: spacing(16),
              },
            ]}
          >
            {(currentStatus === "Order Placed" ||
              currentStatus === "Pending") && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                onPress={() => setIsCancelModalVisible(true)}
              >
                <View
                  style={{
                    padding: 8,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 8,
                  }}
                >
                  <XCircle size={18} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13),
                      color: "#EF4444",
                    }}
                  >
                    Cancel Order
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(10.5),
                      color: colors.textTertiary,
                    }}
                  >
                    Cancel this order if you've changed your mind
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {currentStatus === "Delivered" && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    padding: 8,
                    backgroundColor: colors.backgroundgray,
                    borderRadius: 8,
                  }}
                >
                  <RotateCcw size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13),
                      color: colors.text,
                    }}
                  >
                    Return / Exchange
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(10.5),
                      color: colors.textTertiary,
                    }}
                  >
                    Request a return or exchange for items
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  padding: 8,
                  backgroundColor: colors.backgroundgray,
                  borderRadius: 8,
                }}
              >
                <Phone size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(13),
                    color: colors.text,
                  }}
                >
                  Contact Support
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(10.5),
                    color: colors.textTertiary,
                  }}
                >
                  Get help with your order or delivery
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </View>
        <Footer />
      </ScrollView>

      {/* ── Cancel Order Modal ── */}
      <CancelOrderModal
        visible={isCancelModalVisible}
        onClose={() => setIsCancelModalVisible(false)}
        onSubmit={(reason, comments) => {
          // Implement your cancel API call here
          console.log(
            "Cancelling order with reason:",
            reason,
            "and comments:",
            comments,
          );
          setIsCancelModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Horizontal tracker
  horizontalTracker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    alignItems: "center",
    width: 52,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginBottom: 20,
  },
  // Product row
  productRow: {
    flexDirection: "row",
    paddingVertical: 14,
    gap: 14,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  // Payment summary
  summaryBlock: {
    gap: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  // Ticket Card Styling
  ticketCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 1,
  },
  cardContent: {
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 8,
  },
  // Dividers
  divider: {
    height: 1,
    width: "100%",
  },
  verticalDivider: {
    width: 1,
  },
  horizontalDivider: {
    height: 1,
    width: "100%",
  },
  // Unique Quadrant Card
  infoQuadrantCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  quadrantRow: {
    flexDirection: "row",
  },
  quadrantItem: {
    flex: 1,
    padding: 16,
  },
  quadrantLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  quadrantLabel: {
    fontFamily: "Poppins_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quadrantValue: {
    fontFamily: "Poppins_600SemiBold",
  },
  // Sticky Footer
  stickyFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 28 : 12,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  footerActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  footerBtnText: {
    fontFamily: "Poppins_600SemiBold",
  },
});
