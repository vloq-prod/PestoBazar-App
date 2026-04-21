import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../theme";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PRICE_MIN = 100;
const DEFAULT_PRICE_MAX = 50_000;
const STEP = 100;
const MIN_GAP = 500;
const THUMB_SIZE = 18;
const TOUCH_SIZE = 44;
const CONTAINER_H = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceSliderProps {
  onValueChange?: (range: { min: number; max: number }) => void;
  initialMin?: number;
  initialMax?: number;
  min?: number;
  max?: number;
}

// ─── Pure helpers (no hook deps) ──────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

const snap = (v: number) => Math.round(v / STEP) * STEP;

const valueToPos = (
  value: number,
  min: number,
  max: number,
  width: number,
): number => ((value - min) / (max - min || 1)) * width;

const deltaToVal = (
  dx: number,
  width: number,
  min: number,
  max: number,
): number => snap((dx / Math.max(width, 1)) * (max - min || 1));

// ─── Component ────────────────────────────────────────────────────────────────

const PriceSlider = ({
  onValueChange,
  initialMin = 200,
  initialMax = DEFAULT_PRICE_MAX,
  min = DEFAULT_PRICE_MIN,
  max = DEFAULT_PRICE_MAX,
}: PriceSliderProps) => {
  const { colors } = useTheme();

  const safeMin = min;
  const safeMax = max;
  const gap = Math.min(MIN_GAP, Math.max(0, safeMax - safeMin));

  // ── Slider pixel width (set after first layout) ───────────────────────────
  const [sliderWidth, setSliderWidth] = useState(0);

  // ── Committed values — drive thumb positions ──────────────────────────────
  const [minValue, setMinValue] = useState(() =>
    clamp(snap(initialMin), safeMin, safeMax - gap),
  );
  const [maxValue, setMaxValue] = useState(() =>
    clamp(snap(initialMax), safeMin + gap, safeMax),
  );

  // ── Draft strings — freely editable, no clamping until blur ──────────────
  const [draftMin, setDraftMin] = useState(String(minValue));
  const [draftMax, setDraftMax] = useState(String(maxValue));

  // ── Mutable refs (always up-to-date, no stale closures) ──────────────────
  // Pan responders read from these so they never go stale.
  const stateRef = useRef({
    min: minValue,
    max: maxValue,
    width: 0,
    safeMin,
    safeMax,
    gap,
    onValueChange,
  });

  // Keep stateRef current on every render — O(1), no cost.
  stateRef.current.min = minValue;
  stateRef.current.max = maxValue;
  stateRef.current.width = sliderWidth;
  stateRef.current.safeMin = safeMin;
  stateRef.current.safeMax = safeMax;
  stateRef.current.gap = gap;
  stateRef.current.onValueChange = onValueChange;

  const dragStartRef = useRef({ min: minValue, max: maxValue });

  // ── Sync when server/props push new values ────────────────────────────────
  useEffect(() => {
    const nextMin = clamp(snap(initialMin), safeMin, safeMax - gap);
    const nextMax = clamp(snap(initialMax), nextMin + gap, safeMax);

    setMinValue(nextMin);
    setMaxValue(nextMax);
    setDraftMin(String(nextMin));
    setDraftMax(String(nextMax));
  }, [initialMin, initialMax, safeMin, safeMax, gap]);

  // ── Commit helper (called from input blur + pan release) ──────────────────
  const applyRange = useCallback(
    (nextMin: number, nextMax: number, notify = false) => {
      setMinValue(nextMin);
      setMaxValue(nextMax);
      setDraftMin(String(nextMin));
      setDraftMax(String(nextMax));
      if (notify) {
        stateRef.current.onValueChange?.({ min: nextMin, max: nextMax });
      }
    },
    [],
  );

  // ── Pan responders (created ONCE, read from stateRef every call) ──────────
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        // Snapshot current values when drag begins
        dragStartRef.current = {
          min: stateRef.current.min,
          max: stateRef.current.max,
        };
      },

      onPanResponderMove: (_, gs: PanResponderGestureState) => {
        const { safeMin, max, width, gap } = stateRef.current;
        const delta = deltaToVal(gs.dx, width, safeMin, max);
        const next = clamp(
          snap(dragStartRef.current.min + delta),
          safeMin,
          stateRef.current.max - gap,
        );
        // Directly mutate stateRef for instant reads in subsequent move events,
        // then batch the React state update.
        stateRef.current.min = next;
        setMinValue(next);
        setDraftMin(String(next));
      },

      onPanResponderRelease: () => {
        stateRef.current.onValueChange?.({
          min: stateRef.current.min,
          max: stateRef.current.max,
        });
      },

      onPanResponderTerminate: () => {
        stateRef.current.onValueChange?.({
          min: stateRef.current.min,
          max: stateRef.current.max,
        });
      },

      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        dragStartRef.current = {
          min: stateRef.current.min,
          max: stateRef.current.max,
        };
      },

      onPanResponderMove: (_, gs: PanResponderGestureState) => {
        const { safeMin, safeMax, width, gap } = stateRef.current;
        const delta = deltaToVal(gs.dx, width, safeMin, safeMax);
        const next = clamp(
          snap(dragStartRef.current.max + delta),
          stateRef.current.min + gap,
          safeMax,
        );
        stateRef.current.max = next;
        setMaxValue(next);
        setDraftMax(String(next));
      },

      onPanResponderRelease: () => {
        stateRef.current.onValueChange?.({
          min: stateRef.current.min,
          max: stateRef.current.max,
        });
      },

      onPanResponderTerminate: () => {
        stateRef.current.onValueChange?.({
          min: stateRef.current.min,
          max: stateRef.current.max,
        });
      },

      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  // ── Input handlers ────────────────────────────────────────────────────────

  const handleMinChange = useCallback((text: string) => {
    setDraftMin(text.replace(/[^0-9]/g, ""));
  }, []);

  const handleMaxChange = useCallback((text: string) => {
    setDraftMax(text.replace(/[^0-9]/g, ""));
  }, []);

  const handleMinBlur = useCallback(() => {
    const parsed = Number(draftMin);
    const next = clamp(
      snap(parsed > 0 ? parsed : safeMin),
      safeMin,
      stateRef.current.max - gap,
    );
    applyRange(next, stateRef.current.max, true);
  }, [draftMin, safeMin, gap, applyRange]);

  const handleMaxBlur = useCallback(() => {
    const parsed = Number(draftMax);
    const next = clamp(
      snap(parsed > 0 ? parsed : safeMax),
      stateRef.current.min + gap,
      safeMax,
    );
    applyRange(stateRef.current.min, next, true);
  }, [draftMax, safeMax, gap, applyRange]);

  // ── Thumb pixel positions (derived, updated every render) ─────────────────
  const minX = valueToPos(minValue, safeMin, safeMax, sliderWidth);
  const maxX = valueToPos(maxValue, safeMin, safeMax, sliderWidth);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => {
        const w = Math.max(
          Math.round(e.nativeEvent.layout.width - THUMB_SIZE),
          0,
        );
        if (w > 0 && w !== sliderWidth) {
          setSliderWidth(w);
          stateRef.current.width = w;
        }
      }}
    >
      {/* ── Slider track ── */}
      <View style={[styles.sliderContainer, { width: sliderWidth }]}>
        {/* Background track */}
        <View
          style={[
            styles.trackBack,
            { backgroundColor: colors.primaryLight, width: sliderWidth },
          ]}
        />

        {/* Active range track */}
        <View
          style={[
            styles.trackFront,
            {
              backgroundColor: colors.primary,
              left: minX,
              width: Math.max(maxX - minX, 0),
            },
          ]}
        />

        {/* Min thumb */}
        <View
          {...minPanResponder.panHandlers}
          style={[styles.touchArea, { left: minX - TOUCH_SIZE / 2 }]}
        >
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: colors.background,
                borderColor: colors.primary,
              },
            ]}
          />
        </View>

        {/* Max thumb */}
        <View
          {...maxPanResponder.panHandlers}
          style={[styles.touchArea, { left: maxX - TOUCH_SIZE / 2 }]}
        >
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: colors.background,
                borderColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* ── Input fields ── */}
      <View style={styles.inputsRow}>
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
              value={draftMin}
              onChangeText={handleMinChange}
              onBlur={handleMinBlur}
              keyboardType="numeric"
              selectTextOnFocus
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        <View style={[styles.dash, { backgroundColor: colors.primaryLight }]} />

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
              value={draftMax}
              onChangeText={handleMaxChange}
              onBlur={handleMaxBlur}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: THUMB_SIZE / 2,
    gap: 16,
  },
  sliderContainer: {
    height: CONTAINER_H,
    justifyContent: "center",
    alignSelf: "center",
    overflow: "visible",
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
  touchArea: {
    position: "absolute",
    top: (CONTAINER_H - TOUCH_SIZE) / 2,
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
  },
  inputBox: {
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6,
  },
  rupee: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
    padding: 0,
  },
  dash: {
    width: 12,
    height: 2,
    borderRadius: 1,
    marginBottom: 20,
  },
});
