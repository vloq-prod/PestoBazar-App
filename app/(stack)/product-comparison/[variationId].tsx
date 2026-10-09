import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  BadgePercent,
  Beaker,
  Check,
  Droplets,
  FlaskConical,
  Grid3X3,
  ImageIcon,
  IndianRupee,
  Maximize2,
  MessageCircle,
  Package,
  Percent,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Tag,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProductComparison } from "../../../src/hooks/productComparison.hooks";
import { useTheme } from "../../../src/theme";
import type { ProductComparisonProduct } from "../../../src/types/productComparison.types";
import { RequestCallBackModal } from "../../../src/components/comman/RequestCallBackModal";

const LABEL_WIDTH = 118;
const PRODUCT_WIDTH = 176;
const SUPPORT_NUMBER = "919929929980";

const formatPrice = (value: number) =>
  Number.isFinite(Number(value))
    ? `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";

const getAttributeIcon = (attributeName: string, color: string) => {
  const name = attributeName.trim().toLowerCase();
  const iconProps = { size: 15, color };

  if (name.includes("active ingredient")) return <FlaskConical {...iconProps} />;
  if (name.includes("concentration")) return <Percent {...iconProps} />;
  if (name.includes("formulation")) return <Beaker {...iconProps} />;
  if (name.includes("dose")) return <Droplets {...iconProps} />;
  if (name.includes("coverage")) return <Grid3X3 {...iconProps} />;
  if (name.includes("application")) return <Sprout {...iconProps} />;

  return <Check {...iconProps} />;
};

const ProductComparisonScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { variationId: routeVariationId } = useLocalSearchParams<{ variationId?: string }>();
  const variationId = Number(routeVariationId ?? 0);
  const { data: response, isLoading, isError, refetch, isFetching } =
    useProductComparison(Number.isFinite(variationId) ? variationId : 0);
  const comparison = response?.data;

  const products = comparison?.products ?? [];
  const current = comparison?.current;
  const economical = comparison?.economical_product;
  const [isCallBackModalVisible, setIsCallBackModalVisible] = useState(false);

  const ingredientSummary = useMemo(() => {
    if (!current) return null;
    const entries = Object.entries(current.attributes ?? {});
    const ingredient = entries.find(([key]) =>
      key.toLowerCase().includes("active ingredient"),
    );
    const concentration = entries.find(([key]) =>
      key.toLowerCase().includes("concentration"),
    );
    const values = [ingredient?.[1], concentration?.[1]].filter(Boolean);
    return values.length ? values.join(" ") : null;
  }, [current]);

  const openProduct = useCallback(
    (product: ProductComparisonProduct) => {
      router.push({
        pathname: "/(stack)/products/[slug]",
        params: {
          slug: product.slug,
          id: String(product.variation_id),
          variation_id: String(product.variation_id),
          product_name: product.display_name || product.product_name,
        },
      });
    },
    [router],
  );

  const chatWithExpert = useCallback(() => {
    const productName = current?.display_name || current?.product_name || "a product";
    const message = `Hi, I need help choosing the right alternative for ${productName}.`;
    Linking.openURL(
      `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`,
    );
  }, [current]);

  const callExpert = useCallback(() => {
    Linking.openURL(`tel:+${SUPPORT_NUMBER}`);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.stateTitle, { color: colors.text }]}>Building comparison...</Text>
        <Text style={[styles.stateCopy, { color: colors.textSecondary }]}>We’re matching prices and product specifications.</Text>
      </View>
    );
  }

  if (isError || !comparison?.has_comparison || !current) {
    return (
      <View style={[styles.centerState, { backgroundColor: colors.background, paddingTop: insets.top }]}> 
        <ScaleIcon colors={colors} />
        <Text style={[styles.stateTitle, { color: colors.text }]}>Comparison unavailable</Text>
        <Text style={[styles.stateCopy, { color: colors.textSecondary }]}>We couldn’t load comparable products right now.</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => refetch()}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          {isFetching ? <ActivityIndicator color={colors.textOnPrimary} /> : <RefreshCw size={17} color={colors.textOnPrimary} />}
          <Text style={[styles.retryText, { color: colors.textOnPrimary }]}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.navbar, { paddingTop: insets.top + 6, borderBottomColor: colors.border, backgroundColor: colors.background }]}> 
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.navButton, { borderColor: colors.border }]}
        >
          <ArrowLeft size={21} color={colors.text} />
        </TouchableOpacity>
        <Text numberOfLines={2} style={[styles.navTitle, { color: colors.text }]}> 
          Compare {current.display_name || current.product_name} Alternatives
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}> 
        {ingredientSummary && (
          <View style={[styles.summaryCard, { borderColor: colors.primary + "30", backgroundColor: colors.primary + "0B" }]}> 
            <View style={[styles.summaryIcon, { backgroundColor: colors.surface }]}> 
              <ShieldCheck size={20} color={colors.primary} />
            </View>
            <View style={styles.flexOne}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Products below contain {ingredientSummary}</Text>
              <Text style={[styles.summaryCopy, { color: colors.textSecondary }]}>Similar mapped specifications for easy comparison</Text>
            </View>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.tableOuter}> 
          <View style={[styles.table, { borderColor: colors.border }]}> 
            <ComparisonRow label="Image" icon={<ImageIcon size={15} color={colors.textSecondary} />} colors={colors} top>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.variation_id}
                  activeOpacity={0.85}
                  onPress={() => openProduct(product)}
                  style={[
                    styles.imageCell,
                    { borderLeftColor: colors.border },
                    product.is_best_value && { backgroundColor: colors.primary + "09" },
                  ]}
                >
                  <View style={[styles.productImageContainer, { borderColor: colors.border }]}> 
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                      contentFit="contain"
                      transition={180}
                    />
                  </View>
                  <View style={styles.badgeRow}>
                    {product.is_best_value && (
                      <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}> 
                        <Award size={10} color="#FFFFFF" />
                        <Text style={styles.bestBadgeText}>BEST DEAL</Text>
                      </View>
                    )}
                    {product.is_current && (
                      <View style={[styles.currentBadge, { backgroundColor: "#E8F2FF" }]}> 
                        <Text style={styles.currentBadgeText}>CURRENT</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Product Name" icon={<Package size={15} color={colors.textSecondary} />} colors={colors}>
              {products.map((product) => <ValueCell key={product.variation_id} value={product.display_name || product.product_name} colors={colors} strong highlight={product.is_best_value} />)}
            </ComparisonRow>
            <ComparisonRow label="Brand" icon={<Tag size={15} color={colors.textSecondary} />} colors={colors}>
              {products.map((product) => <ValueCell key={product.variation_id} value={product.brand_name} colors={colors} highlight={product.is_best_value} />)}
            </ComparisonRow>
            <ComparisonRow label="Size" icon={<Maximize2 size={15} color={colors.textSecondary} />} colors={colors}>
              {products.map((product) => <ValueCell key={product.variation_id} value={[product.size, product.unit].filter(Boolean).join(" ") || "—"} colors={colors} highlight={product.is_best_value} />)}
            </ComparisonRow>

            {comparison.attributes.map((attribute) => (
              <ComparisonRow
                key={attribute.id}
                label={attribute.attribute_name}
                icon={getAttributeIcon(attribute.attribute_name, colors.textSecondary)}
                colors={colors}
              >
                {products.map((product) => <ValueCell key={product.variation_id} value={product.attributes?.[attribute.attribute_name] || "—"} colors={colors} highlight={product.is_best_value} />)}
              </ComparisonRow>
            ))}

            <ComparisonRow label="Price" icon={<IndianRupee size={15} color={colors.textSecondary} />} colors={colors}>
              {products.map((product) => <ValueCell key={product.variation_id} value={formatPrice(product.price.display_price)} colors={colors} strong highlight={product.is_best_value} primary={product.is_best_value} />)}
            </ComparisonRow>
            <ComparisonRow label="You Save" icon={<BadgePercent size={15} color={colors.textSecondary} />} colors={colors} bottom>
              {products.map((product) => (
                <ValueCell
                  key={product.variation_id}
                  value={product.saving_from_current > 0 ? `${formatPrice(product.saving_from_current)} (${product.saving_percent_from_current}%)` : "—"}
                  colors={colors}
                  strong={product.saving_from_current > 0}
                  primary={product.saving_from_current > 0}
                  highlight={product.is_best_value}
                />
              ))}
            </ComparisonRow>
          </View>
        </ScrollView>

        {economical && (
          <View style={[styles.whyCard, { borderColor: "#EDC97B", backgroundColor: "#FFF9EC" }]}> 
            <View style={[styles.whyIcon, { backgroundColor: "#FFFFFF" }]}> 
              <Award size={20} color="#B7791F" />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.whyTitle}>Why consider {economical.display_name || economical.product_name}?</Text>
              <View style={styles.reasons}>
                {[
                  "Same active ingredient & efficiency",
                  "More economical",
                  "Trusted by professionals",
                  "Quality assured",
                ].map((reason) => (
                  <View key={reason} style={styles.reasonItem}>
                    <View style={styles.reasonCheck}><Check size={10} color={colors.primary} /></View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={[styles.helpCard, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <View style={[styles.helpIcon, { backgroundColor: colors.primary + "10" }]}> 
            <MessageCircle size={20} color={colors.primary} />
          </View>
          <View style={styles.helpCopy}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>Need help choosing the right product?</Text>
            <Text style={[styles.helpSubtitle, { color: colors.textSecondary }]}>Our experts are here to help you make the best choice.</Text>
          </View>
          <View style={styles.helpActions}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={chatWithExpert}
              style={[styles.chatButton, { borderColor: colors.primary }]}
            >
              <MessageCircle size={16} color={colors.primary} />
              <Text style={[styles.chatButtonText, { color: colors.primary }]}>Chat with Expert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => setIsCallBackModalVisible(true)}
              style={[styles.callButton, { backgroundColor: colors.primary }]}
            >
              <Phone size={16} color={colors.textOnPrimary} />
              <Text style={[styles.callButtonText, { color: colors.textOnPrimary }]}>Request a call back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!comparison.info_message && <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{comparison.info_message}</Text>}
      </ScrollView>

      <RequestCallBackModal
        visible={isCallBackModalVisible}
        onClose={() => setIsCallBackModalVisible(false)}
        productName={current?.display_name || current?.product_name}
        sourceUrl={
          current?.slug
            ? `https://pestobazaar.com/products/${current.slug}`
            : undefined
        }
      />
    </View>
  );
};

const ScaleIcon = ({ colors }: { colors: any }) => (
  <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}> 
    <RefreshCw size={28} color={colors.primary} />
  </View>
);

const ComparisonRow = ({ label, icon, colors, children, top = false, bottom = false }: any) => (
  <View style={[styles.tableRow, { borderBottomColor: colors.border }, bottom && styles.noBottomBorder]}>
    <View style={[styles.labelCell, top && styles.imageLabelCell]}>
      <View style={[styles.rowIcon, { borderColor: colors.border }]}>{icon}</View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
    </View>
    {children}
  </View>
);

const ValueCell = ({ value, colors, strong = false, primary = false, highlight = false }: any) => (
  <View style={[styles.valueCell, { borderLeftColor: colors.border }, highlight && { backgroundColor: colors.primary + "09" }]}> 
    <Text style={[styles.valueText, { color: primary ? colors.primary : colors.text }, strong && styles.valueStrong]}>{value}</Text>
  </View>
);

export default ProductComparisonScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navbar: { minHeight: 64, paddingHorizontal: 16, paddingBottom: 9, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 10 },
  navButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "left", fontSize: 13, lineHeight: 18, fontFamily: "Poppins_600SemiBold" },
  content: { padding: 16, gap: 16 },
  summaryCard: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryTitle: { fontSize: 12, lineHeight: 18, fontFamily: "Poppins_600SemiBold" },
  summaryCopy: { fontSize: 10, lineHeight: 16, fontFamily: "Poppins_400Regular" },
  flexOne: { flex: 1 },
  tableOuter: { paddingRight: 2 },
  table: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 40 },
  noBottomBorder: { borderBottomWidth: 0 },
  labelCell: { width: LABEL_WIDTH, paddingHorizontal: 7, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 5 },
  imageLabelCell: { minHeight: 128 },
  rowIcon: { width: 22, height: 22, borderWidth: 1, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 9, lineHeight: 12, fontFamily: "Poppins_600SemiBold" },
  valueCell: { width: PRODUCT_WIDTH, borderLeftWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, paddingVertical: 5, justifyContent: "center" },
  valueText: { fontSize: 10, lineHeight: 13, fontFamily: "Poppins_400Regular" },
  valueStrong: { fontFamily: "Poppins_700Bold", fontSize: 11 },
  imageCell: { width: PRODUCT_WIDTH, minHeight: 128, borderLeftWidth: StyleSheet.hairlineWidth, padding: 7 },
  productImageContainer: {
    width: "100%",
    height: 91,
    padding: 4,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#FFFFFF",
  },
  productImage: { width: "100%", height: "100%" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
  bestBadge: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  bestBadgeText: { color: "#FFFFFF", fontSize: 8, fontFamily: "Poppins_700Bold" },
  currentBadge: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 4 },
  currentBadgeText: { color: "#2463A5", fontSize: 8, fontFamily: "Poppins_700Bold" },
  whyCard: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  whyIcon: { width: 39, height: 39, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  whyTitle: { color: "#6B4712", fontSize: 13, lineHeight: 19, fontFamily: "Poppins_600SemiBold" },
  reasons: { marginTop: 9, flexDirection: "row", flexWrap: "wrap", columnGap: 8, rowGap: 8 },
  reasonItem: { width: "48%", flexDirection: "row", alignItems: "flex-start", gap: 6 },
  reasonCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#E5F7EC", alignItems: "center", justifyContent: "center" },
  reasonText: { flex: 1, color: "#6C6253", fontSize: 10, lineHeight: 15, fontFamily: "Poppins_400Regular" },
  helpCard: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  helpIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  helpCopy: { flex: 1, minWidth: 220 },
  helpTitle: { fontSize: 12, lineHeight: 18, fontFamily: "Poppins_600SemiBold" },
  helpSubtitle: { fontSize: 10, lineHeight: 15, fontFamily: "Poppins_400Regular" },
  helpActions: { width: "100%", flexDirection: "row", gap: 8 },
  chatButton: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  chatButtonText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  callButton: { flex: 1, minHeight: 42, borderRadius: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  callButtonText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  disclaimer: { fontSize: 9, lineHeight: 15, fontFamily: "Poppins_400Regular" },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 10 },
  stateTitle: { marginTop: 8, fontSize: 18, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  stateCopy: { fontSize: 12, lineHeight: 19, fontFamily: "Poppins_400Regular", textAlign: "center" },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  retryButton: { minWidth: 140, minHeight: 44, borderRadius: 10, marginTop: 10, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  retryText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  backLink: { padding: 8 },
  backLinkText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
});
