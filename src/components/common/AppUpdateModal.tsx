import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowRight,
  Download,
} from "lucide-react-native";
import { useTheme } from "../../theme";
import type { AppUpdateData } from "../../types/appVersion.types";

interface AppUpdateModalProps {
  visible: boolean;
  data: AppUpdateData | null;
  onDismiss: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  data,
  onDismiss,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // If force update, strictly block Android hardware back button
  useEffect(() => {
    if (!visible || !data?.force_update) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true, // blocks back press
    );

    return () => backHandler.remove();
  }, [visible, data?.force_update]);

  if (!data) return null;

  const handleUpdatePress = async () => {
    if (data.store_url) {
      try {
        const supported = await Linking.canOpenURL(data.store_url);
        if (supported) {
          await Linking.openURL(data.store_url);
        } else {
          const fallbackUrl =
            Platform.OS === "android"
              ? `https://play.google.com/store/apps/details?id=com.pestobazaar.app`
              : `https://apps.apple.com/app/pestobazaar/id6742698947`;
          await Linking.openURL(fallbackUrl);
        }
      } catch (e) {
        Linking.openURL(data.store_url).catch(() => {});
      }
    }
  };

  const isForce = data.force_update;
  const accentColor = isForce ? "#EF4444" : colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        if (data.can_skip) {
          onDismiss();
        }
      }}
    >
      <View style={styles.backdrop}>
        {/* Backdrop tap to dismiss only if skippable */}
        {data.can_skip ? (
          <TouchableOpacity
            style={styles.backdropDismissArea}
            activeOpacity={1}
            onPress={onDismiss}
          />
        ) : (
          <View style={styles.backdropDismissArea} />
        )}

        {/* ─── Bottom Sheet Card ─── */}
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 20) + 10,
            },
          ]}
        >
          {/* Top Drag Handle Indicator */}
          <View style={styles.dragHandleWrapper}>
            <View
              style={[styles.dragHandle, { backgroundColor: colors.border }]}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >


            {/* Title & Subtitle */}
            <View style={styles.headerBlock}>
              <Text style={[styles.mainTitle, { color: colors.text }]}>
                {data.title || (isForce ? "Update Required" : "Update Available")}
              </Text>
              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                {isForce
                  ? "To continue using Pestobazaar, please update to the latest version."
                  : "A newer and smoother version of Pestobazaar is ready for you."}
              </Text>
            </View>

            {/* Version Comparison Card */}
            <View
              style={[
                styles.versionCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.versionCol}>
                <Text
                  style={[styles.versionLabel, { color: colors.textSecondary }]}
                >
                  Installed
                </Text>
                <Text style={[styles.versionValue, { color: colors.textSecondary }]}>
                  v{data.current_version || "1.0.0"} ({data.current_build_number})
                </Text>
              </View>

              <View
                style={[
                  styles.versionArrowBg,
                  { backgroundColor: accentColor + "14" },
                ]}
              >
                <ArrowRight size={15} color={accentColor} />
              </View>

              <View style={styles.versionCol}>
                <Text style={[styles.versionLabel, { color: accentColor }]}>
                  Latest
                </Text>
                <Text style={[styles.versionValue, { color: accentColor }]}>
                  v{data.latest_version} ({data.latest_build_number})
                </Text>
              </View>
            </View>

            {/* Release Note / Message */}
            {!!data.update_message && (
              <View
                style={[
                  styles.messageCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.messageHeading, { color: colors.text }]}
                >
                  What's new:
                </Text>
                <Text
                  style={[styles.messageBody, { color: colors.textSecondary }]}
                >
                  {data.update_message}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: accentColor,
                    shadowColor: accentColor,
                  },
                ]}
                onPress={handleUpdatePress}
                activeOpacity={0.85}
              >
                <Download size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {isForce ? "Update to Continue" : "Update Now"}
                </Text>
              </TouchableOpacity>

              {data.can_skip && data.show_later_button && (
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.skipBtnText, { color: colors.textSecondary }]}
                  >
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end", // Bottom anchor
  },
  backdropDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 25,
  },
  dragHandleWrapper: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 4,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 4,
  },

  headerBlock: {
    marginTop: 8,
    marginBottom: 18,
    gap: 4,
  },
  mainTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    lineHeight: 26,
  },
  subTitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  versionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  versionCol: {
    gap: 2,
  },
  versionLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  versionValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  versionArrowBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  messageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
    gap: 4,
  },
  messageHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12.5,
  },
  messageBody: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  actionContainer: {
    gap: 10,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14.5,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipBtnText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
});
