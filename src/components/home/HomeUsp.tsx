import React from "react";
import { Text, View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useUsp } from "../../hooks/homeHooks";
import { UspItem } from "../../types/home.types";
import GradientDivider from "../common/GradientDivider";

// ─── UspCard ──────────────────────────────────────────────────────────────────

interface UspCardProps {
  item: UspItem;
}

const UspCard: React.FC<UspCardProps> = ({ item }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          flex: 1,
          backgroundColor: colors.backgroundgray,
          borderRadius: spacing(18),
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(14),
          gap: spacing(12),
        },
      ]}
    >
      {/* Icon */}
      <Image
        source={{ uri: item.image }}
        style={{ width: spacing(55), height: spacing(40) }}
        resizeMode="cover"
      />

      {/* Text */}
      <View style={{ gap: spacing(5) }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: font(12),
            color: colors.text,
            lineHeight: font(17),
            includeFontPadding: false,
          }}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );
};

// ─── HomeUsp ──────────────────────────────────────────────────────────────────

const HomeUsp: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { uspList, loading } = useUsp();

  const EDGE_PADDING = spacing(16);
  const CARD_GAP = spacing(10);

  if (loading) {
    return (
      <View style={[styles.placeholder, { height: spacing(96) }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!uspList || uspList.length === 0) return null;

  const row1 = uspList.slice(0, 2);
  const row2 = uspList.slice(2, 5);

  return (
    <View
      style={[
        styles.section,
        {
          gap: spacing(25),
        },
      ]}
    >
      {/* ── Header ── */}

      {/* ── Header ── */}
      <View style={{ paddingHorizontal: EDGE_PADDING }}>
        <GradientDivider
          label="Why customers love us"
          colors={colors}
          font={font}
          spacing={spacing}
          marginTop={0}
          fontSize={font(18)}
          textColor={colors.text}
          fontFamily="Poppins_700Bold"
        />
      </View>

      <View
        style={[
          styles.grid,
          { gap: CARD_GAP, paddingHorizontal: EDGE_PADDING },
        ]}
      >
        <View style={[styles.row, { gap: CARD_GAP }]}>
          {row1.map((item, i) => (
            <UspCard key={i} item={item} />
          ))}
        </View>

        {row2.length > 0 && (
          <View style={[styles.row, { gap: CARD_GAP }]}>
            {row2.map((item, i) => (
              <UspCard key={i} item={item} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeUsp;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {},
  header: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  card: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
