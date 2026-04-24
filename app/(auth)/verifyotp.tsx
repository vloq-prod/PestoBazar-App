import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback, useRef, useEffect } from "react";
import { useVerifyOtp, useSendOtp } from "../../src/hooks/useAuthHooks";

import { ArrowLeft } from "lucide-react-native";
import { useAppVisitorStore } from "../../src/store/auth";
import AppNavbar from "../../src/components/comman/AppNavbar";
import ResendOtpModal from "../../src/modals/auth/ResendOtpModal";

const OTP_LENGTH = 4;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { mobile, isNewUser, fullName } = useLocalSearchParams<{
    mobile: string;
    isNewUser: "0" | "1";
    fullName?: string;
  }>();

  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  const { mutate: verifyOtpMutate, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtpMutate, isPending: isResending } = useSendOtp();

  const setUser = useAppVisitorStore((s) => s.setUser);
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const [showModal, setShowModal] = useState(false);

  // ── OTP State ──
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // ── Countdown Timer ──
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formattedTimer = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

  // ── OTP Input Handlers ──
  const handleOtpChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === "Backspace") {
      setOtp((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          inputRefs.current[index - 1]?.focus();
        }
        return next;
      });
    }
  }, []);

  // ── Verify ──
  const handleVerify = useCallback(async () => {
    const otpString = otp.join("");
    if (otpString.length < OTP_LENGTH) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    const payload: any = {
      mobile,
      visitor_id: visitorId,
      otp: otpString,
    };

    if (isNewUser === "1" && fullName) {
      payload.full_name = fullName;
    }

    verifyOtpMutate(payload, {
      onSuccess: async (data) => {
        console.log("✅ RESPONSE:", data);

        if (data.status === 0) {
          console.log("❌ OTP FAILED:", data.message);

          setError(data.message || "Invalid OTP");
          return;
        }
        console.log("✅ OTP SUCCESS");

        await setUser(data.data.user_id, data.data.user_name);

        router.replace("/(tabs)");
      },

      onError: () => setError("Invalid OTP. Please try again."),
    });
  }, [
    otp,
    mobile,
    visitorId,
    isNewUser,
    fullName,
    verifyOtpMutate,
    setUser,
    router,
  ]);

  // ── Resend ──
  const handleResend = useCallback(() => {
    if (!canResend) return;
    setShowModal(true);
  }, [canResend]);

  const otpFilled = otp.join("").length === OTP_LENGTH;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + spacing(24),
        },
      ]}
    >
      <StatusBar style="auto" />

      <AppNavbar showBack title="Verify Otp" />
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* ── Heading ── */}
        <Text
          style={{
            fontSize: font(28),
            fontFamily: "Poppins_700Bold",
            color: colors.text,
            marginTop: spacing(16),
          }}
        >
          Almost Done!
        </Text>

        <Text
          style={{
            fontSize: font(13),
            fontFamily: "Poppins_400Regular",
            color: colors.textSecondary,
            marginTop: spacing(8),
            lineHeight: font(20),
          }}
        >
          OTP sent via SMS to{" "}
          <Text
            style={{ fontFamily: "Poppins_600SemiBold", color: colors.text }}
          >
            +91 {mobile}
          </Text>{" "}
          to verify your mobile number
        </Text>

        {/* ── OTP Boxes ── */}
        <View
          style={[styles.otpRow, { marginTop: spacing(36), gap: spacing(14) }]}
        >
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(r) => {
                inputRefs.current[index] = r;
              }}
              value={digit}
              onChangeText={(t) => handleOtpChange(t, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              style={[
                styles.otpBox,
                {
                  width: spacing(68),
                  height: spacing(72),
                  borderRadius: spacing(14),
                  fontSize: font(24),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  borderColor: error
                    ? "#EF4444"
                    : digit
                      ? colors.primary
                      : colors.border,
                  borderWidth: digit ? 1.8 : 1.2,
                },
              ]}
            />
          ))}
        </View>

        {/* ── Error ── */}
        {!!error && (
          <Text
            style={{
              color: "#EF4444",
              fontSize: font(12),
              fontFamily: "Poppins_400Regular",
              marginTop: spacing(12),
            }}
          >
            {error}
          </Text>
        )}

        {/* ── Resend / Timer ── */}
        <View style={[styles.resendRow, { marginTop: spacing(20) }]}>
          <Text
            style={{
              fontSize: font(13),
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
            }}
          >
            Didn&apos;t receive the OTP?{" "}
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text
                style={{
                  fontSize: font(13),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.primary,
                }}
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                fontSize: font(13),
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
              }}
            >
              {formattedTimer}
            </Text>
          )}
        </View>

        {/* ── Verify Button ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleVerify}
          disabled={isVerifying || !otpFilled}
          style={[
            styles.verifyBtn,
            {
              marginTop: spacing(32),
              height: 56,
              backgroundColor:
                !otpFilled || isVerifying
                  ? colors.primary + "60"
                  : colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: otpFilled ? 0.28 : 0,
              shadowRadius: 10,
              elevation: otpFilled ? 6 : 0,
            },
          ]}
        >
          <Text
            style={{
              fontSize: font(15),
              fontFamily: "Poppins_700Bold",
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            {isVerifying ? "VERIFYING..." : "VERIFY OTP"}
          </Text>
        </TouchableOpacity>

        {/* ── Go Back ── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.goBackBtn, { marginTop: spacing(20) }]}
        >
          <ArrowLeft size={15} color={colors.primary} strokeWidth={2} />
          <Text
            style={{
              fontSize: font(14),
              fontFamily: "Poppins_600SemiBold",
              color: colors.primary,
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>

      <ResendOtpModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(type) => {
          setShowModal(false);
          resendOtpMutate(
            { mobile_no: mobile, otp_channel: type },
            {
              onSuccess: () => {
                setOtp(Array(OTP_LENGTH).fill(""));
                setError("");
                setTimer(60);
                setCanResend(false);
                inputRefs.current[0]?.focus();
              },
            },
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  otpRow: { flexDirection: "row", justifyContent: "center" },
  otpBox: {
    textAlign: "center",
    ...Platform.select({ android: { includeFontPadding: false }, ios: {} }),
  },
  resendRow: { flexDirection: "row", alignItems: "center" },
  verifyBtn: {
    width: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
