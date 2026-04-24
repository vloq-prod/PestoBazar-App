import React, { isValidElement } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

export interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    icon?: React.ReactNode;
    confirmText?: string;
    confirmColor?: string;
    isLoading?: boolean;
    cancelText?: string;
    showCancelButton?: boolean;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    icon,
    confirmText = "Confirm",
    confirmColor,
    isLoading = false,
    cancelText = "Cancel",
    showCancelButton = true,
    containerStyle,
    titleStyle,
    descriptionStyle,
}) => {
    const { colors } = useTheme();
    const { font, spacing } = useResponsive();

    // Default confirm color is theme primary, or red if the title suggests destructive action
    const isDestructive = title.toLowerCase().includes("delete") || title.toLowerCase().includes("remove") || title.toLowerCase().includes("logout");
    const primaryBtnColor = confirmColor || (isDestructive ? "#EF4444" : colors.primary);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={!isLoading ? onClose : undefined}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View
                            style={[
                                styles.modalContainer,
                                { backgroundColor: colors.surface, borderRadius: spacing(20) },
                                containerStyle,
                            ]}
                        >


                            {/* ── Text Section ── */}
                            <Text
                                style={[
                                    styles.title,
                                    { fontSize: font(18), color: colors.text, },
                                    titleStyle,
                                ]}
                            >
                                {title}
                            </Text>
                            <Text
                                style={[
                                    styles.description,
                                    {
                                        fontSize: font(13.5),
                                        color: colors.textSecondary,
                                        marginTop: spacing(6),
                                        marginBottom: spacing(28),
                                    },
                                    descriptionStyle,
                                ]}
                            >
                                {description}
                            </Text>

                            {/* ── Action Buttons ── */}
                            <View style={[styles.actionRow, { gap: spacing(12) }]}>
                                {showCancelButton && (
                                    <TouchableOpacity
                                        style={[
                                            styles.cancelBtn,
                                            {
                                                backgroundColor: "#F3F4F6", // Light gray background for cancel
                                                borderRadius: spacing(14),
                                            },
                                        ]}
                                        onPress={onClose}
                                        disabled={isLoading}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.cancelText,
                                                { fontSize: font(14), color: "#1F2937" }, // Dark text for cancel
                                            ]}
                                        >
                                            {cancelText}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.confirmBtn,
                                        {
                                            backgroundColor: primaryBtnColor,
                                            borderRadius: spacing(14),
                                            shadowColor: primaryBtnColor,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        },
                                    ]}
                                    onPress={onConfirm}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <View style={styles.confirmBtnInner}>
                                            {icon && isValidElement(icon) && (
                                                <View style={{ marginRight: 6 }}>
                                                    {React.cloneElement(icon as React.ReactElement<any>, { size: 18, color: "#FFF" })}
                                                </View>
                                            )}
                                            <Text
                                                style={[
                                                    styles.confirmText,
                                                    { fontSize: font(14) },
                                                ]}
                                            >
                                                {confirmText}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 340,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontFamily: "Poppins_600SemiBold",
        textAlign: "center",
    },
    description: {
        fontFamily: "Poppins_400Regular",
        textAlign: "center",
        lineHeight: 20,
    },
    actionRow: {
        flexDirection: "row",
        width: "100%",
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmBtnInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelText: {
        fontFamily: "Poppins_600SemiBold",
    },
    confirmText: {
        fontFamily: "Poppins_600SemiBold",
        color: "#FFF",
    },
});
