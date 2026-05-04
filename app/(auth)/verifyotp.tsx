/**
 * verifyotp.tsx
 *
 * ── How OTP Autofill Works ──────────────────────────────────────────────
 *
 * Android:  A hidden <TextInput> with autoComplete="sms-otp" receives the
 *           SMS Retriever / One-Tap suggestion. Android fills the whole
 *           4-digit string into that input → onChangeText fires with "1234"
 *           → we split it across the 4 visible boxes → auto-verify triggers.
 *
 * iOS:      textContentType="oneTimeCode" on ANY input in the form causes
 *           iOS QuickType to show a suggestion banner above the keyboard.
 *           Tapping it fills the focused input with the full code.
 *           We put this prop on the FIRST visible box too so the suggestion
 *           appears immediately when the keyboard opens.
 *
 * Manual:   Each visible box handles single-digit entry, auto-advancing
 *           focus and supporting Backspace navigation.
 * ────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useVerifyOtp, useSendOtp } from "../../src/hooks/useAuthHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import AppNavbar from "../../src/components/comman/AppNavbar";
import ResendOtpModal from "../../src/modals/auth/ResendOtpModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

// ─── Screen ───────────────────────────────────────────────────────────────────

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

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { mutate: verifyOtpMutate, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtpMutate, isPending: isResending } = useSendOtp();
  const setUser = useAppVisitorStore((s) => s.setUser);
  const visitorId = useAppVisitorStore((s) => s.visitorId);

  // ── State ──────────────────────────────────────────────────────────────────
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  // Guard: prevent duplicate verify calls when auto-verify fires simultaneously
  const isVerifyingRef = useRef(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  /** Visible OTP box refs for focus management */
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  /** Hidden input for Android SMS autofill / iOS oneTimeCode */
  const hiddenInputRef = useRef<TextInput>(null);

  // ── Animations — one scale value per box ──────────────────────────────────
  const scaleAnims = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1)),
  ).current;

  const animateBox = useCallback(
    (index: number, toValue: number) => {
      Animated.spring(scaleAnims[index], {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    },
    [scaleAnims],
  );

  // ── Countdown Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formattedTimer = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
    timer % 60,
  ).padStart(2, "0")}`;

  // ── Shared: fill OTP array + optionally move focus ─────────────────────────
  const applyOtpDigits = useCallback((digits: string[]) => {
    const next = [...Array(OTP_LENGTH).fill("")];
    digits.forEach((d, i) => {
      if (i < OTP_LENGTH) next[i] = d;
    });
    setOtp(next);
    setError("");

    // Move focus to the last filled box (or last box)
    const lastFilled = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }, []);

  // ── Verify ─────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(
    (otpOverride?: string[]) => {
      // Duplicate-call guard
      if (isVerifyingRef.current) return;

      const code = (otpOverride ?? otp).join("");
      if (code.length < OTP_LENGTH) {
        setError("Please enter the complete 4-digit OTP");
        return;
      }

      isVerifyingRef.current = true;

      const payload: any = {
        mobile,
        visitor_id: visitorId,
        otp: code,
      };
      if (isNewUser === "1" && fullName) {
        payload.full_name = fullName;
      }

      verifyOtpMutate(payload, {
        onSuccess: async (data) => {
          if (data.status === 0) {
            setError(data.message || "Invalid OTP. Please try again.");
            isVerifyingRef.current = false;
            return;
          }
          await setUser(data.data.user_id, data.data.user_name);
          isVerifyingRef.current = false;

          if (redirectTo) {
            router.replace(redirectTo as any);
          } else {
            router.replace("/");
          }
        },
        onError: () => {
          setError("Invalid OTP. Please try again.");
          isVerifyingRef.current = false;
        },
      });
    },
    [
      otp,
      mobile,
      visitorId,
      isNewUser,
      fullName,
      verifyOtpMutate,
      setUser,
      router,
      redirectTo,
    ],
  );

  // ── Auto-verify when all 4 digits are entered ──────────────────────────────
  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH) {
      handleVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ── Hidden input handler (Android SMS Retriever / iOS oneTimeCode) ─────────
  const handleHiddenInput = useCallback(
    (text: string) => {
      const digits = text
        .replace(/[^0-9]/g, "")
        .slice(0, OTP_LENGTH)
        .split("");
      if (digits.length > 0) {
        applyOtpDigits(digits);
      }
    },
    [applyOtpDigits],
  );

  // ── Visible box change handler ─────────────────────────────────────────────
  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const numeric = text.replace(/[^0-9]/g, "");

      // Paste / autofill that arrives on index 0 with full code
      if (numeric.length > 1) {
        applyOtpDigits(numeric.split(""));
        return;
      }

      const digit = numeric.slice(-1);
      setOtp((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });
      setError("");

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [applyOtpDigits],
  );

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

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = useCallback(() => {
    if (!canResend) return;
    setShowModal(true);
  }, [canResend]);

  const otpFilled = otp.join("").length === OTP_LENGTH;

  // ─── Render ────────────────────────────────────────────────────────────────
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
      <AppNavbar showBack title="Verify OTP" />

      <View style={{ flex: 1, paddingHorizontal: spacing(20) }}>
        {/* ── Header ── */}
        <View style={{ marginTop: spacing(28), marginBottom: spacing(8) }}>
          {/* Icon circle */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary + "18",
              borderWidth: 1.5,
              borderColor: colors.primary + "30",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing(18),
            }}
          >
            <Text style={{ fontSize: 26 }}>🔐</Text>
          </View>

          <Text
            style={{
              fontSize: font(26),
              fontFamily: "Poppins_700Bold",
              color: colors.text,
              lineHeight: font(34),
            }}
          >
            Enter OTP
          </Text>

          <Text
            style={{
              fontSize: font(13),
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              marginTop: spacing(6),
              lineHeight: font(20),
            }}
          >
            We sent a 4-digit code to{" "}
            <Text style={{ fontFamily: "Poppins_700Bold", color: colors.text }}>
              +91 {mobile}
            </Text>
          </Text>

          {/* Change number */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: spacing(4) }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: font(12),
                fontFamily: "Poppins_500Medium",
                color: colors.primary,
              }}
            >
              ✏️ Change Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hidden autofill input (invisible, always rendered) ── */}
        {/*
          Android: autoComplete="sms-otp" hooks into SMS Retriever.
          iOS:     textContentType="oneTimeCode" causes the suggestion banner.
          The input is 1×1 px and positioned off-screen so it never blocks UI.
        */}
        <TextInput
          ref={hiddenInputRef}
          style={styles.hiddenInput}
          value=""
          onChangeText={handleHiddenInput}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          importantForAccessibility="no"
          accessibilityElementsHidden
          caretHidden
        />

        {/* ── OTP Boxes ── */}
        <View
          style={[styles.otpRow, { marginTop: spacing(36), gap: spacing(14) }]}
        >
          {otp.map((digit, index) => {
            const isFocused = focusedIndex === index;
            const hasError = !!error;
            const isFilled = !!digit;

            const borderColor = hasError
              ? "#EF4444"
              : isFocused
                ? colors.primary
                : isFilled
                  ? colors.primary + "80"
                  : colors.border;

            const bgColor = hasError
              ? "#EF444410"
              : isFocused
                ? colors.primary + "10"
                : (colors.inputBackground ?? colors.surface);

            return (
              <Animated.View
                key={index}
                style={{ transform: [{ scale: scaleAnims[index] }] }}
              >
                <TextInput
                  ref={(r) => {
                    inputRefs.current[index] = r;
                  }}
                  value={digit}
                  onChangeText={(t) => handleOtpChange(t, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  onFocus={() => {
                    setFocusedIndex(index);
                    animateBox(index, 1.08);
                    // On focus, also open the hidden input so Android can intercept SMS
                    if (index === 0) hiddenInputRef.current?.focus();
                  }}
                  onBlur={() => animateBox(index, 1)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  autoFocus={index === 0}
                  // iOS OTP suggestion — put on FIRST box so it shows immediately
                  textContentType={index === 0 ? "oneTimeCode" : "none"}
                  style={[
                    styles.otpBox,
                    {
                      width: spacing(68),
                      height: spacing(72),
                      borderRadius: spacing(14),
                      fontSize: font(24),
                      fontFamily: "Poppins_700Bold",
                      color: colors.text,
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      borderWidth: isFocused || isFilled ? 2 : 1.2,
                    },
                  ]}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* ── Error ── */}
        <View style={{ height: spacing(28), justifyContent: "center" }}>
          {!!error && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: font(12),
                fontFamily: "Poppins_400Regular",
                marginTop: spacing(8),
                textAlign: "center",
              }}
            >
              ⚠️ {error}
            </Text>
          )}
        </View>

        {/* ── Resend / Timer ── */}
        <View style={[styles.resendRow, { marginTop: spacing(4) }]}>
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
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: font(13),
                  fontFamily: "Poppins_700Bold",
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
              marginTop: spacing(28),
              height: 56,
              backgroundColor:
                !otpFilled || isVerifying
                  ? colors.primary + "60"
                  : colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: otpFilled ? 0.3 : 0,
              shadowRadius: 12,
              elevation: otpFilled ? 6 : 0,
            },
          ]}
        >
          {isVerifying ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_700Bold",
                  color: "#fff",
                  letterSpacing: 0.8,
                }}
              >
                VERIFYING...
              </Text>
            </View>
          ) : (
            <Text
              style={{
                fontSize: font(15),
                fontFamily: "Poppins_700Bold",
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              VERIFY OTP
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Resend Modal ── */}
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
                setTimer(RESEND_SECONDS);
                setCanResend(false);
                isVerifyingRef.current = false;
                inputRefs.current[0]?.focus();
              },
            },
          );
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  /** Invisible 1×1 input positioned off-screen for SMS autofill interception */
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    top: -100,
    left: -100,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  otpBox: {
    textAlign: "center",
    ...Platform.select({
      android: { includeFontPadding: false },
      ios: {},
    }),
  },

  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  verifyBtn: {
    width: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
