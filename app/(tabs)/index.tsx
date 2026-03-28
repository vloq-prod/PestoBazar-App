// app/(tabs)/index.tsx
import { View, ScrollView, StatusBar } from "react-native";
import { useTheme } from "../../src/theme";
import HomeNavbar from "../../src/components/home/HomeNavbar"; // 👈 naya
import { SafeAreaView } from "react-native-safe-area-context";
import AppSearchBar from "../../src/components/home/AppSearchBar";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import HomProduct from "../../src/components/home/HomProduct";
import { useHomeBanners } from "../../src/hooks/homeHooks";
import FeatureBannerColumn from "../../src/components/home/FeatureBannerColumn";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import CategoryList from "../../src/components/home/CategoryList";
import FeaturedProducts from "../../src/components/home/FeaturedProducts";
import MiniCart from "../../src/components/home/MiniCart";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { slidingbanners, featureBanners } = useHomeBanners();

  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 Gradient Header */}
      <View
        style={{
          backgroundColor: "#3a286c",
          paddingBottom: 14,
        }}
      >
        <SafeAreaView edges={["top"]}>
          <View style={{ gap: 12 }}>
            <StatusBar
              barStyle={"light-content"}
              backgroundColor={colors.primary}
            />
            <HomeNavbar
              name="Guest"
              onMenuPress={() => {}}
              onCartPress={() => {}}
              onNotificationPress={() => {}}
              onProfilePress={() => {}}
            />

            <View style={{ paddingHorizontal: 16 }}>
              <AppSearchBar />
            </View>
          </View>
        </SafeAreaView>
      </View>

          <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 80, // 👈 80 karo taaki MiniCart content hide na kare
            paddingTop: 20,
          }}
        >
          <CategoryList />
          <View style={{ gap: 10 }}>
            <SlidingBanners data={slidingbanners} />
            <HomProduct />
            <FeatureBannerColumn data={featureBanners} />
            <DealsOfTheDay />
            <FeaturedProducts />
          </View>
        </ScrollView>

        <MiniCart />
      </View>
    </View>
  );
}
