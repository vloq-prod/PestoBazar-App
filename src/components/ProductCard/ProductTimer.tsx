// components/ProductCard/ProductTimer.tsx

import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Flame, Eye } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useCountdown } from "../../hooks/useCountdown";

interface ProductTimerProps {
  expiryDate: string;
  onPress?: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

// ── Timer Unit ────────────────────────────────────────────────────────────────

interface TimerUnitProps {
  value: string;
  label: string;
}

const TimerUnit: React.FC<TimerUnitProps> = React.memo(({ value, label }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  return (
    <View
      style={[
        styles.timerBox,
        {
          backgroundColor: colors.primary + "12",
          borderColor: colors.border,
          paddingHorizontal: spacing(6),
          paddingVertical: spacing(4),
          minWidth: spacing(38),
          borderRadius: spacing(8),
        },
      ]}
    >
      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: font(13),
          color: colors.primary,
          lineHeight: font(17),
          includeFontPadding: false,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(7),
          color: colors.textTertiary,
          letterSpacing: 0.3,
          lineHeight: font(10),
          includeFontPadding: false,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
});

// ── ProductTimer ──────────────────────────────────────────────────────────────

const ProductTimer: React.FC<ProductTimerProps> = ({ expiryDate, onPress }) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const { days, hours, minutes, seconds, expired } = useCountdown(expiryDate);

  if (expired) {
    return (
      <View
        style={[
          styles.expiredRow,
          {
            backgroundColor: colors.backgroundSkeleton,
            borderRadius: spacing(10),
            paddingVertical: spacing(7),
            gap: spacing(5),
          },
        ]}
      >
        <Flame size={spacing(12)} color={colors.textTertiary} strokeWidth={2} />
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(11),
            color: colors.textTertiary,
          }}
        >
          Offer Expired
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing(4) }}>
      {/* Label */}
      <View style={[styles.labelRow, { gap: spacing(3) }]}>
        <Flame size={spacing(10)} color={colors.primary} strokeWidth={2.5} />
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: font(9),
            color: colors.text,
            letterSpacing: 0.8,
            textTransform: "uppercase",
              includeFontPadding: false,
              textAlignVertical: "center",
        
          }}
        >
          Hurry up! Ends in
        </Text>
      </View>

      {/* Timer + CTA */}
      <View style={[styles.timerCTARow, { gap: spacing(6) }]}>
        {/* Boxes */}
        <View style={[styles.timerUnitsRow, { gap: spacing(3) }]}>
          {days > 0 && (
            <>
              <TimerUnit value={pad(days)} label="Days" />
              <Text style={[styles.colon, { fontSize: font(14) }]}>:</Text>
            </>
          )}
          <TimerUnit value={pad(hours)} label="Hrs" />
          <Text style={[styles.colon, { fontSize: font(14) }]}>:</Text>
          <TimerUnit value={pad(minutes)} label="Min" />
          <Text style={[styles.colon, { fontSize: font(14) }]}>:</Text>
          <TimerUnit value={pad(seconds)} label="Sec" />
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.82}
          style={[
            styles.ctaButton,
            {
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: spacing(9),
              borderRadius: spacing(8),
              gap: spacing(5),
            },
          ]}
        >
          <Eye size={spacing(13)} color="#fff" strokeWidth={2.5} />
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(12),
              color: "#fff",
             
              lineHeight: font(18),
            }}
          >
            View
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(ProductTimer);

const styles = StyleSheet.create({
  expiredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerCTARow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerUnitsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerBox: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colon: {
    fontFamily: "Poppins_700Bold",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
