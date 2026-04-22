import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { MessageCircle, Send, Bot, User, Phone, Mail } from "lucide-react-native";

const WHATSAPP_NUMBER = "919876543210";
const WHATSAPP_MESSAGE = "Hi! I'm interested in bulk orders.";
const INPUT_HEIGHT = 50;

// ─── Animated Chat Bubble ─────────────────────────────────────
const ChatBubble = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flexDirection: "row", alignItems: "flex-end", gap: 8 }, style]}>
      <View style={styles.botAvatar}>
        <Bot size={14} color="#fff" strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Animated.View>
  );
};

// ─── Bot Bubble UI ────────────────────────────────────────────
const BotBubble = ({
  text, colors, font, spacing,
}: {
  text: string; colors: any; font: (n: number) => number; spacing: (n: number) => number;
}) => (
  <View
    style={[styles.bubble, {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderBottomLeftRadius: 4,
      alignSelf: "flex-start",
      maxWidth: "85%",
      paddingHorizontal: spacing(14),
      paddingVertical: spacing(11),
    }]}
  >
    <Text style={{ fontSize: font(14), color: colors.text, fontFamily: "Poppins_400Regular", lineHeight: font(21) }}>
      {text}
    </Text>
  </View>
);

// ─── Field with Icon (UserProfile style) ─────────────────────
const FormField = ({
  label, placeholder, icon: Icon, value, onChange,
  keyboardType = "default", autoCapitalize = "sentences",
  optional = false, multiline = false, numberOfLines = 1,
  colors, font,
}: any) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 5 }}>
      {/* Label */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(11),
          color: focused ? colors.primary : colors.textSecondary,
          marginLeft: 2,
        }}>
          {label}
        </Text>
        {optional && (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(10), color: colors.textTertiary }}>
            (optional)
          </Text>
        )}
      </View>

      {/* Input box */}
      <View style={[
        styles.inputBox,
        {
          height: multiline ? undefined : INPUT_HEIGHT,
          minHeight: multiline ? INPUT_HEIGHT * 1.6 : undefined,
          backgroundColor: colors.background,
          borderColor: focused ? colors.primary : colors.border,
          borderWidth: focused ? 1.8 : 1.2,
          alignItems: multiline ? "flex-start" : "center",
          paddingVertical: multiline ? 12 : 0,
        },
      ]}>
        {/* Icon — only if provided */}
        {Icon && (
          <Icon
            size={17}
            color={focused ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
            style={{ marginTop: multiline ? 2 : 0, flexShrink: 0 }}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          style={[
            styles.textInput,
            {
              height: multiline ? undefined : INPUT_HEIGHT,
              color: colors.text,
              fontSize: font(13),
              fontFamily: "Poppins_400Regular",
              textAlignVertical: multiline ? "top" : "center",
              paddingVertical: multiline ? 0 : 0,
              ...Platform.select({ android: { includeFontPadding: false }, ios: {} }),
            },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────
export default function BulkOrder() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ name: "", mobile: "", email: "", product: "" });
  const setField = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`);
  };

  const handleGetQuote = () => {
    setShowForm(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350);
  };

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.product) return;
    setSubmitted(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const msgOpacity = useSharedValue(0);
  const msgY = useSharedValue(16);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(20);

  useEffect(() => {
    if (showForm) {
      msgOpacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
      msgY.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) });
      formOpacity.value = withDelay(450, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
      formY.value = withDelay(450, withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }));
    }
  }, [showForm]);

  const msgStyle = useAnimatedStyle(() => ({ opacity: msgOpacity.value, transform: [{ translateY: msgY.value }] }));
  const formStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value, transform: [{ translateY: formY.value }] }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" />
      <View style={{ height: insets.top, backgroundColor: colors.background }} />
      <AppNavbar title="Bulk Orders" showBack />

      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: spacing(16),
            gap: spacing(14),
            paddingBottom: insets.bottom + spacing(24),
          }}
        >
          {/* ── Msg 1 ── */}
          <ChatBubble delay={200}>
            <BotBubble text="Hi 👋 Looking for bulk orders?" colors={colors} font={font} spacing={spacing} />
          </ChatBubble>

          {/* ── Msg 2 ── */}
          <ChatBubble delay={700}>
            <BotBubble text="I can help you get the best pricing." colors={colors} font={font} spacing={spacing} />
          </ChatBubble>

          {/* ── Action Buttons — same row ── */}
          <ChatBubble delay={1200}>
            <View style={{ flexDirection: "row", gap: spacing(10), marginTop: spacing(4) }}>
              {/* Get Quote */}
              {!showForm && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleGetQuote}
                  style={[styles.actionBtn, {
                    flex: 1,
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }]}
                >
                  <Send size={spacing(15)} color="#fff" strokeWidth={2} />
                  <Text style={[styles.actionBtnText, { fontSize: font(13) }]}>Get Quote</Text>
                </TouchableOpacity>
              )}

              {/* WhatsApp */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleWhatsApp}
                style={[styles.actionBtn, {
                  flex: showForm ? undefined : 1,
                  paddingHorizontal: showForm ? spacing(20) : undefined,
                  backgroundColor: colors.success,
                  shadowColor: colors.success,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }]}
              >
                <MessageCircle size={spacing(15)} color="#fff" strokeWidth={2} fill="#fff" />
                <Text style={[styles.actionBtnText, { fontSize: font(13) }]}>
                  {showForm ? "WhatsApp" : "WhatsApp"}
                </Text>
              </TouchableOpacity>
            </View>
          </ChatBubble>

          {/* ── Form header message ── */}
          {showForm && !submitted && (
            <Animated.View style={[{ flexDirection: "row", alignItems: "flex-end", gap: 8 }, msgStyle]}>
              <View style={styles.botAvatar}>
                <Bot size={14} color="#fff" strokeWidth={2} />
              </View>
              <View style={[styles.bubble, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderBottomLeftRadius: 4,
                alignSelf: "flex-start",
                maxWidth: "85%",
                paddingHorizontal: spacing(14),
                paddingVertical: spacing(11),
              }]}>
                <Text style={{ fontSize: font(14), color: colors.text, fontFamily: "Poppins_400Regular", lineHeight: font(21) }}>
                  Just a few details and we&apos;ll take it from here 👇
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Form card ── */}
          {showForm && !submitted && (
            <Animated.View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }, formStyle]}>
              <View style={{ gap: spacing(14) }}>
                <FormField
                  label="Your Name"
                  placeholder="Enter your full name"
                  icon={User}
                  value={form.name}
                  onChange={setField("name")}
                  autoCapitalize="words"
                  colors={colors}
                  font={font}
                />
                <FormField
                  label="Mobile Number"
                  placeholder="+91 XXXXX XXXXX"
                  icon={Phone}
                  value={form.mobile}
                  onChange={setField("mobile")}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  colors={colors}
                  font={font}
                />
                <FormField
                  label="Email"
                  placeholder="you@email.com"
                  icon={Mail}
                  value={form.email}
                  onChange={setField("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  optional
                  colors={colors}
                  font={font}
                />
                {/* Product — no icon, multiline */}
                <FormField
                  label="Product Name"
                  placeholder="Describe the product and quantity..."
                  value={form.product}
                  onChange={setField("product")}
                  multiline
                  numberOfLines={3}
                  colors={colors}
                  font={font}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  style={[styles.submitBtn, {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 4,
                  }]}
                >
                  <Send size={spacing(15)} color="#fff" strokeWidth={2} />
                  <Text style={[styles.submitBtnText, { fontSize: font(14) }]}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* ── Success ── */}
          {submitted && (
            <ChatBubble delay={0}>
              <BotBubble
                text={`Thanks, ${form.name || "there"}! 🎉 We've received your request and will get back to you shortly with the best pricing.`}
                colors={colors}
                font={font}
                spacing={spacing}
              />
            </ChatBubble>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#5f16e9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: { borderRadius: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});