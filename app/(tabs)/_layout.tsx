import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/TabBar";
import { TabBarVisibilityProvider } from "../../src/context/TabBarVisibilityContext";

export default function TabLayout() {
  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, animation: "none" }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="category" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
