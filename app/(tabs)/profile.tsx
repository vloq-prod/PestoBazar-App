import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useTheme } from "../../src/theme";

export default function ProfileScreen() {
  const { colors } = useTheme();

  const resetOnboarding = async () => {
    Alert.alert("Reset Onboarding", "Show welcome screen on next launch?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@onboarded");
          router.replace("/welcome");
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
