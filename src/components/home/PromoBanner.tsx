import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, Pattern, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { Image } from "expo-image";
import {
  Truck,
  IndianRupee,
  ShieldCheck,
} from "lucide-react-native";

// ─────────────────────────────────────────────
// WAVY LINE
// ─────────────────────────────────────────────

const WavyDivider = ({ color, height = 6 }: { color: string; height?: number }) => {
  return (
    <View style={{ height, width: "100%" }}>
      <Svg width="100%" height="100%">
        <Defs>
          {/* Pattern prevents stretching on tablets. 
              Width 40 provides a nice organic wave frequency. */}
          <Pattern
            id="wave"
            x="0"
            y="0"
            width="20"
            height={height + 20} // Added extra height to prevent the pattern from repeating vertically
            patternUnits="userSpaceOnUse"
          >
            {/* True smooth sine wave filling the area above it */}
            <Path
              d={`M 0,${height/2} Q 5,${height * 1.5} 10,${height/2} T 20,${height/2} L 20,0 L 0,0 Z`}
              fill={color}
            />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#wave)" />
      </Svg>
    </View>
  );
};

// ─────────────────────────────────────────────
// MAIN BANNER COMPONENT
// ─────────────────────────────────────────────

const PromoBanner = () => {
  const { colors } = useTheme();
  const { font } = useResponsive();
  const insets = useSafeAreaInsets();
  
  const lightBg = "#fff"; // Slightly darker purple
  const darkText = "#fff"; // palette.purpleDark
  const mutedText = "#5c4a9e"; // palette.purpleMuted

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.innerContainer,
          { height: 100, backgroundColor: "#fff", paddingTop: insets.top + 5 }
        ]}
      >
        {/* Top Header Row */}
        <View style={[styles.messageRow, { gap: 10 }]}>
          <Image
            source={require("../../../assets/Pestobazaarlogosmall.png")}
            style={{ width: 24, height: 24 }}
            contentFit="contain"
          />
          <Text style={[{ fontSize: font(12.5), color: colors.text, fontFamily: "Poppins_600SemiBold" }]}>
            {"India's Leading Online Pesticide Hub"}
          </Text>
        </View>

        {/* Bottom Subtitle Row */}
        <View style={[styles.messageRow, { marginTop: 2, gap: 16 }]}>
          <View style={[styles.messageRow, { gap: 4 }]}>
            <Truck size={12} color={mutedText} />
            <Text style={[styles.messageText, { fontSize: font(10), color: mutedText, fontFamily: "Poppins_500Medium" }]}>
              Free Delivery Above Rs 699/-*
            </Text>
          </View>
        </View>
      </View>
      
      {/* Wavy underline decoration pointing downwards */}
      <WavyDivider color={lightBg} height={6} />
    </View>
  );
};

export default React.memo(PromoBanner);

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  messageText: {
    color: "#fff",
  },
});
