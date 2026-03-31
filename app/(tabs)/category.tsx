import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";

export default function OrdersScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* 🔥 Navbar */}
        <AppNavbar {...navbarConfig.orders} />

        {/* 📦 Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 12,
            paddingHorizontal: 16,
            gap: 12,
          }} 
        >
          {/* Empty State */}
          <View className="items-center justify-center py-16">
            <Text
              style={{ color: colors.text }}
              className="font-poppins-bold text-xl"
            >
              No Orders Yet
            </Text>

            <Text
              style={{ color: colors.textSecondary }}
              className="font-poppins text-sm mt-2 text-center px-6"
            >
              You haven’t placed any orders yet. Start shopping now.
            </Text>
          </View>

          {/* 🔥 Future: Orders List */}
          {/* <OrdersList /> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
