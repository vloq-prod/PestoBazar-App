import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
    CheckCircle2,
    Circle,
    Pencil,
    Trash2,
    MapPin,
    Home,
    Briefcase,
    Warehouse,
} from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useAppVisitorStore } from "../../store/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressItem {
    id: number;
    address_id: string;
    address_name: string;
    full_name: string;
    address: string;
    building: string;
    area: string;
    city: string;
    state_name: string;
    pincode: string;
    email: string;
    gst: string | null;
}

interface AddressCardProps {
    item: AddressItem;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const getAddressIcon = (name: string, color: string, size = 12) => {
    const n = name?.toLowerCase() ?? "";
    if (n.includes("home")) return <Home size={size} color={color} />;
    if (n.includes("office") || n.includes("work"))
        return <Briefcase size={size} color={color} />;
    if (n.includes("warehouse") || n.includes("godown"))
        return <Warehouse size={size} color={color} />;
    return <MapPin size={size} color={color} />;
};

// ─── Component ───────────────────────────────────────────────────────────────

const AddressCard: React.FC<AddressCardProps> = ({
    item,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}) => {
    const { colors } = useTheme();
    const { font } = useResponsive();
    const {userId} = useAppVisitorStore((state) => state);

    const borderColor = isSelected ? colors.primary : colors.border;

    // Tag Badge styling
    const tagBg = isSelected ? colors.primary + "15" : colors.border + "50";
    const tagTextColor = isSelected ? colors.primary : colors.textSecondary;

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onSelect}
            style={[
                styles.card,
                {
                    borderColor: borderColor,
                    backgroundColor: colors.surface,
                    borderWidth: isSelected ? 1.5 : 1,
                },
            ]}
        >
            {/* ── Top row: tag badge + actions + radio ── */}
            <View style={styles.topRow}>
                <View style={styles.leftTop}>
                    {isSelected ? (
                        <CheckCircle2 size={18} color={colors.primary} />
                    ) : (
                        <Circle size={18} color={colors.border} />
                    )}
                    {/* Tag badge */}
                    <View style={[styles.tagBadge, { backgroundColor: tagBg }]}>
                        {getAddressIcon(item.address_name, tagTextColor)}
                        <Text
                            style={[
                                styles.tagText,
                                { fontSize: font(10), color: tagTextColor },
                            ]}
                        >
                            {item.address_name}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onEdit}
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Pencil size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onDelete}
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Content ── */}
            <View style={styles.content}>
                <Text
                    style={[
                        styles.name,
                        { fontSize: font(12.5), color: colors.text },
                    ]}
                >
                    {item.full_name}
                </Text>

                <Text
                    style={[
                        styles.addressLine,
                        { fontSize: font(11.5), color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                >
                    {item.address}
                </Text>

                <Text
                    style={[
                        styles.meta,
                        { fontSize: font(10.5), color: colors.textSecondary },
                    ]}
                >
                    {item.city}, {item.state_name} – {item.pincode}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default AddressCard;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 12,
    },

    // ── Top row ──
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    leftTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    tagBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: "Poppins_500Medium",
        textTransform: "capitalize",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    actionBtn: {
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
    },

    // ── Text content ──
    content: {
        gap: 2,
    },
    name: {
        fontFamily: "Poppins_600SemiBold",
    },
    addressLine: {
        fontFamily: "Poppins_400Regular",
        lineHeight: 16,
    },
    meta: {
        fontFamily: "Poppins_400Regular",
        marginTop: 2,
    },
});
