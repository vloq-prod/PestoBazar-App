import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useAppVisitorStore } from "../../src/store/auth";
import { useAddress, useCheckout, useRemoveAddress } from "../../src/hooks/CheckoutHooks";
import { useResponsive } from "../../src/utils/useResponsive";
import CheckoutItem from "../../src/components/cart/CheckoutItem";
import {
  ShoppingBag,
  Info,
  MoveRight,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
} from "lucide-react-native";
import AddressCard from "../../src/components/checkout/AddressCard";
import { fmt, formatINR } from "../../src/utils/productHelpers";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionTitle = ({ title, colors, font, spacing, rightElement }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing(12) }}>
    <Text
      style={[
        styles.sectionTitle,
        {
          fontSize: font(11),
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>
    {rightElement}
  </View>
);

const PriceRow = ({
  label,
  value,
  isTotal,
  isGreen,
  colors,
  font,
  spacing,
}: any) => (
  <View style={[styles.priceRow, { paddingVertical: spacing(5) }]}>
    <Text
      style={[
        styles.priceRowLabel,
        {
          fontSize: isTotal ? font(14) : font(13),
          fontFamily: isTotal ? "Poppins_600SemiBold" : "Poppins_400Regular",
          color: isTotal ? colors.text : colors.textSecondary,
        },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.priceRowValue,
        {
          fontSize: isTotal ? font(17) : font(13),
          fontFamily: isTotal ? "Poppins_700Bold" : "Poppins_500Medium",
          color: isGreen ? "#22C55E" : isTotal ? colors.primary : colors.text,
        },
      ]}
    >
      {value}
    </Text>
  </View>
);



// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Checkout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();

  const userId = useAppVisitorStore((s) => s.userId);
  const { mutate: checkoutMutate, isPending, data, error } = useCheckout();
  const { data: addressData } = useAddress({ user_id: userId! });

  // ── Address state ──────────────────────────────────────────────────────────
  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(
    null
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // ── Delete Modal state ──
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const { mutate: removeAddress, isPending: isRemoving } = useRemoveAddress();

  const handleDeleteConfirm = () => {
    if (!addressToDelete || !userId) return;
    removeAddress(
      { user_id: userId, address_id: addressToDelete },
      {
        onSuccess: () => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
          if (selectedBillingId === addressToDelete) setSelectedBillingId(null);
          if (selectedDeliveryId === addressToDelete) setSelectedDeliveryId(null);
        },
      }
    );
  };

  // Auto-select first addresses when data arrives
  useEffect(() => {
    if (addressData?.billing?.length && selectedBillingId === null) {
      setSelectedBillingId(addressData.billing[0].id);
    }
    if (addressData?.delivery?.length && selectedDeliveryId === null) {
      setSelectedDeliveryId(addressData.delivery[0].id);
    }
  }, [addressData]);

  useEffect(() => {
    if (!userId) return;
    checkoutMutate({ user_id: userId });
  }, [checkoutMutate, userId]);

  const cart = data?.data?.cart_app;
  const items: any[] = data?.data?.cart_details || [];

  const isFreeShipping = cart?.free_shipping === "Yes";
  const shippingCharge = Number(cart?.shipping_charge ?? 0);
  const gstAmount = cart?.gst_amount ?? "";

  const billingList: any[] = addressData?.billing ?? [];
  const deliveryList: any[] = addressData?.delivery ?? [];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack />
        <View className="flex-1 items-center justify-center gap-2">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: colors.textSecondary,
                fontSize: font(13),
                marginTop: spacing(10),
              },
            ]}
          >
            Loading your cart...
          </Text>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack />
        <View className="flex-1 items-center justify-center gap-2">
          <Text style={styles.errorText}>Something went wrong</Text>
        </View>
      </View>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!cart) {
    return (
      <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
        <View style={{ height: insets.top }} />
        <AppNavbar title="Checkout" showBack />
        <View className="flex-1 items-center justify-center gap-2">
          <ShoppingBag size={48} color={colors.textTertiary} />
          <Text
            style={[
              styles.emptyText,
              { color: colors.textSecondary, marginTop: spacing(12) },
            ]}
          >
            Your cart is empty
          </Text>
        </View>
      </View>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top }} />
      <AppNavbar title="Checkout" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing(16),
            paddingVertical: spacing(12),
            paddingBottom: insets.bottom + spacing(160),
            gap: spacing(16),
          },
        ]}
      >
        {/* ══════════════════════════════════════
            BILLING ADDRESS SECTION
        ══════════════════════════════════════ */}
        <View>
          <SectionTitle
            title="Billing Address"
            colors={colors}
            font={font}
            spacing={spacing}
            rightElement={
              <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={14} color={colors.primary} />
                <Text style={{ fontSize: font(11), color: colors.primary, fontFamily: "Poppins_500Medium" }}>Add New</Text>
              </TouchableOpacity>
            }
          />
          {billingList.length === 0 ? (
            <View
              style={[
                styles.emptyAddrBox,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <MapPin size={22} color={colors.textTertiary} />
              <Text
                style={[
                  styles.emptyAddrText,
                  { color: colors.textSecondary, fontSize: font(12) },
                ]}
              >
                No billing address added
              </Text>
            </View>
          ) : (
            <View style={[styles.addrList, { gap: spacing(10) }]}>
              {billingList.map((addr) => (
                <AddressCard
                  key={addr.id}
                  item={addr}
                  isSelected={selectedBillingId === addr.id}
                  onSelect={() => setSelectedBillingId(addr.id)}
                  onEdit={() => console.log("Edit billing", addr.id)}
                  onDelete={() => {
                    setAddressToDelete(addr.id);
                    setDeleteModalVisible(true);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════
            "SAME AS BILLING" CHECKBOX
        ══════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSameAsBilling((v) => !v)}
          style={[
            styles.sameAsBillingRow,
            { paddingVertical: 8 }
          ]}
        >
          {sameAsBilling ? (
            <CheckSquare size={20} color={colors.primary} />
          ) : (
            <Square size={20} color={colors.textSecondary} />
          )}
          <View style={styles.sameAsBillingTextWrap}>
            <Text
              style={[
                styles.sameAsBillingTitle,
                {
                  fontSize: font(13),
                  color: colors.text,
                },
              ]}
            >
              Delivery address same as billing
            </Text>
          </View>
        </TouchableOpacity>

        {/* ══════════════════════════════════════
            DELIVERY ADDRESS SECTION (hidden when same as billing)
        ══════════════════════════════════════ */}
        {!sameAsBilling && (
          <View>
            <SectionTitle
              title="Delivery Address"
              colors={colors}
              font={font}
              spacing={spacing}
              rightElement={
                <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Plus size={14} color={colors.primary} />
                  <Text style={{ fontSize: font(11), color: colors.primary, fontFamily: "Poppins_500Medium" }}>Add New</Text>
                </TouchableOpacity>
              }
            />
            {deliveryList.length === 0 ? (
              <View
                style={[
                  styles.emptyAddrBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <MapPin size={22} color={colors.textTertiary} />
                <Text
                  style={[
                    styles.emptyAddrText,
                    { color: colors.textSecondary, fontSize: font(12) },
                  ]}
                >
                  No delivery address added
                </Text>
              </View>
            ) : (
              <View style={[styles.addrList, { gap: spacing(10) }]}>
                {deliveryList.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    item={addr}
                    isSelected={selectedDeliveryId === addr.id}
                    onSelect={() => setSelectedDeliveryId(addr.id)}
                    onEdit={() => console.log("Edit delivery", addr.id)}
                    onDelete={() => {
                      setAddressToDelete(addr.id);
                      setDeleteModalVisible(true);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════
            ORDER SUMMARY
        ══════════════════════════════════════ */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderRadius: spacing(16),
            },
          ]}
        >
          <SectionTitle
            title={`Order Summary (${cart.cart_count} item${cart.cart_count > 1 ? "s" : ""})`}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {items.map((item) => (
            <CheckoutItem key={item.id} item={item} />
          ))}

          <PriceRow
            label={`Subtotal (${cart.cart_count} item${cart.cart_count > 1 ? "s" : ""})`}
            value={cart.cart_amount}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          <PriceRow
            label="Shipping"
            value={shippingCharge === 0 ? "FREE" : fmt(shippingCharge)}
            isGreen={shippingCharge === 0}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {!!gstAmount && (
            <PriceRow
              label="GST"
              value={gstAmount}
              colors={colors}
              font={font}
              spacing={spacing}
            />
          )}

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
                marginVertical: spacing(8),
              },
            ]}
          />

          <PriceRow
            label="Grand Total"
            value={fmt(cart.amount_to_pay)}
            isTotal
            colors={colors}
            font={font}
            spacing={spacing}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {isFreeShipping && (
          <View
            style={[
              styles.freeShippingBanner,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.freeShippingText, { color: colors.primary }]}>
              You have unlocked FREE shipping
            </Text>
          </View>
        )}

        <View style={styles.bottomBarInner}>
          <View>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {formatINR(Number(cart.amount_to_pay) || 0)}
            </Text>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Info size={13} color={colors.textTertiary} />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => { }}
            style={[styles.placeOrderBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
            <MoveRight size={26} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmationModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#EF4444"
        icon={<Trash2 size={24} color="#EF4444" />}
        isLoading={isRemoving}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenRoot: { flex: 1 },
  scrollContent: {},

  // ── Section title ──
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  // ── Price row ──
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRowLabel: {},
  priceRowValue: {},

  // ── State screens ──
  loadingText: { fontFamily: "Poppins_400Regular" },
  errorText: { color: "#EF4444", fontFamily: "Poppins_500Medium" },
  emptyText: { fontFamily: "Poppins_500Medium" },

  // ── Address list ──
  addrList: {},

  // ── Empty address placeholder ──
  emptyAddrBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyAddrText: {
    fontFamily: "Poppins_400Regular",
  },

  // ── Same as billing checkbox row ──
  sameAsBillingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sameAsBillingTextWrap: { flex: 1 },
  sameAsBillingTitle: { fontFamily: "Poppins_500Medium" },

  // ── Order summary card ──
  summaryCard: {},

  // ── Divider ──
  divider: { height: 1 },

  // ── Bottom bar ──
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  freeShippingBanner: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    marginTop: 1,
  },
  freeShippingText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  bottomBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingHorizontal: 20,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  grandTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    color: "#888",
    fontFamily: "Poppins_400Regular",
    includeFontPadding: false,
  },
  placeOrderBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 180,
    flexDirection: "row",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },
});
