import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RenderHTML from "react-native-render-html";
import { X } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  html: string;
};

const ProductDescriptionModal: React.FC<Props> = ({
  visible,
  onClose,
  html,
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // 🔥 Base text style
  const baseStyle = {
    color: colors.textSecondary,
    fontSize: font(13),
    lineHeight: font(22),
    fontFamily: "Poppins_400Regular",
  };

  // 🔥 Tag styles
  const tagStyles: Record<string, any> = {
    p: {
      marginBottom: spacing(8),
      fontSize: font(13),
      lineHeight: font(22),
    },
    ul: {
      paddingLeft: spacing(18),
      marginBottom: spacing(10),
    },
    li: {
      fontSize: font(13),
      lineHeight: font(22),
      marginBottom: spacing(6),
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "700",
      fontSize: font(13),
      color: colors.text,
    },
    b: {
      fontFamily: "Poppins_700Bold",
      fontWeight: "700",
      fontSize: font(13),
      color: colors.text,
    },
    h1: {
      fontFamily: "Poppins_700Bold",
      fontSize: font(16),
      marginBottom: spacing(10),
      color: colors.text,
    },
    h2: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(15),
      marginBottom: spacing(8),
      color: colors.text,
    },
    h3: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(14),
      marginBottom: spacing(8),
      color: colors.text,
    },
  };

  if (!html) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop - clicking here closes the modal */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Content Container */}
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              maxHeight: height * 0.8,
              paddingBottom: insets.bottom + spacing(20),
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text
              style={[styles.title, { fontSize: font(16), color: colors.text }]}
            >
              Product Description
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.backgroundgray },
              ]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ padding: spacing(16) }}
          >
            <RenderHTML
              contentWidth={width - spacing(32)}
              source={{ html }}
              baseStyle={baseStyle}
              tagsStyles={tagStyles}
              enableCSSInlineProcessing={false}
              systemFonts={[
                "Poppins_400Regular",
                "Poppins_600SemiBold",
                "Poppins_700Bold",
              ]}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductDescriptionModal;
