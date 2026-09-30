import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderHTML from "react-native-render-html";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useFaq } from "../../src/hooks/contentHooks";
import { Mail, Phone, MapPin } from "lucide-react-native";

export default function FaqScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useFaq();
  const { width } = useWindowDimensions();
  const contentWidth = width - 40;

  const faqData = data?.data;
  const categories = faqData?.faq ?? [];
  const contactUs = faqData?.contact_us;

  const HTML_BASE_STYLE = {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
  };

  const HTML_TAGS_STYLES = {
    p: {
      marginTop: 0,
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 23,
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
    },
    ul: {
      marginTop: 4,
      marginBottom: 8,
      paddingLeft: 20,
    },
    ol: {
      marginTop: 4,
      marginBottom: 8,
      paddingLeft: 20,
    },
    li: {
      marginBottom: 6,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
    },
    strong: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      color: colors.text,
      fontWeight: "600" as const,
    },
    span: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
    },
    a: {
      color: colors.primary,
      textDecorationLine: "underline" as const,
    },
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Frequently Asked Questions" showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {faqData?.title || "Frequently Asked Questions (FAQ)"}
            </Text>
          </View>

          {/* ── FAQ Categories / Sections ── */}
          {categories.map((category, idx) => (
            <View
              key={`cat-${idx}`}
              style={[
                styles.sectionBlock,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {`${idx + 1}. ${category.category_name}`}
              </Text>

              {category.faqs?.map((faq, fIdx) => (
                <View key={`faq-${faq.id || fIdx}`} style={styles.faqItem}>
                  <Text style={[styles.subHeading, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <RenderHTML
                    contentWidth={contentWidth}
                    source={{ html: faq.answer || "<p></p>" }}
                    baseStyle={HTML_BASE_STYLE}
                    tagsStyles={HTML_TAGS_STYLES}
                    defaultTextProps={{ selectable: true }}
                  />
                </View>
              ))}
            </View>
          ))}

          {/* ── Contact Us Section ── */}
          {!!contactUs && (
            <View
              style={[
                styles.sectionBlock,
                { borderBottomColor: "transparent" },
              ]}
            >
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {`${categories.length + 1}. ${contactUs.title || "Contact Us"}`}
              </Text>

              {!!contactUs.description && (
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {contactUs.description}
                </Text>
              )}

              {/* Email */}
              {!!contactUs.email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${contactUs.email}`)}
                  activeOpacity={0.7}
                  style={styles.contactRow}
                >
                  <View
                    style={[
                      styles.contactIconBox,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <Mail size={18} color={colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.bodyText,
                      {
                        flex: 1,
                        color: colors.primary,
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    {contactUs.email}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Phone */}
              {!!contactUs.phone && (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `tel:${contactUs.phone.replace(/\s/g, "")}`,
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.contactRow}
                >
                  <View
                    style={[
                      styles.contactIconBox,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <Phone size={18} color={colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.bodyText,
                      {
                        flex: 1,
                        color: colors.primary,
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    {contactUs.phone}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Address */}
              {!!contactUs.address && (
                <View style={styles.contactRow}>
                  <View
                    style={[
                      styles.contactIconBox,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <MapPin size={18} color={colors.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.bodyText,
                      { flex: 1, color: colors.textSecondary },
                    ]}
                  >
                    {contactUs.address}
                  </Text>
                </View>
              )}

              {/* Note */}
              {!!contactUs.note && (
                <Text
                  style={[
                    styles.bodyText,
                    {
                      color: colors.textSecondary,
                      fontStyle: "italic",
                      marginTop: 8,
                    },
                  ]}
                >
                  {contactUs.note}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles (Matching terms.tsx 1:1) ───────────────────────────
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
    paddingTop: 8,
  },

  // ── Header ──
  header: {
    paddingVertical: 16,
    gap: 4,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    lineHeight: 26,
  },

  // ── Section ──
  sectionBlock: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 14,
  },
  sectionHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15.5,
    lineHeight: 22,
    marginBottom: 2,
  },

  // ── FAQ Item ──
  faqItem: {
    gap: 6,
    marginTop: 4,
  },
  subHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 21,
  },

  // ── Body ──
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },

  // ── Contact Rows ──
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
