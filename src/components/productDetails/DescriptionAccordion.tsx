import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { ChevronDown } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type DescriptionItem = {
  id: number;
  drop_name: string;
  drop_description: string;
};

type Props = {
  data: DescriptionItem[];
};

// ─── Single Item ──────────────────────────────────────────────
const AccordionItem = ({ item, isLast, expanded, onToggle }: any) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { font, spacing } = useResponsive();

  // Chevron rotation
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(expanded ? "180deg" : "0deg", {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  // Body opacity fade
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: withTiming(expanded ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const HTML_BASE_STYLE = {
    color: colors.textSecondary,
    fontSize: font(12),
    lineHeight: font(20),
    fontFamily: "Poppins_400Regular",
  };

  const HTML_TAGS_STYLES: Record<string, any> = {
    p: {
      marginTop: 0,
      marginBottom: spacing(8),
      fontSize: font(12),
      lineHeight: font(20),
    },
    ul: {
      marginTop: spacing(4),
      marginBottom: spacing(8),
      paddingLeft: spacing(16),
    },
    ol: {
      marginTop: spacing(4),
      marginBottom: spacing(8),
      paddingLeft: spacing(16),
    },
    li: {
      marginBottom: spacing(5),
      fontSize: font(12),
      lineHeight: font(20),
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: "Poppins_700Bold",
      fontSize: font(12),
      color: colors.text,
      fontWeight: "700",
    },
    span: { fontSize: font(12), color: colors.textSecondary },
    h2: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(13),
      color: colors.text,
      marginBottom: spacing(4),
      marginTop: spacing(8),
    },
    h3: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(12),
      color: colors.text,
      marginBottom: spacing(4),
      marginTop: spacing(6),
    },
  };

  return (
    <View
      style={{
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: colors.border,
      }}
    >
      {/* Header */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing(14),
          gap: spacing(10),
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: font(13),
            fontFamily: expanded ? "Poppins_600SemiBold" : "Poppins_500Medium",
            color: expanded ? colors.text : colors.textSecondary,
            includeFontPadding: false,
            lineHeight: font(18),
          }}
          numberOfLines={2}
        >
          {item.drop_name}
        </Text>

        {/* Animated chevron — no bg, just icon */}
        <Animated.View style={chevronStyle}>
          <ChevronDown
            size={font(17)}
            color={expanded ? colors.text : colors.textTertiary}
            strokeWidth={expanded ? 2.2 : 1.8}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Body — LayoutAnimation handles height, opacity fades in */}
      {expanded && (
        <Animated.View style={[bodyStyle, { paddingBottom: spacing(16) }]}>
          <RenderHTML
            contentWidth={width - spacing(32)}
            source={{ html: item.drop_description || "" }}
            baseStyle={HTML_BASE_STYLE}
            tagsStyles={HTML_TAGS_STYLES}
            enableCSSInlineProcessing={false}
          />
        </Animated.View>
      )}
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const DescriptionAccordion: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const [openId, setOpenId] = useState<number | null>(data?.[0]?.id ?? null);

  if (!data || data.length === 0) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleToggle = useCallback((id: number) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.8 },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <View style={{ marginHorizontal: spacing(16) }}>
      {/* Section header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing(8),
          marginBottom: spacing(4),
        }}
      >
  
        <Text
          style={{
          fontSize: font(16),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
            includeFontPadding: false,
          }}
        >
         Product Information
        </Text>
      </View>

      {/* Items — no outer border, just dividers */}
      {data.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isLast={index === data.length - 1}
          expanded={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </View>
  );
};

export default DescriptionAccordion;
