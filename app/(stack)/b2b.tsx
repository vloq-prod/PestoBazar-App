import React from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  Building2,
  Percent,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react-native";

export default function B2BScreen() {
  const { colors, isDark } = useTheme();

  const features = [
    {
      icon: Percent,
      title: "Wholesale & Volume Pricing",
      desc: "Unlock tiered discounts and exclusive pricing for bulk orders.",
    },
    {
      icon: FileText,
      title: "GST Invoice & Input Credit",
      desc: "Automated GST invoicing for easy input tax credit claims.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Business Accounts",
      desc: "Fast KYC verification and dealer-specific payment terms.",
    },
    {
      icon: Clock,
      title: "Priority Fulfillment",
      desc: "Expedited shipping and dedicated B2B account support.",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppNavbar title="B2B Portal" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <LinearGradient
          colors={["#20086b", "#4318a3", "#5f16e9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.badgeContainer}>
            <Sparkles size={14} color="#FBC30B" />
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          <View style={styles.iconCircle}>
            <Briefcase size={32} color="#ffffff" strokeWidth={2} />
          </View>

          <Text style={styles.heroTitle}>B2B Wholesale Portal</Text>
          <Text style={styles.heroSubtitle}>
            We're building an exclusive experience for wholesale buyers, pest
            control operators, and business accounts.
          </Text>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What's Coming
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Key benefits designed for growing businesses
          </Text>
        </View>

        <View style={styles.featureGrid}>
          {features.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: colors.primary + "14" },
                  ]}
                >
                  <IconComp size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.featureCardTitle, { color: colors.text }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureCardDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer Note */}
        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Building2 size={24} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            For immediate bulk order enquiries, please contact our support team
            or check the bulk order section in the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    textAlign: "center",
    marginBottom: 24,
    shadowColor: "#20086b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: "92%",
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  featureGrid: {
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureCardTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  featureCardDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
});
