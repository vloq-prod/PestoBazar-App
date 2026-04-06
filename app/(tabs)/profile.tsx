import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../src/theme";
import { useAppVisitorStore } from "../../src/store/auth";
import { StorageUtil } from "../../src/utils/storage";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";
import { Ionicons } from "@expo/vector-icons";

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
            await StorageUtil.clearVisitor();
            useAppVisitorStore.getState().clearVisitor();
            router.replace("/welcome");
          } catch (error) {
           
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        
        {/* 🔥 Navbar */}
        <AppNavbar title={"Profile"} showBack={true} showThemeToggle={true} />
 
        {/* 📦 Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            gap: 16,
            paddingBottom: 24,
          }}
        >
          {/* 👤 Profile Header */}
          <View className="items-center mt-4">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primaryMuted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>

            <Text
              style={{ color: colors.text }}
              className="font-poppins-bold text-lg mt-3"
            >
              Guest User
            </Text>

            <Text
              style={{ color: colors.textSecondary }}
              className="font-poppins text-sm"
            >
              Manage your account
            </Text>
          </View>

          {/* ⚙️ Actions */}
          <View
            className="rounded-xl border p-4"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              style={{ color: colors.text }}
              className="font-poppins-semibold text-base mb-3"
            >
              Account Settings
            </Text>

            {/* 🔁 Reset */}
            <TouchableOpacity
              onPress={resetOnboarding}
              className="flex-row items-center py-3"
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text
                style={{ color: colors.textSecondary }}
                className="ml-3 font-poppins text-sm"
              >
                Reset Onboarding
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🚪 Logout (Future) */}
          <View
            className="rounded-xl border p-4"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <TouchableOpacity className="flex-row items-center py-3">
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.error}
              />
              <Text
                style={{ color: colors.error }}
                className="ml-3 font-poppins text-sm"
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}