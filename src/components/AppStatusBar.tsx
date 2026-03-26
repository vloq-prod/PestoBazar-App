// src/components/AppStatusBar.tsx
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

const AppStatusBar = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <>
      {/* Android Background */}
      {Platform.OS === "android" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: isDark ? "#000000" : "#ffffff",
          }}
        />
      )}

      {/* Status Bar */}
      <StatusBar style={colors.statusBar} />
    </>
  );
};

export default AppStatusBar;