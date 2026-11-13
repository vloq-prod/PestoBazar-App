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
  Share,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { ConfirmationModal } from "../../src/components/comman/ConfirmationModal";
import { UNIVERSAL_LINK_BASE_URL } from "../../src/deep-linking/constants/schemes";
import {
  getAppBuildDetails,
  checkAppUpdateApi,
} from "../../src/api/appVersion.api";
import { deleteAccountApi } from "../../src/api/auth.api";
import { useAppUpdate } from "../../src/providers/AppUpdateProvider";
import { useToast } from "../../src/context/ToastContext";

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
  Trash2,
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
        route: "/wishlist",
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
        route: "/faq",
      },
      {
        id: "terms",
        label: "Terms & Conditions",
        sub: "Read terms of service",
        icon: FileText,
        route: "/terms",
      },
      {
        id: "shipping",
        label: "Shipping & Cancellation",
        sub: "Delivery and cancellation info",
        icon: Package,
        route: "/shipping",
      },
      {
        id: "returns",
        label: "Return & Refund",
        sub: "Refund and return policy",
        icon: RotateCcw,
        route: "/returns",
      },
      {
        id: "privacy",
        label: "Privacy Policy",
        sub: "How we use your data",
        icon: Lock,
        route: "/privacy",
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
        route: "/about",
      },
      {
        id: "delete_account",
        label: "Delete Account",
        sub: "Permanently delete your account",
        icon: Trash2,
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

  const isDestructive = item.id === "logout" || item.id === "delete_account";

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
        color={isDestructive ? "#ef4444" : colors.primary} // 👈 RED ICON FOR DESTRUCTIVE
      />

      <View style={styles.menuText}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: isDestructive ? "#ef4444" : colors.text, // 👈 RED TEXT FOR DESTRUCTIVE
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

const getInitials = (name?: string | null) => {
  if (!name || !name.trim()) return "G";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
};

// ── Screen ─────────────────────────────────────
export default function ProfileScreen() {
  const { colors } = useTheme();

  const router = useRouter();

  const userId = useAppVisitorStore((s) => s.userId);
  const userName = useAppVisitorStore((s) => s.userName);
  const userAvatar = useAppVisitorStore((s) => s.userAvatar);

  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [userAvatar]);

  const logout = useAppVisitorStore((s) => s.logout);

  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
    router.replace("/login");
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (!userId || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await deleteAccountApi(userId);
      if (res?.status === 1 || res?.status === "1") {
        showToast("Your account has been deleted successfully", "success");
        await logout();
        setDeleteModalVisible(false);
        router.replace("/login");
      } else {
        showToast(
          res?.message || "Failed to delete account. Please try again.",
          "error"
        );
        setDeleteModalVisible(false);
      }
    } catch (error: any) {
      console.error("Delete account error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete account. Please try again.";
      showToast(errorMsg, "error");
      setDeleteModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const appBuild = React.useMemo(() => getAppBuildDetails(), []);
  const { checkForUpdates } = useAppUpdate();
  const { showToast } = useToast();
  const [checkingUpdate, setCheckingUpdate] = React.useState(false);

  const handleCheckUpdate = async () => {
    if (checkingUpdate) return;
    setCheckingUpdate(true);
    try {
      const res = await checkAppUpdateApi();
      if (res?.status && res?.data?.update_available) {
        await checkForUpdates(true);
      } else {
        showToast("App is up to date", "info");
      }
    } catch {
      showToast("Unable to check for updates", "error");
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out Pestobazaar! Order premium pest control products and services instantly: ${UNIVERSAL_LINK_BASE_URL}`,
      });
    } catch (error) {
      // share cancelled or failed
    }
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
            paddingBottom: insets.bottom + 95,
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

              {userAvatar && !imageError ? (
                <View
                  style={[styles.avatarRing, { borderColor: colors.primary }]}
                >
                  <Image
                    source={{ uri: userAvatar }}
                    onError={() => setImageError(true)}
                    style={styles.avatarImage}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.avatarRing,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + "1A",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: 22,
                      color: colors.primary,
                      includeFontPadding: false,
                    }}
                  >
                    {getInitials(userName || (userId ? "User" : "Guest User"))}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Easily manage your account, track your orders, and keep your
              personal details up to date with ease.
            </Text>

            {!userId && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/login")}
                style={{
                  marginTop: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
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

                <View
                  style={{
                    height: 1,
                    flex: 1,
                    backgroundColor: colors.textSecondary,
                  }}
                />
              </TouchableOpacity>
            )}
          </>
        </View>

        {/* ── Menu Sections ───────────────────────── */}
        {MENU_SECTIONS.map((section) => {
          const items = section.items.filter((item) => {
            if (
              !userId &&
              (item.id === "logout" ||
                item.id === "profile" ||
                item.id === "delete_account")
            )
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
                  } else if (item.id === "delete_account") {
                    onPressOverride = handleDeleteAccount;
                  } else if (item.id === "share") {
                    onPressOverride = handleShare;
                  } else if (
                    !userId &&
                    ["orders", "address"].includes(item.id)
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

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCheckUpdate}
            disabled={checkingUpdate}
            style={styles.versionContainer}
          >
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Version {appBuild.versionName}
            </Text>
            {checkingUpdate && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>
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

      <ConfirmationModal
        visible={deleteModalVisible}
        onClose={() => !isDeleting && setDeleteModalVisible(false)}
        onConfirm={confirmDeleteAccount}
        isLoading={isDeleting}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? All your personal information will be permanently removed. This action cannot be undone."
        confirmText="Permanently Delete"
        confirmColor="#EF4444"
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

  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  versionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    opacity: 0.4,
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
