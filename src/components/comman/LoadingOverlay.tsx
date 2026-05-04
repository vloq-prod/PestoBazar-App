import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = "Processing Payment..." }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
        <View style={[styles.card, { backgroundColor: colors.background, borderRadius: spacing(16) }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.text, { color: colors.text, fontSize: font(14), marginTop: spacing(12) }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 200,
  },
  text: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
});

export default LoadingOverlay;
