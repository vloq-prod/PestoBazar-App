// ProfileScreen.tsx
import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";

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
} from "lucide-react-native";
import { useRouter } from "expo-router";

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
      },
      {
        id: "wishlist",
        label: "Wishlist",
        sub: "Your saved items",
        icon: Heart,
      },
      {
        id: "cart",
        label: "Cart",
        sub: "Review your cart",
        icon: ShoppingCart,
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
      },
      {
        id: "shipping",
        label: "Shipping & Cancellation",
        sub: "Delivery and cancellation info",
        icon: Package,
      },
      {
        id: "returns",
        label: "Return & Refund",
        sub: "Refund and return policy",
        icon: RotateCcw,
      },
      {
        id: "privacy",
        label: "Privacy Policy",
        sub: "How we use your data",
        icon: Lock,
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
const MenuRow = ({ item, colors, isLast }: any) => {
  const router = useRouter();
  const Icon = item.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (item.route) {
          router.push(item.route);
        }
      }}
      style={[
        styles.menuRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Icon size={18} color={colors.primary} />

      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>
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

  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />

      <StatusBar barStyle={"dark-content"} />

      <AppNavbar
        title="Profile"
        showBack
        showCart
        showNotification
        showThemeToggle
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 60, // 👈 MAIN FIX
          },
        ]}
      >
        {/* ── Hero ───────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Hey there,
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                Arfat Sheru
              </Text>
            </View>

            <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatarImage}
              />
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Easily manage your account, track your orders, and keep your
            personal details up to date with ease.
          </Text>
        </View>

        {/* ── Account Info ───────────────────────── */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.inputRow}>
            <Mail size={16} color={colors.primary} />
            <Text style={[styles.inputText, { color: colors.text }]}>
              arfatsheru74@gmail.com
            </Text>
            <SquarePen size={16} color={colors.primary} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.inputRow}>
            <Phone size={16} color={colors.primary} />
            <Text style={[styles.inputText, { color: colors.textSecondary }]}>
              Not added yet
            </Text>
            <SquarePen size={16} color={colors.primary} />
          </View>
        </View>

        {/* ── Menu Sections ───────────────────────── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {section.title}
            </Text>

            <View>
              {section.items.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  colors={colors}
                  isLast={index === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            Pestobazaar
          </Text>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
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
    fontSize: 26,
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
});
