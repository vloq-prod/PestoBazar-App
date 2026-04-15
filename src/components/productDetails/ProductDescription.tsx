import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import { useTheme } from "../../theme";

type Props = {
  html: string;
};

const ProductDescription: React.FC<Props> = ({ html }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  if (!html) return null;

  // 🔥 STEP 1: Extract heading from HTML
  const headingMatch = html.match(
    /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/i
  );

  const headingAttributes = headingMatch?.[2] ?? "";

  const hasVisibleHeading =
    !!headingMatch &&
    !/display\s*:\s*none/i.test(headingAttributes);

  const title = hasVisibleHeading
    ? headingMatch?.[3]
        ?.replace(/<[^>]+>/g, " ")
        ?.replace(/&nbsp;/gi, " ")
        ?.replace(/\s+/g, " ")
        ?.trim()
    : "Description";

  // 🔥 STEP 2: Remove heading from body
  const bodyHtml = hasVisibleHeading
    ? html.replace(headingMatch![0], "").trim()
    : html;

  // 🔥 STEP 3: Clean HTML (remove inline garbage styles)
  const cleanHtml = bodyHtml
    ?.replace(/font-size:[^;"]+;?/gi, "")
    ?.replace(/line-height:[^;"]+;?/gi, "")
    ?.replace(/font-family:[^;"]+;?/gi, "")
    ?.replace(/<span[^>]*>/gi, "")
    ?.replace(/<\/span>/gi, "");

  const baseStyle = {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  };

  const tagStyles: Record<string, any> = {
    p: {
      marginBottom: 8,
      fontSize: 13,
      lineHeight: 22,
    },

    ul: {
      paddingLeft: 18,
      marginBottom: 10,
    },

    li: {
      fontSize: 13,
      lineHeight: 22,
      marginBottom: 6,
      color: colors.textSecondary,
    },

    strong: {
      fontFamily: "Poppins_700Bold",
      fontWeight: "700",
      fontSize: 13,
      color: colors.text,
    },

    b: {
      fontFamily: "Poppins_700Bold",
      fontWeight: "700",
      fontSize: 13,
      color: colors.text,
    },

    h1: {
      fontFamily: "Poppins_700Bold",
      fontSize: 16,
      marginBottom: 10,
      color: colors.text,
    },

    h2: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
      marginBottom: 8,
      color: colors.text,
    },

    h3: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      marginBottom: 8,
      color: colors.text,
    },
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        backgroundColor: colors.background,
      }}
    >
      {/* 🔥 Title auto handled */}
      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          fontFamily: "Poppins_600SemiBold",
          color: colors.text,
        }}
      >
        {title}
      </Text>

      <RenderHTML
        contentWidth={width - 60}
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
    </View>
  );
};

export default ProductDescription;