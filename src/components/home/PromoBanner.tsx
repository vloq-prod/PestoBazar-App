import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import {
  Truck,
  IndianRupee,
  ShieldCheck,
} from "lucide-react-native";

// ─────────────────────────────────────────────
// WAVY LINE
// ─────────────────────────────────────────────

const WavyDivider = ({ color }: { color: string }) => {
  return (
    <View style={styles.wavyWrap}>
      <Svg height="12" width="1000" viewBox="0 0 1000 12" preserveAspectRatio="none">
        {/* Filled wave pattern that sits exactly at the bottom edge */}
        <Path
          d="M0,0 Q20,12 40,0 T80,0 T120,0 T160,0 T200,0 T240,0 T280,0 T320,0 T360,0 T400,0 T440,0 T480,0 T520,0 T560,0 T600,0 T640,0 T680,0 T720,0 T760,0 T800,0 T840,0 T880,0 T920,0 T960,0 T1000,0 L1000,-20 L0,-20 Z"
          fill={color}
        />
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
  
  const lightBg = "#C2B0E6"; // Slightly darker purple
  const darkText = "#261b4a"; // palette.purpleDark
  const mutedText = "#5c4a9e"; // palette.purpleMuted

  return (
    <View style={[styles.container, { height: 100, backgroundColor: lightBg }]}>
      <View
        style={[
          styles.innerContainer,
          { paddingTop: insets.top + 5 }
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.messageRow}>
          <ShieldCheck size={16} color={darkText} />
          <Text style={[styles.messageText, { fontSize: font(12.5), color: darkText, fontFamily: "Poppins_600SemiBold" }]}>
            India's Leading Online Pesticide Hub
          </Text>
        </View>

        {/* Bottom Subtitle Row */}
        <View style={[styles.messageRow, { marginTop: 6, gap: 16 }]}>
          <View style={[styles.messageRow, { gap: 4 }]}>
            <IndianRupee size={12} color={mutedText} />
            <Text style={[styles.messageText, { fontSize: font(10), color: mutedText, fontFamily: "Poppins_500Medium" }]}>
              Cash On Delivery
            </Text>
          </View>
          <View style={[styles.messageRow, { gap: 4 }]}>
            <Truck size={12} color={mutedText} />
            <Text style={[styles.messageText, { fontSize: font(10), color: mutedText, fontFamily: "Poppins_500Medium" }]}>
              Free Delivery Above Rs 699/-*
            </Text>
          </View>
        </View>
      </View>
      
      {/* Wavy underline decoration pointing downwards */}
      <WavyDivider color={lightBg} />
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
    position: "relative",
    overflow: "visible", // Allowed to overflow so wavy bottom is visible
  },
  innerContainer: {
    flex: 1,
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
  wavyWrap: {
    position: "absolute",
    bottom: -12, // Equal to the SVG height so it hangs below the background and blends
    left: 0,
    right: 0,
    height: 12,
  },
});
