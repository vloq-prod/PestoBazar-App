import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing, hp } = useResponsive();
  const insets = useSafeAreaInsets();

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ✅ STATUS BAR CONTROL */}
      <StatusBar style="light" />

      <View
        style={[
          styles.topSection,
          {
            height: hp(50),
            backgroundColor: colors.primary,

            // ✅ SAFE AREA PADDING
            paddingTop: insets.top + spacing(10),
            paddingHorizontal: spacing(20),
          },
        ]}
      >
        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={[
            styles.skipButton,
            {
              paddingHorizontal: spacing(20),
              paddingVertical: spacing(8),
              borderRadius: spacing(20),
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          ]}
        >
          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: font(14),
              fontFamily: "Poppins_500Medium",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Heading */}
        <View style={{ marginTop: spacing(40) }}>
          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: font(26),
              fontWeight: "700",
            }}
          >
            Welcome Back
          </Text>

          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: font(14),
              marginTop: spacing(6),
              opacity: 0.8,
            }}
          >
            Login to continue your journey
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.bottomSection,
          {
            padding: spacing(20),
            backgroundColor: colors.background,
            borderTopLeftRadius: spacing(30),
            borderTopRightRadius: spacing(30),
            marginTop: -spacing(22),
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: font(22),
              marginTop: spacing(6),
              color: colors.textSecondary,
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            Login or Signup
          </Text>

          <Text
            style={{
              textAlign: "center",
              fontSize: font(13),
              marginTop: spacing(8),
              color: colors.textTertiary,
              paddingHorizontal: spacing(10),
            }}
          >
            Access trusted pest control services near you in just a few steps
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: spacing(20),
            }}
          >
            {/* LEFT LINE */}
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: colors.border,
              }}
            />

            {/* TEXT */}
            <Text
              style={{
                marginHorizontal: spacing(10),
                fontSize: font(12),
                color: colors.textTertiary,
                fontFamily: "Poppins_500Medium",
              }}
            >
              or continue with
            </Text>

            {/* RIGHT LINE */}
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: colors.border,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    justifyContent: "flex-start",
  },
  bottomSection: {
    flex: 1,
  },
  skipButton: {
    alignSelf: "flex-end",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
