import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";

export default function Address() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Safe Area */}
      <View style={{ height: insets.top }} />

      {/* Navbar */}
      <AppNavbar title="My Address" showBack />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Empty State (for now) ───────── */}
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Address Found
          </Text>

          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Add a new address to continue shopping
          </Text>
        </View>

        {/* ── Future: Address List (yaha aayega) ───────── */}
        {/* map addresses here later */}
      </ScrollView>

      {/* ── Bottom Button ───────── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom || 10,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>+ Add New Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────
const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  emptySub: {
    fontSize: 12,
    marginTop: 6,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
