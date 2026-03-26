// app/(tabs)/index.tsx
import { View, ScrollView } from "react-native";
import { useTheme } from "../../src/theme";
import { navbarConfig } from "../../src/config/navbarConfig";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { SafeAreaView } from "react-native-safe-area-context";
import AppSearchBar from "../../src/components/home/AppSearchBar";
import SlidingBanners from "../../src/components/home/SlidingBanners";
import CategoryList from "../../src/components/home/CategoryList";
import HomProduct from "../../src/components/home/HomProduct";
import { useHomeBanners } from "../../src/hooks/homeHooks";
import FeatureBannerColumn from "../../src/components/home/FeatureBannerColumn";
import DealsOfTheDay from "../../src/components/home/DealsOfTheDay";
import CategoryListStatic from "../../src/components/home/Categoryliststatic";

export default function HomeScreen() {
  const { colors } = useTheme();

  const { loading, slidingbanners, featureBanners, homeBottomBanners } =
    useHomeBanners();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <AppNavbar {...navbarConfig.home} />
        <View className="px-4 py-2">
          <AppSearchBar />
        </View>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 8,
            gap: 5,
          }}
        >
          {/* <CategoryList /> */}
          <CategoryListStatic />
          <SlidingBanners data={slidingbanners} />

          <HomProduct />
          <FeatureBannerColumn data={featureBanners} />
          {/* <HomeBottomCarousel data={homeBottomBanners} /> */}
          <DealsOfTheDay />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
