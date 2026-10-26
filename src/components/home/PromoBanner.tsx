import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { Image } from "expo-image";
import { Truck } from "lucide-react-native";

export const PROMO_WAVE_HEIGHT = 8;
export const getPromoBannerHeight = (statusBarHeight: number) => {
  return statusBarHeight + 54 + PROMO_WAVE_HEIGHT;
};

// ─────────────────────────────────────────────
// SMOOTH CONTINUOUS WAVY LINE (No seams, no pixelation)
// ─────────────────────────────────────────────

const WavyDivider = ({
  color = "#fff",
  height = PROMO_WAVE_HEIGHT,
}: {
  color?: string;
  height?: number;
}) => {
  const { width } = useWindowDimensions();

  // Divide width evenly so waves fit screen exactly without cuts or seams
  const waveTargetWidth = 24;
  const numWaves = Math.max(1, Math.round(width / waveTargetWidth));
  const w = width / numWaves;
  const mid = height / 2;

  // 2px overlap completely fuses the white innerContainer with the wave, removing any subpixel seam
  const OVERLAP = 2;
  const svgHeight = height + OVERLAP;

  const pathData = useMemo(() => {
    let d = `M 0,0 L 0,${(OVERLAP + mid).toFixed(2)} `;
    for (let i = 0; i < numWaves; i++) {
      const x0 = i * w;
      // First half of wave: smooth curve dipping down to bottom
      const cp1x = (x0 + w * 0.18).toFixed(2);
      const cp2x = (x0 + w * 0.32).toFixed(2);
      const end1x = (x0 + w * 0.5).toFixed(2);

      // Second half of wave: smooth curve rising back up to overlap line
      const cp3x = (x0 + w * 0.68).toFixed(2);
      const cp4x = (x0 + w * 0.82).toFixed(2);
      const end2x = ((i + 1) * w).toFixed(2);

      d += `C ${cp1x},${svgHeight} ${cp2x},${svgHeight} ${end1x},${(OVERLAP + mid).toFixed(2)} `;
      d += `C ${cp3x},${OVERLAP} ${cp4x},${OVERLAP} ${end2x},${(OVERLAP + mid).toFixed(2)} `;
    }
    d += `L ${width},0 Z`;
    return d;
  }, [width, height, numWaves, w, mid, svgHeight]);

  return (
    <View
      style={{
        height: svgHeight,
        width: "100%",
        marginTop: -OVERLAP, // Pull up 2px over innerContainer to guarantee zero gap
        overflow: "hidden",
      }}
    >
      <Svg width={width} height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`}>
        <Path d={pathData} fill={color} />
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

  const statusBarHeight =
    Platform.OS === "android"
      ? (RNStatusBar.currentHeight ?? insets.top ?? 24)
      : insets.top;

  const lightBg = "#fff";
  const mutedText = "#5c4a9e";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.innerContainer,
          {
            height: statusBarHeight + 54,
            backgroundColor: "#fff",
            paddingTop: statusBarHeight + 6,
          },
        ]}
      >
        {/* Top Header Row */}
        <View style={[styles.messageRow, { gap: 8 }]}>
          <Image
            source={require("../../../app/AppIcons/playstore.png")}
            style={{ width: 22, height: 22 }}
            contentFit="contain"
          />
          <Text
            style={[
              {
                fontSize: font(12.5),
                color: colors.text,
                fontFamily: "Poppins_600SemiBold",
              },
            ]}
          >
            {"India's Leading Online Pesticide Hub"}
          </Text>
        </View>

        {/* Bottom Subtitle Row */}
        <View style={[styles.messageRow, { marginTop: 3, gap: 16 }]}>
          <View style={[styles.messageRow, { gap: 4 }]}>
            <Truck size={12} color={mutedText} />
            <Text
              style={[
                styles.messageText,
                {
                  fontSize: font(10),
                  color: mutedText,
                  fontFamily: "Poppins_500Medium",
                },
              ]}
            >
              Free Delivery Above Rs 699/-*
            </Text>
          </View>
        </View>
      </View>

      {/* Smooth Wavy underline decoration pointing downwards */}
      <WavyDivider color={lightBg} height={PROMO_WAVE_HEIGHT} />
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
    justifyContent: "flex-start",
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
