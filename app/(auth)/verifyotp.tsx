import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,

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
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { useOtpListener, useGetHash } from "@avasapp/react-native-otp-autofill";

const OTP_LENGTH = 4;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { mobile, isNewUser, fullName, redirectTo } = useLocalSearchParams<{
    mobile: string;
    isNewUser: "0" | "1";
    fullName?: string;
    redirectTo?: string;
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
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const otpInputRef = useRef<OtpInputRef>(null);
  const isVerifyingRef = useRef(false);

  // ── Android SMS Auto-Detection ──
  const { receivedOtp, startListener } = useOtpListener();
  const { hash } = useGetHash();

  // Timeout and error are handled internally by the library or via receivedOtp logic

  // Cleanup useEffect for hash logging (already present)

  useEffect(() => {
    if (hash) {
      console.log("🔑 Your App Hash for SMS:", hash);
    }
  }, [hash]);

  useEffect(() => {
    // Start listening for SMS on Android
    if (Platform.OS === "android") {
      console.log("📡 Starting OTP Listener...");
      startListener();
    }
  }, []);

  useEffect(() => {
    if (receivedOtp) {
      console.log("📨 SMS Received! Raw OTP:", receivedOtp);
      if (receivedOtp.length === OTP_LENGTH) {
        setOtpCode(receivedOtp);
        otpInputRef.current?.setValue(receivedOtp);
        console.log("⚡ Auto-filling OTP and verifying...");
        setTimeout(() => handleVerify(receivedOtp), 100);
      } else {
        console.warn(`⚠️ Received OTP length (${receivedOtp.length}) doesn't match expected length (${OTP_LENGTH})`);
      }
    }
  }, [receivedOtp]);

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

  // Removed manual handlers as OtpInput handles them natively

  // ── Verify ──
  const handleVerify = useCallback(async (codeToVerify?: string) => {
    if (isVerifyingRef.current) return;

    const otpString = codeToVerify || otpCode;
    if (otpString.length < OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit OTP`);
      return;
    }

    isVerifyingRef.current = true;

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
          isVerifyingRef.current = false;
          return;
        }
        console.log("✅ OTP SUCCESS");
        isVerifyingRef.current = false;

        await setUser(data.data.user_id, data.data.user_name);

        if (redirectTo) {
          // Clear auth stack and go to the intended destination
          router.replace("/(tabs)");
          setTimeout(() => {
            router.push(redirectTo as any);
          }, 100);
        } else {
          router.replace("/(tabs)");
        }
      },

      onError: () => {
        setError("Invalid OTP. Please try again.");
        isVerifyingRef.current = false;
      },
    });
  }, [otpCode, mobile, visitorId, isNewUser, fullName, verifyOtpMutate, setUser, router]);

  // ── Resend ──
  const handleResend = useCallback(() => {
    if (!canResend) return;
    setShowModal(true);
  }, [canResend]);

  const otpFilled = otpCode.length === OTP_LENGTH;

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

        {/* ── OTP Input ── */}
        <View style={{ marginTop: spacing(36) }}>
          <OtpInput
            ref={otpInputRef}
            numberOfDigits={OTP_LENGTH}
            focusColor={error ? "#EF4444" : colors.primary}
            onTextChange={(code) => {
              setOtpCode(code);
              if (error) setError("");
            }}
            onFilled={handleVerify}
            textInputProps={{
              textContentType: "oneTimeCode",
              autoComplete: "sms-otp",
            }}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: {
                ...styles.otpBox,
                width: spacing(68),
                height: spacing(72),
                borderRadius: spacing(14),
                backgroundColor: colors.inputBackground ?? colors.surface,
                borderColor: colors.border,
              },
              pinCodeTextStyle: {
                fontSize: font(24),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
              },
              focusedPinCodeContainerStyle: {
                borderColor: colors.primary,
                borderWidth: 1.8,
              },
            }}
          />
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
          onPress={() => handleVerify()}
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
                setOtpCode("");
                otpInputRef.current?.clear();
                setError("");
                setTimer(60);
                setCanResend(false);
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
  otpContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  otpBox: {
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
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
