import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";
import { useAppVisitorStore } from "../../src/store/auth";

export default function HomeScreen() {
  const { colors } = useTheme();
  const visitorId = useAppVisitorStore((state) => state.visitorId);
  const token = useAppVisitorStore((state) => state.token);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <AppNavbar {...navbarConfig.home} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center py-10">
          <Text
            style={{ color: colors.text }}
            className="font-poppins-bold text-2xl"
          >
            Home
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="font-poppins text-sm mt-2"
          >
            Your feed will appear here
          </Text>
          <View>
            <Text style={{ color: colors.text }}>visitor id: {visitorId}</Text>
            <Text style={{ color: colors.text }}>Token: {token}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
