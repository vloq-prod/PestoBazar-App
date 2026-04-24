import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import { X, MessageSquare, Check, Send } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

type OtpChannel = "sms" | "whatsapp" | "both";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: OtpChannel) => void;
};

type Selection = { sms: boolean; wa: boolean };

const ResendOtpModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const [sel, setSel] = useState<Selection>({ sms: true, wa: false });

  const toggle = (key: "sms" | "wa") => {
    setSel((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // at least one must be selected
      if (!next.sms && !next.wa) return prev;
      return next;
    });
  };

  const getChannel = (): OtpChannel => {
    if (sel.sms && sel.wa) return "both";
    if (sel.wa) return "whatsapp";
    return "sms";
  };

  const handleSend = () => {
    onSelect(getChannel());
  };

  const isBoth = sel.sms && sel.wa;
  const btnBg = isBoth ? colors.primary : sel.wa ? "#25D366" : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background ?? "#ffffff", paddingBottom: spacing(36) },
          ]}
        >
          {/* Pull Bar */}
          <View style={styles.pullBarContainer}>
            <View style={styles.pullBar} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { fontSize: font(18), color: colors.text }]}>
              Resend OTP
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize: font(13.5),
                color: colors.textSecondary,
                marginBottom: spacing(24),
              },
            ]}
          >
            How would you like to receive
            your verification code?
          </Text>

          {/* Cards */}
          <View style={[styles.row, { gap: spacing(14) }]}>
            {/* SMS Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggle("sms")}
              style={[
                styles.card,
                {
                  borderColor: sel.sms ? colors.primary : colors.border + "80",
                  borderWidth: sel.sms ? 1.5 : 1,
                  backgroundColor: sel.sms ? colors.primary + "0A" : colors.surface,
                  padding: spacing(16),
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + "1A" }]}>
                  <MessageSquare size={22} color={colors.primary} strokeWidth={2} />
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: sel.sms ? colors.primary : "transparent",
                      borderColor: sel.sms ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {sel.sms && <Check size={12} color="#FFF" strokeWidth={3} />}
                </View>
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  { color: colors.text, fontSize: font(15), marginTop: spacing(16) },
                ]}
              >
                SMS
              </Text>
              <Text
                style={[
                  styles.cardSub,
                  { color: colors.textSecondary, fontSize: font(12.5), marginTop: spacing(2) },
                ]}
              >
                Standard Text
              </Text>
            </TouchableOpacity>

            {/* WhatsApp Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggle("wa")}
              style={[
                styles.card,
                {
                  borderColor: sel.wa ? "#25D366" : colors.border + "80",
                  borderWidth: sel.wa ? 1.5 : 1,
                  backgroundColor: sel.wa ? "#25D3660A" : colors.surface,
                  padding: spacing(16),
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconCircle, { backgroundColor: "#25D3661A" }]}>
                  <MaterialCommunityIcons name="whatsapp" size={26} color="#25D366" />
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: sel.wa ? "#25D366" : "transparent",
                      borderColor: sel.wa ? "#25D366" : colors.border,
                    },
                  ]}
                >
                  {sel.wa && <Check size={12} color="#FFF" strokeWidth={3} />}
                </View>
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  { color: colors.text, fontSize: font(15), marginTop: spacing(16) },
                ]}
              >
                WhatsApp
              </Text>
              <Text
                style={[
                  styles.cardSub,
                  { color: colors.textSecondary, fontSize: font(12.5), marginTop: spacing(2) },
                ]}
              >
                Instant Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Both Info Text */}
          {isBoth && (
            <View style={{ alignItems: "center", marginTop: spacing(16) }}>
              <Text
                style={{
                  fontSize: font(12.5),
                  color: colors.textSecondary,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Code will be sent via both channels
              </Text>
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSend}
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.primary,
                marginTop: spacing(isBoth ? 12 : 28),
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
          >
            <Send size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={[styles.sendBtnText, { fontSize: font(15.5) }]}>
              Send OTP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pullBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
  },
  pullBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Poppins_700Bold",
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
  },
  card: {
    flex: 1,
    borderRadius: 20,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardLabel: {
    fontFamily: "Poppins_600SemiBold",
  },
  cardSub: {
    fontFamily: "Poppins_400Regular",
  },
  sendBtn: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.5,
  },
});

export default ResendOtpModal;
