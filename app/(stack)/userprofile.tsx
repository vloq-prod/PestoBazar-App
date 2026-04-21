// app/userprofile.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { Image } from "expo-image";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
} from "lucide-react-native";
import { useResponsive } from "../../src/utils/useResponsive";

// ─── Field config ─────────────────────────────────────────────────────────────
const FIELDS = [
  {
    key: "fullName",
    label: "Full Name",
    placeholder: "Enter your full name",
    icon: User,
    keyboardType: "default" as const,
    autoCapitalize: "words" as const,
  },
  {
    key: "email",
    label: "Email Address",
    placeholder: "you@email.com",
    icon: Mail,
    keyboardType: "email-address" as const,
    autoCapitalize: "none" as const,
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "+91 XXXXX XXXXX",
    icon: Phone,
    keyboardType: "phone-pad" as const,
    autoCapitalize: "none" as const,
  },
];

// ─── Consistent cross-platform input height ───────────────────────────────────
// iOS: no default height, relies on paddingVertical → can be smaller
// Android: has system padding + includeFontPadding adds extra line spacing
// Fix: explicit INPUT_HEIGHT + includeFontPadding:false + textAlignVertical:center
const INPUT_HEIGHT = 52;

// ─── Single Field ─────────────────────────────────────────────────────────────
const ProfileField = React.memo(
  ({
    field,
    value,
    onChange,
    colors,
    font,
  }: {
    field: (typeof FIELDS)[0];
    value: string;
    onChange: (v: string) => void;
    colors: any;
    font: (n: number) => number;
  }) => {
    const [focused, setFocused] = useState(false);
    const Icon = field.icon;

    return (
      <View style={styles.fieldWrap}>
        {/* Label */}
        <Text
          style={[
            styles.fieldLabel,
            {
              color: focused ? colors.primary : colors.textSecondary,
              fontSize: font(11),
            },
          ]}
        >
          {field.label}
        </Text>

        {/* Input box — border on ALL 4 sides */}
        <View
          style={[
            styles.inputBox,
            {
              height: INPUT_HEIGHT,
              backgroundColor: colors.inputBackground ?? colors.surface,
              borderColor: focused ? colors.primary : colors.border,
              borderWidth: focused ? 1.8 : 1.2,
            },
          ]}
        >
          <Icon
            size={17}
            color={focused ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
          />

          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.textInput,
              {
                color: colors.text,
                fontSize: font(14),
                // ── Cross-platform fix ──────────────────────────
                // Android adds extra padding via includeFontPadding
                // textAlignVertical centers text inside explicit height
                height: INPUT_HEIGHT,
                textAlignVertical: "center",
              },
            ]}
          />
        </View>
      </View>
    );
  },
);
ProfileField.displayName = "ProfileField";

// ─── Password Field (separate — has toggle) ────────────────────────────────────
const PasswordField = React.memo(
  ({ colors, font }: { colors: any; font: (n: number) => number }) => {
    const [focused, setFocused] = useState(false);
    const [show, setShow] = useState(false);

    return (
      <View style={styles.fieldWrap}>
        <Text
          style={[
            styles.fieldLabel,
            {
              color: focused ? colors.primary : colors.textSecondary,
              fontSize: font(11),
            },
          ]}
        >
          Password
        </Text>

        <View
          style={[
            styles.inputBox,
            {
              height: INPUT_HEIGHT,
              backgroundColor: colors.inputBackground ?? colors.surface,
              borderColor: focused ? colors.primary : colors.border,
              borderWidth: focused ? 1.8 : 1.2,
            },
          ]}
        >
          <Lock
            size={17}
            color={focused ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
          />

          <TextInput
            placeholder="Enter new password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!show}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.textInput,
              {
                color: colors.text,
                fontSize: font(14),
                height: INPUT_HEIGHT,
                textAlignVertical: "center",
              },
            ]}
          />

          <TouchableOpacity
            onPress={() => setShow((p) => !p)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {show ? (
              <EyeOff
                size={17}
                color={colors.textSecondary}
                strokeWidth={1.8}
              />
            ) : (
              <Eye size={17} color={colors.textSecondary} strokeWidth={1.8} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);
PasswordField.displayName = "PasswordField";

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function UserProfile() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();

  const [form, setForm] = useState({
    fullName: "Guest User",
    email: "guestuser@gmail.com",
    phone: "",
  });

  const setField = useCallback(
    (key: keyof typeof form) => (v: string) =>
      setForm((p) => ({ ...p, [key]: v })),
    [],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "height" : undefined}
      // 👈 important
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle={"dark-content"} />

      <View style={{ height: insets.top }} />
      <AppNavbar title="User Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing(16),
          paddingBottom: spacing(24),
          gap: spacing(24),
        }}
      >
        {/* ── Avatar section ──────────────────────────────── */}
        <View style={styles.avatarSection}>
          {/* Subtle ring + shadow */}
          <View
            style={[styles.avatarOuter, { borderColor: colors.primary + "40" }]}
          >
            <View style={[styles.avatarInner, { borderColor: colors.primary }]}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
            >
              <Camera size={13} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Camera button */}

          {/* Name + email below avatar */}
          <Text
            style={[
              styles.avatarName,
              { color: colors.text, fontSize: font(18) },
            ]}
          >
            {form.fullName || "Your Name"}
          </Text>
          <Text
            style={[
              styles.avatarEmail,
              { color: colors.textSecondary, fontSize: font(12) },
            ]}
          >
            {form.email || "your@email.com"}
          </Text>
        </View>

        {/* ── Fields ──────────────────────────────────────── */}
        <View style={{ gap: spacing(14) }}>
          {FIELDS.map((f) => (
            <ProfileField
              key={f.key}
              field={f}
              value={form[f.key as keyof typeof form]}
              onChange={setField(f.key as keyof typeof form)}
              colors={colors}
              font={font}
            />
          ))}

          <PasswordField colors={colors} font={font} />
        </View>
      </ScrollView>

      {/* ── Footer ──────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.saveBtnText, { fontSize: font(15) }]}>
            Update Profile
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarSection: {
    alignItems: "center",
    paddingTop: 10,
    gap: 6,
  },
  avatarOuter: {
    position: "relative",
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,

    padding: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    zIndex: 2,
  },
  avatarName: {
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
  },
  avatarEmail: {
    fontFamily: "Poppins_400Regular",
  },

  // ── Section heading ─────────────────────────────────────────────────────────
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionHead: {
    fontFamily: "Poppins_600SemiBold",
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  // ── Field ────────────────────────────────────────────────────────────────────
  fieldWrap: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: "Poppins_500Medium",
    marginLeft: 2,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    // 4-side border via borderWidth above
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    // ── Critical cross-platform fixes ──────────────────
    paddingVertical: 0, // remove default iOS/Android padding
    // Android-only: kills the extra line-height padding inside TextInput
    // that makes it taller than iOS at the same fontSize
    ...Platform.select({
      android: { includeFontPadding: false },
      ios: {},
    }),
  },

  // ── Info note ────────────────────────────────────────────────────────────────
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoNoteText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
