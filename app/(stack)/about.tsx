import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useAboutUs } from "../../src/hooks/contentHooks";
import Branches from "../../src/components/home/Branches";
import {
  Target,
  Eye,
  Users,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  Leaf,
  Store,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AboutUsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data, isLoading } = useAboutUs();
  const about = data?.data;

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleCtaPress = (url?: string) => {
    if (!url) return;
    if (url === "/shop" || url.includes("shop")) {
      router.push("/shop" as any);
    } else if (url === "/contact-us" || url.includes("contact")) {
      Linking.openURL("https://pestobazaar.com/contact-us").catch(() => {
        router.push("/faq" as any);
      });
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      Linking.openURL(url);
    } else {
      try {
        router.push(url as any);
      } catch {
        Linking.openURL(`https://pestobazaar.com${url.startsWith("/") ? "" : "/"}${url}`);
      }
    }
  };

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
          {/* ── 1. HEADER (Title & Subtitle) ── */}
          <View style={styles.titleBlock}>
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              {about?.welcome_section?.heading ||
                "About Pestobazaar – Your Online Destination for Pest Control Products in India"}
            </Text>
            {!!(about?.subtitle || "Discover the Right Pest Control Products for Your Needs") && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {about?.subtitle || "Discover the Right Pest Control Products for Your Needs"}
              </Text>
            )}
          </View>

          {/* Hero Banner Image */}
          {!!about?.image && (
            <View style={styles.heroImageWrapper}>
              <Image
                source={{ uri: about.image }}
                style={styles.heroImage}
                contentFit="contain"
                transition={250}
                cachePolicy="memory-disk"
              />
            </View>
          )}

          {/* ── 2. WELCOME SECTION ── */}
          {!!about?.welcome_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.welcome_section.title}
                </Text>
              </View>

              {about.welcome_section.description?.map((d, i) => (
                <Text key={`w-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}

              {!!about.welcome_section.highlight && (
                <View
                  style={[
                    styles.highlightCard,
                    {
                      backgroundColor: `${colors.primary}0D`,
                      borderColor: `${colors.primary}25`,
                    },
                  ]}
                >
                  <View style={styles.highlightHeader}>
                    <CheckCircle2 size={16} color={colors.primary} />
                    <Text style={[styles.highlightTitle, { color: colors.primary }]}>Key Highlight</Text>
                  </View>
                  <Text style={[styles.highlightText, { color: colors.text }]}>
                    {about.welcome_section.highlight}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── 3. WHO WE ARE SECTION ── */}
          {!!about?.who_we_are_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <Users size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.who_we_are_section.title}
                </Text>
              </View>

              {!!about.who_we_are_section.image && (
                <View style={styles.imageCard}>
                  <Image
                    source={{ uri: about.who_we_are_section.image }}
                    style={styles.sectionImage}
                    contentFit="contain"
                    transition={250}
                    cachePolicy="memory-disk"
                  />
                </View>
              )}

              {about.who_we_are_section.description?.map((d, i) => (
                <Text key={`wwa-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}
            </View>
          )}

          {/* ── 4. MISSION & VISION SECTION ── */}
          {(!!about?.mission_section || !!about?.vision_section) && (
            <View style={styles.sectionBlock}>
              <View style={styles.gridTwoColumns}>
                {/* Mission */}
                {!!about?.mission_section && (
                  <View
                    style={[
                      styles.cardItem,
                      {
                        backgroundColor: colors.cardBackground || "#F9FAFB",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.iconRow}>
                      <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                        <Target size={18} color={colors.primary} />
                      </View>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {about.mission_section.title}
                      </Text>
                    </View>
                    {about.mission_section.description?.map((d, i) => (
                      <Text key={`m-${i}`} style={[styles.bodyTextSmall, { color: colors.textSecondary }]}>
                        {d}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Vision */}
                {!!about?.vision_section && (
                  <View
                    style={[
                      styles.cardItem,
                      {
                        backgroundColor: colors.cardBackground || "#F9FAFB",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.iconRow}>
                      <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                        <Eye size={18} color={colors.primary} />
                      </View>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {about.vision_section.title}
                      </Text>
                    </View>
                    {about.vision_section.description?.map((d, i) => (
                      <Text key={`v-${i}`} style={[styles.bodyTextSmall, { color: colors.textSecondary }]}>
                        {d}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── 5. WHAT WE OFFER / CATEGORIES ── */}
          {!!about?.offer_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <ShoppingBag size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.offer_section.title}
                </Text>
              </View>

              {about.offer_section.description?.slice(0, 2).map((d, i) => (
                <Text key={`o-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}

              {!!about.offer_section.categories?.length && (
                <View style={styles.categoriesList}>
                  {about.offer_section.categories.map((cat, i) => (
                    <View
                      key={`cat-${i}`}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: colors.cardBackground || "#F9FAFB",
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.categoryHeader}>
                        <CheckCircle2 size={16} color={colors.primary} />
                        <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat.title}</Text>
                      </View>
                      <Text style={[styles.categoryDesc, { color: colors.textSecondary }]}>
                        {cat.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ── 6. VALUES SECTION ("Why Choose Pestobazaar?") ── */}
          {!!about?.values_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <ShieldCheck size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.values_section.title}
                </Text>
              </View>

              {!!about.values_section.image && (
                <View style={styles.imageCard}>
                  <Image
                    source={{ uri: about.values_section.image }}
                    style={styles.sectionImage}
                    contentFit="contain"
                    transition={250}
                    cachePolicy="memory-disk"
                  />
                </View>
              )}

              {about.values_section.description?.map((d, i) => (
                <Text key={`vd-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}

              <View style={styles.valuesList}>
                {about.values_section.values?.map((val, i) => (
                  <View
                    key={`val-${i}`}
                    style={[
                      styles.valueCard,
                      {
                        backgroundColor: colors.cardBackground || "#F9FAFB",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.valueBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.valueBadgeText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.valueTitle, { color: colors.text }]}>{val.title}</Text>
                      <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>
                        {val.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── 7. CUSTOMERS SECTION ── */}
          {!!about?.customers_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <UserCheck size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.customers_section.title}
                </Text>
              </View>

              {about.customers_section.description?.map((d, i) => (
                <Text key={`cust-d-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}

              <View style={styles.customersList}>
                {about.customers_section.customers?.map((cust, i) => (
                  <View
                    key={`cust-${i}`}
                    style={[
                      styles.customerCard,
                      {
                        backgroundColor: colors.cardBackground || "#F9FAFB",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.customerDot, { backgroundColor: colors.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.customerTitle, { color: colors.text }]}>{cust.title}</Text>
                      <Text style={[styles.customerDesc, { color: colors.textSecondary }]}>
                        {cust.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── 8. RESPONSIBLE PEST MANAGEMENT ── */}
          {!!about?.responsible_pest_management_section && (
            <View
              style={[
                styles.responsibleCard,
                {
                  backgroundColor: "#F0FDF4", // Soft green tint for eco & safety
                  borderColor: "#BBF7D0",
                },
              ]}
            >
              <View style={styles.iconRow}>
                <Leaf size={22} color="#16A34A" />
                <Text style={[styles.sectionTitle, { color: "#166534" }]}>
                  {about.responsible_pest_management_section.title}
                </Text>
              </View>

              {about.responsible_pest_management_section.description?.map((d, i) => (
                <Text key={`rpm-${i}`} style={[styles.bodyText, { color: "#1E3A1E" }]}>
                  {d}
                </Text>
              ))}
            </View>
          )}

          {/* ── 9. MARKETPLACE SECTION ── */}
          {!!about?.marketplace_section && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <Store size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.marketplace_section.title}
                </Text>
              </View>

              {!!about.marketplace_section.image && (
                <View style={styles.imageCard}>
                  <Image
                    source={{ uri: about.marketplace_section.image }}
                    style={styles.sectionImage}
                    contentFit="contain"
                    transition={250}
                    cachePolicy="memory-disk"
                  />
                </View>
              )}

              {about.marketplace_section.description?.map((d, i) => (
                <Text key={`mp-${i}`} style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {d}
                </Text>
              ))}
            </View>
          )}

          {/* ── 10. FULFILLMENT CENTERS / BRANCHES ── */}
          {!!about?.fulfillment_centers_section && (
            <View style={styles.branchesSectionWrapper}>
              <Branches
                title={about.fulfillment_centers_section.title}
                subtitle={about.fulfillment_centers_section.heading}
              />
            </View>
          )}

          {/* ── 11. FAQ SECTION (Interactive Accordion) ── */}
          {!!about?.faq_section?.questions?.length && (
            <View style={styles.sectionBlock}>
              <View style={styles.iconRow}>
                <HelpCircle size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {about.faq_section.title}
                </Text>
              </View>

              <View style={styles.faqList}>
                {about.faq_section.questions.map((q, i) => {
                  const isOpen = expandedFaq === i;
                  return (
                    <View
                      key={`faq-${i}`}
                      style={[
                        styles.faqCard,
                        {
                          backgroundColor: colors.cardBackground || "#FFFFFF",
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => toggleFaq(i)}
                        activeOpacity={0.7}
                        style={styles.faqHeader}
                      >
                        <Text
                          style={[
                            styles.faqQuestion,
                            { color: colors.text },
                          ]}
                        >
                          {q.question}
                        </Text>

                        {isOpen ? (
                          <ChevronUp size={18} color={colors.text} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>

                      {isOpen && (
                        <View style={styles.faqBody}>
                          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            {q.answer}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── 12. CALL TO ACTION (CTA) SECTION (Matches Website Banner) ── */}
          {!!about?.cta_section && (
            <View style={styles.ctaCard}>
              {/* Background decorative concentric circles matching website banner */}
              <View style={styles.ctaBgCircleTop} pointerEvents="none" />
              <View style={styles.ctaBgCircleBottom} pointerEvents="none" />

              <Text style={styles.ctaTitle}>{about.cta_section.title}</Text>

              <View style={styles.ctaContentBlock}>
                {about.cta_section.description?.map((d, i) => {
                  const isHighlight =
                    d.includes("—") ||
                    d.toLowerCase().includes("your online destination") ||
                    i === 2;

                  if (isHighlight) {
                    return (
                      <Text
                        key={`cta-d-${i}`}
                        style={[styles.ctaHighlightText, { color: colors.primary }]}
                      >
                        {d}
                      </Text>
                    );
                  }

                  return (
                    <Text key={`cta-d-${i}`} style={styles.ctaNormalText}>
                      {d}
                    </Text>
                  );
                })}
              </View>

              {/* Action Buttons */}
              {!!about.cta_section.buttons?.length && (
                <View style={styles.ctaButtonRow}>
                  {about.cta_section.buttons
                    .filter(
                      (btn) =>
                        !btn.label.toLowerCase().includes("contact") &&
                        !btn.url.toLowerCase().includes("contact")
                    )
                    .map((btn, idx) => (
                      <TouchableOpacity
                        key={`cta-btn-${idx}`}
                        onPress={() => handleCtaPress(btn.url)}
                        activeOpacity={0.8}
                        style={[
                          styles.ctaBtn,
                          styles.ctaPrimaryBtn,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={[styles.ctaBtnText, styles.ctaPrimaryBtnText]}>
                          {btn.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* ── 13. FOOTER NOTE ── */}
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
    paddingHorizontal: 16,
    paddingBottom: 60,
    paddingTop: 16,
    gap: 16,
  },

  // ── Header ──
  titleBlock: {
    gap: 6,
    marginBottom: 6,
    alignItems: "center",
  },
  mainTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  // ── Section Images ──
  heroImageWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 1448 / 1086,
  },
  imageCard: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionImage: {
    width: "100%",
    aspectRatio: 1448 / 1086,
  },

  // ── Section Common ──
  sectionBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
    flex: 1,
  },
  sectionHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13.5,
    lineHeight: 22,
  },
  bodyTextSmall: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 21,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highlightCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginTop: 6,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  highlightTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  highlightText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13.5,
    lineHeight: 21,
  },

  // ── Grid 2 Columns (Mission & Vision) ──
  gridTwoColumns: {
    gap: 12,
  },
  cardItem: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },

  // ── Offer Categories ──
  categoriesList: {
    gap: 10,
    marginTop: 6,
  },
  categoryCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  categoryDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 19,
    paddingLeft: 22,
  },

  // ── Values List ──
  valuesList: {
    gap: 10,
    marginTop: 6,
  },
  valueCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  valueBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  valueBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "#fff",
  },
  valueTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    marginBottom: 2,
  },
  valueDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 19,
  },

  // ── Customers List ──
  customersList: {
    gap: 8,
    marginTop: 6,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  customerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  customerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13.5,
    marginBottom: 2,
  },
  customerDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // ── Responsible Pest Management ──
  responsibleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginVertical: 4,
  },

  // ── Fulfillment Branches ──
  branchesSectionWrapper: {
    marginHorizontal: -16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  // ── FAQ Accordion ──
  faqList: {
    gap: 8,
    marginTop: 4,
  },
  faqCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13.5,
    lineHeight: 20,
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  faqAnswer: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 21,
  },

  // ── CTA Card (Matches Website Banner) ──
  ctaCard: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5DBFF",
    backgroundColor: "#F6F2FF",
    position: "relative",
    overflow: "hidden",
    marginVertical: 10,
    alignItems: "center",
  },
  ctaBgCircleTop: {
    position: "absolute",
    top: -55,
    left: -55,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(95, 22, 233, 0.05)",
  },
  ctaBgCircleBottom: {
    position: "absolute",
    bottom: -55,
    right: -55,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(95, 22, 233, 0.06)",
  },
  ctaTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 19,
    lineHeight: 27,
    color: "#18181B",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaContentBlock: {
    gap: 8,
    alignItems: "center",
    width: "100%",
  },
  ctaNormalText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 20,
    color: "#4B5563",
    textAlign: "center",
  },
  ctaHighlightText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: "center",
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  ctaButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  ctaBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPrimaryBtn: {
    shadowColor: "#5F16E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaSecondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  ctaBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  ctaPrimaryBtnText: {
    color: "#FFFFFF",
  },
  ctaSecondaryBtnText: {
    // color is set dynamically via colors.primary
  },

  // ── Footer ──
  footerNote: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
    paddingBottom: 16,
  },
});
