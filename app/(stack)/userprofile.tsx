// app/(stack)/userprofile.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Mail,
  Phone,
  Camera,
} from "lucide-react-native";
import { useResponsive } from "../../src/utils/useResponsive";
import { useAppVisitorStore } from "../../src/store/auth";
import { useToast } from "../../src/context/ToastContext";
import { useRouter } from "expo-router";

const getInitials = (name?: string | null) => {
  if (!name || !name.trim()) return "U";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
};

const INPUT_HEIGHT = 50;

// ─── Profile Field ────────────────────────────────────────────────────────────
const ProfileField = React.memo(
  ({
    label,
    value,
    placeholder,
    icon: Icon,
    keyboardType = "default",
    autoCapitalize = "none",
    onChange,
    colors,
    font,
  }: {
    label: string;
    value: string;
    placeholder: string;
    icon: any;
    keyboardType?: any;
    autoCapitalize?: any;
    onChange: (v: string) => void;
    colors: any;
    font: (n: number) => number;
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.fieldWrap}>
        <Text
          style={[
            styles.fieldLabel,
            {
              color: focused ? colors.primary : colors.textSecondary,
              fontSize: font(12.5),
            },
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.inputBox,
            {
              height: INPUT_HEIGHT,
              backgroundColor: colors.inputBackground ?? "#F5F5F5",
              borderColor: focused ? colors.primary : colors.border,
              borderWidth: focused ? 1.6 : 1,
            },
          ]}
        >
          <Icon
            size={18}
            color={focused ? colors.primary : colors.textSecondary}
            strokeWidth={1.8}
          />

          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary ?? colors.textSecondary}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.textInput,
              {
                color: colors.text,
                fontSize: font(13.5),
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



// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserProfile() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { font, spacing } = useResponsive();
  const { showToast } = useToast();
  const router = useRouter();

  const userId = useAppVisitorStore((s) => s.userId);
  const userName = useAppVisitorStore((s) => s.userName);
  const userEmail = useAppVisitorStore((s) => s.userEmail);
  const userAvatar = useAppVisitorStore((s) => s.userAvatar);
  const setUser = useAppVisitorStore((s) => s.setUser);

  const [imageError, setImageError] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(userAvatar);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setImageError(false);
    setCurrentAvatar(userAvatar);
  }, [userAvatar]);

  const [form, setForm] = useState({
    fullName: userName || "",
    email: userEmail || "",
    phone: "",
  });

  const setField = useCallback(
    (key: keyof typeof form) => (v: string) =>
      setForm((p) => ({ ...p, [key]: v })),
    [],
  );

  const handlePickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Gallery permission is required to change avatar", "warning");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const pickedUri = result.assets[0].uri;
        setCurrentAvatar(pickedUri);
        setImageError(false);
        showToast("Profile image selected", "info");
      }
    } catch {
      showToast("Unable to select image", "error");
    }
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      showToast("Please enter your full name", "warning");
      return;
    }

    setIsSaving(true);
    try {
      await setUser(
        userId || "user",
        form.fullName.trim(),
        form.email.trim(),
        currentAvatar || undefined,
      );
      showToast("Profile updated successfully!", "success");
      setTimeout(() => {
        router.back();
      }, 500);
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Status Bar & Top Safe Area matching profile.tsx ── */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />

      <AppNavbar title="User Profile" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 48 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom: insets.bottom + 90,
            },
          ]}
        >
          {/* ── Hero Section matching profile.tsx ── */}
          <View style={styles.heroSection}>
            <View style={styles.heroRow}>
              <View style={styles.heroTextCol}>
                <Text
                  style={[styles.greeting, { color: colors.textSecondary }]}
                >
                  Hey there,
                </Text>
                <Text
                  style={[
                    styles.userName,
                    { color: colors.text, fontSize: font(22) },
                  ]}
                  numberOfLines={1}
                >
                  {form.fullName || userName || "Guest User"}
                </Text>
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                >
                  Keep your personal info and account details up to date.
                </Text>
              </View>

              {/* Avatar Ring */}
              <View style={styles.avatarWrap}>
                <View
                  style={[styles.avatarRing, { borderColor: colors.primary }]}
                >
                  {currentAvatar && !imageError ? (
                    <Image
                      source={{ uri: currentAvatar }}
                      onError={() => setImageError(true)}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarFallback,
                        { backgroundColor: colors.primary + "1A" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.initialsText,
                          { color: colors.primary, fontSize: font(22) },
                        ]}
                      >
                        {getInitials(form.fullName || userName || "User")}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Camera Edit Button */}
                <TouchableOpacity
                  onPress={handlePickAvatar}
                  activeOpacity={0.85}
                  style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
                >
                  <Camera size={13} color="#fff" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Section 1: Personal Information ── */}
          <View style={styles.menuSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontSize: font(17) },
              ]}
            >
              Personal Details
            </Text>

            <View style={{ gap: spacing(12) }}>
              <ProfileField
                label="Full Name"
                value={form.fullName}
                placeholder="Enter your full name"
                icon={User}
                autoCapitalize="words"
                onChange={setField("fullName")}
                colors={colors}
                font={font}
              />

              <ProfileField
                label="Email Address"
                value={form.email}
                placeholder="Enter your email"
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                onChange={setField("email")}
                colors={colors}
                font={font}
              />

              <ProfileField
                label="Phone Number"
                value={form.phone}
                placeholder="+91 XXXXX XXXXX"
                icon={Phone}
                keyboardType="phone-pad"
                onChange={setField("phone")}
                colors={colors}
                font={font}
              />
            </View>
          </View>

        </ScrollView>

        {/* ── Footer Action Button ── */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.88}
            style={[
              styles.saveBtn,
              {
                backgroundColor: colors.primary,
                opacity: isSaving ? 0.75 : 1,
              },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.saveBtnText, { fontSize: font(15) }]}>
                Update Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles matching profile.tsx ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  // ── Hero Section (Direct match of profile.tsx) ──────────────────────────────
  heroSection: {
    gap: 12,
    marginTop: 4,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  heroTextCol: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  userName: {
    fontFamily: "Poppins_700Bold",
    lineHeight: 28,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  // ── Avatar (Direct match of profile.tsx) ────────────────────────────────────
  avatarWrap: {
    position: "relative",
  },
  avatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    padding: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: false,
  },
  cameraBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },

  // ── Menu Section (Direct match of profile.tsx) ──────────────────────────────
  menuSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    marginBottom: 6,
  },

  // ── Input Fields ────────────────────────────────────────────────────────────
  fieldWrap: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: "Poppins_500Medium",
    marginLeft: 1,
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
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      ios: {},
    }),
  },



  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
