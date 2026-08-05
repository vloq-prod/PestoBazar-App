import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  RotateCcw,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  MapPin,
  Receipt,
  User,
  AlertCircle,
  Play,
  ShieldAlert,
  ThumbsDown,
  ChevronRight,
  CreditCard,
} from "lucide-react-native";

// Project Imports
import AppNavbar from "../../../src/components/comman/AppNavbar";
import MediaLightbox from "../../../src/components/comman/MediaLightbox";
import { useCustomerReturnOrder } from "../../../src/hooks/orderHooks";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";

const IMAGE_BASE = "https://static-cdn.pestobazaar.com/";

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const cleanPrice = String(price).replace(/[₹\s,]/g, "");
  const num = Number(cleanPrice);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

const getReasonTheme = (reasonText: string, colors: any) => {
  return {
    bg: colors.backgroundgray,
    border: colors.border,
    text: colors.primary,
    icon: AlertCircle,
  };
};

const RETURN_STATUSES = [
  {
    label: "Return Placed",
    description: "Your return request has been placed successfully.",
  },
  {
    label: "Pickup Scheduled",
    description: "A pickup for your returned items has been scheduled.",
  },
  {
    label: "Product Dispatched",
    description: "The returned product has been dispatched to our hub.",
  },
  {
    label: "On Delivery",
    description: "Returned items are on their way to our warehouse.",
  },
  {
    label: "Completed",
    description: "Return request has been completed and refund processed.",
  },
];

const ReturnStatusTracker = ({
  currentStatus,
  colors,
  font,
  spacing,
}: {
  currentStatus: string;
  colors: any;
  font: (size: number) => number;
  spacing: (size: number) => number;
}) => {
  const isRejected = currentStatus?.toLowerCase() === "rejected" || currentStatus?.toLowerCase() === "failed";
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!isRejected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start();
    }
  }, [isRejected]);

  if (isRejected) {
    return (
      <View style={{ marginBottom: spacing(20), alignItems: "center" }}>
        <View
          style={{
            backgroundColor: "#FEF2F2",
            padding: 14,
            borderRadius: 16,
            width: "100%",
            gap: spacing(4),
            borderWidth: 1,
            borderColor: "#FEE2E2",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(8) }}>
            <XCircle size={20} color="#EF4444" />
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(14), color: "#EF4444" }}>
              Return Rejected / Failed
            </Text>
          </View>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(11), color: "#B91C1C", lineHeight: font(16) }}>
            Your return request has been rejected or failed. Please contact support for assistance.
          </Text>
        </View>
      </View>
    );
  }

  let activeIndex = 0;
  const statusLower = currentStatus?.toLowerCase() || "";
  if (statusLower.includes("pickup") || statusLower.includes("approved")) {
    activeIndex = 1;
  } else if (statusLower.includes("dispatch")) {
    activeIndex = 2;
  } else if (statusLower.includes("delivery") || statusLower.includes("transit")) {
    activeIndex = 3;
  } else if (statusLower.includes("completed") || statusLower.includes("delivered") || statusLower.includes("refunded")) {
    activeIndex = 4;
  }

  const activeColor = "#22C55E";

  return (
    <View style={{ paddingLeft: spacing(4), marginBottom: spacing(20) }}>
      {RETURN_STATUSES.map((status, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isActive = index <= activeIndex;
        const isLast = index === RETURN_STATUSES.length - 1;

        return (
          <View key={status.label} style={{ flexDirection: "row", minHeight: spacing(52) }}>
            <View style={{ alignItems: "center", width: spacing(30) }}>
              <View
                style={{
                  width: spacing(12),
                  height: spacing(12),
                  borderRadius: spacing(6),
                  backgroundColor: isActive ? activeColor : colors.border,
                  zIndex: 2,
                  marginTop: spacing(4),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCurrent && (
                  <Animated.View
                    style={{
                      width: spacing(18),
                      height: spacing(18),
                      borderRadius: spacing(9),
                      backgroundColor: activeColor,
                      position: "absolute",
                      transform: [{ scale: pulseAnim }],
                      opacity: 0.3,
                    }}
                  />
                )}
                {isCompleted && (
                  <View style={{ width: spacing(6), height: spacing(6), borderRadius: spacing(3), backgroundColor: "#FFF" }} />
                )}
              </View>
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor: index < activeIndex ? activeColor : colors.border,
                    marginVertical: -spacing(2),
                  }}
                />
              )}
            </View>

            <View style={{ marginLeft: spacing(16), paddingBottom: spacing(16), flex: 1 }}>
              <Text
                style={{
                  fontFamily: isCurrent ? "Poppins_700Bold" : isCompleted ? "Poppins_600SemiBold" : "Poppins_500Medium",
                  fontSize: font(13),
                  color: isActive ? colors.text : colors.textTertiary,
                }}
              >
                {status.label}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(11),
                  color: isActive ? colors.textSecondary : colors.textTertiary,
                  marginTop: 2,
                  lineHeight: font(11) * 1.55,
                }}
              >
                {status.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const UnboxingVideoCard = ({
  videoUrl,
  onPress,
  colors,
  font,
  spacing,
}: {
  videoUrl: string;
  onPress: () => void;
  colors: any;
  font: any;
  spacing: any;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.ticketCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          marginBottom: spacing(20),
          paddingVertical: spacing(14),
          paddingHorizontal: spacing(16),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(12) }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.statusBar === "light" ? "rgba(95, 22, 233, 0.15)" : "#E0D9F3",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play size={16} color={colors.primary} fill={colors.primary} />
        </View>
        <View style={{ gap: spacing(2) }}>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(12.5),
              color: colors.text,
            }}
          >
            Unboxing Proof Video
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(10.5),
              color: colors.textSecondary,
            }}
          >
            Tap to watch unboxing video proof
          </Text>
        </View>
      </View>
      <ChevronRight size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
};

/** Integrated Order Info & Address card */
const OrderDetailsSummary = ({ orderData, colors, font, spacing }: any) => {
  const maskedMobile = (mobile: string) => {
    if (!mobile) return "N/A";
    const str = String(mobile);
    if (str.length <= 5) return str;
    return str.substring(0, 5) + "XXXXX";
  };

  const IconWrapper = ({ icon: Icon, bg = colors.backgroundgray }: any) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: bg,
      }}
    >
      <Icon size={16} color={colors.textSecondary} />
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: 16,
        marginBottom: spacing(20),
      }}
    >
      {/* 1. Profile Section (With Border) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 12,
        }}
      >
        <IconWrapper icon={User} />
        <View style={{ marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: font(14),
              color: colors.text,
              includeFontPadding: false,
            }}
          >
            {orderData?.order_delivery_info?.full_name || "N/A"}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(12),
              color: colors.textSecondary,
              includeFontPadding: false,
              marginTop: 2,
            }}
          >
            {maskedMobile(orderData?.order_delivery_info?.mobile)}
          </Text>
        </View>
      </View>

      {/* 2. Payment Method */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={CreditCard} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
                includeFontPadding: false,
              }}
            >
              Payment Method
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              Payment Via:{" "}
              {orderData?.order?.payment_type?.toUpperCase() || "PREPAID"}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Deliver To Address */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={MapPin} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
                includeFontPadding: false,
              }}
            >
              Deliver To
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_delivery_info?.address},{" "}
              {orderData?.order_delivery_info?.city}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_delivery_info?.state_name} -{" "}
              {orderData?.order_delivery_info?.pincode}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Bill To Address */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <IconWrapper icon={Receipt} bg="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(13),
                color: colors.text,
                includeFontPadding: false,
              }}
            >
              Bill To
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.text,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_billing_info?.address},{" "}
              {orderData?.order_billing_info?.city}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: colors.textSecondary,
                includeFontPadding: false,
                marginTop: 1,
              }}
            >
              {orderData?.order_billing_info?.state_name} -{" "}
              {orderData?.order_billing_info?.pincode}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ReturnDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sanitizedId = (id || "").replace(/ /g, "+");
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();

  const [lightboxVisible, setLightboxVisible] = React.useState(false);
  const [lightboxData, setLightboxData] = React.useState<any[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = React.useState(0);

  const handleWatchImages = (productImages: any[], initialIndex: number) => {
    const formattedImages = productImages.map((img: any) => {
      const imgUrl = img.image_path?.startsWith("http")
        ? img.image_path
        : IMAGE_BASE + img.image_path;
      return {
        type: "image",
        image: imgUrl,
        video: null,
      };
    });
    setLightboxData(formattedImages);
    setLightboxInitialIndex(initialIndex);
    setLightboxVisible(true);
  };

  const { data, isLoading, error } = useCustomerReturnOrder(sanitizedId);

  const returnDetails = data;
  const orderInfo = returnDetails?.order;
  const returnInfo = returnDetails?.order_return;
  const returnedProducts = returnDetails?.order_return_product ?? [];

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppNavbar title="Return Details" showBack />
        <View style={styles.center}>
          <Text style={{ color: colors.textTertiary, fontSize: font(14) }}>
            No Return ID provided.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="Return Details" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.textSecondary,
              marginTop: spacing(12),
              fontSize: font(14),
              fontFamily: "Poppins_400Regular",
            }}
          >
            Loading Return Details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !returnDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <AppNavbar title="Return Details" showBack />
        <View style={styles.center}>
          <Text
            style={{
              color: "#EF4444",
              fontSize: font(16),
              fontFamily: "Poppins_600SemiBold",
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            {error instanceof Error ? error.message : "Error loading return details."}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{ marginTop: 20, padding: 10 }}
          >
            <Text style={{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" />
      <AppNavbar
        title={`Return #${returnInfo?.id || ""}`}
        subtitle={returnInfo?.return_at}
        showBack
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingVertical: spacing(20),
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing(16) }}>
          {/* Rejection comment box (above ReturnStatusTracker) */}
          {(returnInfo?.return_status === "Rejected" || returnInfo?.return_status === "Failed" || !!returnInfo?.return_rejected_comment) && (
            <View style={{ marginBottom: spacing(20), alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  padding: 10,
                  borderRadius: 16,
                  width: "100%",
                  gap: spacing(4),
                  borderWidth: 1,
                  borderColor: "#FEE2E2",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing(8),
                  }}
                >
                  <XCircle size={20} color="#EF4444" />
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(14),
                      color: "#EF4444",
                    }}
                  >
                    Return Rejected
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#B91C1C",
                    lineHeight: font(16),
                    textAlign: "left",
                  }}
                >
                  {returnInfo?.return_rejected_comment || "Your return request has been rejected or failed. Please contact support for assistance."}
                </Text>
              </View>
            </View>
          )}

          {/* Return Status Tracker */}
          <ReturnStatusTracker
            currentStatus={returnInfo?.return_status || "Pending"}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {/* Addresses Summary */}
          <OrderDetailsSummary
            orderData={returnDetails}
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {/* Unboxing Video Proof */}
          {!!returnInfo?.unboxing_video && (
            <UnboxingVideoCard
              videoUrl={returnInfo.unboxing_video}
              onPress={() => {
                setLightboxData([
                  {
                    type: "video",
                    video: returnInfo.unboxing_video,
                    image: null,
                  },
                ]);
                setLightboxInitialIndex(0);
                setLightboxVisible(true);
              }}
              colors={colors}
              font={font}
              spacing={spacing}
            />
          )}

          {/* Refund Summary */}
          <View
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 20,
              overflow: "hidden",
              paddingTop: 16,
              marginBottom: spacing(20),
            }}
          >
            {/* Header Section (With Border Bottom) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundgray,
                }}
              >
                <Receipt size={16} color={colors.textSecondary} />
              </View>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(14),
                  color: colors.text,
                  marginLeft: 12,
                }}
              >
                Refund Summary
              </Text>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: spacing(10) }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.textSecondary }}>
                  Original Order Total
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>
                  ₹{formatPrice(orderInfo?.order_amount)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.textSecondary }}>
                  Request Date
                </Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>
                  {returnInfo?.return_at || "N/A"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.textSecondary }}>
                  Refund Status
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(12.5),
                    color: returnInfo?.return_status === "Completed"
                      ? "#10B981"
                      : returnInfo?.return_status === "Rejected" || returnInfo?.return_status === "Failed"
                      ? "#EF4444"
                      : returnInfo?.return_status === "Approved"
                      ? "#3B82F6"
                      : "#F59E0B",
                  }}
                >
                  {returnInfo?.return_status || "Processing"}
                </Text>
              </View>


            </View>
          </View>

          {/* Refund Bank Details */}
          {returnDetails?.refund_bank_details && returnDetails.refund_bank_details.length > 0 && (
            <View
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 20,
                overflow: "hidden",
                paddingTop: 16,
                marginBottom: spacing(20),
              }}
            >
              {/* Header Section (With Border Bottom) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundgray,
                  }}
                >
                  <Receipt size={16} color={colors.textSecondary} />
                </View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(14),
                    color: colors.text,
                    marginLeft: 12,
                  }}
                >
                  Refund Bank Details
                </Text>
              </View>

              {returnDetails.refund_bank_details.map((bank: any) => (
                <View key={bank.id} style={{ paddingHorizontal: 16, paddingBottom: 16, gap: spacing(8) }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>
                      Refund Mode
                    </Text>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.primary }}>
                      {bank.refund_mode?.toUpperCase()}
                    </Text>
                  </View>

                  {bank.refund_mode === "bank" ? (
                    <View style={{ gap: spacing(6), marginTop: spacing(4) }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.textSecondary }}>
                          Bank Name
                        </Text>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
                          {bank.bank_name || "N/A"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.textSecondary }}>
                          Account Holder
                        </Text>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
                          {bank.account_holder || "N/A"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.textSecondary }}>
                          Account Number
                        </Text>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
                          {bank.account_number || "N/A"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.textSecondary }}>
                          IFSC Code
                        </Text>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
                          {bank.ifsc_code || "N/A"}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing(4) }}>
                      <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12), color: colors.textSecondary }}>
                        UPI ID
                      </Text>
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12), color: colors.text }}>
                        {bank.upi_id || "N/A"}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Returned Products */}
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: font(10.5),
              color: colors.textSecondary,
              marginBottom: spacing(14),
            }}
          >
            Returned Items
          </Text>

          <View>
            {returnedProducts.map((productItem: any, index: number) => {
              const imageUri = productItem.main_image?.startsWith("http")
                ? productItem.main_image
                : IMAGE_BASE + productItem.main_image;

              const theme = getReasonTheme(productItem.main_reason, colors);
              const ReasonIcon = theme.icon;

              return (
                <View
                  key={productItem.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderBottomWidth: 1.5,
                    borderColor: colors.border,
                    borderStyle: "solid",
                    padding: spacing(10),
                    marginBottom: spacing(12),
                    overflow: "hidden",
                  }}
                >
                  {/* Product Info Row */}
                  <View style={{ flexDirection: "row", gap: spacing(12), alignItems: "center" }}>
                    {/* Left Column: Image Box */}
                    <View
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 12,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={{ width: 68, height: 68 }}
                        contentFit="contain"
                      />
                    </View>

                    {/* Right Column: Content */}
                    <View style={{ flex: 1, gap: spacing(6) }}>
                      <Text
                        style={{
                          fontFamily: "Poppins_500Medium",
                          fontSize: font(12.5),
                          color: colors.text,
                          lineHeight: font(17),
                        }}
                        numberOfLines={2}
                      >
                        {productItem.product_name}
                      </Text>

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
                          {productItem.size && (
                            <>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  fontSize: font(10.5),
                                  color: colors.textSecondary,
                                }}
                              >
                                Size:{" "}
                                <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                                  {productItem.size}
                                </Text>
                              </Text>
                              <View
                                style={{
                                  width: 1,
                                  height: spacing(10),
                                  backgroundColor: colors.border,
                                }}
                              />
                            </>
                          )}

                          <Text
                            style={{
                              fontFamily: "Poppins_400Regular",
                              fontSize: font(10.5),
                              color: colors.textSecondary,
                            }}
                          >
                            Qty:{" "}
                            <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                              {productItem.quantity}
                            </Text>
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontFamily: "Poppins_600SemiBold",
                            fontSize: font(13.5),
                            color: colors.text,
                          }}
                        >
                          ₹{formatPrice(productItem.selling_price)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Return Reasons Box */}
                  <View
                    style={{
                      marginTop: spacing(10),
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: spacing(12),
                        gap: spacing(8),
                      }}
                    >
                      {/* Badge Header */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(6) }}>
                        <ReasonIcon size={14} color={theme.text} />
                        <Text
                          style={{
                            fontFamily: "Poppins_600SemiBold",
                            fontSize: font(10.5),
                            color: theme.text,
                          }}
                        >
                          Returned Reason Details
                        </Text>
                      </View>

                      {/* Main Reason and Sub Reason */}
                      <View style={{ gap: spacing(2) }}>
                        <Text
                          style={{
                            fontFamily: "Poppins_500Medium",
                            fontSize: font(9.5),
                            color: colors.textSecondary,
                          }}
                        >
                          Reason for Return
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Poppins_600SemiBold",
                            fontSize: font(11.5),
                            color: colors.text,
                          }}
                        >
                          {productItem.main_reason}
                          {!!productItem.sub_reason && (
                            <Text style={{ fontFamily: "Poppins_400Regular" }}> - {productItem.sub_reason}</Text>
                          )}
                        </Text>
                      </View>

                      {/* Comments */}
                      {!!productItem.comments && (
                        <View style={{ gap: spacing(2) }}>
                          <Text
                            style={{
                              fontFamily: "Poppins_500Medium",
                              fontSize: font(9.5),
                              color: colors.textSecondary,
                            }}
                          >
                            Comments
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Poppins_400Regular",
                              fontSize: font(10.5),
                              color: colors.text,
                              fontStyle: "italic",
                            }}
                          >
                            {"\""}{productItem.comments}{"\""}
                          </Text>
                        </View>
                      )}

                      {/* Return Product Images */}
                      {(() => {
                        const productImages = returnDetails?.order_return_product_images?.filter(
                          (img: any) => img.return_product_detail_id === productItem.id
                        ) || [];
                        if (productImages.length === 0) return null;
                        return (
                          <View style={{ gap: spacing(4), marginTop: spacing(2) }}>
                            <Text
                              style={{
                                fontFamily: "Poppins_500Medium",
                                fontSize: font(9.5),
                                color: colors.textSecondary,
                              }}
                            >
                              Uploaded Photos ({productImages.length})
                            </Text>
                            <View style={{ flexDirection: "row", gap: spacing(8), flexWrap: "wrap" }}>
                              {productImages.map((img: any, idx: number) => {
                                const imgUrl = img.image_path?.startsWith("http")
                                  ? img.image_path
                                  : IMAGE_BASE + img.image_path;
                                return (
                                  <TouchableOpacity
                                    key={idx}
                                    activeOpacity={0.8}
                                    onPress={() => handleWatchImages(productImages, idx)}
                                    style={{
                                      width: 64,
                                      height: 64,
                                      borderRadius: 10,
                                      borderWidth: 1.5,
                                      borderColor: colors.border,
                                      backgroundColor: colors.background,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Image
                                      source={{ uri: imgUrl }}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                      }}
                                      contentFit="cover"
                                    />
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <MediaLightbox
        visible={lightboxVisible}
        data={lightboxData}
        initialIndex={lightboxInitialIndex}
        onClose={() => setLightboxVisible(false)}
        accentColor={colors.primary}
      />
    </SafeAreaView>
  );
};

export default ReturnDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  ticketCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  productItemCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
