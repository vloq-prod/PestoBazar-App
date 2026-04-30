import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { useState, useCallback } from "react";
import { Phone } from "lucide-react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useGoogleAuthCallback, useSendOtp, useVerifyUser } from "../../src/hooks/useAuthHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { z, ZodError } from "zod";

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_REDIRECT_SCHEME = "com.googleusercontent.apps.147081453519-o44pc2pd7vj224gdq1q5atc992lsrrvh";

type SafeParseReturn<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

const phoneSchema = z.object({
  mobile_no: z.string().regex(/^[0-9]{10}$/, "Enter valid 10 digit number"),
});

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const INPUT_HEIGHT = 52;

const carouselData = [
  {
    id: 1,
    title: "Fast Pest Control",
    description: "Get quick and reliable pest control service at your doorstep",
    image: "https://cdn-icons-png.flaticon.com/512/6195/6195700.png",
  },
  {
    id: 2,
    title: "Trusted Experts",
    description: "Verified professionals with years of experience",
    image: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
  },
  {
    id: 3,
    title: "100% Safe",
    description: "Eco-friendly chemicals safe for your family and pets",
    image: "https://cdn-icons-png.flaticon.com/512/3142/3142397.png",
  },
];

// ─── Pill Dot ─────────────────────────────────────────────────
const PillDot = ({
  index,
  progress,
  total,
}: {
  index: number;
  progress: SharedValue<number>;
  total: number;
}) => {
  const animStyle = useAnimatedStyle(() => {
    const current = Math.round(progress.value) % total;
    const isActive = current === index;
    return {
      width: withTiming(isActive ? 20 : 6, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.45, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 10,
          backgroundColor: "#fff",
        },
        animStyle,
      ]}
    />
  );
};

// ─── Gradient Divider ─────────────────────────────────────────
const GradientDivider = ({
  label,
  colors,
  font,
  spacing,
}: {
  label: string;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing(22),
    }}
  >
    <LinearGradient
      colors={[colors.border, "transparent"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 0 }}
      style={{ flex: 1, height: 1 }}
    />
    <Text
      style={{
        marginHorizontal: spacing(12),
        fontSize: font(12),
        color: colors.textTertiary,
        fontFamily: "Poppins_500Medium",
      }}
    >
      {label}
    </Text>
    <LinearGradient
      colors={[colors.border, "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, height: 1 }}
    />
  </View>
);

export default function Login() {
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const progress = useSharedValue(0);
  const { colors } = useTheme();
  const { font, spacing, hp } = useResponsive();
  const insets = useSafeAreaInsets();

  const googleRedirectUri = AuthSession.makeRedirectUri({
    native: `${GOOGLE_REDIRECT_SCHEME}:/oauth2redirect`,
  });
  const isExpoGo = Constants.executionEnvironment === "storeClient";

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    redirectUri: googleRedirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const handleGoogleLogin = useCallback(() => {
    if (isExpoGo) {
      console.error("❌ Google Auth blocked in Expo Go", {
        redirectUri: googleRedirectUri,
        platform: Platform.OS,
        executionEnvironment: Constants.executionEnvironment,
      });
      Alert.alert(
        "Google login unavailable",
        "Google Sign-In cannot run inside Expo Go. Use a development build or standalone app for Google login.",
      );
      return;
    }

    promptAsync().catch((authError) => {
      console.error("❌ Failed to start Google Auth:", {
        authError,
        redirectUri: googleRedirectUri,
        platform: Platform.OS,
      });
    });
  }, [googleRedirectUri, isExpoGo, promptAsync]);

  const { mutate: verifyUserMutate, isPending: isVerifyPending } =
    useVerifyUser();
  const { mutate: sendOtpMutate, isPending: isSendOtpPending } = useSendOtp();
  const { mutate: googleCallbackMutate, isPending: isGooglePending } = useGoogleAuthCallback();

  const visitorId = useAppVisitorStore((s) => s.visitorId);
  const setUser = useAppVisitorStore((s) => s.setUser);

  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const isLoading = isVerifyPending || isSendOtpPending;

  // Dynamic border color helper
  const borderColor = error
    ? "#EF4444"
    : focused
      ? colors.primary
      : colors.border;

  const handleSkip = () => router.replace("/(tabs)");

  const handleGetOtp = useCallback(() => {
    const result = phoneSchema.safeParse({ mobile_no: phone });
    if (!result.success) {
      setError(result.error?.issues?.[0]?.message || "Invalid input");
      return;
    }
    setError("");

    verifyUserMutate(
      { mobile_no: phone },
      {
        onSuccess: (data) => {
          if (data.data.exists === 0) {
            router.push({
              pathname: "/(auth)/userinfo",
              params: { mobile: phone, ...(redirectTo ? { redirectTo } : {}) },
            });
          } else {
            sendOtpMutate(
              { mobile_no: phone, otp_channel: "sms" },
              {
                onSuccess: () => {
                  router.push({
                    pathname: "/(auth)/verifyotp",
                    params: {
                      mobile: phone,
                      isNewUser: "0",
                      ...(redirectTo ? { redirectTo } : {}),
                    },
                  });
                },
                onError: () => setError("Failed to send OTP. Try again."),
              },
            );
          }
        },
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  }, [phone]);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === "success") {
        const { accessToken, idToken } = response.authentication || {};
        if (!accessToken) return;

        try {
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          const user = await userInfoResponse.json();

          googleCallbackMutate(
            {
              email: user.email ?? "",
              user_name: user.name ?? "",
              token: idToken ?? accessToken,
              visitor_id: visitorId ?? "",
              avatar: user.picture ?? "",
            },
            {
              onSuccess: async (data) => {
                if (data.status === 0) {
                  Alert.alert("Google Sign-In Failed", data.message || "Something went wrong.");
                  return;
                }
                await setUser(data.data.user_id, data.data.user_name);
                if (redirectTo) {
                  router.replace("/(tabs)");
                  setTimeout(() => router.push(redirectTo as any), 100);
                } else {
                  router.replace("/(tabs)");
                }
              },
              onError: () => {
                Alert.alert("Google Sign-In Failed", "Could not sign in with Google. Please try again.");
              },
            },
          );
        } catch (err) {
          console.error("❌ Failed to fetch Google user info:", err);
          Alert.alert("Google Sign-In Failed", "Could not retrieve account details.");
        }
      } else if (response?.type === "error") {
        console.error("❌ Google Auth Error:", response.error);
      }
    };

    handleGoogleResponse();
  }, [response]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* ── Bottom Form Section ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
        >
          {/* ── Top Carousel Section ── */}
          <View
            style={[
              styles.topSection,
              {
                height: hp(44),
                backgroundColor: colors.primary,
                paddingTop: insets.top + spacing(8),
              },
            ]}
          >
            {/* Skip Button */}
            <TouchableOpacity
              onPress={handleSkip}
              style={[
                styles.skipButton,
                {
                  marginRight: spacing(16),
                  paddingHorizontal: spacing(16),
                  paddingVertical: spacing(7),
                  borderRadius: spacing(20),
                  backgroundColor: "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: font(13),
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>

            {/* Carousel */}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Carousel
                width={SCREEN_WIDTH}
                height={hp(33)}
                data={carouselData}
                loop
                autoPlay
                autoPlayInterval={3000}
                onProgressChange={(_, absoluteProgress) => {
                  progress.value = absoluteProgress;
                }}
                renderItem={({ item }) => (
                  <View style={styles.slide}>
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 90, height: 90, resizeMode: "contain" }}
                    />
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: font(19),
                        fontFamily: "Poppins_700Bold",
                        marginTop: spacing(10),
                        textAlign: "center",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        fontSize: font(12),
                        fontFamily: "Poppins_400Regular",
                        marginTop: spacing(5),
                        textAlign: "center",
                        paddingHorizontal: spacing(28),
                        lineHeight: font(18),
                      }}
                    >
                      {item.description}
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* Dots — pinned inside topSection above curve */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                marginTop: spacing(15),
                paddingBottom: spacing(40),
              }}
            >
              {carouselData.map((_, i) => (
                <PillDot
                  key={i}
                  index={i}
                  progress={progress}
                  total={carouselData.length}
                />
              ))}
            </View>
          </View>

          <View
            style={[
              styles.bottomSection,
              {
                marginTop: -spacing(15),
                padding: spacing(20),
                paddingTop: spacing(24),
                paddingBottom:
                  Platform.OS === "ios"
                    ? insets.bottom + spacing(10)
                    : spacing(20),
                backgroundColor: colors.background,
                borderTopLeftRadius: spacing(28),
                borderTopRightRadius: spacing(28),
              },
            ]}
          >
            {/* Title */}
            <Text
              style={{
                textAlign: "center",
                fontSize: font(22),
                marginTop: spacing(6),
                color: colors.text,
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              Login or Signup
            </Text>

            <Text
              style={{
                textAlign: "center",
                fontSize: font(13),
                marginTop: spacing(5),
                color: colors.textTertiary,
                paddingHorizontal: spacing(10),
                fontFamily: "Poppins_400Regular",
                lineHeight: font(19),
              }}
            >
              Access trusted pest control services near you in just a few steps
            </Text>

            {/* ── Phone Input ── */}
            <View style={{ marginTop: spacing(24), gap: 6 }}>
              {/* Label */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(11),
                  marginLeft: 2,
                  color: error
                    ? "#EF4444"
                    : focused
                      ? colors.primary
                      : colors.textSecondary,
                }}
              >
                Phone Number
              </Text>

              {/* Input Row */}
              <View
                style={[
                  styles.inputBox,
                  {
                    height: INPUT_HEIGHT,
                    backgroundColor: colors.inputBackground ?? colors.surface,
                    borderColor: borderColor,
                    borderWidth: error || focused ? 1.8 : 1.2,
                  },
                ]}
              >
                {/* Phone Icon */}
                <Phone
                  size={16}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />

                {/* Divider + Prefix */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingRight: 10,
                    borderRightWidth: 1.2,
                    borderRightColor: borderColor,
                    height: 22,
                    gap: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: font(14),
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                      includeFontPadding: false,
                    }}
                  >
                    +91
                  </Text>
                </View>

                {/* Text Input */}
                <TextInput
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v.replace(/[^0-9]/g, "").slice(0, 10));
                    if (error) setError("");
                  }}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  maxLength={10}
                  style={[
                    styles.textInput,
                    {
                      color: colors.text,
                      fontSize: font(14),
                      height: INPUT_HEIGHT,
                      textAlignVertical: "center",
                    },
                  ]}
                />
              </View>

              {/* Error Text */}
              {!!error && (
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: font(11),
                    fontFamily: "Poppins_400Regular",
                    marginLeft: 2,
                    marginTop: -2,
                  }}
                >
                  {error}
                </Text>
              )}

              {/* Get OTP Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleGetOtp}
                disabled={isLoading}
                style={[
                  styles.otpBtn,
                  {
                    marginTop: spacing(14),
                    height: INPUT_HEIGHT,
                    backgroundColor: isLoading
                      ? colors.primary + "80"
                      : colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isLoading ? 0 : 0.28,
                    shadowRadius: 10,
                    elevation: isLoading ? 0 : 6,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: font(15),
                    fontFamily: "Poppins_600SemiBold",
                    color: "#fff",
                  }}
                >
                  {isVerifyPending
                    ? "Checking..."
                    : isSendOtpPending
                      ? "Sending OTP..."
                      : "Get OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gradient Divider */}
            <GradientDivider
              label="or continue with"
              colors={colors}
              font={font}
              spacing={spacing}
            />

            {/* Google Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={isGooglePending}
              style={[
                styles.googleBtn,
                {
                  marginTop: spacing(20),
                  borderColor: colors.border,
                  backgroundColor:
                    colors.background === "#fff" ? "#fff" : colors.surface,
                  opacity: isExpoGo || isGooglePending ? 0.65 : 1,
                },
              ]}
            >
              <Image
                source={require("../../assets/google.png")}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontSize: font(14),
                  fontFamily: "Poppins_500Medium",
                  color: colors.text,
                }}
              >
                {isExpoGo
                  ? "Google Login Requires Dev Build"
                  : isGooglePending
                  ? "Signing in..."
                  : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text
              style={{
                textAlign: "center",
                fontSize: font(11),
                fontFamily: "Poppins_400Regular",
                color: colors.textTertiary,
                marginTop: spacing(20),
                lineHeight: font(18),
                paddingHorizontal: spacing(8),
              }}
            >
              By continuing, you agree to our{" "}
              <Text
                onPress={() => {}}
                style={{
                  color: colors.primary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Terms
              </Text>
              {", "}
              <Text
                onPress={() => {}}
                style={{
                  color: colors.primary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Refunds
              </Text>
              {" and "}
              <Text
                onPress={() => {}}
                style={{
                  color: colors.primary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { justifyContent: "flex-start" },
  bottomSection: { flexGrow: 1 },
  skipButton: { alignSelf: "flex-end" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // ✅ icon aur +91 ke beech tight gap
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
    ...Platform.select({ android: { includeFontPadding: false }, ios: {} }),
  },
  otpBtn: {
    width: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1.2,
    borderRadius: 999,
    paddingVertical: 14,
  },
  googleLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
