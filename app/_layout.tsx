import "../global.css";

import { useEffect, useRef, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Text, TextInput, View } from "react-native";

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
import { useCartQuantitySync } from "../src/hooks/cartHooks";
import { NotificationProvider } from "../src/providers/NotificationProvider";
import { AppUpdateProvider } from "../src/providers/AppUpdateProvider";
import { OfflineBanner } from "../src/components/common/OfflineBanner";
import { useDeepLinking, usePendingNavigation } from "../src/deep-linking";
import {
  trackScreen,
  getTrackedScreenName,
  setAnalyticsUserId,
} from "../src/lib/analytics";

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

  const { visitorId, token, userId } = useAppVisitorStore();
  const { hydratePincode } = useDeliveryStore();

  const router = useRouter();
  const segments = useSegments();
  const lastTrackedScreenRef = useRef<string | null>(null);

  // 📊 Centralized Screen Tracking (for key business journeys only)
  useEffect(() => {
    if (!isReady || !splashDone) return;
    const screenName = getTrackedScreenName(segments);
    if (screenName && screenName !== lastTrackedScreenRef.current) {
      lastTrackedScreenRef.current = screenName;
      trackScreen(screenName);
    }
  }, [segments, isReady, splashDone]);

  // 👤 Synchronize User ID with Analytics
  useEffect(() => {
    if (userId) {
      setAnalyticsUserId(userId);
    }
  }, [userId]);

  // 🔥 INIT (Hydration & Auto Visitor Generation)
  useEffect(() => {
    const initApp = async () => {
      const store = useAppVisitorStore.getState();

      await store.ensureVisitor(); // ✅ Auto-creates visitor ID on load if missing
      await store.hydrateUser(); // optional but safe

      hydratePincode();

      setIsReady(true);
    };

    initApp();
  }, []);

  // 🔗 DEEP LINKING — handles cold start URLs, warm start URLs, and router registration
  useDeepLinking({ isReady: isReady && splashDone });

  // 🔗 PENDING NAVIGATION — resumes auth-gated deep links after login completes
  usePendingNavigation();

  // 🔥 NAVIGATION CONTROL (ONLY THIS)
  useEffect(() => {
    if (!isReady) return;

    const inWelcome = segments[0] === "welcome";
    const inAuth = segments[0] === "(auth)";

    // 🚀 Bypass welcome screen → redirect to tabs
    if (inWelcome) {
      router.replace("/(tabs)");
    }
  }, [visitorId, token, isReady, segments]);

  // 🔥 ALWAYS RENDER STACK IN BACKGROUND (Load Home Screen while splash is active)
  return (
    <View style={{ flex: 1 }}>
      <CartQuantitySyncProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(stack)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="welcome" />
        </Stack>
      </CartQuantitySyncProvider>

      {/* ⏳ Splash Screen Overlay */}
      {(!isReady || !splashDone) && (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      )}
    </View>
  );
}

const CartQuantitySyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { visitorId, userId } = useAppVisitorStore();
  useCartQuantitySync({
    visitor_id: visitorId || "",
    user_id: String(userId ?? 0),
  });
  return <>{children}</>;
};



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
              {/* NotificationProvider runs FCM token registration once on mount */}
              <NotificationProvider>
                <AppUpdateProvider>
                  <RootLayoutNav />
                </AppUpdateProvider>
              </NotificationProvider>
            </BottomSheetModalProvider>
          </ThemeProvider>
          <ToastContainer />
          <OfflineBanner />
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
