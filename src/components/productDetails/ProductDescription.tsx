import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import RenderHTML from "react-native-render-html";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { LinearGradient } from "expo-linear-gradient";

const COLLAPSED_HEIGHT = 240;

type Props = {
  html: string;
  onReadMore?: () => void;
};

const ProductDescription: React.FC<Props> = ({ html, onReadMore }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const { width } = useWindowDimensions();

  const measured = React.useRef(false);
  const fullHeightRef = React.useRef(0);
  const [needsClamp, setNeedsClamp] = React.useState(false);

  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  // ─── HTML Processing ──────────────────────────────────────────
  const headingMatch = html.match(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/i);
  const headingAttributes = headingMatch?.[2] ?? "";
  const hasVisibleHeading =
    !!headingMatch && !/display\s*:\s*none/i.test(headingAttributes);

  const title = hasVisibleHeading
    ? headingMatch?.[3]
        ?.replace(/<[^>]+>/g, " ")
        ?.replace(/&nbsp;/gi, " ")
        ?.replace(/\s+/g, " ")
        ?.trim()
    : "Description";

  const bodyHtml = hasVisibleHeading
    ? html.replace(headingMatch![0], "").trim()
    : html;

  const cleanHtml = bodyHtml
    ?.replace(/font-size:[^;"]+;?/gi, "")
    ?.replace(/line-height:[^;"]+;?/gi, "")
    ?.replace(/font-family:[^;"]+;?/gi, "")
    ?.replace(/<span[^>]*>/gi, "")
    ?.replace(/<\/span>/gi, "");

  // ─── Measure ─────────────────────────────────────────────────
  const handleLayout = useCallback((e: any) => {
    if (measured.current) return;
    const h = e.nativeEvent.layout.height;
    if (h === 0) return;

    measured.current = true;
    fullHeightRef.current = h;

    if (h > COLLAPSED_HEIGHT) {
      setNeedsClamp(true);
    } else {
      animatedHeight.value = h;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  // ─── Styles ───────────────────────────────────────────────────
  const baseStyle = {
    color: colors.textSecondary,
    fontSize: font(13),
    lineHeight: font(22),
    fontFamily: "Poppins_400Regular",
  };

  const tagStyles: Record<string, any> = {
    p: { marginBottom: spacing(8), fontSize: font(12), lineHeight: font(22) },
    ul: { paddingLeft: spacing(18), marginBottom: spacing(10) },
    li: {
      fontSize: font(12),
      lineHeight: font(22),
      marginBottom: spacing(6),
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "700",
      fontSize: font(12),
      color: colors.text,
    },
    b: {
      fontFamily: "Poppins_700Bold",
      fontWeight: "700",
      fontSize: font(12),
      color: colors.text,
    },
    h1: {
      fontFamily: "Poppins_700Bold",
      fontSize: font(18),
      marginBottom: spacing(10),
      color: colors.text,
    },
    h2: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(18),
      marginBottom: spacing(8),
      color: colors.text,
    },
    h3: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(14),
      marginBottom: spacing(8),
      color: colors.text,
    },
  };

  if (!html) return null;

  const renderHTML = (
    <RenderHTML
      contentWidth={width - spacing(32)}
      source={{ html: cleanHtml }}
      baseStyle={baseStyle}
      tagsStyles={tagStyles}
      enableCSSInlineProcessing={false}
      systemFonts={[
        "Poppins_400Regular",
        "Poppins_600SemiBold",
        "Poppins_700Bold",
      ]}
    />
  );

  return (
    <View
      style={{
        marginHorizontal: spacing(16),
        paddingVertical: spacing(14),
        backgroundColor: colors.background,
        gap: spacing(12),
      }}
    >
      {/* Title with accent bar */}
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: spacing(8) }}
      >
        <Text
          style={{
            fontSize: font(16),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
            includeFontPadding: false,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Content + fade overlay */}
      <View>
        <Animated.View style={animatedStyle}>
          {!measured.current && (
            <View
              onLayout={handleLayout}
              style={{
                position: "absolute",
                opacity: 0,
                left: 0,
                right: 0,
                pointerEvents: "none",
              }}
            >
              {renderHTML}
            </View>
          )}
          {renderHTML}
        </Animated.View>

        {/* Fade + Read more — text ke saath connected */}
        {needsClamp && (
          <TouchableOpacity
            onPress={onReadMore}
            activeOpacity={0.75}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: spacing(70),
            }}
          >
            <LinearGradient
              colors={[colors.background + "00", colors.background]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            {/* Read more text — bottom center pe */}
            <View
              style={{
                position: "absolute",
                bottom: spacing(-15),
                left: 0,
                right: 0,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: spacing(3),
              }}
            >
              <Text
                style={{
                  fontSize: font(13),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                }}
              >
                Read more
              </Text>
              <ChevronDown
                size={font(14)}
                color={colors.text}
                strokeWidth={2.5}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProductDescription;
