import React from "react";
import { View, Text, TouchableOpacity, FlatList, Dimensions } from "react-native";
import ItemCard from "../comman/ItemCard";
import { useDiyListing } from "../../hooks/diyHooks";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Diy = () => {
    const { products } = useDiyListing({});
    const { colors } = useTheme();
    const { spacing, font } = useResponsive();
    const router = useRouter();


    const H_PADDING = 16 * 1;
    const rightWidth = (SCREEN_WIDTH - H_PADDING) * 0.58;
    const GAP = spacing(5);

    // Show 1 full card + ~85% of 2nd card peeking
    const CARD_WIDTH = (rightWidth - GAP * 0.85) / 1.90;

    return (
        <View style={{ paddingHorizontal: spacing(16) }}>
            <View style={{
                borderRadius: spacing(16),
                backgroundColor: colors.primary + "10",
                flexDirection: "row",
                overflow: "hidden",
                minHeight: spacing(200),
            }}>
                {/* ── Left Side ── */}
                <View style={{
                    flex: 0.42,
                    paddingTop: spacing(16),
                    paddingBottom: spacing(16),
                    paddingLeft: spacing(16),
                    paddingRight: spacing(6),
                    justifyContent: "center",
                    gap: spacing(10),
                }}>
                    <Text style={{
                        fontSize: font(24),
                        fontWeight: "800",
                        color: colors.primaryDark,
                        lineHeight: font(22),
                    }}>
                        Do it{"\n"}Yourself
                    </Text>

                    <Text
                        numberOfLines={3}
                        style={{
                            fontSize: font(11),
                            color: colors.textSecondary,
                            lineHeight: font(17),
                        }}>
                        Complete pest control solutions you can easily apply at home.
                    </Text>

                    <TouchableOpacity 
                        onPress={() => router.push('/(stack)/diy')}
                        style={{
                            backgroundColor: colors.primary,
                            paddingVertical: spacing(7),
                            paddingHorizontal: spacing(14),
                            borderRadius: spacing(10),
                            alignSelf: "flex-start",
                        }}
                    >
                        <Text style={{
                            color: colors.primaryForeground,
                            fontSize: font(11),
                            fontWeight: "700",
                        }}>
                            Explore Now
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Right Side — horizontal product scroll ── */}
                <View style={{
                    flex: 0.58,
                    paddingVertical: spacing(12),
                    paddingRight: spacing(8),
                    overflow: "hidden",
                }}>
                    <FlatList
                        horizontal
                        data={products}
                        keyExtractor={(item) => String(item.id)}
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled
                        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
                        contentContainerStyle={{ paddingRight: spacing(4) }}
                        renderItem={({ item }) => (
                            <View style={{ width: CARD_WIDTH }}>
                                <ItemCard
                                    item={{
                                        ...item,
                                        s3_image_path: item.image_path,
                                    } as any}
                                    onPress={() => { }}
                                />
                            </View>
                        )}
                    />
                </View>
            </View>
        </View>
    );
};

export default Diy;

