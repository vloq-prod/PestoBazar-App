import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { FileText, ChevronRight } from "lucide-react-native";

const DocumentButtons = ({ onPressMSDS, onPressDFU }: any) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  return (
    <View style={[styles.container, { marginHorizontal: spacing(16) }]}>
      {/* MSDS */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.button,
          {
            paddingVertical: spacing(10),
            paddingHorizontal: spacing(10),
            borderRadius: spacing(10),
            borderColor: colors.border,
          },
        ]}
        onPress={onPressMSDS}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            {/* 🔥 Improved Icon */}
            <View
              style={{
                width: spacing(36),
                height: spacing(36),
                borderRadius: spacing(18),
                backgroundColor: colors.backgroundgray,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={spacing(16)} color={colors.textSecondary} />
            </View>

            <View>
              <Text
                style={{
                  fontSize: font(13),
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                MSDS
              </Text>
              <Text
                style={{
                  fontSize: font(10),
                  color: colors.textSecondary,
                }}
              >
                Safety Sheet
              </Text>
            </View>
          </View>

          <ChevronRight size={spacing(15)} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* DFU */}
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.button,
          {
            paddingVertical: spacing(10),
            paddingHorizontal: spacing(10),
            borderRadius: spacing(10),
            borderColor: colors.border,
          },
        ]}
        onPress={onPressDFU}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            {/* 🔥 Improved Icon */}
            <View
              style={{
                width: spacing(36),
                height: spacing(36),
                borderRadius: spacing(18),
                backgroundColor: colors.backgroundgray,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={spacing(16)} color={colors.textSecondary} />
            </View>

            <View>
              <Text
                style={{
                  fontSize: font(13),
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                DFU
              </Text>
              <Text
                style={{
                  fontSize: font(10),
                  color: colors.textSecondary,
                }}
              >
                Usage Guide
              </Text>
            </View>
          </View>

          <ChevronRight size={spacing(15)} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default DocumentButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // 🔼 slightly improved spacing
  },
});
