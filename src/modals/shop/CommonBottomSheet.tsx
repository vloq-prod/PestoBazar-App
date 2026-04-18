import React, { forwardRef, useMemo } from "react";
import { Text, useWindowDimensions, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import RenderHTML from "react-native-render-html";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";

type Props = {
  html: string;
};

const ProductDescriptionSheet = forwardRef<BottomSheet, Props>(
  ({ html }, ref) => {
    const { colors } = useTheme();
    const { font, spacing } = useResponsive();
    const { width } = useWindowDimensions();

    const snapPoints = useMemo(() => ["50%", "80%"], []);

    if (!html) return null;

    // 🔥 Backdrop
    const renderBackdrop = (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        pressBehavior="close"
      />
    );

    // 🔥 Base text style
    const baseStyle = {
      color: colors.textSecondary,
      fontSize: font(13),
      lineHeight: font(22),
      fontFamily: "Poppins_400Regular",
    };

    // 🔥 Tag styles (same as collapsed view)
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

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          width: 40,
          backgroundColor: "#ccc",
        }}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <BottomSheetScrollView
            showsVerticalScrollIndicator={true}
            bounces={false}
            contentContainerStyle={{
              padding: spacing(16),
              paddingBottom: spacing(30),
              paddingRight: spacing(8),
              backgroundColor: colors.background,
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: font(16),
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
                marginBottom: spacing(10),
              }}
            >
              Product Description
            </Text>

            {/* HTML */}
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
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

ProductDescriptionSheet.displayName = "ProductDescriptionSheet";

export default ProductDescriptionSheet;
