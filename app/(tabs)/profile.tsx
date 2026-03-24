import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../src/theme";
import { useAppVisitorStore } from "../../src/store/auth";
import { StorageUtil } from "../../src/utils/storage";

export default function ProfileScreen() {
  const { colors } = useTheme();

const resetOnboarding = async () => {
  Alert.alert("Reset Onboarding", "Show welcome screen on next launch?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Reset",
      style: "destructive",
      onPress: async () => {
        try {

          // 1. Clear secure storage (token + visitor)
          await StorageUtil.clearVisitor();

          // 2. Clear Zustand state
          useAppVisitorStore.getState().clearVisitor();

          // 3. Navigate cleanly
          router.replace("/welcome");
        } catch (error) {
          console.error("Reset failed:", error);
        }
      },
    },
  ]);
};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center py-10">
          <Text style={{ color: colors.text }} className="font-poppins-bold text-2xl">
            Profile
          </Text>
          <Text style={{ color: colors.textSecondary }} className="font-poppins text-sm mt-2">
            Manage your account
          </Text>

          <TouchableOpacity
            onPress={resetOnboarding}
            className="mt-8 px-5 py-3 rounded-xl border"
            style={{ borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }} className="font-poppins text-sm">
              🔁 Reset Onboarding
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
