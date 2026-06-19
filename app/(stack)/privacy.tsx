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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { usePrivacyPolicy } from "../../src/hooks/contentHooks";
import { Mail, Phone, Globe } from "lucide-react-native";
import type { ContentSection, SubSection } from "../../src/types/content.types";

// ── Sub-section ──────────────────────────────────────────────────
const SubSectionBlock = ({ sub, colors }: { sub: SubSection; colors: any }) => (
  <View style={{ gap: 6, marginTop: 4 }}>
    {!!sub.heading && (
      <Text style={[styles.subHeading, { color: colors.text }]}>{sub.heading}</Text>
    )}
    {sub.content?.map((c, i) => (
      <Text key={`sc-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>{c}</Text>
    ))}
    {sub.points?.map((p, i) => (
      <View key={`sp-${i}`} style={styles.bulletRow}>
        <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>•</Text>
        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{p}</Text>
      </View>
    ))}
    {sub.steps?.map((s, i) => (
      <View key={`ss-${i}`} style={styles.bulletRow}>
        <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>{i + 1}.</Text>
        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{s}</Text>
      </View>
    ))}
    {sub.extra_content?.map((c, i) => (
      <Text key={`sec-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>{c}</Text>
    ))}
    {sub.extra_points?.map((p, i) => (
      <View key={`sep-${i}`} style={styles.bulletRow}>
        <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>•</Text>
        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{p}</Text>
      </View>
    ))}
  </View>
);

// ── Custom Contact Info Renderer ─────────────────────────────────
const ContactTextRenderer = ({ text, colors, isContactSection }: { text: string; colors: any; isContactSection?: boolean }) => {
  if (!isContactSection) {
    return <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{text}</Text>;
  }

  const lowerText = text.toLowerCase();
  const isEmail = lowerText.includes("email") || lowerText.includes("@");
  const isPhone = lowerText.includes("phone") || lowerText.includes("call");
  const isWebsite = lowerText.includes("website") || lowerText.includes(".com");

  let Icon = null;
  let onPress = undefined;
  let isLink = false;

  if (isEmail) {
    Icon = Mail;
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      onPress = () => Linking.openURL(`mailto:${emailMatch[0]}`);
    }
  } else if (isPhone) {
    Icon = Phone;
    const phoneMatch = text.match(/\+?\d[\d -]{8,}\d/);
    if (phoneMatch) {
      onPress = () => Linking.openURL(`tel:${phoneMatch[0].replace(/\s/g, "")}`);
    }
  } else if (isWebsite) {
    Icon = Globe;
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      onPress = () => Linking.openURL(urlMatch[0]);
      isLink = true;
    } else {
      const wwwMatch = text.match(/www\.[^\s]+/);
      if (wwwMatch) {
        onPress = () => Linking.openURL(`https://${wwwMatch[0]}`);
        isLink = true;
      } else {
        // Just in case it's a domain like pestobazaar.com
        const domainMatch = text.match(/[\w.-]+\.com/);
        if (domainMatch) {
           onPress = () => Linking.openURL(`https://${domainMatch[0]}`);
           isLink = true;
        }
      }
    }
  }

  if (Icon) {
    return (
      <TouchableOpacity 
        disabled={!onPress} 
        onPress={onPress} 
        activeOpacity={0.7} 
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={colors.textSecondary} />
        </View>
        <Text style={[styles.bodyText, { flex: 1, color: isLink ? colors.primary : colors.textSecondary, textDecorationLine: isLink ? 'underline' : 'none' }]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  return <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{text}</Text>;
};

// ── Section block ────────────────────────────────────────────────
const SectionBlock = ({
  section,
  colors,
}: {
  section: ContentSection;
  colors: any;
}) => {
  const isContactSection = section.heading?.toLowerCase().includes("contact");

  return (
    <View style={[styles.sectionBlock, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionHeading, { color: colors.text }]}>
        {section.heading}
      </Text>

      {section.content?.map((c, i) => (
        <ContactTextRenderer key={`c-${i}`} text={c} colors={colors} isContactSection={isContactSection} />
      ))}

      {section.points?.map((p, i) => {
        if (isContactSection && (p.toLowerCase().includes("email") || p.toLowerCase().includes("phone") || p.toLowerCase().includes("website") || p.toLowerCase().includes(".com"))) {
          return <ContactTextRenderer key={`p-${i}`} text={p} colors={colors} isContactSection={true} />;
        }
        return (
          <View key={`p-${i}`} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{p}</Text>
          </View>
        );
      })}

      {section.steps?.map((s, i) => {
        if (isContactSection && (s.toLowerCase().includes("email") || s.toLowerCase().includes("phone") || s.toLowerCase().includes("website") || s.toLowerCase().includes(".com"))) {
          return <ContactTextRenderer key={`st-${i}`} text={s} colors={colors} isContactSection={true} />;
        }
        return (
          <View key={`st-${i}`} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>{i + 1}.</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{s}</Text>
          </View>
        );
      })}

      {section.sub_sections?.map((sub, i) => (
        <SubSectionBlock key={`sub-${i}`} sub={sub} colors={colors} />
      ))}

      {section.extra_content?.map((c, i) => (
        <ContactTextRenderer key={`ec-${i}`} text={c} colors={colors} isContactSection={isContactSection} />
      ))}

      {section.extra_points?.map((p, i) => {
        if (isContactSection && (p.toLowerCase().includes("email") || p.toLowerCase().includes("phone") || p.toLowerCase().includes("website") || p.toLowerCase().includes(".com"))) {
          return <ContactTextRenderer key={`ep-${i}`} text={p} colors={colors} isContactSection={true} />;
        }
        return (
          <View key={`ep-${i}`} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{p}</Text>
          </View>
        );
      })}

      {section.footer_content?.map((f, i) => (
        <Text key={`fc-${i}`} style={[styles.bodyText, { color: colors.textSecondary, fontStyle: "italic" }]}>{f}</Text>
      ))}
    </View>
  );
};

// ── Screen ───────────────────────────────────────────────────────
export default function PrivacyScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = usePrivacyPolicy();
  const policyData = data?.data;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Privacy Policy" showBack />

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
              {policyData?.title || "Privacy Policy"}
            </Text>
            {!!policyData?.effective_date && (
              <Text style={[styles.effectiveDate, { color: colors.textSecondary }]}>
                Effective date: {policyData.effective_date}
              </Text>
            )}
          </View>

          {/* Intro */}
          {policyData?.intro?.map((para, idx) => (
            <Text
              key={`intro-${idx}`}
              style={[styles.introText, { color: colors.textSecondary }]}
            >
              {para}
            </Text>
          ))}

          {/* Sections */}
          {policyData?.sections?.map((section, idx) => (
            <SectionBlock key={`sec-${idx}`} section={section} colors={colors} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────
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
  effectiveDate: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },

  // ── Intro ──
  introText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 16,
  },

  // ── Section ──
  sectionBlock: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 10,
  },
  sectionHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15.5,
    lineHeight: 22,
    marginBottom: 2,
  },

  // ── Body ──
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },

  // ── Bullets ──
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bulletDot: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
    width: 16,
  },
  bulletText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 23,
    flex: 1,
  },

  // ── Sub-section ──
  subHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 21,
  },


});
