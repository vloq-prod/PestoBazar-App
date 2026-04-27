import "../global.css";

import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Text, TextInput } from "react-native";

import { ThemeProvider } from "../src/theme";
import { useFonts } from "../src/hooks/useFonts";
import { SplashScreen } from "../src/components/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppVisitorStore } from "../src/store/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useDeliveryStore } from "../src/store/deliveryStore";
import { ToastProvider } from "../src/context/ToastContext";
import { ToastContainer } from "../src/components/Toast/ToastContainer";

function RootLayoutNav() {
  // font scaling fix
  // @ts-ignore
  if (Text.defaultProps == null) Text.defaultProps = {};
  // @ts-ignore
  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  // @ts-ignore
  Text.defaultProps.allowFontScaling = false;
  // @ts-ignore
  TextInput.defaultProps.allowFontScaling = false;

  const [isReady, setIsReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const { visitorId, token } = useAppVisitorStore();
  const { hydratePincode } = useDeliveryStore();

  const router = useRouter();
  const segments = useSegments();

  // 🔥 INIT (Hydration)
  useEffect(() => {
    const initApp = async () => {
      const store = useAppVisitorStore.getState();

      await store.hydrateVisitor(); // ✅ IMPORTANT
      await store.hydrateUser(); // optional but safe

      hydratePincode();

      setIsReady(true);
    };

    initApp();
  }, []);

  // 🔥 NAVIGATION CONTROL (ONLY THIS)
  useEffect(() => {
    if (!isReady) return;

    const inTabs = segments[0] === "(tabs)";
    const inWelcome = segments[0] === "welcome";

    // ❌ No visitor → go welcome
    if (!visitorId || !token) {
      if (!inWelcome) {
        console.log("🚨 Redirect → welcome");
        router.replace("/welcome");
      }
      return;
    }

    // ✅ Visitor exists → go tabs
    if (visitorId && token) {
      if (!inTabs) {
        console.log("🚀 Redirect → tabs");
        router.replace("/(tabs)");
      }
    }
  }, [visitorId, token, isReady]);

  // ⏳ Splash handling
  if (!isReady) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  console.log("visitorId, token:", visitorId, token);

  // 🔥 ALWAYS RENDER BOTH (NO CONDITION)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}

export default function RootLayout() {
  const { fontsLoaded } = useFonts();
  const [queryClient] = useState(() => new QueryClient());

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <RootLayoutNav />
            </BottomSheetModalProvider>
          </ThemeProvider>
          <ToastContainer />
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
