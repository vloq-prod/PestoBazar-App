import "./global.css";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { ThemeProvider, useTheme } from "./src/theme";
import { useFonts } from "./src/hooks/useFonts";
import { SplashScreen } from "./src/components/SplashScreen";

function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View
        style={{ backgroundColor: colors.primary }}
        className="pt-14 pb-5 px-5 flex-row items-center justify-between"
      >
        <Text className="text-2xl font-poppins-bold text-white">PestoBazar</Text>
        <TouchableOpacity
          onPress={toggleTheme}
          className="bg-white/20 rounded-full px-4 py-1.5"
        >
          <Text className="text-white text-sm font-poppins-medium">
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const { fontsLoaded } = useFonts();
  const [splashDone, setSplashDone] = useState(false);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <HomeScreen />
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </ThemeProvider>
  );
}
