import React, { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowRight, Award, Info, X } from "lucide-react-native";

import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import type {
  ProductComparisonData,
  ProductComparisonProduct,
} from "../../types/productComparison.types";
import SeeAllProductsButton from "../comman/SeeAllProductsButton";

type Props = {
  data?: ProductComparisonData;
  isLoading?: boolean;
};

const formatPrice = (value: number) =>
  Number.isFinite(Number(value))
    ? `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "₹0";

const ProductComparisonSection = memo(({ data, isLoading = false }: Props) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const [showInfo, setShowInfo] = useState(false);
  const products = data?.products ?? [];

  // Show up to 4 products in preview box
  const displayProducts = products.length > 4 ? products.slice(0, 4) : products;

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

  if (isLoading) {
    return (
      <View style={[styles.loadingCard, { borderColor: colors.border }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finding better options...
        </Text>
      </View>
    );
  }

  if (!data?.has_comparison) return null;

  const economicalProduct = data.economical_product;

  return (
    <View style={{ gap: spacing(20) }}>
      {/* ── 1. Recommended Economical Pick Section ── */}
      {economicalProduct && data.show_economical_card && (
        <View style={{ paddingHorizontal: spacing(16), gap: spacing(10) }}>
          {/* Header */}
          <View style={{ gap: spacing(2) }}>
            <Text
              style={{
                fontSize: font(15),
                fontFamily: "Poppins_700Bold",
                color: colors.text,
                lineHeight: font(21),
              }}
            >
              Our economical pick
            </Text>
            <Text
              style={{
                fontSize: font(11.5),
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
                lineHeight: font(17),
              }}
            >
              Same active ingredients at a better price.
            </Text>
          </View>

          {/* Product Card Styled Like App Standard (Order/Return Items) */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing(12),
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(14),
              gap: spacing(12),
            }}
          >
            {/* Card Header Row: Recommended Badge & Saving Tag */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(4),
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing(8),
                  paddingVertical: spacing(3),
                  borderRadius: 6,
                }}
              >
                <Award size={12} color="#FFFFFF" />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: font(9.5),
                    fontFamily: "Poppins_700Bold",
                    letterSpacing: 0.3,
                  }}
                >
                  RECOMMENDED
                </Text>
              </View>

              {economicalProduct.saving_from_current > 0 && (
                <View
                  style={{
                    backgroundColor: "#10B98115",
                    paddingHorizontal: spacing(8),
                    paddingVertical: spacing(3),
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(10.5),
                      color: "#10B981",
                    }}
                  >
                    Save {formatPrice(economicalProduct.saving_from_current)}
                  </Text>
                </View>
              )}
            </View>

            {/* Horizontal Product Details Row */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openProduct(economicalProduct)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing(14),
              }}
            >
              {/* Left Column: Image */}
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: economicalProduct.image_url }}
                  style={{ width: 62, height: 62 }}
                  contentFit="contain"
                  transition={180}
                />
              </View>

              {/* Right Column: Content */}
              <View style={{ flex: 1, gap: spacing(4) }}>
                {!!economicalProduct.brand_name && (
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(10.5),
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                    }}
                    numberOfLines={1}
                  >
                    {economicalProduct.brand_name}
                  </Text>
                )}

                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.text,
                    lineHeight: font(17),
                  }}
                  numberOfLines={2}
                >
                  {economicalProduct.display_name ||
                    economicalProduct.product_name}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: spacing(2),
                  }}
                >
                  {[economicalProduct.size, economicalProduct.unit].filter(
                    Boolean,
                  ).length > 0 && (
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(10.5),
                        color: colors.textSecondary,
                      }}
                    >
                      {[economicalProduct.size, economicalProduct.unit]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: spacing(6),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                        color: colors.text,
                      }}
                    >
                      {formatPrice(economicalProduct.price.display_price)}
                    </Text>

                    {economicalProduct.price.mrp >
                      economicalProduct.price.display_price && (
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: font(11),
                          color: colors.textSecondary,
                          textDecorationLine: "line-through",
                        }}
                      >
                        {formatPrice(economicalProduct.price.mrp)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Compare Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/(stack)/product-comparison/[variationId]",
                  params: { variationId: String(data.current.variation_id) },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: spacing(8),
                paddingHorizontal: spacing(12),
                backgroundColor: colors.primary + "10",
                borderRadius: 8,
                gap: spacing(6),
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(12),
                  color: colors.primary,
                }}
              >
                Compare Now
              </Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── 2. Compare Similar Products Section (Box + See All Products Button) ── */}
      {products.length > 0 && (
        <View style={{ paddingHorizontal: spacing(16), gap: spacing(10) }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontSize: font(15),
                  fontFamily: "Poppins_700Bold",
                  color: colors.text,
                  lineHeight: font(21),
                }}
              >
                Compare similar products
              </Text>
              <Text
                style={{
                  fontSize: font(11),
                  fontFamily: "Poppins_400Regular",
                  color: colors.textSecondary,
                  lineHeight: font(16),
                }}
              >
                Check prices and choose what works best for you
              </Text>
            </View>

            {!!data.info_message && (
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="About product comparison"
                onPress={() => setShowInfo(true)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.primary + "45",
                  backgroundColor: colors.primary + "0D",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Info size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Standard App Items Box (Like Order Items Box) */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing(12),
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            {displayProducts.map((product, index) => {
              const isLast = index === displayProducts.length - 1;
              const isBest = product.is_best_value;
              const isCurrent = product.is_current;

              return (
                <TouchableOpacity
                  key={product.variation_id}
                  activeOpacity={0.7}
                  onPress={() => openProduct(product)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing(14),
                    paddingHorizontal: spacing(14),
                    paddingVertical: spacing(12),
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: colors.border,
                    backgroundColor: isCurrent
                      ? colors.primary + "08"
                      : "transparent",
                  }}
                >
                  {/* Left Column: Image */}
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: isCurrent
                        ? colors.primary + "40"
                        : colors.border,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{ uri: product.image_url }}
                      style={{ width: 62, height: 62 }}
                      contentFit="contain"
                      transition={180}
                    />
                  </View>

                  {/* Right Column: Content */}
                  <View style={{ flex: 1, gap: spacing(4) }}>
                    {/* Brand & Badge Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: font(10.5),
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {product.brand_name || ""}
                      </Text>

                      {(isBest || isCurrent) && (
                        <View
                          style={{
                            paddingHorizontal: spacing(6),
                            paddingVertical: spacing(2),
                            borderRadius: 4,
                            backgroundColor: isCurrent
                              ? colors.text
                              : colors.primary,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: font(8.5),
                              fontFamily: "Poppins_700Bold",
                            }}
                          >
                            {isCurrent ? "CURRENT" : "BEST VALUE"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Name */}
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(12.5),
                        color: colors.text,
                        lineHeight: font(17),
                      }}
                      numberOfLines={2}
                    >
                      {product.display_name || product.product_name}
                    </Text>

                    {/* Size & Savings */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: spacing(2),
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing(8),
                        }}
                      >
                        {[product.size, product.unit].filter(Boolean).length >
                          0 && (
                          <Text
                            style={{
                              fontFamily: "Poppins_400Regular",
                              fontSize: font(10.5),
                              color: colors.textSecondary,
                            }}
                          >
                            {[product.size, product.unit]
                              .filter(Boolean)
                              .join(" ")}
                          </Text>
                        )}

                        {product.saving_from_current > 0 && (
                          <Text
                            style={{
                              fontFamily: "Poppins_600SemiBold",
                              fontSize: font(10.5),
                              color: "#10B981",
                            }}
                          >
                            Save {formatPrice(product.saving_from_current)}
                          </Text>
                        )}
                      </View>

                      {/* Price */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          gap: spacing(6),
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins_600SemiBold",
                            fontSize: font(13.5),
                            color: colors.text,
                          }}
                        >
                          {formatPrice(product.price.display_price)}
                        </Text>

                        {product.price.mrp > product.price.display_price && (
                          <Text
                            style={{
                              fontFamily: "Poppins_400Regular",
                              fontSize: font(10.5),
                              color: colors.textSecondary,
                              textDecorationLine: "line-through",
                            }}
                          >
                            {formatPrice(product.price.mrp)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── View Full Comparison Button (Same as Home Page See All Products) ── */}
          <SeeAllProductsButton
            products={products}
            label="View full comparison"
            style={{ marginHorizontal: 0, marginTop: spacing(2) }}
            onPress={() =>
              router.push({
                pathname: "/(stack)/product-comparison/[variationId]",
                params: { variationId: String(data.current.variation_id) },
              })
            }
          />
        </View>
      )}

      {/* ── 3. Info Modal ── */}
      <Modal
        transparent
        animationType="fade"
        visible={showInfo}
        onRequestClose={() => setShowInfo(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowInfo(false)}
        >
          <Pressable
            style={[styles.infoModal, { backgroundColor: colors.surface }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.infoModalHeader}>
              <View
                style={[
                  styles.infoIconBox,
                  { backgroundColor: colors.primary + "18" },
                ]}
              >
                <Info size={18} color={colors.primary} />
              </View>
              <Text style={[styles.infoModalTitle, { color: colors.text }]}>
                About this comparison
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close comparison information"
                onPress={() => setShowInfo(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.backgroundgray },
                ]}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.infoMessage, { color: colors.textSecondary }]}
            >
              {data.info_message}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

ProductComparisonSection.displayName = "ProductComparisonSection";

export default ProductComparisonSection;

const styles = StyleSheet.create({
  loadingCard: {
    marginHorizontal: 16,
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  infoModal: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoModalTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoMessage: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
});
