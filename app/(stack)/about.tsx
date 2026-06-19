import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useAboutUs } from "../../src/hooks/contentHooks";
import { Heart, Target, ShoppingBag } from "lucide-react-native";

export default function AboutUsScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useAboutUs();
  const about = data?.data;

  const LogoImage = require("../../assets/Pestobazaarlogo.webp");

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="About Us" showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={LogoImage}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

          {/* Title + Subtitle */}
          <View style={styles.titleBlock}>
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              {about?.title || "About Pestobazaar"}
            </Text>
            {!!about?.subtitle && (
              <Text style={[styles.subtitle, { color: colors.primary }]}>
                {about.subtitle}
              </Text>
            )}
          </View>

          {/* Welcome Section */}
          {!!about?.welcome_section && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {about.welcome_section.title}
              </Text>
              {about.welcome_section.description?.map((d, i) => (
                <Text key={`w-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>{d}</Text>
              ))}
            </View>
          )}

          {/* Mission Section */}
          {!!about?.mission_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <Target size={20} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text, flex: 1, marginBottom: 0 }]}>
                  {about.mission_section.title}
                </Text>
              </View>
              {about.mission_section.description?.map((d, i) => (
                <Text key={`m-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>{d}</Text>
              ))}
            </View>
          )}

          {/* What We Offer Section */}
          {!!about?.offer_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <ShoppingBag size={20} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text, flex: 1, marginBottom: 0 }]}>
                  {about.offer_section.title}
                </Text>
              </View>
              {about.offer_section.description?.map((d, i) => (
                <Text key={`o-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>{d}</Text>
              ))}
            </View>
          )}

          {/* Values Section */}
          {!!about?.values_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <Heart size={20} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text, flex: 1, marginBottom: 0 }]}>
                  {about.values_section.title}
                </Text>
              </View>
              
              <View style={styles.valuesList}>
                {about.values_section.values?.map((val, i) => (
                  <View key={`val-${i}`} style={styles.valueItem}>
                    <Text style={[styles.valueDot, { color: colors.textSecondary }]}>{i + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.valueTitle, { color: colors.text }]}>{val.title}</Text>
                      <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>{val.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            Thank you for choosing Pestobazaar 🌿
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 16,
  },

  // ── Logo ──
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 140,
    height: 140,
  },

  // ── Title ──
  titleBlock: {
    gap: 4,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Sections ──
  sectionBlock: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // light gray divider
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },

  // ── Values ──
  valuesList: {
    gap: 16,
    marginTop: 8,
  },
  valueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  valueDot: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 22,
    width: 18,
  },
  valueTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14.5,
    marginBottom: 2,
  },
  valueDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13.5,
    lineHeight: 22,
  },

  // ── Footer ──
  footerNote: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 24,
    paddingTop: 8,
  },
});
