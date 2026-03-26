import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";

export default function BuyAgainScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* 🔥 Navbar */}
        <AppNavbar {...navbarConfig.buyAgain} />

        {/* 📦 Content */}
        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 8,
            gap: 12,
          }}
        >
          {/* Empty State (for now) */}
          <View className=" flex-1 items-center justify-center py-10">
            <Text
              style={{ color: colors.text }}
              className="font-poppins-bold text-xl"
            >
              No Previous Orders
            </Text>

            <Text
              style={{ color: colors.textSecondary }}
              className="font-poppins text-sm mt-2 text-center px-6"
            >
              Your reordered products will appear here
            </Text>
          </View>

          {/* 🔥 Future: show products */}
          {/* <HomProduct type="buy-again" /> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
