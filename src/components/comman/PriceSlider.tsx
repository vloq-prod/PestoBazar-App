import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "../../theme";

// ─── Constants ────────────────────────────────────────────
const PRICE_MIN = 0;
const PRICE_MAX = 50_000;
const STEP = 10;
const MIN_GAP = 500;
const THUMB_SIZE = 22;
const CONTAINER_H = 55; // ✅ reduced height

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface PriceSliderProps {
  onValueChange?: (range: { min: number; max: number }) => void;
  initialMin?: number;
  initialMax?: number;
}

const PriceSlider = ({
  onValueChange,
  initialMin = 200,
  initialMax = 50_000,
}: PriceSliderProps) => {
  const { colors } = useTheme();
  const [sliderWidth, setSliderWidth] = useState(0);
  const pxPerStep = useSharedValue(1);
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);

  // ── Initial positions from props ───────────────────────────
  const initMinPos = 0;
  const initMaxPos = 0;

  const position = useSharedValue(initMinPos);
  const position2 = useSharedValue(initMaxPos);
  const opacity = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const zIndex = useSharedValue(0);
  const zIndex2 = useSharedValue(0);
  const context = useSharedValue(0);
  const context2 = useSharedValue(0);

  useEffect(() => {
    if (sliderWidth <= 0) return;

    // ✅ update step calculation
    pxPerStep.value = sliderWidth / ((PRICE_MAX - PRICE_MIN) / STEP);

    position.value = (initialMin / PRICE_MAX) * sliderWidth;
    position2.value = (initialMax / PRICE_MAX) * sliderWidth;
  }, [sliderWidth, initialMin, initialMax]);

  // ── Worklet helpers ────────────────────────────────────────
  const getPrice = (pos: number) => {
    "worklet";
    return PRICE_MIN + Math.round(pos / pxPerStep.value) * STEP;
  };
  // ── JS thread notify ───────────────────────────────────────
  const notifyChange = useCallback(
    (min: number, max: number) => {
      setMinValue(min);
      setMaxValue(max);
      onValueChange?.({ min, max });
    },
    [onValueChange],
  );

  // ── Track tap — nearest thumb moves ───────────────────────
  const trackTap = Gesture.Tap().onEnd((e) => {
    if (sliderWidth <= 0) return;

    const tapX = Math.max(0, Math.min(e.x, sliderWidth));
    const distMin = Math.abs(tapX - position.value);
    const distMax = Math.abs(tapX - position2.value);
    if (distMin <= distMax) {
      // clamp so min doesn't cross max
      const clamped = Math.min(tapX, position2.value - pxPerStep.value);
      position.value = withTiming(clamped, { duration: 150 });
      runOnJS(notifyChange)(getPrice(clamped), getPrice(position2.value));
    } else {
      // clamp so max doesn't cross min
      const clamped = Math.max(tapX, position.value + pxPerStep.value);
      position2.value = withTiming(clamped, { duration: 150 });
      runOnJS(notifyChange)(getPrice(position.value), getPrice(clamped));
    }
  });

  // ── Min thumb pan ──────────────────────────────────────────
  const pan = Gesture.Pan()
    .onBegin(() => {
      context.value = position.value;
    })
    .onUpdate((e) => {
      opacity.value = 1;
      const next = context.value + e.translationX;
      if (next < 0) {
        position.value = 0;
      } else if (next > position2.value - pxPerStep.value) {
        position.value = position2.value - pxPerStep.value;
      } else {
        position.value = next;
      }
    })
    .onEnd(() => {
      opacity.value = 0;
      runOnJS(notifyChange)(
        getPrice(position.value),
        getPrice(position2.value),
      );
    });

  // ── Max thumb pan ──────────────────────────────────────────
  const pan2 = Gesture.Pan()
    .onBegin(() => {
      context2.value = position2.value;
    })
    .onUpdate((e) => {
      opacity2.value = 1;
      const next = context2.value + e.translationX;
      if (next > sliderWidth) {
        position2.value = sliderWidth;
      } else if (next < position.value + pxPerStep.value) {
        position2.value = position.value + pxPerStep.value;
      } else {
        position2.value = next;
      }
    })
    .onEnd(() => {
      opacity2.value = 0;
      runOnJS(notifyChange)(
        getPrice(position.value),
        getPrice(position2.value),
      );
    });

  // ── Animated styles ────────────────────────────────────────
  const thumbStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
    zIndex: zIndex.value,
  }));

  const thumbStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: position2.value }],
    zIndex: zIndex2.value,
  }));

  const tooltipStyle1 = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const tooltipStyle2 = useAnimatedStyle(() => ({ opacity: opacity2.value }));

  const sliderFillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
    width: position2.value - position.value,
  }));

  // ── Animated tooltip text ──────────────────────────────────
  const minLabelProps = useAnimatedProps(() => ({
    text: `₹${getPrice(position.value)}`,
    defaultValue: `₹${initialMin}`,
  }));

  const maxLabelProps = useAnimatedProps(() => ({
    text: `₹${getPrice(position2.value)}`,
    defaultValue: `₹${initialMax}`,
  }));

  // ── Manual input handlers ──────────────────────────────────
  const handleMinInput = useCallback(
    (text: string) => {
      // ✅ allow empty typing
      if (text === "") {
        setMinValue(0);
        return;
      }

      const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
      if (isNaN(val)) return;

      const clamped = Math.max(PRICE_MIN, Math.min(val, maxValue - MIN_GAP));

      // ✅ important: raw value set karo (typing smooth hogi)
      setMinValue(val);

      position.value = withTiming((clamped / PRICE_MAX) * sliderWidth, {
        duration: 200,
      });

      onValueChange?.({ min: clamped, max: maxValue });
    },
    [maxValue, onValueChange, position, sliderWidth],
  );

  const handleMaxInput = useCallback(
    (text: string) => {
      if (text === "") {
        setMaxValue(0);
        return;
      }

      const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
      if (isNaN(val)) return;

      const clamped = Math.min(PRICE_MAX, Math.max(val, minValue + MIN_GAP));

      setMaxValue(val);

      position2.value = withTiming((clamped / PRICE_MAX) * sliderWidth, {
        duration: 200,
      });

      onValueChange?.({ min: minValue, max: clamped });
    },
    [minValue, onValueChange, position2, sliderWidth],
  );

  return (
    <View
      style={styles.wrapper}
      onLayout={(event) => {
        const nextWidth = Math.max(
          Math.round(event.nativeEvent.layout.width) - THUMB_SIZE,
          0,
        );

        if (nextWidth > 0 && nextWidth !== sliderWidth) {
          setSliderWidth(nextWidth);
        }
      }}
    >
      {/* ── Slider ─────────────────────────────────────────── */}
      {/* ✅ Outer GestureDetector for track tap */}
      <GestureDetector gesture={trackTap}>
        <View style={[styles.sliderContainer, { width: sliderWidth }]}>
          {/* Background track */}
          <View
            style={[
              styles.trackBack,
              { backgroundColor: colors.primaryLight, width: sliderWidth },
            ]}
          />

          {/* Active fill */}
          <Animated.View
            style={[
              styles.trackFront,
              { backgroundColor: colors.primary },
              sliderFillStyle,
            ]}
          />

          {/* ✅ Min Thumb — inner GestureDetector for pan */}
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                styles.thumb,
                thumbStyle1,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                },
              ]}
            >
              {/* ✅ Tooltip with arrow */}
              <Animated.View style={[styles.tooltipWrapper, tooltipStyle1]}>
                <View style={styles.tooltipBox}>
                  <AnimatedTextInput
                    style={styles.tooltipText}
                    animatedProps={minLabelProps}
                    editable={false}
                  />
                </View>
                {/* ✅ Triangle arrow pointing down */}
                <View style={styles.tooltipArrow} />
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {/* ✅ Max Thumb */}
          <GestureDetector gesture={pan2}>
            <Animated.View
              style={[
                styles.thumb,
                thumbStyle2,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                },
              ]}
            >
              {/* ✅ Tooltip with arrow */}
              <Animated.View style={[styles.tooltipWrapper, tooltipStyle2]}>
                <View style={styles.tooltipBox}>
                  <AnimatedTextInput
                    style={styles.tooltipText}
                    animatedProps={maxLabelProps}
                    editable={false}
                  />
                </View>
                <View style={styles.tooltipArrow} />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureDetector>

      {/* ── Min / Max Inputs ─────────────────────────────── */}
      <View style={styles.inputsRow}>
        {/* ✅ Min Price — same structure as Max */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Min Price
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                borderColor: colors.primary,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.rupee, { color: colors.textSecondary }]}>
              ₹
            </Text>
            <TextInput
              value={String(minValue)}
              onChangeText={handleMinInput}
              keyboardType="numeric"
              selectTextOnFocus
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Dash */}
        <View style={[styles.dash, { backgroundColor: colors.primaryLight }]} />

        {/* ✅ Max Price — same structure as Min, no alignItems override */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Max Price
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                borderColor: colors.primary,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.rupee, { color: colors.textSecondary }]}>
              ₹
            </Text>
            <TextInput
              value={String(maxValue)}
              onChangeText={handleMaxInput}
              keyboardType="numeric"
              selectTextOnFocus
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default PriceSlider;

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: THUMB_SIZE / 2,
    gap: 16,
  },

  // ── Slider ────────────────────────────────────────────────
  sliderContainer: {
    height: CONTAINER_H, // ✅ 55 — reduced
    justifyContent: "center",
    alignSelf: "center",
    overflow: "visible", // ✅ tooltip goes above container freely
  },
  trackBack: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
  },
  trackFront: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
  },
  thumb: {
    position: "absolute",
    left: -(THUMB_SIZE / 2),
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    top: (CONTAINER_H - THUMB_SIZE) / 2,
  },

  tooltipWrapper: {
    position: "absolute",
    bottom: THUMB_SIZE + 2,
    alignSelf: "center",
    alignItems: "center",
  },
  tooltipBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 64,
    alignItems: "center",
  },
  tooltipArrow: {
    // ✅ CSS triangle trick — pointing down
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1A1A1A",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  // ✅ Inputs — both equal, same structure
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputGroup: {
    flex: 1, // ✅ equal flex — both same width
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rupee: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  input: {
    flex: 1, // ✅ fills remaining space — no minWidth needed
    fontSize: 14,
    fontWeight: "700",
    padding: 0,
  },
  dash: {
    width: 14,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 8,
    marginTop: 16,
  },
});
