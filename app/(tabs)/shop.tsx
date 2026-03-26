import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { navbarConfig } from "../../src/config/navbarConfig";
import AppSearchBar from "../../src/components/home/AppSearchBar";
import CategoryList from "../../src/components/home/CategoryList";
import HomProduct from "../../src/components/home/HomProduct";

export default function ShopScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* 🔥 Navbar */}
        <AppNavbar {...navbarConfig.shop} />

        {/* 📦 Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 8,
            gap: 12,
          }}
        ></ScrollView>
      </View>
    </SafeAreaView>
  );
}
