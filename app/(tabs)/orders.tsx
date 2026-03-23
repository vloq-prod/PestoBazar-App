import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";

export default function OrdersScreen() {
  const { colors } = useTheme();

  const ENVIRONMENT =
    process.env.EXPO_PUBLIC_ENVIRONMENT?.toUpperCase() ?? "PRODUCTION";

  console.log("Enviroment : ", ENVIRONMENT);
  const BASE_URLS = {
    STAGING: "https://staging-api.furnixcrm.com/api",
    PRODUCTION: "https://api.production.com/api",
  };

  const baseURL =
    BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] || BASE_URLS.PRODUCTION;

  console.log("Base Url : ", baseURL);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center py-10">
          <Text
            style={{ color: colors.text }}
            className="font-poppins-bold text-2xl"
          >
            Orders
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="font-poppins text-sm mt-2"
          >
            Track your orders here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
