import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../context/ToastContext";
import { useAppVisitorStore } from "../../store/auth";
import { useRequestCallBack } from "../../hooks/requestCallBackHooks";

export interface RequestCallBackModalProps {
  visible: boolean;
  onClose: () => void;
  productName?: string;
  sourceUrl?: string;
  onSuccess?: () => void;
}

const INPUT_HEIGHT = 48;

export const RequestCallBackModal: React.FC<RequestCallBackModalProps> = ({
  visible,
  onClose,
  productName,
  sourceUrl,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { userName, userEmail } = useAppVisitorStore();

  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    contact_no?: string;
    email?: string;
    message?: string;
  }>({});

  const { mutate: submitCallBack, isPending } = useRequestCallBack();

  useEffect(() => {
    if (visible) {
      setName(userName || "");
      setEmail(userEmail || "");
      setContactNo("");
      setMessage("");
      setErrors({});
    }
  }, [visible, userName, userEmail]);

  const validate = () => {
    const newErrors: {
      name?: string;
      contact_no?: string;
      email?: string;
      message?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const cleanPhone = contactNo.trim();
    if (!cleanPhone) {
      newErrors.contact_no = "Contact number is required";
    } else if (!/^[0-9+()\-\s]{7,20}$/.test(cleanPhone) || cleanPhone.replace(/\D/g, "").length < 10) {
      newErrors.contact_no = "Enter a valid 10-digit phone number";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!validate()) return;

    submitCallBack(
      {
        name: name.trim(),
        contact_no: contactNo.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
        source_url: sourceUrl || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.status === 1) {
            showToast(res.message || "Query submitted. We will get in touch with you.", "success");
            onSuccess?.();
            onClose();
          } else {
            showToast(res.message || "Failed to submit request", "error");
          }
        },
        onError: (err: any) => {
          showToast(err?.message || "Failed to submit request. Please try again.", "error");
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={!isPending ? onClose : undefined}
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
          <Pressable style={{ flex: 1 }} onPress={!isPending ? onClose : undefined} />

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
                onPress={onClose}
                disabled={isPending}
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
                Request a Call Back
              </Text>
              {productName ? (
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  Regarding: {productName}
                </Text>
              ) : (
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 2,
                  }}
                >
                  Our pest control experts will call you to help choose the best product
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
                paddingBottom: Math.max(insets.bottom, spacing(24)),
              }}
            >
              {/* Full Name */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginBottom: 5,
                }}
              >
                Full Name <Text style={{ color: "#e10320" }}>*</Text>
              </Text>
              <TextInput
                style={{
                  height: INPUT_HEIGHT,
                  borderWidth: 1.2,
                  borderColor: errors.name ? "#e10320" : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  color: colors.text,
                  fontSize: font(13),
                  fontFamily: "Poppins_400Regular",
                  paddingHorizontal: spacing(12),
                }}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#e10320",
                    marginTop: 4,
                    marginLeft: 2,
                  }}
                >
                  {errors.name}
                </Text>
              )}

              {/* Contact Number */}
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
                Phone Number <Text style={{ color: "#e10320" }}>*</Text>
              </Text>
              <TextInput
                style={{
                  height: INPUT_HEIGHT,
                  borderWidth: 1.2,
                  borderColor: errors.contact_no ? "#e10320" : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  color: colors.text,
                  fontSize: font(13),
                  fontFamily: "Poppins_400Regular",
                  paddingHorizontal: spacing(12),
                }}
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={15}
                value={contactNo}
                onChangeText={(t) => {
                  setContactNo(t);
                  if (errors.contact_no) setErrors((prev) => ({ ...prev, contact_no: undefined }));
                }}
              />
              {errors.contact_no && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#e10320",
                    marginTop: 4,
                    marginLeft: 2,
                  }}
                >
                  {errors.contact_no}
                </Text>
              )}

              {/* Email Address */}
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
                Email Address{" "}
                <Text style={{ color: colors.textTertiary, fontFamily: "Poppins_400Regular" }}>
                  (Optional)
                </Text>
              </Text>
              <TextInput
                style={{
                  height: INPUT_HEIGHT,
                  borderWidth: 1.2,
                  borderColor: errors.email ? "#e10320" : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  color: colors.text,
                  fontSize: font(13),
                  fontFamily: "Poppins_400Regular",
                  paddingHorizontal: spacing(12),
                }}
                placeholder="e.g. rahul@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {errors.email && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#e10320",
                    marginTop: 4,
                    marginLeft: 2,
                  }}
                >
                  {errors.email}
                </Text>
              )}

              {/* Message / Query */}
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
                Your Message / Query <Text style={{ color: "#e10320" }}>*</Text>
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.2,
                  borderColor: errors.message ? "#e10320" : colors.border,
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
                placeholder="Describe what you need help with..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={(t) => {
                  setMessage(t);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                }}
              />
              {errors.message && (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#e10320",
                    marginTop: 4,
                    marginLeft: 2,
                  }}
                >
                  {errors.message}
                </Text>
              )}

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
                  Our pest control experts usually call back within 15–30 minutes during business hours.
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
                  onPress={onClose}
                  disabled={isPending}
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
                  activeOpacity={!isPending ? 0.8 : 1}
                  disabled={isPending}
                  onPress={handleSubmit}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(13),
                        color: "#FFFFFF",
                      }}
                    >
                      Submit Request
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RequestCallBackModal;
