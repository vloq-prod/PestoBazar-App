import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

// Project Imports
import AppNavbar from "../../../src/components/comman/AppNavbar";
import CancelOrderModal from "../../../src/components/comman/CancelOrderModal";
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
} from "lucide-react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  { label: "Order Placed", icon: ShoppingBag, short: "Placed" },
  { label: "Pickup Scheduled", icon: Calendar, short: "Pickup" },
  { label: "Product Dispatched", icon: Package, short: "Dispatched" },
  { label: "On Delivery", icon: Truck, short: "On Way" },
  { label: "Product Delivered", icon: CheckCircle2, short: "Delivered" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

/** Matches checkout.tsx SectionTitle style */
const SectionLabel = ({ title, colors, font, spacing, first }: any) => (
  <View
    style={{
      marginBottom: spacing(14),
      marginTop: first ? spacing(4) : spacing(32),
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

/** Horizontal step-by-step status tracker */
const OrderStatusTracker = ({ currentStatus, colors, font, spacing }: any) => {
  const isCancelled = currentStatus?.toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <View style={{ marginBottom: spacing(4), alignItems: "center" }}>
        <View
          style={{
            backgroundColor: "#FEF2F2",
            paddingVertical: spacing(16),
            paddingHorizontal: spacing(24),
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            borderWidth: 1,
            borderColor: "#FECACA",
          }}
        >
          <XCircle size={32} color="#EF4444" style={{ marginBottom: 8 }} />
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: font(14),
              color: "#EF4444",
            }}
          >
            Order Cancelled
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(11),
              color: "#B91C1C",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            Your order has been cancelled. If you have already paid, the refund will be initiated soon.
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = ORDER_STATUSES.findIndex(
    (s) => s.label === currentStatus,
  );

  return (
    <View style={{ marginBottom: spacing(4) }}>
      {/* Steps Row */}
      <View style={styles.horizontalTracker}>
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === ORDER_STATUSES.length - 1;
          const Icon = status.icon;

          return (
            <React.Fragment key={status.label}>
              {/* Step */}
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isCompleted
                        ? colors.primary
                        : colors.border + "80",
                      borderWidth: isCurrent ? 2.5 : 0,
                      borderColor: isCurrent ? colors.primary : "transparent",
                    },
                  ]}
                >
                  <Icon
                    size={14}
                    color={isCompleted ? "#FFF" : colors.textTertiary}
                  />
                </View>
                <Text
                  style={{
                    fontSize: font(9),
                    fontFamily: isCurrent
                      ? "Poppins_700Bold"
                      : "Poppins_400Regular",
                    color: isCompleted ? colors.text : colors.textTertiary,
                    textAlign: "center",
                    marginTop: 5,
                    maxWidth: 60,
                  }}
                >
                  {status.short}
                </Text>
              </View>

              {/* Connector line */}
              {!isLast && (
                <View
                  style={[
                    styles.stepConnector,
                    {
                      backgroundColor:
                        index < currentIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Current status label */}
      <View style={{ alignItems: "center", marginTop: spacing(12) }}>
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: font(12),
            color: colors.primary,
          }}
        >
          {currentStatus}
        </Text>
      </View>
    </View>
  );
};


/** Address info block (no card border) */
const AddressBlock = ({ title, addressInfo, colors, font, spacing }: any) => (
  <View style={{ flex: 1 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing(6) }}>
      <MapPin size={12} color={colors.textTertiary} />
      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: font(10),
          color: colors.textTertiary,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
    </View>
    <Text
      style={{
        fontFamily: "Poppins_500Medium",
        fontSize: font(12),
        color: colors.text,
        lineHeight: 20,
      }}
    >
      {addressInfo?.address}, {addressInfo?.city}
      {"\n"}
      <Text style={{ fontFamily: "Poppins_400Regular", color: colors.textSecondary }}>
        {addressInfo?.state_name} - {addressInfo?.pincode}
      </Text>
    </Text>
  </View>
);

/** Grid for Order Info (Invoice, Payment, Customer) */
const OrderInfoGrid = ({ orderData, colors, font, spacing }: any) => {
  const infoItems = [
    {
      label: "Invoice No",
      value: orderData?.order?.invoice_no || "N/A",
      icon: Receipt,
    },
    {
      label: "Payment Mode",
      value: orderData?.order?.payment_type || "Prepaid",
      icon: CreditCard,
    },
    {
      label: "Customer",
      value: orderData?.order_delivery_info?.full_name || "N/A",
      icon: User,
    },
    {
      label: "Mobile Number",
      value: orderData?.order_delivery_info?.mobile || "N/A",
      icon: Phone,
    },
  ];

  return (
    <View
      style={[
        styles.infoQuadrantCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Row */}
      <View
        style={[
          styles.quadrantRow,
          { borderBottomWidth: 1, borderBottomColor: colors.border},
        ]}
      >
        <View
          style={[
            styles.quadrantItem,
            { borderRightWidth: 1, borderRightColor: colors.border},
          ]}
        >
          <View style={styles.quadrantLabelRow}>
            <Receipt size={12} color={colors.textTertiary} />
            <Text
              style={[
                styles.quadrantLabel,
                { color: colors.textTertiary, fontSize: font(9) },
              ]}
            >
              Invoice No
            </Text>
          </View>
          <Text
            style={[
              styles.quadrantValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {orderData?.order?.invoice_no || "N/A"}
          </Text>
        </View>
        <View style={styles.quadrantItem}>
          <View style={styles.quadrantLabelRow}>
            <CreditCard size={12} color={colors.textTertiary} />
            <Text
              style={[
                styles.quadrantLabel,
                { color: colors.textTertiary, fontSize: font(9) },
              ]}
            >
              Payment
            </Text>
          </View>
          <Text
            style={[
              styles.quadrantValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {orderData?.order?.payment_type || "Prepaid"}
          </Text>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.quadrantRow}>
        <View
          style={[
            styles.quadrantItem,
            { borderRightWidth: 1, borderRightColor: colors.border },
          ]}
        >
          <View style={styles.quadrantLabelRow}>
            <User size={12} color={colors.textTertiary} />
            <Text
              style={[
                styles.quadrantLabel,
                { color: colors.textTertiary, fontSize: font(9) },
              ]}
            >
              Customer
            </Text>
          </View>
          <Text
            style={[
              styles.quadrantValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {orderData?.order_delivery_info?.full_name || "N/A"}
          </Text>
        </View>
        <View style={styles.quadrantItem}>
          <View style={styles.quadrantLabelRow}>
            <Phone size={12} color={colors.textTertiary} />
            <Text
              style={[
                styles.quadrantLabel,
                { color: colors.textTertiary, fontSize: font(9) },
              ]}
            >
              Mobile
            </Text>
          </View>
          <Text
            style={[
              styles.quadrantValue,
              { color: colors.text, fontSize: font(12) },
            ]}
            numberOfLines={1}
          >
            {orderData?.order_delivery_info?.mobile || "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const IMAGE_BASE = "https://static-cdn.pestobazaar.com/";

const OrderItemCard = ({ item, orderData, isLast, colors, font, spacing }: any) => {
  const [expanded, setExpanded] = React.useState(false);
  const isCombo = item.listing_type === "Combo";

  const childItems = isCombo
    ? (orderData?.order_combo_detail || []).filter(
        (child: any) => child.parent_variant_id === item.variation_id
      )
    : [];

  const comboTotalAmount = childItems.reduce(
    (acc: number, child: any) => acc + Number(child.total_amount || 0), 0
  );
  const displayTotalAmount = isCombo ? comboTotalAmount.toFixed(2) : item.total_amount;

  const imageUri = item.main_image?.startsWith("http")
    ? item.main_image
    : IMAGE_BASE + item.main_image;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: isLast ? 0 : spacing(12),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* ── Main Item Row ─────────────────────────────────── */}
      <View style={{ flexDirection: "row", padding: spacing(14), gap: spacing(14) }}>
        {/* Image with subtle bg */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{ width: 72, height: 72 }}
            contentFit="contain"
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
            <Text
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(13), color: colors.text, lineHeight: font(18) }}
              numberOfLines={2}
            >
              {item.product_name}
            </Text>

          {/* Price row — directly below name */}
          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: spacing(5), gap: spacing(6) }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(15), color: colors.primary }}>
              ₹{displayTotalAmount}
            </Text>
            {item.actual_price && Number(item.actual_price) > Number(displayTotalAmount) && (
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(11),
                  color: colors.textTertiary,
                  textDecorationLine: "line-through",
                }}
              >
                ₹{item.actual_price}
              </Text>
            )}
          </View>

          {/* Size & Qty — simple plain text below price */}
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: colors.textTertiary, marginTop: spacing(3) }}>
            {[item.size, `Qty: ${item.qty}`].filter(Boolean).join("  ·  ")}
          </Text>
        </View>
      </View>

      {/* ── Divider + Action Bar ──────────────────────────── */}
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border }}>

        {/* For Combo: View Items | Review | Reorder (3 buttons) */}
        {isCombo && childItems.length > 0 ? (
          <>
            {/* View Items */}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing(11), gap: spacing(4) }}
          >
              {expanded ? <ChevronUp size={13} color={colors.primary} /> : <ChevronDown size={13} color={colors.primary} />}
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.primary }}>
                {expanded ? "Hide" : `${childItems.length} Items`}
            </Text>
          </TouchableOpacity>

            <View style={{ width: 1, backgroundColor: colors.border }} />

            {/* Review */}
        <TouchableOpacity
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing(11), gap: spacing(4) }}
        >
              <Star size={12} color={colors.primary} fill={colors.primary} />
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.primary }}>
            Review
          </Text>
        </TouchableOpacity>

            <View style={{ width: 1, backgroundColor: colors.border }} />

            {/* Reorder */}
        <TouchableOpacity
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing(11), gap: spacing(4) }}
            >
              <RotateCcw size={12} color={colors.textSecondary} />
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.textSecondary }}>
                Reorder
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* For Static: Write Review | Reorder (2 buttons) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing(11), gap: spacing(4) }}
            >
              <Star size={12} color={colors.primary} fill={colors.primary} />
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.primary }}>
                Write Review
              </Text>
            </TouchableOpacity>

            <View style={{ width: 1, backgroundColor: colors.border }} />

            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing(11), gap: spacing(4) }}
            >
              <RotateCcw size={12} color={colors.textSecondary} />
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.textSecondary }}>
                Reorder
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Combo Accordion ───────────────────────────────── */}
      {expanded && isCombo && childItems.length > 0 && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          {/* Header */}
          <View
          style={{
            flexDirection: "row",
              justifyContent: "space-between",
            alignItems: "center",
              paddingHorizontal: spacing(14),
              paddingVertical: spacing(10),
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
          }}
        >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11), color: colors.text }}>
              Combo Includes
          </Text>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11), color: colors.textTertiary }}>
              {childItems.length} items
            </Text>
      </View>

          {/* Child Item Rows */}
          {childItems.map((child: any, cIndex: number) => {
            const childImageUri = child.main_image?.startsWith("http")
              ? child.main_image
              : IMAGE_BASE + child.main_image;

            return (
              <View
                key={child.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing(14),
                  paddingVertical: spacing(12),
                  borderBottomWidth: cIndex === childItems.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  gap: spacing(12),
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: childImageUri }}
                    style={{ width: 44, height: 44 }}
                    contentFit="contain"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.text, lineHeight: font(16) }}
                    numberOfLines={2}
                  >
                    {child.product_name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing(3), gap: spacing(8) }}>
                    {child.size ? (
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(10), color: colors.textTertiary }}>
                        {child.size}
                      </Text>
                    ) : null}
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(10), color: colors.textTertiary }}>
                      × {child.pack}
                  </Text>
                </View>
                </View>

                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(13), color: colors.primary }}>
                  ₹{child.total_amount}
                </Text>
              </View>
            );
          })}

          {/* Combo Total Footer */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: spacing(14),
              paddingVertical: spacing(10),
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.primary + "08",
            }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
              Combo Total
            </Text>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(14), color: colors.primary }}>
              ₹{comboTotalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

const OrderDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const [isCancelModalVisible, setIsCancelModalVisible] = React.useState(false);

  const { data, isLoading, error } = useViewOrder({
    order_id: id || "",
  });

  console.log(" order id enc : ", id)

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Order Details" showBack />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing(16),
            paddingVertical: spacing(10),
            paddingBottom: 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Order Reference ────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing(20),
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(18),
                color: colors.text,
              }}
            >
              #{orderData?.order?.order_no || "Order"}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(12),
                color: colors.textTertiary,
                marginTop: 2,
              }}
            >
              {orderData?.order?.created_at}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.primary + "15",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: font(11),
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {currentStatus}
            </Text>
          </View>
        </View>

        {/* ── 2. Tracker ──────────────────────────────────── */}
        <SectionLabel
          title="Order Status"
          colors={colors}
          font={font}
          spacing={spacing}
          first
        />
        <OrderStatusTracker
          currentStatus={currentStatus}
          colors={colors}
          font={font}
          spacing={spacing}
        />

        {/* ── 3. Order Info Grid ──────────────────────────── */}
        <SectionLabel
          title="Order Information"
          colors={colors}
          font={font}
          spacing={spacing}
        />
        <OrderInfoGrid
          orderData={orderData}
          colors={colors}
          font={font}
          spacing={spacing}
        />

        {/* ── 3. Addresses ────────────────────────────────── */}
        <SectionLabel
          title="Delivery Details"
          colors={colors}
          font={font}
          spacing={spacing}
        />
        <View style={{ gap: 16 }}>
          <AddressBlock
            title="Deliver To"
            addressInfo={orderData?.order_delivery_info}
            colors={colors}
            font={font}
            spacing={spacing}
          />
          <View
            style={[
              styles.horizontalDivider,
              { backgroundColor: colors.border + "40" },
            ]}
          />
          <AddressBlock
            title="Bill To"
            addressInfo={orderData?.order_billing_info}
            colors={colors}
            font={font}
            spacing={spacing}
          />
        </View>

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

        {/* ── 5. Payment Summary ──────────────────────────── */}
        <SectionLabel
          title="Payment Summary"
          colors={colors}
          font={font}
          spacing={spacing}
        />
        <View style={[styles.summaryBlock, { marginBottom: spacing(20) }]}>
          <View style={styles.summaryRow}>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(13),
                color: colors.textSecondary,
              }}
            >
              Subtotal
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
              }}
            >
              ₹{orderData?.order?.order_amount}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(13),
                color: colors.textSecondary,
              }}
            >
              Shipping
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
              }}
            >
              + ₹{orderData?.order?.shipping_charge}
            </Text>
          </View>
          {orderData?.order?.cod_charges !== "0" && (
            <View style={styles.summaryRow}>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(13),
                  color: colors.textSecondary,
                }}
              >
                COD Charges
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(13),
                  color: colors.text,
                }}
              >
                + ₹{orderData?.order?.cod_charges}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(13),
                color: colors.textSecondary,
              }}
            >
              GST
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
              }}
            >
              + ₹{orderData?.order?.shipping_gst || "0"}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.border, marginVertical: spacing(12) },
            ]}
          />
          <View style={styles.summaryRow}>
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(15),
                color: colors.text,
              }}
            >
              Order Total
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(18),
                color: colors.primary,
              }}
            >
              ₹{orderData?.order?.paid_amount}
            </Text>
          </View>
        </View>

        {/* ── Cancel Order Button ── */}
        {currentStatus !== "Cancelled" && currentStatus !== "Delivered" && (
          <View style={{ paddingHorizontal: spacing(2), marginBottom: spacing(40) }}>
            <TouchableOpacity
              style={[
                styles.cancelOrderBtn,
                { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
              ]}
              activeOpacity={0.7}
              onPress={() => setIsCancelModalVisible(true)}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(13),
                  color: "#EF4444",
                }}
              >
                Cancel Order
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Cancel Order Modal ── */}
      <CancelOrderModal
        visible={isCancelModalVisible}
        onClose={() => setIsCancelModalVisible(false)}
        onSubmit={(reason, comments) => {
          // Implement your cancel API call here
          console.log("Cancelling order with reason:", reason, "and comments:", comments);
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
  cancelOrderBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
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
});
