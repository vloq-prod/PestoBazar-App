import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Animated,
} from "react-native";

interface OrderSkeletonProps {
  colors: any;
}

const OrderSkeleton = ({ colors }: OrderSkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const S = ({ w, h, r = 4, style }: { w: number | string; h: number; r?: number, style?: any }) => (
    <View
      style={[{
        width: w as any,
        height: h,
        borderRadius: r,
        backgroundColor: colors.border,
      }, style]}
    />
  );

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pulseAnim,
        },
      ]}
    >
      {/* Top Section */}
      <View style={styles.skeletonTop}>
        <S w={52} h={52} r={26} style={{ marginRight: 10 }} />
        
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
             <S w={40} h={12} />
             <S w={60} h={12} />
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
             <S w={60} h={10} />
             <S w={80} h={10} />
          </View>
        </View>

        <S w={85} h={26} r={20} />
      </View>

      {/* Info Row */}
      <View style={styles.skeletonInfoRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <S w={55} h={10} />
            <S w={45} h={12} />
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={{ flex: 1, alignItems: "center" }}>
           <S w={60} h={14} />
        </View>
        <View style={{ width: 1, height: "100%", backgroundColor: colors.border }} />
        <View style={{ flex: 1, alignItems: "center" }}>
           <S w={80} h={14} />
        </View>
      </View>
    </Animated.View>
  );
};

export default OrderSkeleton;

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  skeletonTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  skeletonInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    height: 46,
  },
});
