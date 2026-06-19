// ProfileScreen.tsx
import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";

import { Image } from "expo-image";
import {
  Mail,
  Phone,
  SquarePen,
  ChevronRight,
  User,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  HelpCircle,
  RotateCcw,
  FileText,
  Lock,
  Share2,
  Info,
  LogOut,
  MoveRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppVisitorStore } from "../../src/store/auth";

const MENU_SECTIONS = [
  {
    title: "My Account",
    items: [
      {
        id: "profile",
        label: "User Profile",
        sub: "Edit your personal info",
        icon: User,
        route: "/userprofile",
      },
      {
        id: "orders",
        label: "My Orders",
        sub: "Track & manage orders",
        icon: Package,
        route: "/order",
      },
      {
        id: "wishlist",
        label: "Wishlist",
        sub: "Your saved items",
        icon: Heart,
        // route: "/ordersuccess"
      },
      {
        id: "cart",
        label: "Cart",
        sub: "Review your cart",
        icon: ShoppingCart,
        route: "/cart",
      },
      {
        id: "address",
        label: "Address Book",
        sub: "Manage delivery addresses",
        icon: MapPin,
        route: "/address",
      },
    ],
  },
  {
    title: "Customer Policies",
    items: [
      {
        id: "faq",
        label: "FAQ",
        sub: "Frequently asked questions",
        icon: HelpCircle,
      },
      {
        id: "terms",
        label: "Terms & Conditions",
        sub: "Read terms of service",
        icon: FileText,
        route: "/terms"
      },
      {
        id: "shipping",
        label: "Shipping & Cancellation",
        sub: "Delivery and cancellation info",
        icon: Package,
        route: "/shipping"
      },
      {
        id: "returns",
        label: "Return & Refund",
        sub: "Refund and return policy",
        icon: RotateCcw,
        route: "/returns"
      },
      {
        id: "privacy",
        label: "Privacy Policy",
        sub: "How we use your data",
        icon: Lock,
        route: "/privacy"
      },
    ],
  },

  {
    title: "Other Information",
    items: [
      {
        id: "share",
        label: "Share the App",
        sub: "Invite others to use the app",
        icon: Share2,
      },
      {
        id: "about",
        label: "About Us",
        sub: "Learn more about our company",
        icon: Info,
        route: "/about"
      },
      {
        id: "logout",
        label: "Logout",
        sub: "Sign out from your account",
        icon: LogOut,
      },
    ],
  },
];

// ── Menu Row Component ─────────────────────────
const MenuRow = ({ item, colors, isLast, onPressOverride }: any) => {
  const router = useRouter();
  const Icon = item.icon;

  const handlePress = () => {
    if (onPressOverride) {
      onPressOverride();
      return;
    }

    if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.menuRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Icon
        size={18}
        color={item.id === "logout" ? "#ef4444" : colors.primary} // 👈 RED ICON
      />

      <View style={styles.menuText}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: item.id === "logout" ? "#ef4444" : colors.text, // 👈 RED TEXT
            },
          ]}
        >
          {item.label}
        </Text>

        <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
          {item.sub}
        </Text>
      </View>

      <ChevronRight size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

// ── Screen ─────────────────────────────────────
export default function ProfileScreen() {
  const { colors } = useTheme();

  const router = useRouter();

  const userId = useAppVisitorStore((s) => s.userId);
  const userName = useAppVisitorStore((s) => s.userName);
  const userAvatar = useAppVisitorStore((s) => s.userAvatar);

  const logout = useAppVisitorStore((s) => s.logout);

  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
    router.replace("/login");
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />

      <StatusBar barStyle={"dark-content"} />

      <AppNavbar title="Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 60,
          },
        ]}
      >
        {/* ── Hero ───────────────────────────────── */}
        <View style={styles.heroSection}>
          <>
            <View style={styles.heroRow}>
              <View>
                <Text
                  style={[styles.greeting, { color: colors.textSecondary }]}
                >
                  Hey there,
                </Text>
                <Text
                  style={[
                    styles.userName,
                    { color: colors.text, fontSize: userId ? 23 : 18 },
                  ]}
                >
                  {userName || "Guest User"}
                </Text>
              </View>

              <View
                style={[styles.avatarRing, { borderColor: colors.primary }]}
              >
                <Image
                  source={
                    userAvatar
                      ? { uri: userAvatar }
                      : require("../../assets/profile.jpeg")
                  }
                  style={styles.avatarImage}
                />
              </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Easily manage your account, track your orders, and keep your
              personal details up to date with ease.
            </Text>

            {!userId && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/login")}
                style={{ marginTop: 2, flexDirection: "row", alignItems: "center", gap: 4 }}

              >

                <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>

                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  Login / Signup
                  
                </Text>

              <MoveRight size={22} color={colors.primary} />
                </View>

                <View  style={{height: 1,flex:1, backgroundColor: colors.textSecondary,}}/>
              </TouchableOpacity>
            )}
          </>
        </View>

        {/* ── Account Info ───────────────────────── */}
        {/* Hiding Account Info since we don't have email/phone in the store yet */}
        {/*
          {userId ? (
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <View style={styles.inputRow}>
                <Phone size={16} color={colors.primary} />
                <Text style={[styles.inputText, { color: colors.textSecondary }]}>
                  +91 XXXXXXXXXX
                </Text>
                <SquarePen size={16} color={colors.primary} />
              </View>
            </View>
          ) : null}
          */}

        {/* ── Menu Sections ───────────────────────── */}
        {MENU_SECTIONS.map((section) => {
          const items = section.items.filter((item) => {
            if (!userId && (item.id === "logout" || item.id === "profile"))
              return false;
            return true;
          });

          if (items.length === 0) return null;

          return (
            <View key={section.title} style={styles.menuSection}>
              <Text
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                {section.title}
              </Text>

              <View>
                {items.map((item, index) => {
                  let onPressOverride;

                  if (item.id === "logout") {
                    onPressOverride = handleLogout;
                  } else if (
                    !userId &&
                    ["orders", "wishlist", "address"].includes(item.id)
                  ) {
                    onPressOverride = () => router.push("/login");
                  }

                  return (
                    <MenuRow
                      key={item.id}
                      item={item}
                      colors={colors}
                      isLast={index === items.length - 1}
                      onPressOverride={onPressOverride}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            Pestobazaar
          </Text>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Logout"
        description="Are you sure you want to logout from your account?"
        confirmText="Logout"
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
    paddingTop: 8,
  },

  heroSection: { gap: 12 },

  infoCard: {
    borderRadius: 16,
    padding: 12,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  inputText: {
    flex: 1,
    fontSize: 14,
  },

  divider: {
    height: 1,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },

  userName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 23,
    lineHeight: 30,
  },

  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 18,
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

  menuSection: {
    marginTop: 12,
  },

  sectionTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    marginBottom: 6,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },

  menuText: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },

  menuSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginTop: 2,
  },

  footer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingTop: 10,
  },

  appName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 25,
    opacity: 0.3,
  },

  versionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,

    opacity: 0.3,
  },

  guestCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  guestCardContent: {
    gap: 8,
  },
  guestTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
  },
  guestSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  loginBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  loginBtnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});
