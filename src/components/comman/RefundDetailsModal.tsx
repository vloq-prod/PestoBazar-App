import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { X, UploadCloud, CreditCard, Landmark } from "lucide-react-native";
import { Image } from "expo-image";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Safe Dynamic Import to prevent crash when bundler is not restarted
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  console.warn("expo-image-picker module not found or loaded in RefundDetailsModal");
}

interface RefundDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (refundData: any) => void;
}

const INPUT_HEIGHT = 44;

const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"Bank" | "UPI">("Bank");

  // Bank Form State
  const [holderName, setHolderName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [confirmAccountNo, setConfirmAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeImage, setChequeImage] = useState<string | null>(null);

  // UPI Form State
  const [upiId, setUpiId] = useState("");
  const [upiImage, setUpiImage] = useState<string | null>(null);

  const handlePickCheque = async () => {
    if (!ImagePicker) {
      Alert.alert("Module Offline", "expo-image-picker not loaded");
      return;
    }
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to upload passbook/cheque");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setChequeImage(result.assets[0].uri);
    }
  };

  const handlePickUpiQr = async () => {
    if (!ImagePicker) {
      Alert.alert("Module Offline", "expo-image-picker not loaded");
      return;
    }
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to upload QR code/screenshot");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUpiImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "Bank") {
      if (!holderName || !accountNo || !confirmAccountNo || !ifsc || !bankName || !chequeImage) {
        Alert.alert("Error", "Please fill all mandatory fields and upload passbook/cancelled cheque image.");
        return;
      }
      if (accountNo !== confirmAccountNo) {
        Alert.alert("Error", "Account Number and Confirm Account Number do not match.");
        return;
      }
      onSubmit({
        method: "Bank",
        holderName,
        accountNo,
        ifsc,
        bankName,
        chequeImage,
      });
    } else {
      if (!upiId || !upiImage) {
        Alert.alert("Error", "Please enter UPI ID and upload screenshot/QR code image.");
        return;
      }
      onSubmit({
        method: "UPI",
        upiId,
        upiImage,
      });
    }
  };

  const handleClose = () => {
    // Reset Form states
    setHolderName("");
    setAccountNo("");
    setConfirmAccountNo("");
    setIfsc("");
    setBankName("");
    setChequeImage(null);
    setUpiId("");
    setUpiImage(null);
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
              maxHeight: "85%",
            }}
          >
            {/* Floating Cross */}
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
                Refund Account Details
              </Text>
              <Text
                style={{
                  fontSize: font(11.5),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textSecondary,
                  includeFontPadding: false,
                  marginTop: 2,
                }}
              >
                Specify where you want to receive your refund
              </Text>
            </View>

            {/* Tab Bar */}
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.backgroundgray,
              }}
            >
              <TouchableOpacity
                onPress={() => setActiveTab("Bank")}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 14,
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === "Bank" ? colors.primary : "transparent",
                }}
              >
                <Landmark size={16} color={activeTab === "Bank" ? colors.primary : colors.textSecondary} />
                <Text
                  style={{
                    fontFamily: activeTab === "Bank" ? "Poppins_600SemiBold" : "Poppins_500Medium",
                    fontSize: font(13),
                    color: activeTab === "Bank" ? colors.primary : colors.textSecondary,
                  }}
                >
                  Bank Transfer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("UPI")}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 14,
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === "UPI" ? colors.primary : "transparent",
                }}
              >
                <CreditCard size={16} color={activeTab === "UPI" ? colors.primary : colors.textSecondary} />
                <Text
                  style={{
                    fontFamily: activeTab === "UPI" ? "Poppins_600SemiBold" : "Poppins_500Medium",
                    fontSize: font(13),
                    color: activeTab === "UPI" ? colors.primary : colors.textSecondary,
                  }}
                >
                  UPI ID
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: spacing(16),
                paddingTop: spacing(16),
                paddingBottom: Math.max(insets.bottom, spacing(24)),
              }}
            >
              {activeTab === "Bank" ? (
                <View style={{ gap: 12 }}>
                  {/* Account Holder Name */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      Account Holder Name <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="Name on bank account"
                      placeholderTextColor={colors.textTertiary}
                      value={holderName}
                      onChangeText={setHolderName}
                    />
                  </View>

                  {/* Bank Name */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      Bank Name <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="E.g., HDFC Bank, SBI"
                      placeholderTextColor={colors.textTertiary}
                      value={bankName}
                      onChangeText={setBankName}
                    />
                  </View>

                  {/* Account Number */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      Account Number <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="Enter Bank Account Number"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      secureTextEntry
                      value={accountNo}
                      onChangeText={setAccountNo}
                    />
                  </View>

                  {/* Confirm Account Number */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      Confirm Account Number <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="Re-enter Account Number"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      value={confirmAccountNo}
                      onChangeText={setConfirmAccountNo}
                    />
                  </View>

                  {/* IFSC */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      IFSC Code <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="E.g., HDFC0001234"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="characters"
                      value={ifsc}
                      onChangeText={setIfsc}
                    />
                  </View>

                  {/* Passbook/Cheque upload */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      Passbook / Cancelled Cheque <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    
                    {chequeImage ? (
                      <View
                        style={{
                          height: 120,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <Image source={{ uri: chequeImage }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        <TouchableOpacity
                          onPress={() => setChequeImage(null)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={handlePickCheque}
                        activeOpacity={0.8}
                        style={{
                          height: 80,
                          borderRadius: 12,
                          borderWidth: 1.2,
                          borderColor: colors.border,
                          borderStyle: "dashed",
                          backgroundColor: colors.backgroundgray,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <UploadCloud size={20} color={colors.textSecondary} />
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: colors.textSecondary }}>
                          Click to upload cheque image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Notice */}
                  <View style={{ backgroundColor: "#10B98115", padding: 12, borderRadius: 10, marginTop: 4 }}>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: "#059669", textAlign: "center" }}>
                      Refund in 5–7 business days after pickup.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {/* UPI ID */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      UPI ID <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    <TextInput
                      style={{
                        height: INPUT_HEIGHT,
                        borderWidth: 1.2,
                        borderColor: colors.border,
                        borderRadius: 12,
                        backgroundColor: colors.inputBackground ?? colors.surface,
                        color: colors.text,
                        fontSize: font(13),
                        fontFamily: "Poppins_400Regular",
                        paddingHorizontal: 12,
                      }}
                      placeholder="E.g., name@okaxis"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="none"
                      value={upiId}
                      onChangeText={setUpiId}
                    />
                  </View>

                  {/* UPI QR / Screenshot Upload */}
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: colors.text, marginBottom: 5 }}>
                      UPI Screenshot / QR Code <Text style={{ color: "#e10320" }}>*</Text>
                    </Text>
                    
                    {upiImage ? (
                      <View
                        style={{
                          height: 150,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <Image source={{ uri: upiImage }} style={{ width: "100%", height: "100%" }} contentFit="contain" />
                        <TouchableOpacity
                          onPress={() => setUpiImage(null)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={handlePickUpiQr}
                        activeOpacity={0.8}
                        style={{
                          height: 100,
                          borderRadius: 12,
                          borderWidth: 1.2,
                          borderColor: colors.border,
                          borderStyle: "dashed",
                          backgroundColor: colors.backgroundgray,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <UploadCloud size={20} color={colors.textSecondary} />
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: colors.textSecondary }}>
                          Click to upload QR code screenshot
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Notice */}
                  <View style={{ backgroundColor: "#10B98115", padding: 12, borderRadius: 10, marginTop: 4 }}>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: "#059669", textAlign: "center" }}>
                      Refund in 5–7 business days after pickup.
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(10),
                  marginTop: spacing(24),
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
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: spacing(10),
                    paddingHorizontal: spacing(20),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: font(13),
                      color: "#FFFFFF",
                    }}
                  >
                    Confirm Refund details
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RefundDetailsModal;
