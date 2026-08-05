import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Video,
  UploadCloud,
  CheckCircle,
  Play,
  Trash2,
  ChevronRight,
  ShieldAlert,
  X,
  Receipt,
  Download,
  User,
  CreditCard,
  MapPin,
  Square,
  CheckSquare,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";

// Project Imports
import AppNavbar from "../../../src/components/comman/AppNavbar";
import ReturnProductModal from "../../../src/components/comman/ReturnProductModal";
import RefundDetailsModal from "../../../src/components/comman/RefundDetailsModal";
import { useViewOrder, useUploadReturnVideo, useReturnProduct, useSaveReturnImage } from "../../../src/hooks/orderHooks";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";

// Safe Dynamic Import to prevent crash when bundler is not restarted
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  console.warn("expo-image-picker module not found or loaded");
}

const IMAGE_BASE = "https://static-cdn.pestobazaar.com/";

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return "0";
  const cleanPrice = String(price).replace(/[₹\s,]/g, "");
  const num = Number(cleanPrice);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
};

const WavyDivider = ({ color, spacing }: { color: string; spacing: any }) => {
  return (
    <View
      style={{ height: 10, overflow: "hidden", marginVertical: spacing(8) }}
    >
      <Svg height="10" width="1000">
        <Path
          d="M0 5 Q 3 1, 6 5 T 12 5 T 18 5 T 24 5 T 30 5 T 36 5 T 42 5 T 48 5 T 54 5 T 60 5 T 66 5 T 72 5 T 78 5 T 84 5 T 90 5 T 96 5 T 102 5 T 108 5 T 114 5 T 120 5 T 126 5 T 132 5 T 138 5 T 144 5 T 150 5 T 156 5 T 162 5 T 168 5 T 174 5 T 180 5 T 186 5 T 192 5 T 198 5 T 204 5 T 210 5 T 216 5 T 222 5 T 228 5 T 234 5 T 240 5 T 246 5 T 252 5 T 258 5 T 264 5 T 270 5 T 276 5 T 282 5 T 288 5 T 294 5 T 300 5 T 306 5 T 312 5 T 318 5 T 324 5 T 330 5 T 336 5 T 342 5 T 348 5 T 354 5 T 360 5 T 366 5 T 372 5 T 378 5 T 384 5 T 390 5 T 396 5 T 402 5 T 408 5 T 414 5 T 420 5 T 426 5 T 432 5 T 438 5 T 444 5 T 450 5 T 456 5 T 462 5 T 468 5 T 474 5 T 480 5 T 486 5 T 492 5 T 498 5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
};

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
      style={[
        styles.ticketCard,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingVertical: 5,
          marginBottom: spacing(20),
        },
      ]}
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

const SectionLabel = ({ title, colors, font }: any) => (
  <View>
    <Text
      style={{
        fontFamily: "Poppins_600SemiBold",
        letterSpacing: 1,
        textTransform: "uppercase",
        fontSize: font(10.5),
        color: colors.textSecondary,
      }}
    >
      {title}
    </Text>
  </View>
);

const LocalVideoPreview = ({ uri, colors }: { uri: string; colors: any }) => {
  const isMock = uri.startsWith("file:///mock");
  const player = useVideoPlayer(isMock ? "" : uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    if (player && !isMock) {
      player.play();
    }
  }, [player, isMock]);

  if (isMock || !player) {
    return (
      <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <Play size={20} color={colors.primary} fill={colors.primary} />
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      nativeControls={true}
      contentFit="cover"
    />
  );
};

const ReturnProductsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();


  const { data: orderResponse } = useViewOrder({
    order_id: id || "",
  });
  const uploadVideoMutation = useUploadReturnVideo();

  const orderData = orderResponse?.data;

  // Video State
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [videoType, setVideoType] = useState<string>("");
  const [videoSize, setVideoSize] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<string>("");

  const returnProductMutation = useReturnProduct();
  const saveReturnImageMutation = useSaveReturnImage();

  // Return Flow States
  const [checkedProducts, setCheckedProducts] = useState<Record<number, boolean>>({});
  const [productReturns, setProductReturns] = useState<Record<number, {
    reasonId: number;
    reasonText: string;
    subReasonId: number | null;
    subReasonText: string;
    comments: string;
    images: string[];
  }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);

  const selectVideo = async () => {
    if (!ImagePicker) {
      Alert.alert(
        "Module Offline",
        "Please restart your Metro bundler (press 'r' in terminal or rebuild the app) to load expo-image-picker. Using a mock video for testing now.",
        [
          {
            text: "Mock Video",
            onPress: () => {
              setVideoUri("file:///mock/path/unboxing_proof.mp4");
              setVideoName("mock_return_proof.mp4");
              setVideoType("video/mp4");
              setVideoSize("12.4 MB");
              setVideoDuration("15s");
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant media library access to select a proof video."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.fileName || "return_proof.mp4";
        const type = asset.mimeType || "video/mp4";

        const sizeBytes = asset.fileSize || 0;
        const sizeMB = sizeBytes ? (sizeBytes / (1024 * 1024)).toFixed(1) + " MB" : "";
        const durationSec = asset.duration ? Math.round(asset.duration) + "s" : "";

        setVideoUri(uri);
        setVideoName(name);
        setVideoType(type);
        setVideoSize(sizeMB);
        setVideoDuration(durationSec);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while choosing the video.");
    }
  };

  const removeVideo = () => {
    setVideoUri(null);
    setVideoName("");
    setVideoType("");
    setVideoSize("");
    setVideoDuration("");
  };

  const checkedCount = Object.values(checkedProducts).filter(Boolean).length;
  const checkedItems = orderData?.order_detail?.filter((item: any) => checkedProducts[item.id]) || [];
  const allCheckedFilled = checkedCount > 0 && checkedItems.every((item: any) => productReturns[item.id]?.reasonId !== undefined);
  const isSubmitEnabled = checkedCount > 0 && allCheckedFilled;

  const handleSubmitReturn = async (refundData: any) => {
    try {
      setIsSubmitting(true);
      const returnKey = "RET-" + Date.now();

      for (const item of checkedItems) {
        const details = productReturns[item.id];
        const returnPayload: any = {
          order_id: String(id),
          product_id: item.product_id,
          return_quantity: item.qty,
          purchased_qty: item.qty,
          return_reason: details.reasonId,
          more_return_reason: details.subReasonId || details.reasonId,
          comments: details.comments,
          return_key: returnKey,
          product_variation_id: item.variation_id,
          refund_mode: refundData.method.toLowerCase(),
          video_path: videoUri || "",
        };

        if (refundData.method === "Bank") {
          returnPayload.account_holder = refundData.holderName;
          returnPayload.account_number = refundData.accountNo;
          returnPayload.ifsc_code = refundData.ifsc;
          returnPayload.bank_name = refundData.bankName;
          returnPayload.bank_path = refundData.chequeImage || "";
        } else {
          returnPayload.upi_id = refundData.upiId;
          returnPayload.bank_path = refundData.upiImage || "";
        }

        const res = await returnProductMutation.mutateAsync(returnPayload);

        const productDetailId = res.data?.order_return_product_detail_id;
        const orderReturnId = res.data?.order_return_id;
        const orderIdVal = res.data?.order_id;

        if (productDetailId && details.images && details.images.length > 0) {
          for (const imgUri of details.images) {
            await saveReturnImageMutation.mutateAsync({
              order_return_product_detail_id: Number(productDetailId),
              order_return_id: Number(orderReturnId),
              order_id: Number(orderIdVal),
              image_path: imgUri,
            });
          }
        }
      }

      setIsSubmitting(false);
      Alert.alert("Success", "Your return request has been submitted successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      setIsSubmitting(false);
      console.error("Return failed:", err);
      Alert.alert("Error", err?.message || "Failed to submit return request.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppNavbar
        title="Return Products"
        subtitle={orderData?.order_id ? `Order #${orderData.order_id}` : undefined}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: spacing(16), gap: spacing(8) }}>

          {/* Instruction Section */}
          <SectionLabel
            title="Upload Unboxing Video"
            colors={colors}
            font={font}
            spacing={spacing}
          />

          {/* Upload Box */}
          {!videoUri ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={selectVideo}
              style={[
                styles.uploadBox,
                {
                  borderColor: "#4B5563", // Clean dark gray border
                  backgroundColor: colors.backgroundgray,
                },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                <UploadCloud size={18} color={colors.primary} />
              </View>
              <View style={{ alignItems: "center", gap: 2 }}>
                <Text style={[styles.uploadBoxTitle, { color: colors.text, fontSize: font(13.5) }]}>
                  Select Unboxing Video
                </Text>
                <Text style={[styles.uploadBoxSub, { color: colors.textTertiary, fontSize: font(10) }]}>
                  Supports MP4 or MOV up to 200MB (Max 1 file)
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.previewCard, { borderColor: colors.border, backgroundColor: colors.backgroundgray }]}>
              <View style={styles.previewHeader}>

                {/* Left Side: Video Preview Player */}
                <View style={[styles.playIconContainer, { backgroundColor: colors.surface, overflow: "hidden" }]}>
                  <LocalVideoPreview uri={videoUri} colors={colors} />
                </View>

                {/* Middle: File Name and Details */}
                <View style={{ flex: 1, gap: 2, paddingRight: 16, justifyContent: "center" }}>
                  <Text style={[styles.fileName, { color: colors.text, fontSize: font(12.5) }]} numberOfLines={1}>
                    {videoName}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
                    {!!videoSize && (
                      <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: font(10) }]}>
                          {videoSize}
                        </Text>
                      </View>
                    )}
                    {!!videoDuration && (
                      <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: font(10) }]}>
                          {videoDuration}
                        </Text>
                      </View>
                    )}
                    {!!videoType && (
                      <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: font(10) }]}>
                          {videoType.split("/")[1]?.toUpperCase() || videoType.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

              </View>

              {/* Top Right absolutely positioned close button */}
              <TouchableOpacity onPress={removeVideo} style={styles.closeBtn}>
                <X size={10} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Products List Section */}
          <View style={{ marginTop: spacing(12) }}>
            <SectionLabel
              title="Products in this Order"
              colors={colors}
              font={font}
            />
          </View>

          {orderData?.order_detail?.map((item: any) => {
            const isChecked = !!checkedProducts[item.id];
            const hasDetails = !!productReturns[item.id]?.reasonId;
            const imageUri = item.main_image?.startsWith("http")
              ? item.main_image
              : IMAGE_BASE + item.main_image;            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => {
                  if (isChecked) {
                    setSelectedProduct(item);
                    setIsModalVisible(true);
                  } else {
                    // Auto-check and open modal
                    setCheckedProducts(prev => ({ ...prev, [item.id]: true }));
                    setSelectedProduct(item);
                    setIsModalVisible(true);
                  }
                }}
                style={[
                  {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    paddingVertical: spacing(16),
                    gap: spacing(12),
                  },
                ]}
              >
                {/* Top Row: Checkbox + Image + Core Details */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                  {/* Checkbox Icon */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setCheckedProducts(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    style={{ marginRight: 2, height: 80, justifyContent: "center" }}
                  >
                    {isChecked ? (
                      <CheckSquare size={22} color={colors.primary} />
                    ) : (
                      <Square size={22} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>

                  {/* Left Column: Image - exactly like OrderItemCard */}
                  <View
                    style={{
                      width: 80,
                      height: 80,
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
                      style={{ width: 72, height: 72 }}
                      contentFit="contain"
                    />
                  </View>

                  {/* Right Column: Content */}
                  <View style={{ flex: 1, gap: spacing(8) }}>
                    {/* Row 1: Product Name */}
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(12),
                        color: colors.text,
                        lineHeight: font(18),
                      }}
                      numberOfLines={2}
                    >
                      {item.product_name}
                    </Text>

                    {/* Row 2: Size, Qty (Left) & Price (Right) */}
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
                          gap: spacing(8),
                        }}
                      >
                        {item.size && (
                          <>
                            <Text
                              style={{
                                fontFamily: "Poppins_400Regular",
                                fontSize: font(11),
                                color: colors.textSecondary,
                              }}
                            >
                              Size:{" "}
                              <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                                {item.size}
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
                            fontSize: font(11),
                            color: colors.textSecondary,
                          }}
                        >
                          Qty:{" "}
                          <Text style={{ color: colors.text, fontFamily: "Poppins_500Medium" }}>
                            {item.qty}
                          </Text>
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(14),
                          color: colors.text,
                        }}
                      >
                        ₹{formatPrice(item.price_per_piece)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Row: Status Indicator for Return Details */}
                {isChecked && (
                  <View
                    style={{
                      paddingTop: spacing(8),
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      gap: spacing(4),
                      marginLeft: 36, // aligned cleanly under the product image Container
                    }}
                  >
                    {hasDetails ? (
                      <View style={{ gap: 2 }}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(10.5), color: "#10B981" }}>
                          ✓ Return details added
                        </Text>
                        {/* Show Main Reason in main text color */}
                        {!!productReturns[item.id]?.reasonText && (
                          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(11.5), color: colors.text, marginTop: 2 }}>
                            Reason: <Text style={{ fontFamily: "Poppins_400Regular" }}>{productReturns[item.id].reasonText}</Text>
                          </Text>
                        )}
                        {/* Show Sub Reason in secondary color */}
                        {!!productReturns[item.id]?.subReasonText && (
                          <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(10.5), color: colors.textSecondary }}>
                            Sub-reason: <Text style={{ fontFamily: "Poppins_400Regular" }}>{productReturns[item.id].subReasonText}</Text>
                          </Text>
                        )}
                        {/* Show Comments in italicized secondary color */}
                        {!!productReturns[item.id]?.comments && (
                          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: font(10.5), color: colors.textSecondary, fontStyle: "italic" }}>
                            Comment: {"\""}{productReturns[item.id].comments}{"\""}
                          </Text>
                        )}
                        {/* Show uploaded product images */}
                        {productReturns[item.id]?.images && productReturns[item.id].images.length > 0 && (
                          <View style={{ flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            {productReturns[item.id].images.map((imgUri: string, idx: number) => (
                              <Image
                                key={idx}
                                source={{ uri: imgUri }}
                                style={{ width: 45, height: 45, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}
                                contentFit="cover"
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(10), color: "#EF4444" }}>
                        * Return details required (Tap to add)
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Order Details (Customer Info / Addresses) Section */}
          <View style={{ marginTop: spacing(16) }}>
            <SectionLabel
              title="Order Details"
              colors={colors}
              font={font}
              spacing={spacing}
            />
            <View style={{ marginTop: spacing(8) }}>
              <OrderDetailsSummary
                orderData={orderData}
                colors={colors}
                font={font}
                spacing={spacing}
              />
            </View>
          </View>

          {/* Bill Summary Section */}
          <View>
            <View
              style={[
                styles.ticketCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  paddingTop: 16,
                  borderWidth: 1,
                  borderRadius: 20,
                  overflow: "hidden",
                  marginBottom: spacing(20),
                },
              ]}
            >
              {/* Internal Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
                    }}
                  >
                    Bill Summary
                  </Text>
                </View>
              </View>

              <View style={[styles.cardContent, { paddingHorizontal: 16, gap: 4, marginBottom: 8 }]}>
                <View style={styles.detailsRow}>
                  <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.text }}>Item Total</Text>
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>₹{formatPrice(orderData?.order?.order_amount)}</Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.text }}>Shipping</Text>
                  {orderData?.order?.shipping_charge === "0" ? (
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(12.5), color: "#10B981" }}>FREE</Text>
                  ) : (
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>+ ₹{formatPrice(orderData?.order?.shipping_charge)}</Text>
                  )}
                </View>

                {orderData?.order?.cod_charges !== "0" && (
                  <View style={styles.detailsRow}>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.text }}>COD Charges</Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_700Bold",
                        fontSize: font(12.5),
                        color: Number(orderData?.order?.cod_charges) > 0 ? "#EF4444" : colors.text,
                      }}
                    >
                      + ₹{formatPrice(orderData?.order?.cod_charges)}
                    </Text>
                  </View>
                )}

                <View style={styles.detailsRow}>
                  <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(12.5), color: colors.text }}>GST (Govt. Taxes)</Text>
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(12.5), color: colors.text }}>+ ₹{formatPrice(orderData?.order?.shipping_gst || "0")}</Text>
                </View>
              </View>

              <WavyDivider color={colors.border} spacing={spacing} />

              <View style={{ paddingHorizontal: 16, marginTop: 0, marginBottom: spacing(8) }}>
                <View style={styles.detailsRow}>
                  <View>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(14), color: colors.textSecondary }}>Grand Total</Text>
                    <Text style={{ fontFamily: "Poppins_500Medium", fontSize: font(10), color: colors.textSecondary, marginTop: -1 }}>
                      Payment by {orderData?.order?.payment_type?.toLowerCase() === "cash" ? "Cash" : "Prepaid"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: font(20), color: colors.text }}>
                      ₹{formatPrice(orderData?.order?.paid_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Button Container */}
      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (!isSubmitEnabled) {
              Alert.alert("Error", "Please select at least one item and fill in their return details.");
              return;
            }
            setIsRefundModalVisible(true);
          }}
          disabled={!isSubmitEnabled || isSubmitting}
          style={{
            backgroundColor: colors.primary,
            opacity: isSubmitEnabled ? 1 : 0.5,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: font(14), color: "#fff" }}>
              Submit Return Request
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Return Product Modal */}
      <ReturnProductModal
        visible={isModalVisible}
        orderId={id}
        productName={selectedProduct?.product_name}
        onClose={() => setIsModalVisible(false)}
        initialReasonId={selectedProduct ? productReturns[selectedProduct.id]?.reasonId : null}
        initialReasonText={selectedProduct ? productReturns[selectedProduct.id]?.reasonText : ""}
        initialSubReasonId={selectedProduct ? productReturns[selectedProduct.id]?.subReasonId : null}
        initialSubReasonText={selectedProduct ? productReturns[selectedProduct.id]?.subReasonText : ""}
        initialComments={selectedProduct ? productReturns[selectedProduct.id]?.comments : ""}
        initialImages={selectedProduct ? productReturns[selectedProduct.id]?.images : []}
        onConfirm={(reasonId, reasonText, subReasonId, subReasonText, comments, imageUris) => {
          if (selectedProduct) {
            setProductReturns(prev => ({
              ...prev,
              [selectedProduct.id]: {
                reasonId,
                reasonText,
                subReasonId,
                subReasonText,
                comments,
                images: imageUris,
              }
            }));
          }
          setIsModalVisible(false);
        }}
      />

      {/* Refund Details Modal */}
      <RefundDetailsModal
        visible={isRefundModalVisible}
        onClose={() => setIsRefundModalVisible(false)}
        onSubmit={handleSubmitReturn}
      />
    </SafeAreaView>
  );
};

export default ReturnProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 100,
  },
  titleSection: {

  },
  titleText: {
    fontFamily: "Poppins_700Bold",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadBoxTitle: {
    fontFamily: "Poppins_600SemiBold",
  },
  uploadBoxSub: {
    fontFamily: "Poppins_400Regular",
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    position: "relative",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: false,
  },
  fileType: {
    fontFamily: "Poppins_400Regular",
  },
  closeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  metaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metaText: {
    fontFamily: "Poppins_500Medium",
    includeFontPadding: false,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
    borderBottomWidth: 1,
  },
  productImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productDetails: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontFamily: "Poppins_500Medium",
  },
  productMeta: {
    fontFamily: "Poppins_400Regular",
  },
  productPrice: {
    fontFamily: "Poppins_600SemiBold",
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsLabel: {
    fontFamily: "Poppins_500Medium",
  },
  detailsValue: {
    fontFamily: "Poppins_600SemiBold",
  },
  ticketCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 16,
  },
  cardContent: {
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 8,
  },
});

