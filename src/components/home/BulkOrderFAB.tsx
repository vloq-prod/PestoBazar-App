import React, { useMemo } from "react";
import {
  Platform,
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  ShieldCheck,
  AlertCircle,
  Store,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  Extrapolate,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useB2BApplicationStatus } from "../../hooks/b2bHooks";

const BULK_ORDER_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=300&auto=format&fit=crop";

const FAB_WIDTH = 138;
const FAB_HEIGHT = 44;

type Props = {
  onPress?: () => void;
  visible?: SharedValue<number>;
  pbandroid?: number;
  pbios?: number;
};

const BulkOrderFAB: React.FC<Props> = ({
  onPress,
  visible,
  pbandroid,
  pbios,
}) => {
  const { colors } = useTheme();
  const { spacing } = useResponsive();
  const { height } = useWindowDimensions();
  const router = useRouter();
  const { data: b2bStatus } = useB2BApplicationStatus();

  const manualOpen = useSharedValue(1);
  const defaultBottomOffset = Math.max(120, Math.min(height * 0.22, 200));
  const bottomOffset =
    pbandroid !== undefined || pbios !== undefined
      ? Platform.OS === "ios"
        ? spacing(pbios ?? 90)
        : spacing(pbandroid ?? 12)
      : defaultBottomOffset;

  // Dynamic visual state based on B2B status
  const visual = useMemo(() => {
    const rawStatus = (b2bStatus?.status || "").toLowerCase().trim();
    const isApproved =
      b2bStatus?.is_b2b_user === true || rawStatus === "approved";

    // 1. Approved Wholesale / B2B User -> Green
    if (isApproved) {
      return {
        title: "Bulk Buyer",
        subtitle: "Approved",
        badge: "Verified",
        gradient: ["#064e3b", "#059669"] as [string, string],
        bgColor: "#059669",
        shadowColor: "#059669",
        Icon: ShieldCheck,
      };
    }

    // 2. Submitted for Approval -> Exact Web Warning Brown/Amber
    const isSubmitted =
      rawStatus === "submitted for approval" ||
      rawStatus === "submitted" ||
      rawStatus.includes("submit");

    if (isSubmitted) {
      return {
        title: "Bulk Buyer",
        subtitle: "Submitted",
        badge: "In Review",
        gradient: ["#805009", "#a66a10"] as [string, string],
        bgColor: "#a66a10",
        shadowColor: "#805009",
        Icon: Clock,
      };
    }

    // 3. Under Review -> Blue / Info
    const isUnderReview =
      rawStatus === "under review" ||
      rawStatus === "under_review" ||
      rawStatus === "in_review" ||
      rawStatus.includes("review");

    if (isUnderReview) {
      return {
        title: "Bulk Buyer",
        subtitle: "Under Review",
        badge: "In Review",
        gradient: ["#1e3a8a", "#2563eb"] as [string, string],
        bgColor: "#2563eb",
        shadowColor: "#1e3a8a",
        Icon: Clock,
      };
    }

    // 4. Correction Required -> Red
    const isCorrection =
      rawStatus === "correction required" ||
      rawStatus === "correction_required" ||
      rawStatus.includes("correct");

    if (isCorrection) {
      return {
        title: "Bulk Buyer",
        subtitle: "Correction Req.",
        badge: "Action Req.",
        gradient: ["#7f1d1d", "#dc2626"] as [string, string],
        bgColor: "#dc2626",
        shadowColor: "#7f1d1d",
        Icon: AlertCircle,
      };
    }

    // 5. Draft / Continue Setup -> Orange / Amber
    const isDraft =
      rawStatus === "draft" ||
      rawStatus === "incomplete" ||
      (b2bStatus?.has_application && !rawStatus);

    if (isDraft) {
      return {
        title: "Bulk Buyer",
        subtitle: "Continue Setup",
        badge: "Draft",
        gradient: ["#7c2d12", "#d97706"] as [string, string],
        bgColor: "#d97706",
        shadowColor: "#d97706",
        Icon: Clock,
      };
    }

    // 6. Default / Not applied -> Brand Primary Purple
    return {
      title: "Become a",
      subtitle: "Bulk Buyer",
      badge: null,
      gradient: ["#20086b", "#5f16e9"] as [string, string],
      bgColor: "#5f16e9",
      shadowColor: "#5f16e9",
      Icon: Store,
    };
  }, [b2bStatus]);

  useAnimatedReaction(
    () => visible?.value ?? 1,
    (current, previous) => {
      if (current === previous) return;
      manualOpen.value = withTiming(current > 0.5 ? 1 : 0, { duration: 280 });
    },
    [visible],
  );

  const expandStyle = useAnimatedStyle(() => {
    const progress = manualOpen.value;

    return {
      width: interpolate(progress, [0, 1], [0, FAB_WIDTH], Extrapolate.CLAMP),
      opacity: interpolate(
        progress,
        [0, 0.35, 1],
        [0, 0, 1],
        Extrapolate.CLAMP,
      ),
      overflow: "hidden",
    };
  });

  const collapsedHandleStyle = useAnimatedStyle(() => {
    const progress = manualOpen.value;

    return {
      width: interpolate(progress, [0, 1], [22, 0], Extrapolate.CLAMP),
      opacity: interpolate(
        progress,
        [0, 0.35, 1],
        [1, 0, 0],
        Extrapolate.CLAMP,
      ),
      overflow: "hidden",
    };
  });

  const handlePress = () => {
    onPress?.();
    router.push("/b2b");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      style={{
        position: "absolute",
        right: 0,
        bottom: bottomOffset,
        zIndex: 50,
        flexDirection: "row",
        alignItems: "center",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        shadowColor: visual.shadowColor,
        shadowOffset: { width: -2, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 5,
        elevation: 7,
      }}
    >
      {/* Expanded State (Rich gradient badge with subtle backdrop) */}
      <Animated.View style={[{ position: "relative" }, expandStyle]}>
        <View
          style={{
            width: FAB_WIDTH,
            height: FAB_HEIGHT,
            position: "relative",
            overflow: "hidden",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          {/* Subtle background image */}
          <Image
            source={{ uri: BULK_ORDER_IMAGE }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />

          {/* Status Gradient Overlay */}
          <LinearGradient
            colors={visual.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              ...StyleSheet.absoluteFillObject,
              opacity: 0.92,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: 8,
              paddingRight: 6,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              <visual.Icon size={18} color="#ffffff" strokeWidth={2.2} />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    color: "#ffffff",
                    fontFamily: "Poppins_700Bold",
                    lineHeight: 14,
                  }}
                >
                  {visual.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 9.5,
                    color: "rgba(255,255,255,0.95)",
                    fontFamily: "Poppins_600SemiBold",
                    lineHeight: 12,
                  }}
                >
                  {visual.subtitle}
                </Text>
              </View>
            </View>

            <ChevronRight size={17} color="#ffffff" strokeWidth={2.5} />
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Collapsed State (Compact side-tab handle) */}
      <Animated.View
        style={{
          height: FAB_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Animated.View style={collapsedHandleStyle}>
          <View
            style={{
              width: 22,
              height: FAB_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: visual.bgColor,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              overflow: "hidden",
            }}
          >
            <ChevronLeft size={18} color="#ffffff" strokeWidth={2.5} />
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BulkOrderFAB;
