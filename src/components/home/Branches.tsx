import React, { useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { MapPin, Building2 } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useBranch } from "../../hooks/homeHooks";
import { BranchItem } from "../../types/home.types";
import { useTheme } from "../../theme";

const CARD_WIDTH = 260;
const CARD_HEIGHT = 170;

// ─── Live Dot — pulsing ring animation ───────────────────
const LiveDot = () => {
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.8);

  useEffect(() => {
    // Ring expands and fades — like a ripple
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(2.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
      ),
      -1, // infinite
      false,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 0 }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.dotWrapper}>
      {/* ✅ Ripple ring — animates outward */}
      <Animated.View style={[styles.dotRing, ringStyle]} />
      {/* ✅ Solid center dot — always visible */}
      <View style={styles.dotCore} />
    </View>
  );
};

// ─── Branch Card ─────────────────────────────────────────
const BranchCard = ({ item, index }: { item: BranchItem; index: number }) => {
  const centerNum = String(index + 1).padStart(2, "0");

  return (
    <View style={styles.card}>
      <View style={[styles.bgBase]} />
      <View style={styles.bgMid} />
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.centerNum}>CENTER {centerNum}</Text>
          <Building2
            size={20}
            color="rgba(255,255,255,0.45)"
            strokeWidth={1.5}
          />
        </View>

        <View>
          <Text style={styles.cityName} numberOfLines={1}>
            {item.branch_name}
          </Text>
          <View style={styles.locationPill}>
            <MapPin size={10} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.branch_name} · {item.state_name}
            </Text>
          </View>
        </View>

        {/* ✅ Live dot + orders */}
        <View style={styles.orderRow}>
          <LiveDot />
          <Text style={styles.orderCount}>
            {item.order_count.toLocaleString("en-IN")}+ orders
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main ────────────────────────────────────────────────
const Branches = () => {
  const { branches, loading, error } = useBranch();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#5f16e9" />
      </View>
    );
  }

  if (error || !branches || branches.length === 0) return null;

  const renderItem: ListRenderItem<BranchItem> = ({ item, index }) => (
    <BranchCard item={item} index={index} />
  );

  return (
    <View  style={{gap: 25}}>
      <View className="flex-row items-center gap-3 ">
        <View
          style={{
            flex: 1, // 🔥 dynamic width
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        <Text
          numberOfLines={1}
          style={{
            
            fontFamily: "Poppins_700Bold",
            fontSize: 18,
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          We Deliver From <Text>Near You</Text>
        </Text>

        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
          }}
        />
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => String(item.branch_id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        snapToAlignment="start"
      />

      <View style={{ paddingHorizontal: 27 }}>
        <Text
          className="text-center"
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: 10,
            color: colors.textTertiary,
          }}
        >
          All orders dispatched from the{" "}
          <Text style={{ fontFamily: "Poppins_500Medium" }}>
            nearest fulfillment centers
          </Text>{" "}
          to your delivery address · Free delivery above <Text style={{color: colors.primary, fontFamily: "Poppins_700Bold"}}>₹ 699</Text>
        </Text>
      </View>
    </View>
  );
};

export default Branches;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  center: {
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#261b4a",
  },
  bgMid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#5f16e9",
    opacity: 0.2,
  },
  blob1: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -35,
    right: -35,
    backgroundColor: "#e10320",
    opacity: 0.2,
  },
  blob2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: -20,
    right: 20,
    backgroundColor: "#5c4a9e",
    opacity: 0.3,
  },
  blob3: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 28,
    top: 50,
    left: -15,
    backgroundColor: "#5f16e9",
    opacity: 0.15,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  centerNum: {
    fontSize: 12,
    includeFontPadding: false,
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
  },
  cityName: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    lineHeight: 28,
    marginBottom: 6,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.88)",
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  dotWrapper: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  dotRing: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },

  dotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },

  orderCount: {
    fontSize: 13,
    includeFontPadding: false,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
});
