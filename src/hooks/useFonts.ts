import { useEffect } from "react";
import { useFonts as useExpoFonts } from "expo-font";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    // Direct Inter keys
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,

    // Poppins keys mapped to Inter fonts for compatibility
    Poppins_300Light: Inter_300Light,
    Poppins_400Regular: Inter_400Regular,
    Poppins_500Medium: Inter_500Medium,
    Poppins_600SemiBold: Inter_600SemiBold,
    Poppins_700Bold: Inter_700Bold,
    Poppins_800ExtraBold: Inter_800ExtraBold,
    Poppins_300Light_Italic: Inter_300Light,
    Poppins_400Regular_Italic: Inter_400Regular,
    Poppins_500Medium_Italic: Inter_500Medium,
    Poppins_600SemiBold_Italic: Inter_600SemiBold,
    Poppins_700Bold_Italic: Inter_700Bold,

    // Space Grotesk
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
}