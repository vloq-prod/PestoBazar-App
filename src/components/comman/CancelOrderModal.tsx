import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import { X, ChevronDown, Check } from "lucide-react-native";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCancelReason, useCancelOrder } from "../../hooks/orderHooks";
import { useAppVisitorStore } from "../../store/auth";
import { ActivityIndicator } from "react-native";

interface CancelOrderModalProps {
  visible: boolean;
  orderId?: string | number;
  onClose: () => void;
  onSuccess?: () => void;
  orderNumber: string;
}



const INPUT_HEIGHT = 48;

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  orderId,
  onClose,
  onSuccess,
  orderNumber
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const userId = useAppVisitorStore((state) => state.userId);

  // Fetch cancel reasons
  const { data: cancelReasonsData, isLoading: isLoadingReasons } = useCancelReason();
  const reasonsList = cancelReasonsData?.data?.return_reason || [];

  // Submit cancel order
  const cancelOrderMutation = useCancelOrder();

  const [reasonId, setReasonId] = useState<number | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [comments, setComments] = useState("");

  // State for the nested reason picker modal
  const [reasonModalVisible, setReasonModalVisible] = useState(false);

  const handleSubmit = () => {
    console.log("Submitting cancel order:", { orderId, userId, reasonId, comments });

    if (!reasonId || !orderId || !userId) {
      console.log("Validation failed:", {
        missingReason: !reasonId,
        missingOrderId: !orderId,
        missingUserId: !userId
      });
      return;
    }

    cancelOrderMutation.mutate(
      {
        order_id: orderId.toString(),
        user_id: userId,
        cancel_reason_id: reasonId,
        cancel_reason: comments,
      },
      {
        onSuccess: (data) => {
          console.log("Cancel Order Success Response:", data);
          if (onSuccess) onSuccess();
          handleClose();
        },
        onError: (error) => {
          console.log("Cancel Order Error:", error);
        }
      }
    );
  };

  const handleClose = () => {
    setReasonId(null);
    setReasonText("");
    setComments("");
    setReasonModalVisible(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay || "rgba(0,0,0,0.45)",
          }}
        >
          {/* Outside click close */}
          <Pressable style={{ flex: 1 }} onPress={handleClose} />

          {/* Bottom Sheet */}
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* 🔥 Floating Cross */}
            <View
              style={{
                position: "absolute",
                top: -spacing(50),
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.8}
                style={{
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: spacing(18),
                  backgroundColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <X size={font(16)} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View
              style={{
                paddingVertical: spacing(12),
                paddingHorizontal: spacing(16),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(16),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                  lineHeight: font(20),
                }}
              >
                Cancel this order?
              </Text>
              {orderId && (
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.text,
                    includeFontPadding: false,
                    lineHeight: font(18),
                  }}
                >
                  Order #{orderNumber}
                </Text>
              )}
            </View>

            {/* Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ 
                paddingHorizontal: spacing(16),
                paddingTop: spacing(16),
                paddingBottom: Math.max(insets.bottom, spacing(24)) 
              }}
            >
              {/* Reason Selector (styled like addaddress StatePicker) */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginBottom: 5,
                }}
              >
                Reason for cancellation <Text style={{ color: "#e10320" }}>*</Text>
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setReasonModalVisible(true)}
                style={{
                  height: INPUT_HEIGHT,
                  borderWidth: reasonId ? 1.8 : 1.2,
                  borderColor: reasonId ? colors.primary : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  paddingHorizontal: spacing(12),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {isLoadingReasons ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text
                      style={{
                        fontFamily: reasonId ? "Poppins_500Medium" : "Poppins_400Regular",
                        fontSize: font(13),
                        color: reasonId ? colors.text : colors.textTertiary,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {reasonText || "Select a reason"}
                    </Text>
                    <ChevronDown
                      size={16}
                      color={reasonId ? colors.primary : colors.textTertiary}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Additional Comments */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginTop: spacing(10),
                  marginBottom: 5,
                }}
              >
                Additional comments (Optional)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.2,
                  borderColor: colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  color: colors.text,
                  fontSize: font(13),
                  fontFamily: "Poppins_400Regular",
                  paddingHorizontal: spacing(12),
                  paddingVertical: spacing(12),
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                placeholder="Tell us more..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                value={comments}
                onChangeText={setComments}
              />

              {/* Info Text */}
              <View
                style={{
                  backgroundColor: colors.primary + "10",
                  padding: spacing(12),
                  borderRadius: 8,
                  marginTop: spacing(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: colors.textSecondary,
                    lineHeight: 18,
                  }}
                >
                  Cancellations are usually processed within 24 hours. Refunds (if applicable) take 5–7 business days.
                </Text>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(10),
                  marginTop: spacing(20),
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: spacing(10),
                    paddingHorizontal: spacing(20),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                  onPress={handleClose}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: font(13),
                      color: colors.textSecondary,
                    }}
                  >
                    Keep Order
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    opacity: reasonId ? 1 : 0.5,
                    paddingVertical: spacing(10),
                    paddingHorizontal: spacing(20),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={reasonId && !cancelOrderMutation.isPending ? 0.8 : 1}
                  disabled={!reasonId || cancelOrderMutation.isPending}
                  onPress={handleSubmit}
                >
                  {cancelOrderMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(13),
                        color: "#FFFFFF",
                      }}
                    >
                      Confirm Cancel
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* ── Nested Modal for Reason Picker ── */}
        <Modal visible={reasonModalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              justifyContent: "flex-end",
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setReasonModalVisible(false)} />
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + spacing(16),
                maxHeight: "80%",
              }}
            >
              {/* 🔥 Floating Cross */}
              <View
                style={{
                  position: "absolute",
                  top: -spacing(50),
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setReasonModalVisible(false)}
                  activeOpacity={0.8}
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: spacing(18),
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 0.5,
                    borderColor: colors.border,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <X size={font(16)} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Header */}
              <View
                style={{
                  paddingVertical: spacing(12),
                  paddingHorizontal: spacing(16),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: font(16),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                    lineHeight: font(20),
                  }}
                >
                  Select Reason
                </Text>
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 4,
                  }}
                >
                  Please tell us why you are cancelling this order
                </Text>
              </View>

              {/* List */}
              <FlatList
                data={reasonsList}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = reasonId === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setReasonId(item.id);
                        setReasonText(item.reason);
                        setReasonModalVisible(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: spacing(16),
                        paddingVertical: spacing(16),
                        backgroundColor: isSelected
                          ? colors.primary + "08"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                          fontSize: font(13),
                          color: isSelected ? colors.primary : colors.text,
                          flex: 1,
                        }}
                      >
                        {item.reason}
                      </Text>
                      {isSelected && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      opacity: 0.4,
                      marginHorizontal: spacing(16),
                    }}
                  />
                )}
              />
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CancelOrderModal;
