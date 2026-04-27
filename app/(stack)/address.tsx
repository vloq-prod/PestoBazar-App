import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useAppVisitorStore } from "../../src/store/auth";
import { useResponsive } from "../../src/utils/useResponsive";
import { useAddress, useRemoveAddress } from "../../src/hooks/CheckoutHooks";
import AddressCard from "../../src/components/checkout/AddressCard";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";
import { MapPin, Plus, Trash2 } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

// ── Helpers ──
const SectionTitle = ({ title, colors, font, spacing, onAddPress }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing(12),
      marginTop: spacing(16),
    }}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          fontSize: font(12),
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>
    <TouchableOpacity
      onPress={onAddPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
    >
      <Plus size={14} color={colors.primary} />
      <Text
        style={{
          fontSize: font(12),
          color: colors.primary,
          fontFamily: "Poppins_500Medium",
        }}
      >
        Add New
      </Text>
    </TouchableOpacity>
  </View>
);

export default function Address() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const queryClient = useQueryClient();

  const userId = useAppVisitorStore((s) => s.userId);

  // Queries & Mutations
  const {
    data: addressData,
    isLoading,
    refetch,
  } = useAddress({ user_id: userId! });

  // When the screen comes into focus, trigger a background refetch
  // This solves the issue of stale data when returning from addaddress.tsx
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  const { mutate: removeAddress, isPending: isRemoving } = useRemoveAddress();
  console.log("addressData", addressData?.data?.delivery_address);

  // Delete Modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const billingList = React.useMemo(
    () => [...(addressData?.data?.billing_address ?? [])],
    [addressData],
  );

  const deliveryList = React.useMemo(
    () => [...(addressData?.data?.delivery_address ?? [])],
    [addressData],
  );

  const handleDeleteConfirm = () => {
    if (!addressToDelete || !userId) return;
    removeAddress(
      { user_id: userId, address_id: addressToDelete },
      {
        onSuccess: () => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        },
      },
    );
  };

  const openDeleteModal = (id: number) => {
    setAddressToDelete(id);
    setDeleteModalVisible(true);
  };

  // Rendering Address List
  const renderAddressList = (
    list: any[],
    title: string,
    emptyText: string,
    type: "billing" | "delivery",
  ) => (
    <View>
      <SectionTitle
        title={title}
        colors={colors}
        font={font}
        spacing={spacing}
        onAddPress={() =>
          router.push({
            pathname: "/(stack)/addaddress",
            params: { type },
          })
        }
      />
      {list.length === 0 ? (
        <View
          style={[
            styles.emptyAddrBox,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingVertical: spacing(24),
            },
          ]}
        >
          <MapPin size={22} color={colors.textTertiary} />
          <Text
            style={[
              styles.emptyAddrText,
              {
                color: colors.textSecondary,
                fontSize: font(12.5),
                marginTop: spacing(8),
              },
            ]}
          >
            {emptyText}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing(12) }}>
          {list.map((addr) => (
            <AddressCard
              key={addr.id}
              item={addr}
              isSelected={false} // Address screen doesn't need selection state
              onSelect={() => {}} // No-op
              onEdit={() =>
                router.push({
                  pathname: "/(stack)/addaddress",
                  params: { type, id: addr.id },
                })
              }
              onDelete={() => openDeleteModal(addr.id)}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: insets.top }} />
      <AppNavbar title="My Addresses" showBack />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: spacing(10),
              fontFamily: "Poppins_400Regular",
            }}
          >
            Loading addresses...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          {billingList.length !== 0 && deliveryList.length !== 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <MapPin size={32} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontSize: font(16) },
                ]}
              >
                No Addresses Found
              </Text>
              <Text
                style={[
                  styles.emptySub,
                  { color: colors.textSecondary, fontSize: font(13) },
                ]}
              >
                Add a new address to continue shopping
              </Text>

              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: colors.primary,
                  borderRadius: 25,
                }}
              onPress={() => router.push("(stack)/map")}
              >
                <Text style={{ color: colors.textInverse }}>Open Map</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {renderAddressList(
                billingList,
                "Billing Address",
                "No billing address added",
                "billing",
              )}
              <View style={{ height: spacing(12) }} />
              {renderAddressList(
                deliveryList,
                "Delivery Address",
                "No delivery address added",
                "delivery",
              )}
            </>
          )}
        </ScrollView>
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Address?"
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

// ── Styles ─────────────────────────
const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
  },
  emptySub: {
    fontFamily: "Poppins_400Regular",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  emptyAddrBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
  },
  emptyAddrText: {
    fontFamily: "Poppins_400Regular",
  },
});
