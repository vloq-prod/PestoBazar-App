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

interface CancelOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comments: string) => void;
}

const CANCELLATION_REASONS = [
  "Expected delivery date has changed and is too late",
  "Ordered the wrong item by mistake",
  "Found a better price elsewhere",
  "Item no longer needed",
  "Shipping address is incorrect",
  "Other",
];

const INPUT_HEIGHT = 48;

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  
  // State for the nested reason picker modal
  const [reasonModalVisible, setReasonModalVisible] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, comments);
    handleClose();
  };

  const handleClose = () => {
    setReason("");
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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
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
              paddingHorizontal: spacing(16),
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
                paddingVertical: spacing(16),
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
                marginBottom: spacing(16),
              }}
            >
              <Text
                style={{
                  fontSize: font(16),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Cancel this order?
              </Text>
            </View>

            {/* Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, spacing(20)) }}
            >
              {/* Reason Selector (styled like addaddress StatePicker) */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.textSecondary,
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
                  borderWidth: reason ? 1.8 : 1.2,
                  borderColor: reason ? colors.primary : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  paddingHorizontal: spacing(12),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: reason ? "Poppins_500Medium" : "Poppins_400Regular",
                    fontSize: font(13),
                    color: reason ? colors.text : colors.textTertiary,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {reason || "Select a reason"}
                </Text>
                <ChevronDown
                  size={16}
                  color={reason ? colors.primary : colors.textTertiary}
                />
              </TouchableOpacity>

              {/* Additional Comments */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.textSecondary,
                  marginLeft: 1,
                  marginTop: spacing(16),
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
                  marginTop: spacing(20),
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
                  gap: spacing(12),
                  marginTop: spacing(24),
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: spacing(14),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                  onPress={handleClose}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: colors.text,
                    }}
                  >
                    Keep Order
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: reason ? "#e10320" : colors.border + "80",
                    paddingVertical: spacing(14),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={reason ? 0.8 : 1}
                  disabled={!reason}
                  onPress={handleSubmit}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: reason ? "#FFFFFF" : colors.textTertiary,
                    }}
                  >
                    Confirm Cancel
                  </Text>
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
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom + spacing(16),
                maxHeight: "80%",
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing(16),
                  paddingTop: spacing(20),
                  paddingBottom: spacing(12),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(16),
                    color: colors.text,
                  }}
                >
                  Select Reason
                </Text>
                <TouchableOpacity
                  onPress={() => setReasonModalVisible(false)}
                  style={{
                    width: spacing(32),
                    height: spacing(32),
                    borderRadius: spacing(16),
                    backgroundColor: colors.inputBackground || colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* List */}
              <FlatList
                data={CANCELLATION_REASONS}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = reason === item;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setReason(item);
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
                        {item}
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
