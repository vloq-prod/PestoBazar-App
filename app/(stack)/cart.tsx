import React from "react";
import { View, Text, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";

export default function CartScreen() {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <AppNavbar title="Cart" showBack />

      <View
        style={[
          styles.content,
          {
            paddingVertical: spacing(20),
          },
        ]}
      >


        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
