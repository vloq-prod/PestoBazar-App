import "../global.css";
import { useEffect, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../src/theme";
import { useFonts } from "../src/hooks/useFonts";
import { SplashScreen } from "../src/components/SplashScreen";

function RootLayoutNav() {
  const { colors } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Resolve initial route from storage
  useEffect(() => {
    AsyncStorage.getItem("@onboarded")
      .then((value) => {
        setInitialRoute(value === "true" ? "/(tabs)" : "/welcome");
      })
      .catch(() => {
        setInitialRoute("/welcome");
      });
  }, []);

  // Navigate only when BOTH splash is done AND route is resolved
  useEffect(() => {
    if (splashDone && initialRoute) {
      router.replace(initialRoute as any);
    }
  }, [splashDone, initialRoute]);

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      </Stack>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </>
  );
}

export default function RootLayout() {
  const { fontsLoaded } = useFonts();

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
