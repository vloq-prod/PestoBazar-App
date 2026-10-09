import React, { useState, useRef, useEffect } from "react";
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
  Keyboard,
} from "react-native";
import { X, UploadCloud, Landmark } from "lucide-react-native";
import { Image } from "expo-image";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../context/ToastContext";

// Safe Dynamic Import to prevent crash when bundler is not restarted
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {}

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
  const { showToast } = useToast();

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToField = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  // Bank Form State
  const [holderName, setHolderName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [confirmAccountNo, setConfirmAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeImage, setChequeImage] = useState<string | null>(null);

  // Field validation errors state
  const [errors, setErrors] = useState<{
    holderName?: string;
    bankName?: string;
    accountNo?: string;
    confirmAccountNo?: string;
    ifsc?: string;
    chequeImage?: string;
  }>({});

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
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setChequeImage(result.assets[0].uri);
      if (errors.chequeImage) {
        setErrors((prev) => ({ ...prev, chequeImage: undefined }));
      }
    }
  };

  const validate = () => {
    const newErrors: {
      holderName?: string;
      bankName?: string;
      accountNo?: string;
      confirmAccountNo?: string;
      ifsc?: string;
      chequeImage?: string;
    } = {};

    if (!holderName.trim()) {
      newErrors.holderName = "Account holder name is required";
    }

    if (!bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    const cleanAccount = accountNo.trim();
    if (!cleanAccount) {
      newErrors.accountNo = "Account number is required";
    } else if (cleanAccount.length < 9) {
      newErrors.accountNo = "Account number must be at least 9 digits";
    }

    const cleanConfirm = confirmAccountNo.trim();
    if (!cleanConfirm) {
      newErrors.confirmAccountNo = "Please confirm your account number";
    } else if (cleanConfirm !== cleanAccount) {
      newErrors.confirmAccountNo = "Account numbers do not match";
    }

    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!cleanIfsc) {
      newErrors.ifsc = "IFSC code is required";
    } else if (cleanIfsc.length !== 11) {
      newErrors.ifsc = "Enter a valid 11-digit IFSC code";
    }

    if (!chequeImage) {
      newErrors.chequeImage = "Please upload passbook or cancelled cheque";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      if (accountNo.trim() && confirmAccountNo.trim() && accountNo.trim() !== confirmAccountNo.trim()) {
        showToast("Account Number and Confirm Account Number do not match", "error");
      } else {
        showToast("Please fill all mandatory fields correctly", "error");
      }
      return;
    }

    onSubmit({
      method: "Bank",
      holderName: holderName.trim(),
      accountNo: accountNo.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      bankName: bankName.trim(),
      chequeImage,
    });
  };

  const handleClose = () => {
    // Reset Form states & errors
    setHolderName("");
    setAccountNo("");
    setConfirmAccountNo("");
    setIfsc("");
    setBankName("");
    setChequeImage(null);
    setErrors({});
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              maxHeight: "88%",
              paddingBottom: Math.max(insets.bottom, 10),
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
                paddingVertical: spacing(14),
                paddingHorizontal: spacing(16),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(8) }}>
                <Landmark size={font(18)} color={colors.primary} />
                <Text
                  style={{
                    fontSize: font(16),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                    lineHeight: font(20),
                  }}
                >
                  Bank Account Details
                </Text>
              </View>
              <Text
                style={{
                  fontSize: font(11.5),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textSecondary,
                  includeFontPadding: false,
                  marginTop: 3,
                }}
              >
                Enter bank details where you want to receive your refund
              </Text>
            </View>

            {/* Form Content */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingHorizontal: spacing(16),
                paddingTop: spacing(16),
                paddingBottom: Math.max(insets.bottom, 16) + (keyboardHeight > 0 ? Math.max(keyboardHeight + 20, 260) : spacing(16)),
              }}
            >
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
                      borderColor: errors.holderName ? "#e10320" : colors.border,
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
                    onFocus={() => scrollToField(0)}
                    onChangeText={(t) => {
                      setHolderName(t);
                      if (errors.holderName) setErrors((prev) => ({ ...prev, holderName: undefined }));
                    }}
                  />
                  {errors.holderName && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.holderName}
                    </Text>
                  )}
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
                      borderColor: errors.bankName ? "#e10320" : colors.border,
                      borderRadius: 12,
                      backgroundColor: colors.inputBackground ?? colors.surface,
                      color: colors.text,
                      fontSize: font(13),
                      fontFamily: "Poppins_400Regular",
                      paddingHorizontal: 12,
                    }}
                    placeholder="E.g., HDFC Bank, SBI, ICICI"
                    placeholderTextColor={colors.textTertiary}
                    value={bankName}
                    onFocus={() => scrollToField(70)}
                    onChangeText={(t) => {
                      setBankName(t);
                      if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: undefined }));
                    }}
                  />
                  {errors.bankName && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.bankName}
                    </Text>
                  )}
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
                      borderColor: errors.accountNo ? "#e10320" : colors.border,
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
                    onFocus={() => scrollToField(150)}
                    onChangeText={(t) => {
                      setAccountNo(t);
                      if (errors.accountNo) setErrors((prev) => ({ ...prev, accountNo: undefined }));
                      if (confirmAccountNo) {
                        if (confirmAccountNo !== t) {
                          setErrors((prev) => ({ ...prev, confirmAccountNo: "Account numbers do not match" }));
                        } else {
                          setErrors((prev) => ({ ...prev, confirmAccountNo: undefined }));
                        }
                      }
                    }}
                  />
                  {errors.accountNo && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.accountNo}
                    </Text>
                  )}
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
                      borderColor: errors.confirmAccountNo ? "#e10320" : confirmAccountNo && confirmAccountNo === accountNo ? "#10B981" : colors.border,
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
                    onFocus={() => scrollToField(230)}
                    onChangeText={(t) => {
                      setConfirmAccountNo(t);
                      if (accountNo && t && t !== accountNo) {
                        setErrors((prev) => ({ ...prev, confirmAccountNo: "Account numbers do not match" }));
                      } else {
                        setErrors((prev) => ({ ...prev, confirmAccountNo: undefined }));
                      }
                    }}
                  />
                  {errors.confirmAccountNo ? (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.confirmAccountNo}
                    </Text>
                  ) : confirmAccountNo && confirmAccountNo === accountNo ? (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#10B981", marginTop: 4, marginLeft: 2 }}>
                      ✓ Account numbers match
                    </Text>
                  ) : null}
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
                      borderColor: errors.ifsc ? "#e10320" : colors.border,
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
                    onFocus={() => scrollToField(310)}
                    onChangeText={(t) => {
                      setIfsc(t.toUpperCase());
                      if (errors.ifsc) setErrors((prev) => ({ ...prev, ifsc: undefined }));
                    }}
                  />
                  {errors.ifsc && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.ifsc}
                    </Text>
                  )}
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
                        borderColor: errors.chequeImage ? "#e10320" : colors.border,
                        borderStyle: "dashed",
                        backgroundColor: colors.backgroundgray,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <UploadCloud size={20} color={errors.chequeImage ? "#e10320" : colors.textSecondary} />
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: errors.chequeImage ? "#e10320" : colors.textSecondary }}>
                        Click to upload passbook / cheque image
                      </Text>
                    </TouchableOpacity>
                  )}
                  {errors.chequeImage && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#e10320", marginTop: 4, marginLeft: 2 }}>
                      {errors.chequeImage}
                    </Text>
                  )}
                </View>

                {/* Notice */}
                <View style={{ backgroundColor: "#10B98115", padding: 12, borderRadius: 10, marginTop: 4 }}>
                  <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(11.5), color: "#059669", textAlign: "center" }}>
                    Refund in 5–7 business days after pickup.
                  </Text>
                </View>
              </View>

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
