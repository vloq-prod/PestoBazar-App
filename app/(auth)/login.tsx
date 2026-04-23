import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Phone } from "lucide-react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,           // ✅ named import, not Animated.SharedValue
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

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
  progress: SharedValue<number>;   // ✅ fixed type
  total: number;
}) => {
  const animStyle = useAnimatedStyle(() => {
    const current = progress.value % total;
    const diff = Math.abs(current - index);
    const isActive = diff < 0.5;
    return {
      width: withTiming(isActive ? 22 : 7, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.4, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: "rgba(255,255,255,0.9)" }, animStyle]}
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
}) => {
  // border color = colors.border, fades to transparent outward
  const borderHex = colors.border;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing(22) }}>
      {/* Left: dark near text → transparent outward */}
      <LinearGradient
        colors={[borderHex, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={{ flex: 1, height: 1 }}
      />

      <Text style={{
        marginHorizontal: spacing(12),
        fontSize: font(12),
        color: colors.textTertiary,
        fontFamily: "Poppins_500Medium",
      }}>
        {label}
      </Text>

      {/* Right: dark near text → transparent outward */}
      <LinearGradient
        colors={[borderHex, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, height: 1 }}
      />
    </View>
  );
};

export default function Login() {
  const router = useRouter();
  const progress = useSharedValue(0);
  const { colors } = useTheme();
  const { font, spacing, hp } = useResponsive();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSkip = () => router.replace("/(tabs)");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* ── Top Section ── */}
      <View style={[styles.topSection, {
        height: hp(52),
        backgroundColor: colors.primary,
        paddingTop: insets.top + spacing(10),
      }]}>
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.skipButton, {
            marginRight: spacing(20),
            paddingHorizontal: spacing(20),
            paddingVertical: spacing(8),
            borderRadius: spacing(20),
            backgroundColor: "rgba(255,255,255,0.15)",
          }]}
        >
          <Text style={{ color: "#fff", fontSize: font(13), fontFamily: "Poppins_500Medium" }}>
            Skip
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Carousel
            width={SCREEN_WIDTH}
            height={hp(34)}
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
                  style={{ width: 100, height: 100, resizeMode: "contain" }}
                />
                <Text style={{
                  color: "#fff",
                  fontSize: font(20),
                  fontFamily: "Poppins_700Bold",
                  marginTop: spacing(12),
                  textAlign: "center",
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: font(12),
                  fontFamily: "Poppins_400Regular",
                  marginTop: spacing(6),
                  textAlign: "center",
                  paddingHorizontal: spacing(32),
                  lineHeight: font(18),
                }}>
                  {item.description}
                </Text>
              </View>
            )}
          />
        </View>

        <View style={[styles.dotsRow, { marginBottom: spacing(16) }]}>
          {carouselData.map((_, i) => (
            <PillDot key={i} index={i} progress={progress} total={carouselData.length} />
          ))}
        </View>
      </View>

      {/* ── Bottom Section ── */}
      <View style={[styles.bottomSection, {
        padding: spacing(20),
        backgroundColor: colors.background,
        borderTopLeftRadius: spacing(30),
        borderTopRightRadius: spacing(30),
        marginTop: -spacing(22),
      }]}>
        <Text style={{
          textAlign: "center",
          fontSize: font(22),
          marginTop: spacing(6),
          color: colors.text,
          fontFamily: "Poppins_600SemiBold",
        }}>
          Login or Signup
        </Text>

        <Text style={{
          textAlign: "center",
          fontSize: font(13),
          marginTop: spacing(6),
          color: colors.textTertiary,
          paddingHorizontal: spacing(10),
          fontFamily: "Poppins_400Regular",
        }}>
          Access trusted pest control services near you in just a few steps
        </Text>

        {/* ── Phone Input ── */}
        <View style={[styles.fieldWrap, { marginTop: spacing(24) }]}>
          <Text style={[
            styles.fieldLabel,
            { color: focused ? colors.primary : colors.textSecondary, fontSize: font(11) },
          ]}>
            Phone Number
          </Text>

          {/* Input box — full width */}
          <View style={[styles.inputBox, {
            height: INPUT_HEIGHT,
            backgroundColor: colors.inputBackground ?? colors.surface,
            borderColor: focused ? colors.primary : colors.border,
            borderWidth: focused ? 1.8 : 1.2,
          }]}>
            {/* Phone icon */}
            <Phone
              size={17}
              color={focused ? colors.primary : colors.textSecondary}
              strokeWidth={1.8}
            />

            {/* +91 prefix */}
            <View style={[
              styles.prefixBox,
              { borderRightColor: focused ? colors.primary : colors.border },
            ]}>
              <Text style={{
                fontSize: font(14),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
                includeFontPadding: false,
              }}>
                +91
              </Text>
            </View>

            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={10}
              style={[styles.textInput, {
                color: colors.text,
                fontSize: font(14),
                height: INPUT_HEIGHT,
                textAlignVertical: "center",
              }]}
            />
          </View>

          {/* ── Get OTP — full width, pill, below input ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.otpBtn, {
              marginTop: spacing(12),
              height: INPUT_HEIGHT,
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 6,
            }]}
          >
            <Text style={{ fontSize: font(15), fontFamily: "Poppins_600SemiBold", color: "#fff" }}>
              Get OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Gradient Divider ── */}
        <GradientDivider
          label="or continue with"
          colors={colors}
          font={font}
          spacing={spacing}
        />

        {/* ── Google Button ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.googleBtn, {
            marginTop: spacing(18),
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }]}
        >
          {/* <View style={styles.googleLogo}>
            <Text style={{ fontSize: font(14), fontFamily: "Poppins_700Bold" }}>
              <Text style={{ color: "#4285F4" }}>G</Text>
              <Text style={{ color: "#EA4335" }}>o</Text>
              <Text style={{ color: "#FBBC05" }}>o</Text>
              <Text style={{ color: "#4285F4" }}>g</Text>
              <Text style={{ color: "#34A853" }}>l</Text>
              <Text style={{ color: "#EA4335" }}>e</Text>
            </Text>
          </View> */}
          <Text style={{ fontSize: font(14), fontFamily: "Poppins_600SemiBold", color: colors.text }}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        {/* ── Terms ── */}
        <Text style={{
          textAlign: "center",
          fontSize: font(11),
          fontFamily: "Poppins_400Regular",
          color: colors.textTertiary,
          marginTop: spacing(20),
          lineHeight: font(18),
          paddingHorizontal: spacing(8),
        }}>
          By continuing, you agree to our{" "}
          <Text onPress={() => {}} style={{ color: colors.primary, fontFamily: "Poppins_500Medium" }}>Terms</Text>
          {", "}
          <Text onPress={() => {}} style={{ color: colors.primary, fontFamily: "Poppins_500Medium" }}>Refunds</Text>
          {" and "}
          <Text onPress={() => {}} style={{ color: colors.primary, fontFamily: "Poppins_500Medium" }}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { justifyContent: "flex-start" },
  bottomSection: { flex: 1 },
  skipButton: { alignSelf: "flex-end" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center" },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 },
  dot: { height: 5, borderRadius: 10 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: "Poppins_500Medium", marginLeft: 2 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  prefixBox: {
    paddingRight: 10,
    borderRightWidth: 1.2,
    height: 24,
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
    ...Platform.select({ android: { includeFontPadding: false }, ios: {} }),
  },
  otpBtn: {
    width: "100%",
    borderRadius: 999,      // ✅ full pill
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.2,
    borderRadius: 14,
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