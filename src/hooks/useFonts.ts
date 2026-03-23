import { useEffect } from "react";
import { useFonts as useExpoFonts } from "expo-font";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_300Light_Italic,
  Poppins_400Regular_Italic,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold_Italic,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_300Light_Italic,
    Poppins_400Regular_Italic,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
}
