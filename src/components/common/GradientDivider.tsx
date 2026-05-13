import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientDividerProps {
  label: string;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
  marginTop?: number;
  fontSize?: number;
  textColor?: string;
  fontFamily?: string;
}

const GradientDivider: React.FC<GradientDividerProps> = ({
  label,
  colors,
  font,
  spacing,
  marginTop,
  fontSize,
  textColor,
  fontFamily,
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginTop: marginTop ?? spacing(22),
    }}
  >
    <LinearGradient
      colors={[colors.border, "transparent"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 0 }}
      style={{ flex: 1, height: 1 }}
    />
    <Text
      style={{
        marginHorizontal: spacing(12),
        fontSize: fontSize ?? font(12),
        color: textColor ?? colors.textTertiary,
        fontFamily: fontFamily ?? "Poppins_500Medium",
      }}
    >
      {label}
    </Text>
    <LinearGradient
      colors={[colors.border, "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, height: 1 }}
    />
  </View>
);

export default GradientDivider;
