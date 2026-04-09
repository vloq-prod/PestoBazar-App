import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme";
import { useResponsive } from "../utils/useResponsive";

export default function CartItemSkeleton() {
  const { colors } = useTheme();
  const { spacing, wp } = useResponsive();

  const imageSize = wp(22);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.row, { gap: spacing(12) }]}>
        {/* Image */}
        <View
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              borderRadius: spacing(8),
              backgroundColor: colors.backgroundSkeleton,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Delete */}
          <View style={styles.titleRow}>
            <View
              style={[
                styles.title,
                {
                  backgroundColor: colors.backgroundSkeleton,
                },
              ]}
            />
            <View
              style={[
                styles.deleteIcon,
                {
                  backgroundColor: colors.backgroundSkeleton,
                },
              ]}
            />
          </View>

          {/* Price + Qty */}
          <View style={[styles.bottomRow, { marginTop: spacing(10) }]}>
            {/* Price */}
            <View
              style={[
                styles.price,
                {
                  backgroundColor: colors.backgroundSkeleton,
                },
              ]}
            />

            {/* Qty Stepper */}
            <View style={[styles.qtyContainer, { gap: spacing(8) }]}>
              <View
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: colors.backgroundSkeleton,
                  },
                ]}
              />
              <View
                style={[
                  styles.qtyBox,
                  {
                    backgroundColor: colors.backgroundSkeleton,
                  },
                ]}
              />
              <View
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: colors.backgroundSkeleton,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },

  row: {
    flexDirection: "row",
  },

  image: {},

  content: {
    flex: 1,
    justifyContent: "space-between",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    height: 14,
    width: "70%",
    borderRadius: 6,
  },

  deleteIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    height: 16,
    width: 60,
    borderRadius: 6,
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 20,
  },

  qtyBox: {
    width: 36,
    height: 20,
    borderRadius: 6,
  },
});
