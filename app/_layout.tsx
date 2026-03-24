import "../global.css";
import { useEffect, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../src/theme";
import { useFonts } from "../src/hooks/useFonts";
import { SplashScreen } from "../src/components/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppVisitorStore } from "../src/store/auth";
import { StorageUtil } from "../src/utils/storage";

function RootLayoutNav() {
  const { colors } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // ✅ Single source of truth
        await useAppVisitorStore.getState().hydrateVisitor();

        const { visitorId, token } = useAppVisitorStore.getState();

        if (visitorId && token) {
          setInitialRoute("/(tabs)");
        } else {
          setInitialRoute("/welcome");
        }
      } catch (error) {
        setInitialRoute("/welcome");
      }
    };

    initApp();
  }, []);

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

  const queryClient = new QueryClient();

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
