import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { ChevronDown } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
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

// ─── Single Accordion Item ────────────────────────────────────
const AccordionItem = ({
  item,
  index,
  isLast,
}: {
  item: DescriptionItem;
  index: number;
  isLast: boolean;
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { font, spacing } = useResponsive();
  const [expanded, setExpanded] = useState(index === 0); // first one open by default

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(expanded ? "180deg" : "0deg", {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setExpanded((prev) => !prev);
  }, []);

  const HTML_BASE_STYLE = {
    color: colors.textSecondary,
    fontSize: font(12),
    lineHeight: font(20),
    fontFamily: "Poppins_400Regular",
  };

  const HTML_TAGS_STYLES: Record<string, any> = {
    p: { marginTop: 0, marginBottom: spacing(8) },
    ul: {
      marginTop: spacing(4),
      marginBottom: spacing(8),
      paddingLeft: spacing(18),
    },
    ol: {
      marginTop: spacing(4),
      marginBottom: spacing(8),
      paddingLeft: spacing(18),
    },
    li: { marginBottom: spacing(6), lineHeight: font(20) },
    strong: {
      fontFamily: "Poppins_600SemiBold",
      color: colors.text,
    },
    em: {
      fontFamily: "Poppins_400Regular",
      fontStyle: "italic",
      color: colors.textSecondary,
    },
    h2: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(13),
      color: colors.text,
      marginBottom: spacing(6),
      marginTop: spacing(10),
    },
    h3: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(12),
      color: colors.text,
      marginBottom: spacing(4),
      marginTop: spacing(8),
    },
    // Table styles
    table: {
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing(8),
      marginVertical: spacing(8),
      overflow: "hidden",
    },
    thead: {
      backgroundColor: colors.primary + "14",
    },
    th: {
      paddingHorizontal: spacing(10),
      paddingVertical: spacing(8),
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(11),
      color: colors.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    td: {
      paddingHorizontal: spacing(10),
      paddingVertical: spacing(8),
      fontSize: font(11),
      fontFamily: "Poppins_400Regular",
      color: colors.textSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    tr: {},
  };

  return (
    <View
      style={[
        styles.itemWrapper,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Header row */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleToggle}
        style={[
          styles.itemHeader,
          {
            paddingVertical: spacing(10),
            paddingRight: spacing(16),
            paddingLeft: spacing(16),
            gap: spacing(10),
          },
        ]}
      >
        {/* Left accent bar + title */}
        <View style={[styles.titleRow, { gap: spacing(10) }]}>
          <Text
            style={[
              styles.itemTitle,
              {
                color: expanded ? colors.text : colors.textSecondary,
                fontFamily: expanded
                  ? "Poppins_600SemiBold"
                  : "Poppins_500Medium",
                fontSize: font(13),
                lineHeight: font(18),
              },
            ]}
            numberOfLines={2}
          >
            {item.drop_name}
          </Text>
        </View>

        {/* Chevron */}
        <Animated.View
          style={[
            styles.chevronWrap,
            chevronStyle,
            {
              width: spacing(26),
              height: spacing(26),
              borderRadius: spacing(13),
              backgroundColor: expanded
                ? colors.primary + "12"
                : colors.backgroundgray,
            },
          ]}
        >
          <ChevronDown
            size={font(16)}
            color={expanded ? colors.primary : colors.textTertiary}
            strokeWidth={2}
          />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[
            styles.headerDivider,
            {
            
              backgroundColor: colors.border,
            },
          ]}
        />
      )}

      {/* Body */}
      {expanded && (
        <View
          style={[
            styles.itemBody,
            {
              paddingHorizontal: spacing(16),
              paddingBottom: spacing(16),
              paddingTop: spacing(12),
            },
          ]}
        >
          <RenderHTML
            contentWidth={width - spacing(64)}
            source={{ html: item.drop_description || "" }}
            baseStyle={HTML_BASE_STYLE}
            tagsStyles={HTML_TAGS_STYLES}
            enableCSSInlineProcessing
          />
        </View>
      )}
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────
const DescriptionAccordion: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();

  if (!data || data.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          marginHorizontal: spacing(16),
          borderRadius: spacing(14),
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
      ]}
    >
      {data.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === data.length - 1}
        />
      ))}
    </View>
  );
};

export default DescriptionAccordion;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
  itemWrapper: {},
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemTitle: {
    includeFontPadding: false,
    flex: 1,
  },
  chevronWrap: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDivider: {
    height: 1,
  },
  itemBody: {
  },
});
