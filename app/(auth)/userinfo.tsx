import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback, useRef } from "react";
import { useSendOtp } from "../../src/hooks/useAuthHooks";
import { User } from "lucide-react-native";
import AppNavbar from "../../src/components/comman/AppNavbar";

const INPUT_HEIGHT = 52;

const nameSchema = {
  validate: (firstName: string, lastName: string) => {
    const errors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim() || firstName.trim().length < 2)
      errors.firstName = "First name must be at least 2 characters";
    if (!lastName.trim() || lastName.trim().length < 2)
      errors.lastName = "Last name must be at least 2 characters";
    return errors;
  },
};

export default function UserInfo() {
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const { mutate: sendOtpMutate, isPending } = useSendOtp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [focusedField, setFocusedField] = useState<"first" | "last" | null>(null);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const lastNameRef = useRef<TextInput>(null);

  const handleFirstNameChange = useCallback((v: string) => {
    setFirstName(v);
    if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
  }, [errors.firstName]);

  const handleLastNameChange = useCallback((v: string) => {
    setLastName(v);
    if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
  }, [errors.lastName]);

  const handleSave = useCallback(() => {
    const validationErrors = nameSchema.validate(firstName, lastName);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    sendOtpMutate(
      { mobile_no: mobile, otp_channel: "sms" },
      {
        onSuccess: () => {
          router.push({
            pathname: "/(auth)/verifyotp",
            params: { mobile, isNewUser: "1", fullName },
          });
        },
        onError: () => setErrors({ firstName: "Failed to send OTP. Try again." }),
      }
    );
  }, [firstName, lastName, mobile]);

  // ── Border color helpers ──────────────────────────────────
  const firstBorderColor = errors.firstName
    ? "#EF4444"
    : focusedField === "first"
    ? colors.primary
    : colors.border;

  const lastBorderColor = errors.lastName
    ? "#EF4444"
    : focusedField === "last"
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style="auto" />

      <AppNavbar title="Profile Setup" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: spacing(20), paddingBottom: insets.bottom + spacing(24) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Icon — centered ── */}
          <View style={{ alignItems: "center", marginBottom: spacing(24), marginTop: spacing(8) }}>
            <View
              style={{
                backgroundColor: colors.primary + "15",
                width: spacing(88),
                height: spacing(88),
                borderRadius: spacing(44),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={38} color={colors.primary} strokeWidth={1.5} />
            </View>
          </View>

          {/* ── Heading ── */}
          <Text
            style={{
              fontSize: font(24),
              fontFamily: "Poppins_700Bold",
              color: colors.text,
              marginBottom: spacing(8),
            }}
          >
            Help Us Know You Better
          </Text>
          <Text
            style={{
              fontSize: font(13),
              fontFamily: "Poppins_400Regular",
              color: colors.textTertiary,
              lineHeight: font(20),
              marginBottom: spacing(32),
            }}
          >
            Hey, you seem to be new here. Please provide your name details.
          </Text>

          {/* ── First Name ── */}
          <View style={{ gap: 6, marginBottom: spacing(16) }}>
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(11),
                marginLeft: 2,
                color: errors.firstName
                  ? "#EF4444"
                  : focusedField === "first"
                  ? colors.primary
                  : colors.textSecondary,
              }}
            >
              First Name
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  height: INPUT_HEIGHT,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  borderColor: firstBorderColor,
                  borderWidth: errors.firstName || focusedField === "first" ? 1.8 : 1.2,
                },
              ]}
            >
              <User size={16} color={colors.textSecondary} strokeWidth={1.8} />
              <TextInput
                value={firstName}
                onChangeText={handleFirstNameChange}
                placeholder="Enter first name"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
                autoComplete="name"
                autoCorrect={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                onFocus={() => setFocusedField("first")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.textInput,
                  { color: colors.text, fontSize: font(14), height: INPUT_HEIGHT },
                ]}
              />
            </View>
            {!!errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          {/* ── Last Name ── */}
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(11),
                marginLeft: 2,
                color: errors.lastName
                  ? "#EF4444"
                  : focusedField === "last"
                  ? colors.primary
                  : colors.textSecondary,
              }}
            >
              Last Name
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  height: INPUT_HEIGHT,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  borderColor: lastBorderColor,
                  borderWidth: errors.lastName || focusedField === "last" ? 1.8 : 1.2,
                },
              ]}
            >
              <User size={16} color={colors.textSecondary} strokeWidth={1.8} />
              <TextInput
                ref={lastNameRef}
                value={lastName}
                onChangeText={handleLastNameChange}
                placeholder="Enter last name"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                autoComplete="name"
                autoCorrect={false}
                onSubmitEditing={handleSave}
                onFocus={() => setFocusedField("last")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.textInput,
                  { color: colors.text, fontSize: font(14), height: INPUT_HEIGHT },
                ]}
              />
            </View>
            {!!errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          {/* ── Save Button ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isPending}
            style={[
              styles.saveBtn,
              {
                marginTop: spacing(32),
                height: INPUT_HEIGHT,
                backgroundColor: isPending ? colors.primary + "99" : colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isPending ? 0 : 0.28,
                shadowRadius: 10,
                elevation: isPending ? 0 : 6,
              },
            ]}
          >
            <Text style={{ fontSize: font(15), fontFamily: "Poppins_600SemiBold", color: "#fff" }}>
              {isPending ? "Sending OTP..." : "Save & Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
    textAlignVertical: "center",
    ...Platform.select({ android: { includeFontPadding: false }, ios: {} }),
  },
  saveBtn: {
    width: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginLeft: 2,
    marginTop: -2,
  },
});