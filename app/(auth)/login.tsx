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
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { useState, useCallback, useRef, useEffect } from "react";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import {
  useGoogleAuthCallback,
  useSendOtp,
  useVerifyUser,
} from "../../src/hooks/useAuthHooks";
import { useAppVisitorStore } from "../../src/store/auth";
import { z } from "zod";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import RNOtpVerify from "react-native-otp-verify";
import { trackLogin, setAnalyticsUserId } from "../../src/lib/analytics";
import { ChevronDown } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

const androidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  "147081453519-lap730k31jgsjlk2d0ovb6ok4p9rn8tr.apps.googleusercontent.com";

const androidSchemePrefix = androidClientId.replace(
  /\.apps\.googleusercontent\.com$/,
  "",
);

const GOOGLE_REDIRECT_SCHEME = `com.googleusercontent.apps.${androidSchemePrefix}`;

const phoneSchema = z.object({
  mobile_no: z.string().regex(/^[0-9]{10}$/, "Enter valid 10 digit number"),
});

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CAROUSEL_HEIGHT = Math.round(SCREEN_HEIGHT * 0.55);
const BRAND_RED = "#EF4F5F";

const IndiaFlag = () => (
  <View style={styles.flagContainer}>
    <View style={[styles.flagStripe, { backgroundColor: "#FF9933" }]} />
    <View style={[styles.flagStripe, styles.flagMiddle]}>
      <View style={styles.ashokaChakra} />
    </View>
    <View style={[styles.flagStripe, { backgroundColor: "#138808" }]} />
  </View>
);

const carouselImages = [
  require("../../assets/loginimage1.png"),
  require("../../assets/loginimage2.png"),
  require("../../assets/loginimage3.png"),
];

// ─── Carousel Dot Indicator ──────────────────────────────────
const CarouselDot = ({
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
      opacity: withTiming(isActive ? 1 : 0.4, { duration: 200 }),
      transform: [
        { scale: withTiming(isActive ? 1.25 : 1, { duration: 200 }) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: 5.5,
          height: 5.5,
          borderRadius: 3,
          backgroundColor: "#ffffff",
        },
        animStyle,
      ]}
    />
  );
};

export default function Login() {
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const progress = useSharedValue(0);
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isKeyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    if (Platform.OS === "android") {
      RNOtpVerify.getHash()
        .then((hashes) => {
          console.log("🔑 [SMS RETRIEVER HASH]:", hashes);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const googleRedirectUri = AuthSession.makeRedirectUri({
    native: `${GOOGLE_REDIRECT_SCHEME}:/oauth2redirect`,
  });
  const isExpoGo = Constants.executionEnvironment === "storeClient";

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "",
    redirectUri: googleRedirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const handleGoogleLogin = useCallback(() => {
    if (isExpoGo) {
      Alert.alert(
        "Google login unavailable",
        "Google Sign-In cannot run inside Expo Go. Use a development build or standalone app for Google login.",
      );
      return;
    }

    promptAsync().catch(() => {});
  }, [googleRedirectUri, isExpoGo, promptAsync]);

  const handleAppleLogin = useCallback(() => {
    Alert.alert(
      "Apple Sign-In",
      "Apple Sign-In will be available in an upcoming update.",
    );
  }, []);

  const { mutate: verifyUserMutate, isPending: isVerifyPending } =
    useVerifyUser();
  const { mutate: sendOtpMutate, isPending: isSendOtpPending } = useSendOtp();
  const { mutate: googleCallbackMutate, isPending: isGooglePending } =
    useGoogleAuthCallback();

  const visitorId = useAppVisitorStore((s) => s.visitorId);
  const setGoogleUser = useAppVisitorStore((s) => s.setGoogleUser);

  const isLoading = isVerifyPending || isSendOtpPending;

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
  }, [phone, redirectTo, router, sendOtpMutate, verifyUserMutate]);

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
                  Alert.alert(
                    "Google Sign-In Failed",
                    data.message || "Something went wrong.",
                  );
                  return;
                }
                await setGoogleUser(
                  data.data.user_id,
                  data.data.user_name,
                  user.email ?? "",
                  user.picture ?? "",
                );
                setAnalyticsUserId(data.data.user_id);
                trackLogin("google");
                if (redirectTo) {
                  router.replace("/(tabs)");
                  setTimeout(() => router.push(redirectTo as any), 100);
                } else {
                  router.replace("/(tabs)");
                }
              },
              onError: () => {
                Alert.alert(
                  "Google Sign-In Failed",
                  "Could not sign in with Google. Please try again.",
                );
              },
            },
          );
        } catch (err) {
          Alert.alert(
            "Google Sign-In Failed",
            "Could not retrieve account details.",
          );
        }
      }
    };

    handleGoogleResponse();
  }, [
    googleCallbackMutate,
    redirectTo,
    response,
    router,
    setGoogleUser,
    visitorId,
  ]);

  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 36 : 16);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Fixed Top Hero Carousel (NEVER moves up!) ── */}
      <View style={[styles.carouselContainer, { height: CAROUSEL_HEIGHT }]}>
        <Carousel
          width={SCREEN_WIDTH}
          height={CAROUSEL_HEIGHT}
          data={carouselImages}
          loop
          autoPlay={!isKeyboardVisible}
          autoPlayInterval={3500}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
              <Image
                source={item}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          )}
        />

        {/* Skip Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[
            styles.skipButton,
            { top: Math.max(insets.top, 16) + 8 },
          ]}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        {/* Overlay Pagination Dots */}
        {!isKeyboardVisible && (
          <View style={styles.paginationPill}>
            {carouselImages.map((_, i) => (
              <CarouselDot
                key={i}
                index={i}
                progress={progress}
                total={carouselImages.length}
              />
            ))}
          </View>
        )}

        {/* Tapping on top carousel while keyboard is open dismisses the keyboard */}
        {isKeyboardVisible && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={Keyboard.dismiss}
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>

      {/* ── Bottom Login Card — Sits directly above keyboard when open, image stays fixed at top ── */}
      <View
        style={[
          styles.bottomSection,
          {
            bottom: isKeyboardVisible
              ? keyboardHeight + (Platform.OS === "android" ? insets.bottom : 0)
              : 0,
          },
          isKeyboardVisible && styles.bottomSectionKeyboard,
          !isKeyboardVisible && { paddingBottom: bottomInset + 20 },
        ]}
      >
        <View>
          {/* Title */}
          <Text style={styles.title}>Log in or sign up</Text>

          {/* Phone Input Row */}
          <View style={styles.phoneRow}>
            {/* Country Code Selector Box */}
            <View style={styles.countryBox}>
              <IndiaFlag />
              <ChevronDown size={14} color="#6B7280" strokeWidth={2.2} />
            </View>

            {/* Phone Input Box */}
            <View
              style={[
                styles.phoneInputBox,
                focused && {
                  borderColor: colors.primary,
                  borderWidth: 1.5,
                },
                !!error && styles.phoneInputBoxError,
              ]}
            >
              <Text style={styles.prefixText}>+91</Text>
              <TextInput
                value={phone}
                onChangeText={(v) => {
                  setPhone(v.replace(/[^0-9]/g, "").slice(0, 10));
                  if (error) setError("");
                }}
                placeholder="Enter Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Error Message */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Continue Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGetOtp}
            disabled={isLoading}
            style={[
              styles.continueBtn,
              { backgroundColor: colors.primary },
              isLoading && { opacity: 0.75 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.continueBtnText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Logins & Footer — only shown when keyboard is closed */}
        {!isKeyboardVisible && (
          <View>
            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGoogleLogin}
                disabled={isGooglePending}
                style={[
                  styles.socialButton,
                  isGooglePending && { opacity: 0.6 },
                ]}
              >
                <Image
                  source={require("../../assets/google.png")}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Apple Button (iOS only) */}
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAppleLogin}
                  style={[styles.socialButton, { marginTop: 10 }]}
                >
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer Terms & Policies */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our
              </Text>
              <View style={styles.footerLinksRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/terms")}
                >
                  <Text style={styles.footerLink}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/privacy")}
                >
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/privacy")}
                >
                  <Text style={styles.footerLink}>Content Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  carouselContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000000",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  skipButton: {
    position: "absolute",
    right: 16,
    zIndex: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  skipButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  paginationPill: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
    zIndex: 10,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    minHeight: Math.round(SCREEN_HEIGHT * 0.45),
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSectionKeyboard: {
    minHeight: undefined,
    paddingBottom: 16,
    justifyContent: "flex-start",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#2D3748",
    marginBottom: 16,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countryBox: {
    width: 66,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
  },
  flagContainer: {
    width: 23,
    height: 15,
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: 0.6,
    borderColor: "#D1D5DB",
  },
  flagStripe: {
    flex: 1,
  },
  flagMiddle: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ashokaChakra: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: "#000080",
  },
  phoneInputBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  phoneInputBoxError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  prefixText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#1F2937",
    marginRight: 8,
    includeFontPadding: false,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#111827",
    paddingVertical: 0,
    includeFontPadding: false,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    marginLeft: 4,
  },
  continueBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    color: "#ffffff",
    fontSize: 15.5,
    fontFamily: "Poppins_600SemiBold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  socialContainer: {
    width: "100%",
  },
  socialButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#1F2937",
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  footerContainer: {
    alignItems: "center",
    gap: 5,
    marginTop: 22,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  footerLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  footerLink: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#4B5563",
    textDecorationLine: "underline",
  },
});
