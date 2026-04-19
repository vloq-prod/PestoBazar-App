import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";
import { TriangleAlert, X } from "lucide-react-native";
import { useEstimatedDelivery } from "../hooks/productDetailsHook";
import { useDeliveryStore } from "../store/deliveryStore";

type Props = {
  visible: boolean;
  onClose: () => void;
  variationId?: number;
};

const PincodeModal: React.FC<Props> = ({ visible, onClose, variationId }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { pincode, setPincode } = useDeliveryStore();

  const [localPincode, setLocalPincode] = useState("");
  const [trigger, setTrigger] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { loading, error } = useEstimatedDelivery({
    selected_variation_id: variationId ?? 0,
    pincode: trigger ? (pincode ?? "") : "",
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // small delay for modal animation
    }
  }, [visible]);

  const isValid = localPincode.length === 6;

  const handleCheck = () => {
    if (isValid) {
      setPincode(localPincode);
      setTrigger(true);
    }
  };

  useEffect(() => {
    if (trigger && !loading) {
      // ✅ success condition
      if (!error) {
        setPincode(localPincode);
        onClose();
        setTrigger(false);
      }
    }
  }, [loading, error, trigger]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          {/* ✅ Inner TouchableWithoutFeedback hata diya — onStartShouldSetResponder se bubble rok rahe hain */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              onStartShouldSetResponder={() => true}
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: spacing(16),
                paddingBottom: spacing(40),
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing(20),
                }}
              >
                <Text
                  style={{
                    fontSize: font(15),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                  }}
                >
                  Enter Pincode
                </Text>

                <TouchableOpacity onPress={onClose}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Input Container */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 10,
                  borderBottomWidth: 3,
                  borderBottomColor: error ? "#ef4444" : colors.primary,
                  backgroundColor: error
                    ? "rgba(239,68,68,0.08)"
                    : colors.backgroundgray,
                  paddingHorizontal: spacing(10),
                  height: spacing(50),
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={localPincode}
                  onChangeText={(text) => {
                    setLocalPincode(text);
                    setTrigger(false);
                  }}
                  placeholder="Enter 6 digit pincode"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    flex: 1,
                    fontSize: font(14),
                    color: colors.text,
                    fontFamily: "Poppins_400Regular",
                    includeFontPadding: false,
                    textAlignVertical: "center",
                    paddingVertical: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                />

                {isValid && (
                  <TouchableOpacity onPress={handleCheck}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(13),
                      }}
                    >
                      {loading ? "..." : "Check"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Error */}
              {error && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: spacing(8),
                  }}
                >
                  <Text
                    style={{
                      fontSize: font(12),
                      color: "#ef4444",
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    Does not ship to this pincode
                  </Text>
                  <TriangleAlert size={16} color="#ef4444" />
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PincodeModal;
