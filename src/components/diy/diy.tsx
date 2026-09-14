import React from "react";
import { View, Text, Dimensions } from "react-native";
import ItemCard from "../comman/ItemCard";
import SeeAllProductsButton from "../comman/SeeAllProductsButton";
import { useDiyListing } from "../../hooks/diyHooks";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Diy = () => {
    const { products, loading } = useDiyListing({});
    const { colors } = useTheme();
    const { spacing, font } = useResponsive();
    const router = useRouter();

    if (!loading && (!products || products.length === 0)) {
        return null;
    }

    const CARD_PADDING = spacing(14);
    const GAP = spacing(6);
    const innerWidth = SCREEN_WIDTH - CARD_PADDING * 2;
    const ITEM_WIDTH = (innerWidth - GAP * 2) / 3;

    // Display 3 products in one row
    const displayedProducts = products ? products.slice(0, 3) : [];

    return (
        <View style={{ marginVertical: spacing(8) }}>
            <View style={{
                backgroundColor: colors.primary + "20",
                padding: CARD_PADDING,
                gap: spacing(12),
            }}>
                {/* ── Top Header (Title & Description) ── */}
                <View style={{ gap: spacing(4) }}>
                    <Text style={{
                        fontSize: font(20),
                        fontWeight: "800",
                        color: colors.primaryDark || colors.text,
                        lineHeight: font(24),
                    }}>
                        Do it Yourself
                    </Text>

                    <Text style={{
                        fontSize: font(12),
                        color: colors.textSecondary,
                        lineHeight: font(17),
                    }}>
                        Complete pest control solutions you can easily apply at home.
                    </Text>
                </View>

                {/* ── Middle: 3 Products per Row Grid ── */}
                <View style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: GAP,
                }}>
                    {displayedProducts.map((item) => (
                        <View key={item.id} style={{ width: ITEM_WIDTH }}>
                            <ItemCard
                                item={{
                                    ...item,
                                    s3_image_path: item.image_path,
                                } as any}
                            />
                        </View>
                    ))}
                </View>

                {/* ── Bottom: See All Products Button ── */}
                <SeeAllProductsButton
                    products={displayedProducts}
                    label="Explore Now"
                    onPress={() => router.push('/(stack)/diy')}
                    style={{ marginHorizontal: 0, marginTop: spacing(2) }}
                />
            </View>
        </View>
    );
};

export default Diy;
