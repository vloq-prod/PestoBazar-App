import "../global.css";


import { useEffect, useState } from "react";
import { Stack } from "expo-router";
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

  useEffect(() => {
    const initApp = async () => {
      await useAppVisitorStore.getState().hydrateVisitor();
      hydratePincode();
      setIsReady(true);
    };

    initApp();
  }, []);

  // 🚨 Step 1: wait for hydration
  if (!isReady) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  // 🚨 Step 2: show splash FIRST (block UI)
  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <>
      {/* <AppStatusBar /> */}

      <Stack screenOptions={{ headerShown: false }}>
        {visitorId && token ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="welcome" />
        )}
      </Stack>
    </>
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
