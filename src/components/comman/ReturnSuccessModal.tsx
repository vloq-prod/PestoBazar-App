import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { CheckCircle2, PackageCheck } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

export interface ReturnSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderId?: string | number;
  itemCount?: number;
}

export const ReturnSuccessModal: React.FC<ReturnSuccessModalProps> = ({
  visible,
  onClose,
  orderId,
  itemCount = 1,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.surface,
                  borderRadius: spacing(24),
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Glowing Success Badge Icon */}
              <View
                style={[
                  styles.iconOuterRing,
                  { backgroundColor: "#10B98115", borderColor: "#10B98135" },
                ]}
              >
                <View
                  style={[
                    styles.iconInnerCircle,
                    { backgroundColor: "#10B981" },
                  ]}
                >
                  <CheckCircle2 size={32} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              </View>

              {/* Title */}
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: font(18),
                    color: colors.text,
                    marginTop: spacing(4),
                  },
                ]}
              >
                Return Request Submitted!
              </Text>

              {/* Description */}
              <Text
                style={[
                  styles.description,
                  {
                    fontSize: font(13),
                    color: colors.textSecondary,
                    marginTop: spacing(8),
                    lineHeight: font(20),
                  },
                ]}
              >
                Your return request has been submitted successfully. Our team will review the details and unboxing video shortly.
              </Text>

              {/* Order Info Badge */}
              {orderId ? (
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      marginTop: spacing(16),
                    },
                  ]}
                >
                  <PackageCheck size={18} color={colors.primary} />
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: font(12.5),
                      color: colors.text,
                    }}
                  >
                    Order #{orderId}
                    {itemCount > 0
                      ? ` • ${itemCount} ${itemCount === 1 ? "Item" : "Items"}`
                      : ""}
                  </Text>
                </View>
              ) : null}

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onClose}
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: colors.primary,
                    marginTop: spacing(24),
                    borderRadius: spacing(14),
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(14),
                    color: "#FFFFFF",
                    letterSpacing: 0.3,
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReturnSuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  description: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmBtn: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
