import React from "react";
import { Text, View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useUsp } from "../../hooks/homeHooks";
import { UspItem } from "../../types/home.types";

// ─── UspCard ──────────────────────────────────────────────────────────────────

interface UspCardProps {
  item: UspItem;
}

const UspCard: React.FC<UspCardProps> = ({ item }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  return (
    <LinearGradient
      colors={[colors.primary + "28", colors.primary + "08"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          flex: 1,
          borderRadius: spacing(18),
          borderWidth: 1,
          borderColor: colors.primary + "20",
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
    </LinearGradient>
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

      <View className="flex-row items-center gap-3 ">
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: font(18),
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          Why customers love us
        </Text>

        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
          }}
        />
      </View>


      <View style={[styles.grid, { gap: CARD_GAP, paddingHorizontal: EDGE_PADDING, }]}>
     
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
