import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  Switch,
  Image as RNImage,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Briefcase,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Percent,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Edit2,
  RotateCcw,
  Sparkles,
  Lock,
  Building2,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Tag,
  Search,
  X,
  Store,
  Truck,
  Building,
  Users,
  Bug,
  MapPin,
  Home,
  Compass,
  FileCheck2,
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Upload,
  Eye,
  FileBadge,
  CheckSquare,
  Square,
  Camera,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useToast } from "../../src/context/ToastContext";
import { StorageUtil } from "../../src/utils/storage";
import { useAppVisitorStore } from "../../src/store/auth";
import { setAnalyticsUserId } from "../../src/lib/analytics";
import ResendOtpModal, { OtpChannel } from "../../src/modals/auth/ResendOtpModal";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import {
  useB2BMasterData,
  useB2BGetRegistrationDetails,
  useB2BSaveBasicDetails,
  useB2BVerifyOtp,
  useB2BResendOtp,
  useB2BVerifyGst,
  useB2BValidateReferralCode,
  useB2BSaveBusinessDetails,
  useB2BSaveAddressDetails,
  useB2BSaveKycDetails,
  useB2BSubmitKycDetails,
} from "../../src/hooks/b2bHooks";
import {
  B2BSaveBusinessDetailsPayload,
  B2BSaveAddressDetailsPayload,
} from "../../src/types/b2b.types";
import { apiClient, BASE_URL } from "../../src/lib/apiClient";
import { useAddress } from "../../src/hooks/CheckoutHooks";
import { StateItem } from "../../src/types/checkout.types";

// Helper icon resolver for dealer categories dynamically loaded from DB
const getDealerCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("retail")) return Store;
  if (
    lower.includes("distribut") ||
    lower.includes("whole") ||
    lower.includes("dealer") ||
    lower.includes("stockist")
  )
    return Truck;
  if (lower.includes("institut") || lower.includes("buyer")) return Building;
  if (lower.includes("coop") || lower.includes("fpo")) return Users;
  if (lower.includes("pest")) return Bug;
  return Store;
};

// Helper description resolver for dealer categories dynamically loaded from DB
const getDealerCategoryDesc = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("retail"))
    return "Local retail shop selling to farmers & consumers";
  if (lower.includes("distribut") || lower.includes("sub-distribut"))
    return "Wholesale distributor supplying to dealers & retailers";
  if (
    lower.includes("wholesal") ||
    lower.includes("dealer") ||
    lower.includes("stockist")
  )
    return "Wholesale dealer / distributor supplying goods";
  if (lower.includes("institut") || lower.includes("bulk"))
    return "Corporate, commercial farms, or institutions";
  if (lower.includes("coop") || lower.includes("fpo"))
    return "Farmer Producer Org or Co-op society";
  if (lower.includes("pest"))
    return "PCO service operator & professional applicator";
  return "Registered commercial business";
};



const INPUT_HEIGHT = 48;

const B2B_STEPS: Array<{
  step: 1 | 2 | 3 | 4 | 5;
  stepLabel: string;
  title: string;
}> = [
  { step: 1, stepLabel: "Step 1", title: "Basic Details" },
  { step: 2, stepLabel: "Step 2", title: "Business Details" },
  { step: 3, stepLabel: "Step 3", title: "Address Details" },
  { step: 4, stepLabel: "Step 4", title: "KYC Documents" },
  { step: 5, stepLabel: "Step 5", title: "Review & Submit" },
];

const STEP_NAMES: Record<number, string> = {
  1: "Basic Details",
  2: "Business Details",
  3: "Address Details",
  4: "KYC Documents",
  5: "Review & Submit",
};

const FIELD_LABELS: Record<string, string> = {
  owner_name: "Owner / Full Name",
  mobile: "Mobile Number",
  alternate_mobile: "Alternate Mobile",
  email: "Email Address",
  business_name: "Business / Firm Name",
  business_type_id: "Business Type",
  dealer_category_id: "Dealer Category",
  years_in_business: "Years in Business",
  gst_number: "GSTIN Number",
  referral_code: "Referral Code",
  business_address: "Business Address",
  business_city: "City",
  business_state_id: "State",
  business_pincode: "Pincode",
  legal_business_name: "Legal Business Name",
  pan_number: "PAN Number",
  pan_name: "Name on PAN",
  aadhaar_holder_name: "Aadhaar Holder Name",
  business_proof_type: "Business Proof Type",
  gst_certificate: "GST Certificate",
  pan_card: "PAN Card Document",
  aadhaar_card: "Aadhaar Card Document",
  business_proof_document: "Business Proof Document",
};

// ── Standard App Form Input (Matching addaddress.tsx) ─────────
interface AppInputFieldProps {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  maxLength?: number;
  optional?: boolean;
  required?: boolean;
  prefix?: string;
  prefixIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  letterSpacing?: number;
  inputStyle?: any;
  isRejected?: boolean;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
}

const AppInputField: React.FC<AppInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  optional,
  required,
  prefix,
  prefixIcon,
  rightElement,
  editable = true,
  multiline = false,
  numberOfLines,
  letterSpacing,
  inputStyle,
  isRejected = false,
  colors,
  font,
  spacing,
}) => {
  const [focused, setFocused] = useState(false);
  const [modified, setModified] = useState(false);
  const showRejected = isRejected && !modified;

  const borderColor = showRejected
    ? "#DC2626"
    : error
      ? colors.error
      : focused
        ? colors.primary
        : colors.border;
  const bgColor = showRejected
    ? (colors.isDark ? "#2A1414" : "#FEF2F2")
    : (colors.inputBackground ?? colors.surface);

  return (
    <View style={{ gap: 5 }}>
      {/* Label */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(11),
            color: showRejected
              ? "#DC2626"
              : error
                ? colors.error
                : focused
                  ? colors.primary
                  : colors.textSecondary,
            marginLeft: 1,
          }}
        >
          {label}
          {required && (
            <Text style={{ color: "#EF4444", fontFamily: "Poppins_700Bold" }}>
              {" "}
              *
            </Text>
          )}
          {optional && (
            <Text
              style={{
                color: colors.textTertiary,
                fontFamily: "Poppins_400Regular",
              }}
            >
              {" "}
              (Optional)
            </Text>
          )}
        </Text>
      </View>

      {/* Input box */}
      <View
        style={{
          height: multiline ? undefined : INPUT_HEIGHT,
          minHeight: multiline
            ? numberOfLines
              ? numberOfLines * 22 + 20
              : 74
            : undefined,
          borderWidth: showRejected ? 2 : (focused || !!error ? 1.8 : 1.2),
          borderColor,
          borderRadius: 12,
          backgroundColor: bgColor,
          paddingHorizontal: spacing(12),
          paddingVertical: multiline ? spacing(10) : 0,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          opacity: editable ? 1 : 0.7,
        }}
      >
        {prefixIcon && (
          <View
            style={{
              marginRight: 8,
              marginTop: multiline ? 2 : 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {prefixIcon}
          </View>
        )}
        {prefix && (
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: font(13),
              color: colors.textSecondary,
              marginRight: 8,
            }}
          >
            {prefix}
          </Text>
        )}
        <TextInput
          value={value}
          onChangeText={(t) => {
            setModified(true);
            onChangeText?.(t);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            {
              flex: 1,
              fontFamily: "Poppins_400Regular",
              fontSize: font(13),
              color: colors.text,
              paddingVertical: 0,
              letterSpacing: letterSpacing,
              ...Platform.select({
                android: { includeFontPadding: false },
                ios: {},
              }),
            },
            inputStyle,
          ]}
        />
        {rightElement && (
          <View
            style={{
              marginLeft: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rightElement}
          </View>
        )}
      </View>

      {showRejected ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginLeft: 1,
            marginTop: 2,
          }}
        >
          <AlertCircle size={12} color="#DC2626" />
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: font(11),
              color: "#DC2626",
            }}
          >
            {error || "Admin requested correction for this field"}
          </Text>
        </View>
      ) : !!error ? (
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(11),
            color: colors.error,
            marginLeft: 1,
          }}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(10.5),
            color: colors.textTertiary,
            marginLeft: 1,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

// ── Standard App Dropdown Picker (Matching addaddress.tsx) ──────
interface AppDropdownPickerProps<T> {
  label: string;
  placeholder?: string;
  selectedText?: string | null;
  items: T[];
  getItemLabel: (item: T) => string;
  getItemKey: (item: T) => string | number;
  getItemSubLabel?: (item: T) => string | undefined;
  getItemIcon?: (item: T) => any;
  prefixIcon?: React.ReactNode;
  onSelect: (item: T) => void;
  error?: string;
  isRejected?: boolean;
  required?: boolean;
  optional?: boolean;
  modalTitle: string;
  searchPlaceholder?: string;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
}

function AppDropdownPicker<T>({
  label,
  placeholder = "Select an option",
  selectedText,
  items,
  getItemLabel,
  getItemKey,
  getItemSubLabel,
  getItemIcon,
  prefixIcon,
  onSelect,
  error,
  isRejected = false,
  required,
  optional,
  modalTitle,
  searchPlaceholder = "Search...",
  colors,
  font,
  spacing,
}: AppDropdownPickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [modified, setModified] = useState(false);
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setModalVisible(false);
    setSearch("");
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const labelStr = getItemLabel(item).toLowerCase();
      const subStr = getItemSubLabel ? getItemSubLabel(item)?.toLowerCase() : "";
      return labelStr.includes(q) || (subStr && subStr.includes(q));
    });
  }, [items, search, getItemLabel, getItemSubLabel]);

  const showRejected = isRejected && !modified;

  const borderColor = showRejected
    ? "#DC2626"
    : error
      ? colors.error
      : selectedText
        ? colors.primary
        : colors.border;
  const bgColor = showRejected
    ? (colors.isDark ? "#2A1414" : "#FEF2F2")
    : (colors.inputBackground ?? colors.surface);

  return (
    <>
      <View style={{ gap: 5 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: font(11),
              color: showRejected
                ? "#DC2626"
                : error
                  ? colors.error
                  : selectedText
                    ? colors.primary
                    : colors.textSecondary,
              marginLeft: 1,
            }}
          >
            {label}
            {required && (
              <Text style={{ color: "#EF4444", fontFamily: "Poppins_700Bold" }}>
                {" "}
                *
              </Text>
            )}
            {optional && (
              <Text
                style={{
                  color: colors.textTertiary,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {" "}
                (Optional)
              </Text>
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={{
            height: INPUT_HEIGHT,
            borderWidth: showRejected ? 2 : (selectedText || !!error ? 1.8 : 1.2),
            borderColor,
            borderRadius: 12,
            backgroundColor: bgColor,
            paddingHorizontal: spacing(12),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {prefixIcon && (
            <View
              style={{
                marginRight: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {prefixIcon}
            </View>
          )}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: selectedText
                ? "Poppins_500Medium"
                : "Poppins_400Regular",
              fontSize: font(13),
              color: selectedText ? colors.text : colors.textTertiary,
              flex: 1,
              marginRight: 8,
            }}
          >
            {selectedText || placeholder}
          </Text>
          <ChevronDown
            size={16}
            color={selectedText ? colors.primary : colors.textTertiary}
          />
        </TouchableOpacity>

        {showRejected ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginLeft: 1,
              marginTop: 2,
            }}
          >
            <AlertCircle size={12} color="#DC2626" />
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(11),
                color: "#DC2626",
              }}
            >
              {error || "Admin requested correction for this field"}
            </Text>
          </View>
        ) : !!error ? (
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: font(11),
              color: colors.error,
              marginLeft: 1,
            }}
          >
            {error}
          </Text>
        ) : null}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={handleClose}
            />

            <View
              style={{
                maxHeight: "75%",
                minHeight: "45%",
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: Math.max(insets.bottom, spacing(16)),
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing(16),
                  paddingTop: spacing(18),
                  paddingBottom: spacing(12),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(15.5),
                    color: colors.text,
                  }}
                >
                  {modalTitle}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {items.length > 6 && (
                <View
                  style={{
                    paddingHorizontal: spacing(16),
                    paddingVertical: spacing(10),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: spacing(10),
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Search size={15} color={colors.textTertiary} />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder={searchPlaceholder}
                      placeholderTextColor={colors.textTertiary}
                      style={{
                        flex: 1,
                        marginLeft: 8,
                        fontSize: font(12.5),
                        fontFamily: "Poppins_400Regular",
                        color: colors.text,
                        paddingVertical: 0,
                      }}
                    />
                    {search.length > 0 && (
                      <TouchableOpacity onPress={() => setSearch("")}>
                        <X size={15} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              <FlatList
                data={filtered}
                keyExtractor={(item) => String(getItemKey(item))}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: spacing(16),
                  paddingVertical: spacing(6),
                }}
                renderItem={({ item }) => {
                  const labelStr = getItemLabel(item);
                  const subLabelStr = getItemSubLabel ? getItemSubLabel(item) : undefined;
                  const IconComp = getItemIcon ? getItemIcon(item) : undefined;
                  const isSelected = selectedText === labelStr;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setModified(true);
                        onSelect(item);
                        handleClose();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: spacing(12),
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        {IconComp && (
                          <View
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 17,
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.surfaceElevated,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconComp
                              size={16}
                              color={isSelected ? "#ffffff" : colors.primary}
                            />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: isSelected
                                ? "Poppins_600SemiBold"
                                : "Poppins_500Medium",
                              fontSize: font(13),
                              color: isSelected ? colors.primary : colors.text,
                            }}
                          >
                            {labelStr}
                          </Text>
                          {subLabelStr ? (
                            <Text
                              style={{
                                fontFamily: "Poppins_400Regular",
                                fontSize: font(11),
                                color: colors.textSecondary,
                                marginTop: 1,
                              }}
                            >
                              {subLabelStr}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {isSelected && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={{ padding: spacing(24), alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12.5),
                        color: colors.textSecondary,
                      }}
                    >
                      No options found.
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ── Standard Document Upload Card (Matching Steps Design System) ──────
interface AppDocumentUploadCardProps {
  label: string;
  required?: boolean;
  document: { uri: string; name: string; type: string } | null;
  documentUrl?: string | null;
  onPress: () => void;
  error?: string;
  isRejected?: boolean;
  helperText?: string;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
}

const AppDocumentUploadCard: React.FC<AppDocumentUploadCardProps> = ({
  label,
  required,
  document,
  documentUrl,
  onPress,
  error,
  isRejected = false,
  helperText,
  colors,
  font,
  spacing,
}) => {
  const isNewlyAttached = !!document;
  const isAttached = !!document || !!documentUrl;
  const fileName = document
    ? document.name
    : documentUrl
      ? documentUrl.split("/").pop() || "Document Attached"
      : "";

  // If rejected, but user has uploaded/attached a replacement document, do NOT show as rejected!
  const showAsRejected = isRejected && !isNewlyAttached;

  const borderColor = showAsRejected
    ? "#DC2626"
    : error
      ? "#EF4444"
      : isAttached
        ? "#10B981"
        : colors.border;
  const bgColor = showAsRejected
    ? (colors.isDark ? "#2A1414" : "#FEF2F2")
    : isAttached
      ? "#10B9810A"
      : colors.surface;

  return (
    <View style={{ gap: 5 }}>
      {/* Label */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(11),
            color: showAsRejected
              ? "#DC2626"
              : error
                ? colors.error
                : colors.textSecondary,
            marginLeft: 1,
          }}
        >
          {label}
          {required && (
            <Text style={{ color: "#EF4444", fontFamily: "Poppins_700Bold" }}>
              {" "}
              *
            </Text>
          )}
        </Text>
      </View>

      {/* Upload button container */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={{
          borderRadius: 12,
          borderWidth: showAsRejected ? 2 : 1.2,
          borderStyle: isAttached ? "solid" : "dashed",
          borderColor,
          backgroundColor: bgColor,
          paddingHorizontal: spacing(14),
          paddingVertical: spacing(12),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Icon Badge */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: showAsRejected
                ? "#FEE2E2"
                : isAttached
                  ? "#10B9811C"
                  : colors.primary + "14",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showAsRejected ? (
              <AlertCircle size={20} color="#DC2626" />
            ) : isAttached ? (
              <CheckCircle2 size={20} color="#10B981" />
            ) : (
              <UploadCloud size={20} color={colors.primary} />
            )}
          </View>

          {/* Text Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(12.5),
                color: showAsRejected ? "#DC2626" : colors.text,
              }}
              numberOfLines={1}
            >
              {isAttached ? fileName : `Attach ${label}`}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: showAsRejected
                  ? "#DC2626"
                  : isAttached
                    ? "#10B981"
                    : colors.textSecondary,
                marginTop: 1,
              }}
            >
              {showAsRejected
                ? "Re-upload required by Admin"
                : isAttached
                  ? "Tap to re-capture or select new file"
                  : "Camera photo or Gallery file (up to 5 MB)"}
            </Text>
          </View>

          {/* Right Action Chip */}
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              backgroundColor: showAsRejected
                ? "#FEE2E2"
                : isAttached
                  ? "#10B98118"
                  : colors.primary + "10",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(11),
                color: showAsRejected
                  ? "#DC2626"
                  : isAttached
                    ? "#10B981"
                    : colors.primary,
              }}
            >
              {showAsRejected ? "Re-upload" : isAttached ? "Change" : "Upload"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Error / Helper */}
      {showAsRejected ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginLeft: 1,
            marginTop: 2,
          }}
        >
          <AlertCircle size={12} color="#DC2626" />
          <Text
            style={{
              fontFamily: "Poppins_500Medium",
              fontSize: font(11),
              color: "#DC2626",
            }}
          >
            {error || "Admin rejected this document. Please re-upload."}
          </Text>
        </View>
      ) : !!error ? (
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(11),
            color: colors.error,
            marginLeft: 1,
          }}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(10.5),
            color: colors.textTertiary,
            marginLeft: 1,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

export default function B2BScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { font, spacing } = useResponsive();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const setUser = useAppVisitorStore((s) => s.setUser);
  const visitorUserId = useAppVisitorStore((s) => s.userId);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  useEffect(() => {
    StorageUtil.getUserId().then((id) => {
      if (id) setStoredUserId(id);
    });
  }, []);

  const effectiveUserId = visitorUserId || storedUserId || "";
  // Fetch address & state master (same API as addaddress.tsx)
  const { data: addressData } = useAddress({ user_id: effectiveUserId });

  // Fetch B2B Master Data dynamically from DB tables (b2b_business_type_master, b2b_dealer_category_master, state)
  const { data: masterDataRes } = useB2BMasterData();
  const masterData = masterDataRes?.data;

  // Fallback direct state list from /api/get-state if user_id is not yet set
  const [directApiStates, setDirectApiStates] = useState<StateItem[]>([]);

  useEffect(() => {
    if (addressData?.data?.state_master && addressData.data.state_master.length > 0) {
      return;
    }
    let isMounted = true;
    apiClient
      .get("/api/get-state")
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.state || res.data?.data?.state_master || [];
        if (Array.isArray(list) && list.length > 0) {
          setDirectApiStates(list);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [addressData]);

  // Master State List fetched dynamically from DB (no frontend hardcoding)
  const stateList: StateItem[] = useMemo(() => {
    if (masterData?.states && masterData.states.length > 0) {
      return masterData.states.map((s: any) => ({
        id: s.id,
        name: s.name,
        state_no: s.state_no ?? null,
      }));
    }
    if (addressData?.data?.state_master && addressData.data.state_master.length > 0) {
      return addressData.data.state_master;
    }
    return directApiStates;
  }, [masterData?.states, addressData?.data?.state_master, directApiStates]);

  // Business Types dynamically fetched from DB (b2b_business_type_master)
  const businessTypes = useMemo(() => {
    const list = masterData?.business_types || [];
    return list.map((b: any) => ({
      id: b.id,
      name: b.business_type_name || b.name,
      requires_registration_document: b.requires_registration_document || "Yes",
    }));
  }, [masterData?.business_types]);

  // Dealer Categories dynamically fetched from DB (b2b_dealer_category_master)
  const dealerCategories = useMemo(() => {
    const list = masterData?.dealer_categories || [];
    return list.map((c: any) => ({
      id: c.id,
      name: c.dealer_category_name || c.name,
      desc: getDealerCategoryDesc(c.dealer_category_name || c.name),
      icon: getDealerCategoryIcon(c.dealer_category_name || c.name),
    }));
  }, [masterData?.dealer_categories]);

  // Years in business options dynamically fetched from API
  const yearsInBusinessOptions = useMemo(() => {
    return (
      masterData?.years_in_business_options || [
        "Less than 1 year",
        "1 - 3 years",
        "3 - 5 years",
        "5 - 10 years",
        "10 - 20 years",
        "More than 20 years",
      ]
    );
  }, [masterData?.years_in_business_options]);

  // Business Proof Types dynamically fetched from API
  const businessProofTypes = useMemo(() => {
    return (
      masterData?.business_proof_types || [
        "Insecticide Licence",
        "Pest Control Licence",
        "Shop & Establishment Licence",
        "Other",
      ]
    );
  }, [masterData?.business_proof_types]);

  // Multi-step Navigation State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [lastCompletedStep, setLastCompletedStep] = useState(0);
  const [isInitializingSession, setIsInitializingSession] = useState(true);

  // Flow Tracking IDs
  const [publicId, setPublicId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  // Application Overall Status
  const [applicationStatus, setApplicationStatus] = useState<string>("Draft");
  const [lastAdminRemark, setLastAdminRemark] = useState<string>("");
  const [correctionStep, setCorrectionStep] = useState<number | null>(null);
  const [correctionFields, setCorrectionFields] = useState<{ [key: string]: string[] } | null>(null);
  const [correctedFields, setCorrectedFields] = useState<Record<string, boolean>>({});

  const markFieldCorrected = (fieldKey: string) => {
    setCorrectedFields((prev) => ({ ...prev, [fieldKey]: true }));
  };
  const [showReviewInStatus, setShowReviewInStatus] = useState(false);

  // -------------------------------------------------------------
  // Step 1: Basic Details State
  // -------------------------------------------------------------
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Step 1.2: OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const otpInputRef = useRef<OtpInputRef>(null);

  // -------------------------------------------------------------
  // Step 2: Business & GST Details State
  // -------------------------------------------------------------
  const [gstNumber, setGstNumber] = useState("");
  const [isGstVerified, setIsGstVerified] = useState(false);
  const [gstVerifiedData, setGstVerifiedData] = useState<any>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState<number | null>(null);
  const [dealerCategoryId, setDealerCategoryId] = useState<number | null>(null);
  const [yearsInBusiness, setYearsInBusiness] = useState("1 - 3 years");

  const [referralCode, setReferralCode] = useState("");
  const [isReferralVerified, setIsReferralVerified] = useState(false);
  const [salesPersonName, setSalesPersonName] = useState("");

  // -------------------------------------------------------------
  // Step 3: Address Details State
  // -------------------------------------------------------------
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessStateId, setBusinessStateId] = useState<number | null>(null);
  const [businessPincode, setBusinessPincode] = useState("");

  const [deliverySame, setDeliverySame] = useState<"Yes" | "No">("Yes");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryStateId, setDeliveryStateId] = useState<number | null>(null);
  const [deliveryPincode, setDeliveryPincode] = useState("");

  const [warehouseSame, setWarehouseSame] = useState<"Yes" | "No">("Yes");
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [warehouseCity, setWarehouseCity] = useState("");
  const [warehouseStateId, setWarehouseStateId] = useState<number | null>(null);
  const [warehousePincode, setWarehousePincode] = useState("");

  // -------------------------------------------------------------
  // Step 4: KYC Documents State
  // -------------------------------------------------------------
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [aadhaarHolderName, setAadhaarHolderName] = useState("");
  const [businessProofType, setBusinessProofType] = useState(
    "Shop & Establishment Licence",
  );

  // Document File Attachments & Uploaded URLs
  const [gstCertificate, setGstCertificate] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [gstCertificateUrl, setGstCertificateUrl] = useState("");

  const [panCard, setPanCard] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [panCardUrl, setPanCardUrl] = useState("");

  const [aadhaarCard, setAadhaarCard] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState("");

  const [businessProofDocument, setBusinessProofDocument] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [businessProofUrl, setBusinessProofUrl] = useState("");

  // Modals for Selection
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [businessTypeSearch, setBusinessTypeSearch] = useState("");

  const [showStateModal, setShowStateModal] = useState(false);
  const [stateModalTarget, setStateModalTarget] = useState<
    "business" | "delivery" | "warehouse"
  >("business");
  const [stateSearch, setStateSearch] = useState("");

  const [showProofTypeModal, setShowProofTypeModal] = useState(false);
  const [showYearsModal, setShowYearsModal] = useState(false);
  const [showStatusScreen, setShowStatusScreen] = useState(false);

  // Step 5: Document Preview Modal State
  const [previewDocModal, setPreviewDocModal] = useState<{
    visible: boolean;
    title: string;
    uri: string;
    name: string;
  }>({
    visible: false,
    title: "",
    uri: "",
    name: "",
  });

  // -------------------------------------------------------------
  // Step 5: Review & Final Confirmation State
  // -------------------------------------------------------------
  const [finalConfirmation, setFinalConfirmation] = useState(false);

  // Errors & Focus
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // -------------------------------------------------------------
  // API Mutations
  // -------------------------------------------------------------
  const { mutateAsync: getRegistrationDetails } =
    useB2BGetRegistrationDetails();
  const { mutateAsync: saveBasicDetails, isPending: isSavingBasic } =
    useB2BSaveBasicDetails();
  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } =
    useB2BVerifyOtp();
  const { mutateAsync: resendOtp, isPending: isResendingOtp } =
    useB2BResendOtp();

  const { mutateAsync: verifyGst, isPending: isVerifyingGst } =
    useB2BVerifyGst();
  const { mutateAsync: validateReferral, isPending: isValidatingReferral } =
    useB2BValidateReferralCode();
  const { mutateAsync: saveBusinessDetails, isPending: isSavingBusiness } =
    useB2BSaveBusinessDetails();
  const { mutateAsync: saveAddressDetails, isPending: isSavingAddress } =
    useB2BSaveAddressDetails();
  const { mutateAsync: saveKycDetails, isPending: isSavingKyc } =
    useB2BSaveKycDetails();
  const { mutateAsync: submitKycDetails, isPending: isSubmittingApproval } =
    useB2BSubmitKycDetails();

  // -------------------------------------------------------------
  // Session Hydration on Screen Mount (Restores Progress on Refresh!)
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedId = await StorageUtil.getUserId();
        const userId = storedId || visitorUserId || "";
        const session = await StorageUtil.getB2BSession();

        // If user is logged out, clear any stale B2B session and start fresh on Step 1
        if (!userId) {
          if (session.publicId || session.mobile) {
            console.log("🏢 [B2B SCREEN]: User is logged out. Clearing stale B2B session.");
            await StorageUtil.clearB2BSession();
          }
          if (isMounted) {
            setPublicId("");
            setTrackingToken("");
            setApplicationStatus("Draft");
            setShowStatusScreen(false);
            setCurrentStep(1);
            setLastCompletedStep(0);
          }
          return;
        }

        if (session.publicId || session.mobile || userId) {
          const res = await getRegistrationDetails({
            public_id: session.publicId || undefined,
            tracking_token: session.trackingToken || undefined,
            mobile: session.mobile || undefined,
            user_id: userId || undefined,
          });

          if (!isMounted) return;

          if (res.status === 1 && res.data) {
            const d = res.data;
            console.log("🏢 [B2B SCREEN RESTORE SESSION]:", {
              storedUserId: userId,
              session,
              public_id: d.public_id,
              application_status: d.status,
              is_b2b_user: d.is_b2b_user,
              mobile_verified: d.mobile_verified,
              business_name: d.business_details?.business_name,
              gst_number: d.business_details?.gst_number,
            });
            setPublicId(d.public_id);
            if (d.tracking_token) {
              setTrackingToken(d.tracking_token);
            }
            const completedStep = Number(d.last_completed_step) || 0;
            setLastCompletedStep(completedStep);

            if (d.status) {
              setApplicationStatus(d.status);
            }
            if (d.last_admin_remark) {
              setLastAdminRemark(d.last_admin_remark);
            }
            if (d.correction_step) {
              setCorrectionStep(Number(d.correction_step));
            }
            if (d.correction_fields) {
              setCorrectionFields(d.correction_fields);
            }

            // Populate Step 1 Basic Details
            if (d.basic_details) {
              setOwnerName(d.basic_details.owner_name || "");
              setMobile(d.basic_details.mobile || "");
              setAlternateMobile(d.basic_details.alternate_mobile || "");
              setEmail(d.basic_details.email || "");
            }

            if (d.mobile_verified === "Yes") {
              setIsVerified(true);
            }

            // Populate Step 2 Business Details
            if (d.business_details) {
              setGstNumber(d.business_details.gst_number || "");
              setBusinessName(d.business_details.business_name || "");
              setBusinessTypeId(d.business_details.business_type_id || null);
              setDealerCategoryId(
                d.business_details.dealer_category_id || null,
              );
              setYearsInBusiness(
                d.business_details.years_in_business || "1 - 3 years",
              );
              setReferralCode(d.business_details.referral_code || "");
              if (d.business_details.gst_number) {
                setIsGstVerified(true);
              }
            }

            // Populate Step 3 Address Details
            if (d.address_details) {
              setBusinessAddress(d.address_details.business_address || "");
              setBusinessCity(d.address_details.business_city || "");
              setBusinessStateId(d.address_details.business_state_id || null);
              setBusinessPincode(d.address_details.business_pincode || "");
              setDeliverySame(
                d.address_details.delivery_same_as_business || "Yes",
              );
              setDeliveryAddress(d.address_details.delivery_address || "");
              setDeliveryCity(d.address_details.delivery_city || "");
              setDeliveryStateId(d.address_details.delivery_state_id || null);
              setDeliveryPincode(d.address_details.delivery_pincode || "");
              setWarehouseSame(d.address_details.warehouse_same || "Yes");
              setWarehouseAddress(d.address_details.warehouse_address || "");
              setWarehouseCity(d.address_details.warehouse_city || "");
              setWarehouseStateId(d.address_details.warehouse_state_id || null);
              setWarehousePincode(d.address_details.warehouse_pincode || "");
            }

            // Populate Step 4 KYC Details
            if (d.kyc_details) {
              setLegalBusinessName(
                d.kyc_details.legal_business_name ||
                  d.business_details?.legal_business_name ||
                  "",
              );
              setPanNumber(
                d.kyc_details.pan_number ||
                  d.business_details?.pan_number ||
                  "",
              );
              setPanName(
                d.kyc_details.pan_name || d.business_details?.pan_name || "",
              );
              setAadhaarHolderName(d.kyc_details.aadhaar_holder_name || "");
              if (d.kyc_details.business_proof_type) {
                setBusinessProofType(d.kyc_details.business_proof_type);
              }
              setGstCertificateUrl(d.kyc_details.gst_certificate_path || "");
              setPanCardUrl(d.kyc_details.pan_card_path || "");
              setAadhaarCardUrl(d.kyc_details.aadhaar_card_path || "");
              setBusinessProofUrl(d.kyc_details.business_proof_path || "");
            }

            // Navigate to appropriate active step based on status & completed progress
            if (
              [
                "Submitted for Approval",
                "Pending",
                "Under Review",
                "Review In Progress",
                "Submitted",
                "Approved",
                "Correction Required",
              ].includes(d.status)
            ) {
              setShowStatusScreen(true);
              if (d.status === "Correction Required") {
                const target =
                  d.correction_step &&
                  Number(d.correction_step) >= 1 &&
                  Number(d.correction_step) <= 4
                    ? (Number(d.correction_step) as 1 | 2 | 3 | 4)
                    : 1;
                setCurrentStep(target);
              } else {
                setCurrentStep(5);
              }
            } else if (d.current_step >= 5 || completedStep >= 4) {
              setCurrentStep(5);
            } else if (d.current_step === 4 || completedStep >= 3) {
              setCurrentStep(4);
            } else if (d.current_step === 3 || completedStep >= 2) {
              setCurrentStep(3);
            } else if (d.current_step === 2 || d.mobile_verified === "Yes") {
              setCurrentStep(2);
            } else {
              setCurrentStep(1);
            }

            // Ensure cached session has latest publicId & token
            await StorageUtil.setB2BSession(
              d.public_id,
              d.tracking_token || session.trackingToken || "",
              d.basic_details?.mobile || session.mobile || "",
            );
          } else {
            await StorageUtil.clearB2BSession();
            setCurrentStep(1);
          }
        }
      } catch (err) {
        console.log("No existing B2B session to restore.");
        await StorageUtil.clearB2BSession();
        setCurrentStep(1);
      } finally {
        if (isMounted) setIsInitializingSession(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpScreen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, resendTimer]);

  // -------------------------------------------------------------
  // Reset / Clear Session Handler (Start Fresh)
  // -------------------------------------------------------------
  const handleStartNewApplication = () => {
    Alert.alert(
      "Start New Registration?",
      "This will clear the current in-progress application session on this device. Do you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Fresh",
          style: "destructive",
          onPress: async () => {
            await StorageUtil.clearB2BSession();
            setPublicId("");
            setTrackingToken("");
            setShowStatusScreen(false);
            setCurrentStep(1);
            setLastCompletedStep(0);
            setIsVerified(false);
            setShowOtpScreen(false);
            setOwnerName("");
            setMobile("");
            setAlternateMobile("");
            setEmail("");
            setGstNumber("");
            setIsGstVerified(false);
            setBusinessName("");
            setBusinessTypeId(null);
            setDealerCategoryId(null);
            setReferralCode("");
            setBusinessAddress("");
            setBusinessCity("");
            setBusinessStateId(null);
            setBusinessPincode("");
            showToast(
              "Session reset. You can start a new application.",
              "info",
            );
          },
        },
      ],
    );
  };

  // -------------------------------------------------------------
  // Step 1: Validation & Submit
  // -------------------------------------------------------------
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!ownerName.trim() || ownerName.trim().length < 2) {
      newErrors.ownerName = "Full Name must be at least 2 characters.";
    }

    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!mobileRegex.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit Indian mobile number.";
    }

    if (alternateMobile.trim()) {
      if (!mobileRegex.test(alternateMobile.trim())) {
        newErrors.alternateMobile =
          "Enter a valid 10-digit alternate mobile number.";
      } else if (alternateMobile.trim() === mobile.trim()) {
        newErrors.alternateMobile =
          "Alternate mobile must be different from primary mobile.";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!termsAccepted) {
      newErrors.terms = "Please accept the Terms & Privacy Policy to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateStep1()) {
      showToast("Please fill all required fields correctly.", "error");
      return;
    }

    try {
      const response = await saveBasicDetails({
        public_id: publicId || undefined,
        tracking_token: trackingToken || undefined,
        owner_name: ownerName.trim(),
        mobile: mobile.trim(),
        alternate_mobile: alternateMobile.trim() || null,
        email: email.trim().toLowerCase(),
        terms_accepted: 1,
      });

      if (response.status === 1 && response.data?.public_id) {
        setPublicId(response.data.public_id);
        if (response.data.status) {
          setApplicationStatus(response.data.status);
        }
        await StorageUtil.setB2BSession(
          response.data.public_id,
          response.data.tracking_token || trackingToken || "",
          mobile.trim(),
        );

        // If show_otp is false (e.g. correction flow where mobile was already verified)
        if (response.data.show_otp === false) {
          setIsVerified(true);
          setLastCompletedStep((prev) => Math.max(prev, 1));
          markFieldCorrected("owner_name");
          markFieldCorrected("mobile");
          markFieldCorrected("alternate_mobile");
          markFieldCorrected("email");
          showToast(
            response.message || "Basic details updated successfully!",
            "success",
          );
          const nextStep = getNextStepInFlow(1);
          setCurrentStep(nextStep);
          return;
        }

        setShowOtpScreen(true);
        setResendTimer(60);
        setOtpCode("");
        showToast(response.message || "OTP sent successfully!", "success");
      } else {
        showToast(response.message || "Failed to save details.", "error");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      showToast(msg, "error");
    }
  };

  const handleVerifyOtp = async (inputCode?: string) => {
    const fullOtp = (inputCode ?? otpCode).trim();
    if (fullOtp.length !== 4) {
      showToast("Please enter complete 4-digit OTP.", "error");
      return;
    }

    try {
      const response = await verifyOtp({
        public_id: publicId,
        otp: fullOtp,
      });

      if (response.status === 1 && response.data) {
        const d = response.data;
        const currentToken = d.tracking_token || trackingToken || "";
        const activePublicId = d.public_id || publicId;
        const uId = d.user_id
          ? String(d.user_id)
          : d.raw_user_id
            ? String(d.raw_user_id)
            : "";
        const uName = d.user_name || ownerName.trim() || "B2B User";

        // 1. Log user into the app session
        if (uId) {
          try {
            await setUser(uId, uName, email.trim() || undefined);
            setAnalyticsUserId(uId);
          } catch (e) {
            console.log("Failed to persist user in auth store", e);
          }
        }

        // 2. Persist B2B session
        if (currentToken) {
          setTrackingToken(currentToken);
        }
        if (activePublicId) {
          setPublicId(activePublicId);
        }
        setIsVerified(true);
        setLastCompletedStep((prev) => Math.max(prev, 1));
        await StorageUtil.setB2BSession(
          activePublicId,
          currentToken,
          mobile.trim(),
        );

        // 3. Fetch full registration details to restore existing data (business, KYC, addresses, status)
        let resolvedStatus = d.status || applicationStatus || "Draft";
        let resolvedStep = Number(d.current_step) || 2;
        let loadedFullData: any = null;
        setApplicationStatus(resolvedStatus);
        try {
          const details = await getRegistrationDetails({
            public_id: activePublicId,
            tracking_token: currentToken || undefined,
            mobile: mobile.trim(),
            user_id: uId || undefined,
          });

          if (details.status === 1 && details.data) {
            const fullData = details.data;
            loadedFullData = fullData;
            if (fullData.status) {
              resolvedStatus = fullData.status;
              setApplicationStatus(fullData.status);
            }
            if (fullData.last_admin_remark) {
              setLastAdminRemark(fullData.last_admin_remark);
            }
            if (fullData.correction_step) {
              setCorrectionStep(Number(fullData.correction_step));
            }
            if (fullData.correction_fields) {
              setCorrectionFields(fullData.correction_fields);
            }
            if (fullData.current_step) {
              resolvedStep = Number(fullData.current_step);
            }
            const completedStep = Number(fullData.last_completed_step) || 0;
            setLastCompletedStep(completedStep);

            // Populate Step 1 Basic Details
            if (fullData.basic_details) {
              setOwnerName(fullData.basic_details.owner_name || ownerName);
              setMobile(fullData.basic_details.mobile || mobile);
              setAlternateMobile(
                fullData.basic_details.alternate_mobile || alternateMobile,
              );
              setEmail(fullData.basic_details.email || email);
            }

            // Populate Step 2 Business Details
            if (fullData.business_details) {
              setGstNumber(fullData.business_details.gst_number || "");
              setBusinessName(fullData.business_details.business_name || "");
              setBusinessTypeId(
                fullData.business_details.business_type_id || null,
              );
              setDealerCategoryId(
                fullData.business_details.dealer_category_id || null,
              );
              setYearsInBusiness(
                fullData.business_details.years_in_business || "1 - 3 years",
              );
              setReferralCode(fullData.business_details.referral_code || "");
              if (fullData.business_details.gst_number) {
                setIsGstVerified(true);
              }
            }

            // Populate Step 3 Address Details
            if (fullData.address_details) {
              setBusinessAddress(
                fullData.address_details.business_address || "",
              );
              setBusinessCity(fullData.address_details.business_city || "");
              setBusinessStateId(
                fullData.address_details.business_state_id || null,
              );
              setBusinessPincode(
                fullData.address_details.business_pincode || "",
              );
              setDeliverySame(
                fullData.address_details.delivery_same_as_business || "Yes",
              );
              setDeliveryAddress(
                fullData.address_details.delivery_address || "",
              );
              setDeliveryCity(fullData.address_details.delivery_city || "");
              setDeliveryStateId(
                fullData.address_details.delivery_state_id || null,
              );
              setDeliveryPincode(
                fullData.address_details.delivery_pincode || "",
              );
              setWarehouseSame(
                fullData.address_details.warehouse_same || "Yes",
              );
              setWarehouseAddress(
                fullData.address_details.warehouse_address || "",
              );
              setWarehouseCity(fullData.address_details.warehouse_city || "");
              setWarehouseStateId(
                fullData.address_details.warehouse_state_id || null,
              );
              setWarehousePincode(
                fullData.address_details.warehouse_pincode || "",
              );
            }

            // Populate Step 4 KYC Details
            if (fullData.kyc_details) {
              setLegalBusinessName(
                fullData.kyc_details.legal_business_name ||
                  fullData.business_details?.legal_business_name ||
                  "",
              );
              setPanNumber(
                fullData.kyc_details.pan_number ||
                  fullData.business_details?.pan_number ||
                  "",
              );
              setPanName(
                fullData.kyc_details.pan_name ||
                  fullData.business_details?.pan_name ||
                  "",
              );
              setAadhaarHolderName(
                fullData.kyc_details.aadhaar_holder_name || "",
              );
              if (fullData.kyc_details.business_proof_type) {
                setBusinessProofType(fullData.kyc_details.business_proof_type);
              }
              setGstCertificateUrl(
                fullData.kyc_details.gst_certificate_path || "",
              );
              setPanCardUrl(fullData.kyc_details.pan_card_path || "");
              setAadhaarCardUrl(fullData.kyc_details.aadhaar_card_path || "");
              setBusinessProofUrl(
                fullData.kyc_details.business_proof_path || "",
              );
            }
          }
        } catch (detailErr) {
          console.log("Error loading full registration details:", detailErr);
        }

        setShowOtpScreen(false);

        // 4. Navigate appropriately based on application status
        const isApproved =
          resolvedStatus === "Approved" || d.is_b2b_user === "Yes";
        const isPendingReview = [
          "Submitted for Approval",
          "Pending",
          "Under Review",
          "Review In Progress",
          "Submitted",
        ].includes(resolvedStatus);

        if (isApproved) {
          showToast(
            "Your B2B account is approved! Welcome to PestoBazaar.",
            "success",
          );
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 500);
        } else if (isPendingReview) {
          showToast(
            "Application submitted. Waiting for admin review.",
            "info",
          );
          setShowStatusScreen(true);
          setCurrentStep(5);
        } else if (resolvedStatus === "Correction Required") {
          showToast(
            "Admin requested corrections in your application.",
            "warning",
          );
          const target =
            loadedFullData?.correction_step &&
            Number(loadedFullData.correction_step) >= 1 &&
            Number(loadedFullData.correction_step) <= 4
              ? (Number(loadedFullData.correction_step) as 1 | 2 | 3 | 4)
              : 1;
          setShowStatusScreen(true);
          setCurrentStep(target);
        } else {
          showToast("Mobile Number Verified Successfully!", "success");
          setShowStatusScreen(false);
          setCurrentStep(resolvedStep >= 2 ? (resolvedStep as any) : 2);
        }
      } else {
        showToast(response.message || "Invalid OTP entered.", "error");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed.";
      showToast(msg, "error");
    }
  };

  const handleOpenResendModal = () => {
    if (resendTimer > 0) return;
    setShowResendModal(true);
  };

  const handleSelectResendChannel = async (type: OtpChannel) => {
    setShowResendModal(false);
    try {
      const response = await resendOtp({
        public_id: publicId,
        channel: type,
        otp_channel: type,
      });

      if (response.status === 1) {
        setResendTimer(60);
        setOtpCode("");
        otpInputRef.current?.clear();
        showToast(
          response.message ||
            `A new OTP has been sent via ${
              type === "both"
                ? "SMS & WhatsApp"
                : type === "whatsapp"
                ? "WhatsApp"
                : "SMS"
            }.`,
          "success",
        );
      } else {
        showToast(response.message || "Failed to resend OTP.", "error");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to resend OTP.";
      showToast(msg, "error");
    }
  };

  const handleEditPhone = () => {
    setShowOtpScreen(false);
    setOtpCode("");
  };

  // -------------------------------------------------------------
  // Step 2: GST Verification & Referral Validation
  // -------------------------------------------------------------
  const handleVerifyGst = async () => {
    const cleanGst = gstNumber.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

    if (!cleanGst) {
      setErrors((prev) => ({
        ...prev,
        gstNumber: "Please enter GSTIN to verify.",
      }));
      showToast("Please enter your 15-character GSTIN.", "error");
      return;
    }

    if (!gstRegex.test(cleanGst)) {
      setErrors((prev) => ({
        ...prev,
        gstNumber: "Invalid GSTIN format (e.g. 24AAAAA0000A1Z5)",
      }));
      showToast("Please enter a valid 15-character GSTIN format.", "error");
      return;
    }

    try {
      const response = await verifyGst({
        gst_number: cleanGst,
        gstin: cleanGst,
      });

      if (response.status === 1 && response.data) {
        const d = response.data;
        setIsGstVerified(true);
        setGstVerifiedData(d);

        // Autofill business name
        const bName = d.business_name || d.trade_name || d.legal_name || "";
        if (bName) {
          setBusinessName(bName);
        }

        // Autofill KYC fields from GST
        const legalName = d.legal_name || d.trade_name || d.business_name || "";
        if (legalName) {
          setLegalBusinessName(legalName);
        }
        if (cleanGst.length === 15) {
          const pan = d.pan || cleanGst.substring(2, 12);
          setPanNumber(pan);
        }
        if (d.pan_name || d.legal_name || legalName) {
          setPanName(d.pan_name || d.legal_name || legalName);
        }

        if (d.suggested_business_type_id) {
          setBusinessTypeId(Number(d.suggested_business_type_id));
        }

        if (d.suggested_dealer_category_id) {
          setDealerCategoryId(Number(d.suggested_dealer_category_id));
        }

        if (d.suggested_years_in_business) {
          setYearsInBusiness(d.suggested_years_in_business);
        }

        // Pre-fill Step 3 Address fields if returned by GST
        if (d.address && !businessAddress) {
          setBusinessAddress(d.address);
        }
        if (d.city && !businessCity) {
          setBusinessCity(d.city);
        }
        if (d.pincode && !businessPincode) {
          setBusinessPincode(d.pincode);
        }
        if (d.state_id && !businessStateId) {
          setBusinessStateId(Number(d.state_id));
        }

        if (errors.gstNumber) {
          setErrors((prev) => ({ ...prev, gstNumber: "" }));
        }

        showToast(
          response.message || "GSTIN Verified! Details autofilled.",
          "success",
        );
      } else {
        setIsGstVerified(false);
        showToast(
          response.message ||
            "GSTIN verification failed. You may enter details manually.",
          "error",
        );
      }
    } catch (err: any) {
      setIsGstVerified(false);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "GSTIN verification failed.";
      showToast(msg, "error");
    }
  };

  const handleValidateReferral = async () => {
    const code = referralCode.trim();
    if (!code) {
      setIsReferralVerified(false);
      setSalesPersonName("");
      showToast("Enter a sales referral code first.", "error");
      return;
    }

    try {
      const response = await validateReferral({ referral_code: code });
      if (response.status === 1 && response.data?.valid) {
        setIsReferralVerified(true);
        const pName =
          response.data.sales_person || response.data.sales_person_name || "";
        setSalesPersonName(pName);
        showToast(
          `Sales code verified! ${pName ? `(${pName})` : ""}`,
          "success",
        );
        if (errors.referralCode) {
          setErrors((prev) => ({ ...prev, referralCode: "" }));
        }
      } else {
        setIsReferralVerified(false);
        setSalesPersonName("");
        showToast(
          response.message || "Invalid or inactive sales code.",
          "error",
        );
      }
    } catch (err: any) {
      setIsReferralVerified(false);
      setSalesPersonName("");
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid sales referral code.";
      showToast(msg, "error");
    }
  };

  const handleSaveBusinessDetails = async () => {
    const newErrors: { [key: string]: string } = {};

    const cleanGst = gstNumber.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

    if (!cleanGst) {
      newErrors.gstNumber = "GSTIN is required.";
    } else if (!gstRegex.test(cleanGst)) {
      newErrors.gstNumber = "Please enter a valid 15-character GSTIN.";
    }

    if (!businessName.trim() || businessName.trim().length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters.";
    }

    if (!businessTypeId) {
      newErrors.businessType = "Please select your business constitution/type.";
    }

    if (!dealerCategoryId) {
      newErrors.dealerCategory = "Please select your dealer category.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill all required business fields.", "error");
      return;
    }

    if (!publicId || !trackingToken) {
      showToast(
        "Application session missing. Please verify mobile again.",
        "error",
      );
      return;
    }

    try {
      const payload: B2BSaveBusinessDetailsPayload = {
        public_id: publicId,
        tracking_token: trackingToken,
        business_name: businessName.trim(),
        business_type_id: businessTypeId!,
        dealer_category_id: dealerCategoryId!,
        years_in_business: yearsInBusiness || undefined,
        gst_number: cleanGst,
        referral_code: referralCode.trim() || undefined,
        legal_business_name: gstVerifiedData?.legal_name || undefined,
        pan_name:
          gstVerifiedData?.pan_name || gstVerifiedData?.legal_name || undefined,
        gst_address: gstVerifiedData?.address || undefined,
        gst_city:
          gstVerifiedData?.city || gstVerifiedData?.district || undefined,
        gst_state_id: gstVerifiedData?.state_id
          ? Number(gstVerifiedData.state_id)
          : undefined,
        gst_pincode: gstVerifiedData?.pincode || undefined,
      };

      const response = await saveBusinessDetails(payload);

      if (response.status === 1) {
        setLastCompletedStep((prev) => Math.max(prev, 2));
        markFieldCorrected("business_name");
        markFieldCorrected("business_type_id");
        markFieldCorrected("dealer_category_id");
        markFieldCorrected("years_in_business");
        markFieldCorrected("gst_number");
        markFieldCorrected("referral_code");
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message || "Business details saved successfully!",
          "success",
        );
        const nextStep = getNextStepInFlow(2);
        setCurrentStep(nextStep);
      } else {
        showToast(
          response.message || "Failed to save business details.",
          "error",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save business details.";
      showToast(msg, "error");
    }
  };

  // -------------------------------------------------------------
  // Step 3: Address Details Validation & Submit
  // -------------------------------------------------------------
  const handleSaveAddressDetails = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!businessAddress.trim() || businessAddress.trim().length < 5) {
      newErrors.businessAddress = "Please enter complete business address.";
    }

    if (!businessCity.trim()) {
      newErrors.businessCity = "City is required.";
    }

    if (!businessStateId) {
      newErrors.businessStateId = "Please select state.";
    }

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!businessPincode.trim() || !pinRegex.test(businessPincode.trim())) {
      newErrors.businessPincode = "Please enter a valid 6-digit pincode.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fill all required address fields.", "error");
      return;
    }

    try {
      const payload: B2BSaveAddressDetailsPayload = {
        public_id: publicId,
        tracking_token: trackingToken,
        business_address: businessAddress.trim(),
        business_city: businessCity.trim(),
        business_state_id: businessStateId!,
        business_pincode: businessPincode.trim(),
        delivery_same_as_business: "Yes",
        warehouse_same: "Yes",
      };

      const response = await saveAddressDetails(payload);

      if (response.status === 1) {
        setLastCompletedStep((prev) => Math.max(prev, 3));
        markFieldCorrected("business_address");
        markFieldCorrected("business_city");
        markFieldCorrected("business_pincode");
        markFieldCorrected("business_state_id");
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message || "Address details saved successfully!",
          "success",
        );
        const nextStep = getNextStepInFlow(3);
        setCurrentStep(nextStep);
      } else {
        showToast(
          response.message || "Failed to save address details.",
          "error",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save address details.";
      showToast(msg, "error");
    }
  };

  // State selection helper
  const openStatePicker = (target: "business" | "delivery" | "warehouse") => {
    setStateModalTarget(target);
    setStateSearch("");
    setShowStateModal(true);
  };

  const handleSelectState = (id: number) => {
    if (stateModalTarget === "business") {
      setBusinessStateId(id);
      if (errors.businessStateId)
        setErrors((prev) => ({ ...prev, businessStateId: "" }));
    } else if (stateModalTarget === "delivery") {
      setDeliveryStateId(id);
      if (errors.deliveryStateId)
        setErrors((prev) => ({ ...prev, deliveryStateId: "" }));
    } else {
      setWarehouseStateId(id);
      if (errors.warehouseStateId)
        setErrors((prev) => ({ ...prev, warehouseStateId: "" }));
    }
    setShowStateModal(false);
  };

  const getStateName = (id: number | null) => {
    if (!id) return "Select State...";
    const found = stateList.find((s) => s.id === id);
    return found ? found.name : "Select State...";
  };

  const getBusinessTypeName = (id: number | null) => {
    if (!id) return "Not specified";
    const found = businessTypes.find((b) => b.id === id);
    return found ? found.name : "Not specified";
  };

  const getDealerCategoryName = (id: number | null) => {
    if (!id) return "Not specified";
    const found = dealerCategories.find((c) => c.id === id);
    return found ? found.name : "Not specified";
  };

  const filteredStates = stateList.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const selectedBusinessType = businessTypes.find(
    (b) => b.id === businessTypeId,
  );

  const selectedDealerCategory = dealerCategories.find(
    (c) => c.id === dealerCategoryId,
  );

  const filteredBusinessTypes = businessTypes.filter((item) =>
    item.name.toLowerCase().includes(businessTypeSearch.toLowerCase()),
  );

  // -------------------------------------------------------------
  // Step 4: Pick Document Image (from Gallery or Camera)
  // -------------------------------------------------------------
  const handlePickDocument = async (
    field: "gst" | "pan" | "aadhaar" | "proof",
  ) => {
    Alert.alert("Attach Document", "Select document upload source:", [
      {
        text: "Camera",
        onPress: async () => {
          try {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              showToast(
                "Camera permission is required to capture documents.",
                "error",
              );
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.6,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const asset = res.assets[0];
              const ext = (asset.uri?.split(".").pop() || "jpg")
                .split("?")[0]
                .toLowerCase();
              const safeExt = ["jpg", "jpeg", "png", "webp", "pdf"].includes(
                ext,
              )
                ? ext
                : "jpg";
              const fileObj = {
                uri: asset.uri,
                name: `${field}_${Date.now()}.${safeExt}`,
                type:
                  asset.mimeType ||
                  (safeExt === "png" ? "image/png" : "image/jpeg"),
              };
              if (field === "gst") {
                setGstCertificate(fileObj);
                markFieldCorrected("gst_certificate");
                if (errors.gstCertificate)
                  setErrors((prev) => ({ ...prev, gstCertificate: "" }));
              } else if (field === "pan") {
                setPanCard(fileObj);
                markFieldCorrected("pan_card");
                if (errors.panCard)
                  setErrors((prev) => ({ ...prev, panCard: "" }));
              } else if (field === "aadhaar") {
                setAadhaarCard(fileObj);
                markFieldCorrected("aadhaar_card");
                if (errors.aadhaarCard)
                  setErrors((prev) => ({ ...prev, aadhaarCard: "" }));
              } else if (field === "proof") {
                setBusinessProofDocument(fileObj);
                markFieldCorrected("business_proof_document");
                if (errors.businessProofDocument)
                  setErrors((prev) => ({ ...prev, businessProofDocument: "" }));
              }
              showToast("Document captured successfully!", "success");
            }
          } catch (err) {
            showToast("Failed to capture photo.", "error");
          }
        },
      },
      {
        text: "Gallery / Files",
        onPress: async () => {
          try {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              showToast(
                "Gallery permission is required to select documents.",
                "error",
              );
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: false,
              quality: 0.6,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const asset = res.assets[0];
              const ext = (asset.uri?.split(".").pop() || "jpg")
                .split("?")[0]
                .toLowerCase();
              const safeExt = ["jpg", "jpeg", "png", "webp", "pdf"].includes(
                ext,
              )
                ? ext
                : "jpg";
              const rawName = asset.fileName || `${field}_doc_${Date.now()}`;
              const finalName = rawName.includes(".")
                ? rawName
                : `${rawName}.${safeExt}`;
              const fileObj = {
                uri: asset.uri,
                name: finalName,
                type:
                  asset.mimeType ||
                  (safeExt === "png" ? "image/png" : "image/jpeg"),
              };
              if (field === "gst") {
                setGstCertificate(fileObj);
                markFieldCorrected("gst_certificate");
                if (errors.gstCertificate)
                  setErrors((prev) => ({ ...prev, gstCertificate: "" }));
              } else if (field === "pan") {
                setPanCard(fileObj);
                markFieldCorrected("pan_card");
                if (errors.panCard)
                  setErrors((prev) => ({ ...prev, panCard: "" }));
              } else if (field === "aadhaar") {
                setAadhaarCard(fileObj);
                markFieldCorrected("aadhaar_card");
                if (errors.aadhaarCard)
                  setErrors((prev) => ({ ...prev, aadhaarCard: "" }));
              } else if (field === "proof") {
                setBusinessProofDocument(fileObj);
                markFieldCorrected("business_proof_document");
                if (errors.businessProofDocument)
                  setErrors((prev) => ({ ...prev, businessProofDocument: "" }));
              }
              showToast("Document attached successfully!", "success");
            }
          } catch (err) {
            showToast("Failed to pick document image.", "error");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // -------------------------------------------------------------
  // Step 5: Document View / Preview Handler
  // -------------------------------------------------------------
  const handleOpenDocumentPreview = (
    title: string,
    localUri?: string | null,
    remoteUrl?: string | null,
    fileName?: string | null,
  ) => {
    let resolvedUri = localUri || remoteUrl || "";
    if (!resolvedUri) {
      showToast("No document attached to view.", "info");
      return;
    }
    if (resolvedUri.startsWith("/")) {
      const cleanedBase = BASE_URL.replace(/\/$/, "");
      resolvedUri = `${cleanedBase}${resolvedUri}`;
    }

    setPreviewDocModal({
      visible: true,
      title,
      uri: resolvedUri,
      name: fileName || resolvedUri.split("/").pop()?.split("?")[0] || title,
    });
  };

  // -------------------------------------------------------------
  // Step 4: Save KYC Documents Handler
  // -------------------------------------------------------------
  const handleSaveKycDetails = async () => {
    console.log("🔥 [B2B Step 4]: 'Save & Review' clicked!");
    console.log("📋 [B2B Step 4 State Snapshot]:", {
      publicId,
      trackingToken,
      legalBusinessName,
      panNumber,
      panName,
      aadhaarHolderName,
      businessProofType,
      gstCertificate: gstCertificate ? { name: gstCertificate.name, type: gstCertificate.type, uri: gstCertificate.uri } : null,
      gstCertificateUrl,
      panCard: panCard ? { name: panCard.name, type: panCard.type, uri: panCard.uri } : null,
      panCardUrl,
      aadhaarCard: aadhaarCard ? { name: aadhaarCard.name, type: aadhaarCard.type, uri: aadhaarCard.uri } : null,
      aadhaarCardUrl,
      businessProofDocument: businessProofDocument ? { name: businessProofDocument.name, type: businessProofDocument.type, uri: businessProofDocument.uri } : null,
      businessProofUrl,
    });

    const newErrors: { [key: string]: string } = {};

    if (!legalBusinessName.trim()) {
      newErrors.legalBusinessName =
        "Legal business name as per GST is required.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const cleanPan = panNumber.trim().toUpperCase();
    if (!cleanPan) {
      newErrors.panNumber = "PAN number is required.";
    } else if (!panRegex.test(cleanPan)) {
      newErrors.panNumber =
        "Valid 10-character PAN required (e.g. ABCDE1234F).";
    }

    if (!panName.trim()) {
      newErrors.panName = "Name as per PAN is required.";
    }

    if (!aadhaarHolderName.trim()) {
      newErrors.aadhaarHolderName = "Aadhaar holder name is required.";
    }

    if (!gstCertificate && !gstCertificateUrl) {
      newErrors.gstCertificate = "GST certificate document upload is required.";
    }

    if (!panCard && !panCardUrl) {
      newErrors.panCard = "PAN card document upload is required.";
    }

    if (!aadhaarCard && !aadhaarCardUrl) {
      newErrors.aadhaarCard = "Aadhaar card document upload is required.";
    }

    if (!businessProofType.trim()) {
      newErrors.businessProofType = "Please select a business proof type.";
    }

    if (
      businessProofType.trim() &&
      !businessProofDocument &&
      !businessProofUrl
    ) {
      newErrors.businessProofDocument =
        "Please upload the selected business proof document.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.warn("⚠️ [B2B Step 4 Validation Failed]:", newErrors);
      showToast(
        "Please fill all required KYC fields and attach documents.",
        "error",
      );
      return;
    }

    if (!publicId || !trackingToken) {
      console.error("❌ [B2B Step 4 Session Missing]:", { publicId, trackingToken });
      showToast(
        "Application session missing. Please verify mobile again.",
        "error",
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("tracking_token", trackingToken);
      formData.append("legal_business_name", legalBusinessName.trim());
      formData.append("pan_number", cleanPan);
      formData.append("pan_name", panName.trim());
      formData.append("aadhaar_holder_name", aadhaarHolderName.trim());
      formData.append("business_proof_type", businessProofType.trim());

      if (gstCertificate) {
        console.log("📎 [B2B Step 4] Appending gst_certificate file:", gstCertificate);
        formData.append("gst_certificate", {
          uri: gstCertificate.uri,
          name: gstCertificate.name,
          type: gstCertificate.type,
        } as any);
      }
      if (panCard) {
        console.log("📎 [B2B Step 4] Appending pan_card file:", panCard);
        formData.append("pan_card", {
          uri: panCard.uri,
          name: panCard.name,
          type: panCard.type,
        } as any);
      }
      if (aadhaarCard) {
        console.log("📎 [B2B Step 4] Appending aadhaar_card file:", aadhaarCard);
        formData.append("aadhaar_card", {
          uri: aadhaarCard.uri,
          name: aadhaarCard.name,
          type: aadhaarCard.type,
        } as any);
      }
      if (businessProofDocument) {
        console.log("📎 [B2B Step 4] Appending business_proof_document file:", businessProofDocument);
        formData.append("business_proof_document", {
          uri: businessProofDocument.uri,
          name: businessProofDocument.name,
          type: businessProofDocument.type,
        } as any);
      }

      console.log("🚀 [B2B Step 4]: Sending FormData to saveKycDetails (/app-api/v1/b2b-save-kyc-details)...");
      const response = await saveKycDetails(formData);
      console.log("📥 [B2B Step 4 API Response Received]:", JSON.stringify(response, null, 2));

      if (response.status === 1) {
        console.log("✅ [B2B Step 4]: KYC saved successfully! Transitioning to currentStep = 5");
        setLastCompletedStep((prev) => Math.max(prev, 4));
        markFieldCorrected("legal_business_name");
        markFieldCorrected("gst_certificate");
        markFieldCorrected("pan_number");
        markFieldCorrected("pan_name");
        markFieldCorrected("pan_card");
        markFieldCorrected("aadhaar_holder_name");
        markFieldCorrected("aadhaar_card");
        markFieldCorrected("business_proof_type");
        markFieldCorrected("business_proof_document");
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message ||
            "KYC documents saved. Please review your application.",
          "success",
        );
        setCurrentStep(5);
        console.log("🏁 [B2B Step 4]: setCurrentStep(5) executed!");
      } else {
        console.warn("⚠️ [B2B Step 4 API Returned Non-1 Status]:", response);
        showToast(response.message || "Failed to save KYC documents.", "error");
      }
    } catch (err: any) {
      console.error("💥 [B2B Step 4 Catch Block]: API call or processing threw an exception!", {
        errorMessage: err?.message,
        name: err?.name,
        code: err?.code,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        responseData: err?.response?.data,
        responseHeaders: err?.response?.headers,
        requestUrl: err?.config?.url,
        requestData: err?.config?.data,
        stack: err?.stack,
      });
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save KYC documents.";
      showToast(msg, "error");
    }
  };

  // -------------------------------------------------------------
  // Step 5: Final Submission Handler
  // -------------------------------------------------------------
  const handleSubmitApplication = async () => {
    console.log("🔥 [B2B Step 5]: 'Submit Application' clicked!");
    if (!finalConfirmation) {
      setErrors((prev) => ({
        ...prev,
        finalConfirmation: "Please accept the final confirmation declaration.",
      }));
      showToast(
        "Please confirm that the information provided is correct.",
        "error",
      );
      return;
    }

    if (!publicId || !trackingToken) {
      console.error("❌ [B2B Step 5 Session Missing]:", { publicId, trackingToken });
      showToast(
        "Application session missing. Please verify mobile again.",
        "error",
      );
      return;
    }

    try {
      console.log("🚀 [B2B Step 5]: Calling submitKycDetails (/app-api/v1/b2b-submit-kyc-details)...");
      const response = await submitKycDetails({
        public_id: publicId,
        tracking_token: trackingToken,
        final_confirmation: 1,
      });
      console.log("📥 [B2B Step 5 API Response Received]:", JSON.stringify(response, null, 2));

      if (response.status === 1) {
        console.log("✅ [B2B Step 5]: Application submitted successfully!");
        setApplicationStatus("Submitted for Approval");
        setLastCompletedStep(5);
        setShowStatusScreen(true);
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message ||
            "Application submitted successfully for approval!",
          "success",
        );
      } else {
        console.warn("⚠️ [B2B Step 5 API Returned Non-1 Status]:", response);
        showToast(response.message || "Failed to submit application.", "error");
      }
    } catch (err: any) {
      console.error("💥 [B2B Step 5 Catch Block]: submitKycDetails error!", {
        errorMessage: err?.message,
        name: err?.name,
        code: err?.code,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        responseData: err?.response?.data,
        requestUrl: err?.config?.url,
        stack: err?.stack,
      });
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit application.";
      showToast(msg, "error");
    }
  };

  // Helper to determine lowest rejected step
  const getCorrectionTargetStep = (): 1 | 2 | 3 | 4 => {
    if (correctionStep && correctionStep >= 1 && correctionStep <= 4) {
      return correctionStep as 1 | 2 | 3 | 4;
    }
    if (correctionFields && typeof correctionFields === "object") {
      const stepKeys = Object.keys(correctionFields)
        .map(Number)
        .filter((n) => n >= 1 && n <= 4)
        .sort((a, b) => a - b);
      if (stepKeys.length > 0) {
        return stepKeys[0] as 1 | 2 | 3 | 4;
      }
    }
    return 1;
  };

  const isFieldRejected = (fieldKey: string, stepNum?: number) => {
    if (applicationStatus !== "Correction Required" || !correctionFields) {
      return false;
    }
    if (correctedFields[fieldKey]) {
      return false;
    }
    const targetStep = stepNum || currentStep;
    const stepFields = (correctionFields as any)[String(targetStep)];
    return Array.isArray(stepFields) && stepFields.includes(fieldKey);
  };

  // Helper to determine the next step in flow:
  // In Correction Required mode, if subsequent steps are NOT rejected, jumps directly to Step 5 (Review & Submit)!
  const getNextStepInFlow = (current: 1 | 2 | 3 | 4): 2 | 3 | 4 | 5 => {
    if (applicationStatus === "Correction Required") {
      if (correctionFields && typeof correctionFields === "object") {
        for (let s = (current + 1); s <= 4; s++) {
          const fields = (correctionFields as any)[String(s)];
          if (Array.isArray(fields) && fields.length > 0) {
            return s as 2 | 3 | 4;
          }
        }
      }
      // No remaining steps require correction -> Go straight to Step 5 (Review & Submit)
      return 5;
    }
    return (current + 1) as 2 | 3 | 4 | 5;
  };

  // Stepper Clickability (Allowed if step already unlocked or in correction mode)
  const canGoToStep = (stepNumber: 1 | 2 | 3 | 4 | 5) => {
    if (applicationStatus === "Correction Required") {
      return true;
    }
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return isVerified || lastCompletedStep >= 1;
    if (stepNumber === 3) return lastCompletedStep >= 2;
    if (stepNumber === 4) return lastCompletedStep >= 3;
    if (stepNumber === 5) return lastCompletedStep >= 4;
    return false;
  };

  if (isInitializingSession) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View
          style={{ height: insets.top, backgroundColor: colors.background }}
        />
        <AppNavbar title="Become a Bulk Buyer" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Restoring your application progress...
          </Text>
        </View>
        <View
          style={{ height: insets.bottom, backgroundColor: colors.background }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />

      <AppNavbar title="Become a Bulk Buyer" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 48 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing(40) },
            showStatusScreen && {
              flexGrow: 1,
              paddingTop: spacing(12),
              alignItems: "stretch",
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!showStatusScreen && (
            <>
          {/* Header Title & Description */}
          <View
            style={{
              paddingTop: spacing(4),
              paddingBottom: spacing(14),
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: font(22),
                color: colors.text,
                letterSpacing: -0.3,
              }}
            >
              Become a Bulk Buyer
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(12.5),
                color: colors.textSecondary,
                marginTop: 4,
                lineHeight: font(18),
              }}
            >
              Register your business to access wholesale products, Bulk Buyer
              pricing and dedicated Bulk Buyer support.
            </Text>
          </View>

          {/* 5-Step Connected Progress Stepper */}
          <View style={{ marginTop: spacing(4), marginBottom: spacing(18) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              {B2B_STEPS.map((s, idx) => {
                const isCurrent = currentStep === s.step && !showStatusScreen;
                const isDone =
                  s.step === 1
                    ? isVerified || lastCompletedStep >= 1
                    : lastCompletedStep >= s.step;
                const canNavigate = canGoToStep(s.step);

                // Connecting line states
                const isLeftLineActive =
                  idx > 0 &&
                  (s.step === 2
                    ? isVerified || lastCompletedStep >= 1
                    : lastCompletedStep >= s.step - 1);

                const isRightLineActive =
                  idx < B2B_STEPS.length - 1 &&
                  (s.step === 1
                    ? isVerified || lastCompletedStep >= 1
                    : lastCompletedStep >= s.step);

                return (
                  <View
                    key={s.step}
                    style={{
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    {/* Top Row: Left Line + Step Circle + Right Line */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {/* Left connecting line */}
                      <View
                        style={{
                          flex: 1,
                          height: 2.5,
                          backgroundColor:
                            idx === 0
                              ? "transparent"
                              : isLeftLineActive
                                ? "#10B981"
                                : colors.border,
                        }}
                      />

                      {/* Step Circle Button */}
                      <TouchableOpacity
                        activeOpacity={0.75}
                        disabled={!canNavigate}
                        onPress={() => {
                          setShowStatusScreen(false);
                          setCurrentStep(s.step);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isDone
                            ? "#10B981"
                            : isCurrent
                              ? colors.primary
                              : colors.surface,
                          borderWidth: isCurrent ? 3 : isDone ? 0 : 1.5,
                          borderColor: isCurrent
                            ? colors.primary + "35"
                            : colors.border,
                          opacity: canNavigate ? 1 : 0.65,
                          zIndex: 2,
                        }}
                      >
                        {isDone ? (
                          <Check size={15} color="#ffffff" strokeWidth={3} />
                        ) : (
                          <Text
                            style={{
                              fontFamily: isCurrent
                                ? "Poppins_700Bold"
                                : "Poppins_600SemiBold",
                              fontSize: font(12),
                              color: isCurrent
                                ? "#ffffff"
                                : colors.textTertiary,
                            }}
                          >
                            {s.step}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {/* Right connecting line */}
                      <View
                        style={{
                          flex: 1,
                          height: 2.5,
                          backgroundColor:
                            idx === B2B_STEPS.length - 1
                              ? "transparent"
                              : isRightLineActive
                                ? "#10B981"
                                : colors.border,
                        }}
                      />
                    </View>

                    {/* Step Labels below circle */}
                    <TouchableOpacity
                      activeOpacity={0.75}
                      disabled={!canNavigate}
                      onPress={() => {
                        setShowStatusScreen(false);
                        setCurrentStep(s.step);
                      }}
                      style={{
                        alignItems: "center",
                        marginTop: spacing(6),
                        paddingHorizontal: 2,
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                            fontSize: font(9),
                            color: isDone
                              ? "#10B981"
                              : isCurrent
                                ? colors.primary
                                : colors.textTertiary,
                            textTransform: "uppercase",
                            letterSpacing: 0.3,
                          }}
                        >
                          {s.stepLabel}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={{
                            fontFamily: isCurrent
                              ? "Poppins_600SemiBold"
                              : isDone
                                ? "Poppins_500Medium"
                                : "Poppins_400Regular",
                            fontSize: font(10),
                            color: isCurrent
                              ? colors.text
                              : isDone
                                ? colors.text
                                : colors.textTertiary,
                            textAlign: "center",
                            lineHeight: font(13),
                            marginTop: 1,
                          }}
                        >
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
              </>
          )}

          {/* Correction Notice (if review team requested correction) */}
          {applicationStatus === "Correction Required" && !showStatusScreen && (
            <View style={styles.correctionNoticeBox}>
              <View style={styles.correctionNoticeHeader}>
                <AlertCircle size={18} color="#d92d20" />
                <Text style={styles.correctionNoticeTitle}>
                  Correction Required
                </Text>
              </View>
              <Text style={styles.correctionNoticeSub}>
                Please update the information or documents requested by our
                review team.
              </Text>
              {lastAdminRemark ? (
                <View style={styles.correctionRemarkContainer}>
                  <Text style={styles.correctionRemarkLabel}>
                    Admin Remark / Reason:
                  </Text>
                  <Text style={styles.correctionRemarkText}>
                    {lastAdminRemark}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* ========================================================= */}
          {/* APPLICATION STATUS SCREEN (WHEN SUBMITTED / IN REVIEW)    */}
          {/* ========================================================= */}
          {showStatusScreen && (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                paddingVertical: spacing(8),
              }}
            >
              {/* Status Icon Illustration */}
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    applicationStatus === "Approved"
                      ? "#DCFCE7"
                      : applicationStatus === "Correction Required"
                        ? "#FEE2E2"
                        : "#FEF3C7",
                  borderWidth: 4,
                  borderColor:
                    applicationStatus === "Approved"
                      ? "#F0FDF4"
                      : applicationStatus === "Correction Required"
                        ? "#FFF1F2"
                        : "#FFFBEB",
                  marginBottom: spacing(12),
                }}
              >
                {applicationStatus === "Approved" ? (
                  <CheckCircle2 size={32} color="#16A34A" strokeWidth={2.2} />
                ) : applicationStatus === "Correction Required" ? (
                  <AlertCircle size={32} color="#DC2626" strokeWidth={2.2} />
                ) : (
                  <Clock size={32} color="#D97706" strokeWidth={2.2} />
                )}
              </View>

              {/* Status Pill Badge */}
              <View
                style={{
                  paddingHorizontal: spacing(12),
                  paddingVertical: spacing(4),
                  borderRadius: 20,
                  backgroundColor:
                    applicationStatus === "Approved"
                      ? "#ECFDF5"
                      : applicationStatus === "Correction Required"
                        ? "#FEF2F2"
                        : "#FFFBEB",
                  borderWidth: 1,
                  borderColor:
                    applicationStatus === "Approved"
                      ? "#A7F3D0"
                      : applicationStatus === "Correction Required"
                        ? "#FECACA"
                        : "#FDE68A",
                  marginBottom: spacing(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(11.5),
                    color:
                      applicationStatus === "Approved"
                        ? "#059669"
                        : applicationStatus === "Correction Required"
                          ? "#DC2626"
                          : "#D97706",
                  }}
                >
                  {applicationStatus === "Pending" ||
                  !applicationStatus ||
                  applicationStatus === "Draft"
                    ? "Status: Under Admin Review"
                    : `Application Status: ${applicationStatus}`}
                </Text>
              </View>

              {/* Hero Title */}
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: font(20),
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: spacing(6),
                }}
              >
                Bulk Buyer Application
              </Text>

              {/* Hero Description */}
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(12.5),
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: font(19),
                  maxWidth: 320,
                  marginBottom: spacing(16),
                }}
              >
                {applicationStatus === "Correction Required"
                  ? "Admin has reviewed your application and requested corrections before it can be approved."
                  : applicationStatus === "Approved"
                    ? "Your Bulk Buyer application is approved. You now have full access to wholesale bulk pricing."
                    : "Your application has been received and is waiting for admin verification."}
              </Text>

              {/* CORRECTION REQUIRED CONTENT */}
              {applicationStatus === "Correction Required" && (() => {
                const targetStep = getCorrectionTargetStep();
                const targetStepName = STEP_NAMES[targetStep] || "Details";

                return (
                  <View style={{ width: "100%" }}>
                    {/* Admin Remark Box */}
                    {lastAdminRemark ? (
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: isDark ? "#241414" : "#FFF7F7",
                          borderWidth: 1,
                          borderColor: isDark ? "#5C1D1D" : "#FECACA",
                          borderRadius: 14,
                          padding: spacing(14),
                          marginBottom: spacing(16),
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 8,
                          }}
                        >
                          <AlertCircle size={16} color="#DC2626" />
                          <Text
                            style={{
                              color: "#DC2626",
                              fontSize: font(12.5),
                              fontFamily: "Poppins_600SemiBold",
                            }}
                          >
                            Admin Feedback / Reason:
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: isDark ? "#1C1010" : "#FFFFFF",
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isDark ? "#4B1B1B" : "#FEE2E2",
                            paddingHorizontal: spacing(12),
                            paddingVertical: spacing(10),
                          }}
                        >
                          <Text
                            style={{
                              color: isDark ? "#FCA5A5" : "#1F2937",
                              fontSize: font(13),
                              fontFamily: "Poppins_500Medium",
                              lineHeight: font(19),
                            }}
                          >
                            {lastAdminRemark}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Rejected Sections Breakdown */}
                    {correctionFields &&
                      Object.keys(correctionFields).length > 0 && (
                        <View
                          style={{
                            width: "100%",
                            marginBottom: spacing(14),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: spacing(10),
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Poppins_600SemiBold",
                                fontSize: font(13),
                                color: colors.text,
                              }}
                            >
                              Sections Needing Attention
                            </Text>
                            <View
                              style={{
                                backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(11),
                                  color: "#DC2626",
                                }}
                              >
                                {Object.keys(correctionFields).length}{" "}
                                {Object.keys(correctionFields).length === 1
                                  ? "Section"
                                  : "Sections"}
                              </Text>
                            </View>
                          </View>

                          {Object.entries(correctionFields).map(
                            ([stepKey, fields]) => {
                              const stepNum = (Number(stepKey) >= 1 &&
                              Number(stepKey) <= 5
                                ? Number(stepKey)
                                : 1) as 1 | 2 | 3 | 4 | 5;
                              const stepName =
                                STEP_NAMES[stepNum] || `Step ${stepNum}`;
                              const fieldList = Array.isArray(fields)
                                ? fields
                                : [];

                              return (
                                <TouchableOpacity
                                  key={stepKey}
                                  activeOpacity={0.75}
                                  onPress={() => {
                                    setShowStatusScreen(false);
                                    setCurrentStep(stepNum);
                                  }}
                                  style={{
                                    backgroundColor: colors.surface,
                                    borderWidth: 1.5,
                                    borderColor: isDark ? "#5C1D1D" : "#FECACA",
                                    borderRadius: 14,
                                    padding: spacing(14),
                                    marginBottom: spacing(10),
                                  }}
                                >
                                  {/* Top Row: Step badge, Title, and Action button */}
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
                                        gap: 8,
                                        flex: 1,
                                      }}
                                    >
                                      <View
                                        style={{
                                          backgroundColor: "#DC2626",
                                          borderRadius: 6,
                                          paddingHorizontal: 8,
                                          paddingVertical: 2,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: "#ffffff",
                                            fontFamily: "Poppins_700Bold",
                                            fontSize: font(10.5),
                                          }}
                                        >
                                          Step {stepKey}
                                        </Text>
                                      </View>
                                      <Text
                                        numberOfLines={1}
                                        style={{
                                          fontFamily: "Poppins_600SemiBold",
                                          fontSize: font(13.5),
                                          color: colors.text,
                                          flex: 1,
                                        }}
                                      >
                                        {stepName}
                                      </Text>
                                    </View>

                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                        backgroundColor: isDark
                                          ? "#451A1A"
                                          : "#FEF2F2",
                                        paddingHorizontal: 10,
                                        paddingVertical: 4.5,
                                        borderRadius: 8,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontFamily: "Poppins_600SemiBold",
                                          fontSize: font(11.5),
                                          color: "#DC2626",
                                        }}
                                      >
                                        Fix Now
                                      </Text>
                                      <ChevronRight size={13} color="#DC2626" />
                                    </View>
                                  </View>

                                  {/* Flagged Fields list */}
                                  {fieldList.length > 0 && (
                                    <View
                                      style={{
                                        marginTop: spacing(10),
                                        paddingTop: spacing(8),
                                        borderTopWidth: 1,
                                        borderTopColor: isDark
                                          ? "#2D3748"
                                          : "#F3F4F6",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontFamily: "Poppins_500Medium",
                                          fontSize: font(11),
                                          color: colors.textTertiary,
                                          marginBottom: 6,
                                        }}
                                      >
                                        Fields needing attention:
                                      </Text>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          flexWrap: "wrap",
                                          gap: 6,
                                        }}
                                      >
                                        {fieldList.map((f) => (
                                          <View
                                            key={f}
                                            style={{
                                              backgroundColor: isDark
                                                ? "#2D1D1D"
                                                : "#FFF1F2",
                                              borderWidth: 1,
                                              borderColor: isDark
                                                ? "#612222"
                                                : "#FFE4E6",
                                              borderRadius: 6,
                                              paddingHorizontal: 8,
                                              paddingVertical: 2.5,
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontFamily: "Poppins_500Medium",
                                                fontSize: font(11),
                                                color: "#BE123C",
                                              }}
                                            >
                                              {FIELD_LABELS[f] ||
                                                f.replace(/_/g, " ")}
                                            </Text>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            },
                          )}
                        </View>
                      )}

                    {/* Primary Dynamic Button: Full width, perfectly styled */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setShowStatusScreen(false);
                        setCurrentStep(targetStep);
                      }}
                      style={{
                        width: "100%",
                        height: 50,
                        backgroundColor: colors.primary,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        marginTop: spacing(8),
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: font(13.5),
                          fontFamily: "Poppins_600SemiBold",
                          letterSpacing: 0.3,
                        }}
                      >
                        {`Fix ${targetStepName} (Step ${targetStep})`}
                      </Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </TouchableOpacity>

                    {/* Secondary Link to View All Details */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setShowStatusScreen(false);
                        setCurrentStep(5);
                      }}
                      style={{
                        width: "100%",
                        paddingVertical: spacing(12),
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: spacing(4),
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(12.5),
                        }}
                      >
                        Review Full Application
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}

              {/* APPROVED ACTION BUTTON */}
              {applicationStatus === "Approved" && (
                <View style={{ width: "100%", marginTop: spacing(16), gap: spacing(10) }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.replace("/(tabs)")}
                    style={{
                      width: "100%",
                      height: 50,
                      backgroundColor: "#10B981",
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: font(13.5),
                        fontFamily: "Poppins_600SemiBold",
                        letterSpacing: 0.4,
                      }}
                    >
                      START SHOPPING
                    </Text>
                    <ArrowRight size={18} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleStartNewApplication}
                    style={{
                      paddingVertical: spacing(8),
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: font(12),
                        fontFamily: "Poppins_500Medium",
                      }}
                    >
                      Register Another Business / Start Fresh
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* PENDING / DRAFT ACTION BUTTONS */}
              {(applicationStatus === "Pending" ||
                !applicationStatus ||
                applicationStatus === "Draft") && (
                <View
                  style={{
                    width: "100%",
                    marginTop: spacing(16),
                    gap: spacing(10),
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setShowStatusScreen(false);
                      setCurrentStep(5);
                    }}
                    style={{
                      width: "100%",
                      height: 50,
                      backgroundColor: colors.primary,
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Eye size={18} color="#ffffff" />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: font(13.5),
                        fontFamily: "Poppins_600SemiBold",
                      }}
                    >
                      View Submitted Application
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.replace("/(tabs)")}
                    style={{
                      width: "100%",
                      height: 48,
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13),
                      }}
                    >
                      Back to Home
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 1: BASIC DETAILS                                     */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 1 && !showOtpScreen && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              {/* Step Header */}
              <View style={{ marginBottom: spacing(2) }}>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(17),
                    color: colors.text,
                  }}
                >
                  Basic Details
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Enter business owner or authorized contact details
                </Text>
              </View>

              {/* Owner / Contact Person Name */}
              <AppInputField
                label="Owner / Contact Person Name"
                required
                placeholder="e.g. Ramesh Patel"
                autoCapitalize="words"
                value={ownerName}
                onChangeText={(val) => {
                  setOwnerName(val);
                  markFieldCorrected("owner_name");
                  if (errors.ownerName) setErrors({ ...errors, ownerName: "" });
                }}
                error={errors.ownerName}
                isRejected={isFieldRejected("owner_name", 1)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* Primary Mobile Number */}
              <AppInputField
                label="Primary Mobile Number"
                required
                prefix="+91"
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(val) => {
                  setMobile(val.replace(/[^0-9]/g, ""));
                  markFieldCorrected("mobile");
                  if (errors.mobile) setErrors({ ...errors, mobile: "" });
                }}
                helperText="OTP verification will be sent to this mobile number"
                error={errors.mobile}
                isRejected={isFieldRejected("mobile", 1)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* Alternate Mobile Number */}
              <AppInputField
                label="Alternate Mobile Number"
                optional
                prefix="+91"
                placeholder="Alternate contact number"
                keyboardType="phone-pad"
                maxLength={10}
                value={alternateMobile}
                onChangeText={(val) => {
                  setAlternateMobile(val.replace(/[^0-9]/g, ""));
                  markFieldCorrected("alternate_mobile");
                  if (errors.alternateMobile)
                    setErrors({ ...errors, alternateMobile: "" });
                }}
                error={errors.alternateMobile}
                isRejected={isFieldRejected("alternate_mobile", 1)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* Email Address */}
              <AppInputField
                label="Email Address"
                required
                placeholder="e.g. dealer.orders@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  markFieldCorrected("email");
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                error={errors.email}
                isRejected={isFieldRejected("email", 1)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* Terms Checkbox */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 2,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: termsAccepted ? colors.primary : colors.border,
                    backgroundColor: termsAccepted
                      ? colors.primary
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  {termsAccepted ? (
                    <Check size={13} color="#ffffff" strokeWidth={3} />
                  ) : null}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    lineHeight: font(18),
                  }}
                >
                  I agree to the{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    B2B Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: colors.error,
                    marginLeft: 1,
                  }}
                >
                  {errors.terms}
                </Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSavingBasic}
                onPress={handleSendOtp}
                style={{
                  height: 48,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: spacing(6),
                }}
              >
                {isSavingBasic ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                      }}
                    >
                      {applicationStatus === "Correction Required"
                        ? "Saving Changes..."
                        : "Sending OTP..."}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                      }}
                    >
                      {applicationStatus === "Correction Required" || isVerified
                        ? "Save & Continue"
                        : "Send Verification OTP"}
                    </Text>
                    <ArrowRight size={17} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>

              {/* If already verified, allow direct jump to Step 2 */}
              {isVerified && (
                <TouchableOpacity
                  onPress={() => setCurrentStep(2)}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: spacing(8),
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(12.5),
                    }}
                  >
                    Mobile already verified. Jump to Business Details →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 1.2: OTP VERIFICATION                                */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 1 && showOtpScreen && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              <View style={{ marginBottom: spacing(2) }}>
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold",
                    fontSize: font(20),
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}
                >
                  Verify Mobile Number
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12.5),
                    color: colors.textSecondary,
                    marginTop: spacing(4),
                    lineHeight: font(18),
                  }}
                >
                  Enter the 4-digit verification code sent to your mobile
                </Text>
              </View>

              {/* Mobile Number Display & Change Card */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing(14),
                  paddingVertical: spacing(11),
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: colors.primary + "14",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(10.5),
                        color: colors.textSecondary,
                      }}
                    >
                      Verification sent to
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                        color: colors.text,
                      }}
                    >
                      +91 {mobile}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleEditPhone}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: spacing(12),
                    paddingVertical: spacing(6),
                    borderRadius: 8,
                    backgroundColor: colors.primary + "12",
                  }}
                >
                  <Edit2 size={12} color={colors.primary} />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(12),
                      color: colors.primary,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 4-Box Clean OTP Input using react-native-otp-entry (matching verifyotp.tsx) */}
              <View style={{ marginTop: spacing(12), marginBottom: spacing(4) }}>
                <OtpInput
                  ref={otpInputRef}
                  numberOfDigits={4}
                  focusColor={colors.primary}
                  onTextChange={(code) => {
                    setOtpCode(code);
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  onFilled={(code) => handleVerifyOtp(code)}
                  textInputProps={{
                    textContentType: "oneTimeCode",
                    autoComplete: "sms-otp",
                  }}
                  theme={{
                    containerStyle: {
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: spacing(14),
                    },
                    pinCodeContainerStyle: {
                      width: spacing(62),
                      height: spacing(64),
                      borderRadius: 14,
                      backgroundColor: colors.inputBackground ?? colors.surface,
                      borderColor: errors.otp ? "#EF4444" : colors.border,
                      borderWidth: 1.2,
                    },
                    pinCodeTextStyle: {
                      fontSize: font(22),
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  }}
                />
              </View>

              {errors.otp ? (
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(11.5),
                    color: "#EF4444",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  {errors.otp}
                </Text>
              ) : null}

              {/* Resend / Timer Row matching verifyotp.tsx with WhatsApp / SMS Modal */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: spacing(6),
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(13),
                    color: colors.textSecondary,
                  }}
                >
                  Didn&apos;t receive the code?
                </Text>
                {resendTimer === 0 ? (
                  <TouchableOpacity
                    onPress={handleOpenResendModal}
                    disabled={isResendingOtp}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingVertical: 2,
                    }}
                  >
                    <RotateCcw size={13} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13),
                        color: colors.primary,
                      }}
                    >
                      {isResendingOtp ? "Sending..." : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13),
                      color: colors.primary,
                    }}
                  >
                    {`${String(Math.floor(resendTimer / 60)).padStart(2, "0")}:${String(
                      resendTimer % 60,
                    ).padStart(2, "0")}`}
                  </Text>
                )}
              </View>

              {/* Verify & Continue Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isVerifyingOtp || otpCode.length !== 4}
                onPress={() => handleVerifyOtp()}
                style={{
                  height: 50,
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: spacing(10),
                  opacity: otpCode.length === 4 && !isVerifyingOtp ? 1 : 0.65,
                }}
              >
                {isVerifyingOtp ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                      }}
                    >
                      Verifying OTP...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ShieldCheck size={18} color="#ffffff" />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(14),
                      }}
                    >
                      Verify & Continue
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 2: BUSINESS & GST DETAILS FORM                       */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 2 && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              {/* Step Header */}
              <View style={{ marginBottom: spacing(2) }}>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(17),
                    color: colors.text,
                  }}
                >
                  Business Details
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Enter registered firm name, GSTIN, and business role
                </Text>
              </View>

              {/* 1. GSTIN (Goods and Services Tax ID) */}
              <AppInputField
                label="GSTIN (Goods and Services Tax ID)"
                required
                prefixIcon={<Building2 size={16} color={colors.textSecondary} />}
                placeholder="e.g. 24AAAAA0000A1Z5"
                autoCapitalize="characters"
                maxLength={15}
                letterSpacing={0.8}
                value={gstNumber}
                onChangeText={(val) => {
                  const formatted = val.toUpperCase().trim();
                  setGstNumber(formatted);
                  markFieldCorrected("gst_number");
                  if (errors.gstNumber)
                    setErrors((prev) => ({ ...prev, gstNumber: "" }));
                }}
                error={errors.gstNumber}
                isRejected={isFieldRejected("gst_number", 2)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* 2. Business / Firm Name */}
              <AppInputField
                label="Business / Firm Name"
                required
                prefixIcon={<Building size={16} color={colors.textSecondary} />}
                placeholder="Enter registered firm or trading name"
                autoCapitalize="words"
                value={businessName}
                onChangeText={(val) => {
                  setBusinessName(val);
                  markFieldCorrected("business_name");
                  if (errors.businessName)
                    setErrors({ ...errors, businessName: "" });
                }}
                error={errors.businessName}
                isRejected={isFieldRejected("business_name", 2)}
                helperText={
                  isGstVerified
                    ? "Verified with GST registry records"
                    : undefined
                }
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* 3. Business Constitution / Type */}
              <AppDropdownPicker
                label="Business Constitution / Type"
                required
                prefixIcon={<Briefcase size={16} color={colors.textSecondary} />}
                placeholder="Select Business Constitution..."
                modalTitle="Select Business Constitution"
                searchPlaceholder="Search constitution type..."
                items={businessTypes}
                getItemLabel={(item) => item.name}
                getItemKey={(item) => item.id}
                selectedText={selectedBusinessType?.name}
                onSelect={(item) => {
                  setBusinessTypeId(item.id);
                  markFieldCorrected("business_type_id");
                  if (errors.businessType)
                    setErrors({ ...errors, businessType: "" });
                }}
                error={errors.businessType}
                isRejected={isFieldRejected("business_type_id", 2)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* 4. Dealer Category */}
              <AppDropdownPicker
                label="Dealer Category"
                required
                prefixIcon={<Store size={16} color={colors.textSecondary} />}
                placeholder="Select Dealer Category..."
                modalTitle="Select Dealer Category"
                searchPlaceholder="Search category..."
                items={dealerCategories}
                getItemLabel={(cat) => cat.name}
                getItemKey={(cat) => cat.id}
                getItemSubLabel={(cat) => cat.desc}
                getItemIcon={(cat) => cat.icon}
                selectedText={selectedDealerCategory?.name}
                onSelect={(cat) => {
                  setDealerCategoryId(cat.id);
                  markFieldCorrected("dealer_category_id");
                  if (errors.dealerCategory)
                    setErrors({ ...errors, dealerCategory: "" });
                }}
                error={errors.dealerCategory}
                isRejected={isFieldRejected("dealer_category_id", 2)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* 5. Years in Business */}
              <AppDropdownPicker
                label="Years in Business"
                optional
                prefixIcon={<Calendar size={16} color={colors.textSecondary} />}
                placeholder="Select Years in Business..."
                modalTitle="Select Years in Business"
                searchPlaceholder="Search years..."
                items={yearsInBusinessOptions}
                getItemLabel={(yr) => yr}
                getItemKey={(yr) => yr}
                selectedText={yearsInBusiness || null}
                onSelect={(yr) => {
                  setYearsInBusiness(yr);
                  markFieldCorrected("years_in_business");
                }}
                isRejected={isFieldRejected("years_in_business", 2)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* 6. Referral / Field Executive Code */}
              <AppInputField
                label="Referral / Field Executive Code"
                optional
                prefixIcon={<Tag size={16} color={colors.textSecondary} />}
                placeholder="Enter sales referral code"
                autoCapitalize="characters"
                value={referralCode}
                onChangeText={(val) => {
                  setReferralCode(val.trim());
                  markFieldCorrected("referral_code");
                  if (errors.referralCode)
                    setErrors((prev) => ({ ...prev, referralCode: "" }));
                }}
                error={errors.referralCode}
                isRejected={isFieldRejected("referral_code", 2)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* Action Buttons: Previous & Save & Continue */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(10),
                  marginTop: spacing(10),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(1)}
                  style={{
                    flex: 1,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    borderWidth: 1.2,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <ArrowLeft size={16} color={colors.text} />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13.5),
                      color: colors.text,
                    }}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSavingBusiness}
                  onPress={handleSaveBusinessDetails}
                  style={{
                    flex: 2,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isSavingBusiness ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                        }}
                      >
                        Saving Business...
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                        }}
                      >
                        Save & Continue
                      </Text>
                      <ArrowRight size={17} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 3: ADDRESS DETAILS FORM                              */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 3 && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              {/* Step Header */}
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(17),
                    color: colors.text,
                  }}
                >
                  Address Details
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Enter registered business address and location
                </Text>
              </View>

              {/* Business Address Field */}
              <AppInputField
                label="Business Address"
                required
                prefixIcon={<MapPin size={16} color={colors.textSecondary} />}
                placeholder="Shop/Office number, building, street, area and landmark"
                multiline
                numberOfLines={3}
                value={businessAddress}
                onChangeText={(val) => {
                  setBusinessAddress(val);
                  markFieldCorrected("business_address");
                  if (errors.businessAddress)
                    setErrors((prev) => ({ ...prev, businessAddress: "" }));
                }}
                error={errors.businessAddress}
                isRejected={isFieldRejected("business_address", 3)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* City & Pincode Row */}
              <View style={{ flexDirection: "row", gap: spacing(10) }}>
                <View style={{ flex: 1 }}>
                  <AppInputField
                    label="City"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={businessCity}
                    onChangeText={(val) => {
                      setBusinessCity(val);
                      markFieldCorrected("business_city");
                      if (errors.businessCity)
                        setErrors((prev) => ({ ...prev, businessCity: "" }));
                    }}
                    error={errors.businessCity}
                    isRejected={isFieldRejected("business_city", 3)}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInputField
                    label="Pincode"
                    required
                    placeholder="6-digit pincode"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={businessPincode}
                    onChangeText={(val) => {
                      setBusinessPincode(val.replace(/[^0-9]/g, ""));
                      markFieldCorrected("business_pincode");
                      if (errors.businessPincode)
                        setErrors((prev) => ({
                          ...prev,
                          businessPincode: "",
                        }));
                    }}
                    error={errors.businessPincode}
                    isRejected={isFieldRejected("business_pincode", 3)}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
              </View>

              {/* State Picker */}
              <AppDropdownPicker
                label="State"
                required
                prefixIcon={<Compass size={16} color={colors.textSecondary} />}
                placeholder="Select State..."
                modalTitle="Select State"
                searchPlaceholder="Search state..."
                items={stateList}
                getItemLabel={(s) => s.name}
                getItemKey={(s) => s.id}
                selectedText={
                  stateList.find((s) => s.id === businessStateId)?.name
                }
                onSelect={(s) => {
                  setBusinessStateId(s.id);
                  markFieldCorrected("business_state_id");
                  if (errors.businessStateId)
                    setErrors((prev) => ({ ...prev, businessStateId: "" }));
                }}
                error={errors.businessStateId}
                isRejected={isFieldRejected("business_state_id", 3)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* ========================================================= */}
              {/* ACTION BUTTONS                                            */}
              {/* ========================================================= */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(10),
                  marginTop: spacing(6),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(2)}
                  style={{
                    flex: 1,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    borderWidth: 1.2,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ArrowLeft size={16} color={colors.text} />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13.5),
                      color: colors.text,
                    }}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSavingAddress}
                  onPress={handleSaveAddressDetails}
                  style={{
                    flex: 2,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isSavingAddress ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                        }}
                      >
                        Saving Address...
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                        }}
                      >
                        Save & Continue
                      </Text>
                      <ArrowRight size={17} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 4: KYC DOCUMENTS FORM                                */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 4 && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              {/* Step Header */}
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(17),
                    color: colors.text,
                  }}
                >
                  KYC Documents
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Upload required verification documents (PDF, JPG, PNG up to 5 MB)
                </Text>
              </View>

              {/* ── Registration Summary Card ── */}
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: spacing(8),
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        backgroundColor: colors.primary + "14",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={15} color={colors.primary} />
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                      }}
                    >
                      Registration Summary
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setCurrentStep(1)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: colors.primary + "10",
                    }}
                  >
                    <Edit2 size={11} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(11),
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Summary Rows */}
                <View style={{ gap: spacing(8) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                      }}
                    >
                      Business / Firm
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12.5),
                        color: colors.text,
                        maxWidth: "60%",
                        textAlign: "right",
                      }}
                      numberOfLines={1}
                    >
                      {businessName || legalBusinessName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                      }}
                    >
                      Owner / Contact
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(12.5),
                        color: colors.text,
                      }}
                    >
                      {ownerName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                      }}
                    >
                      Mobile & Email
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(12),
                        color: colors.text,
                      }}
                    >
                      {[mobile, email].filter(Boolean).join(" • ") || "Not provided"}
                    </Text>
                  </View>

                  {gstNumber ? (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: font(12),
                          color: colors.textSecondary,
                        }}
                      >
                        GSTIN
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(12),
                          color: colors.primary,
                          letterSpacing: 0.5,
                        }}
                      >
                        {gstNumber}
                      </Text>
                    </View>
                  ) : null}

                  {(businessAddress || businessCity || businessPincode) ? (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: font(12),
                          color: colors.textSecondary,
                        }}
                      >
                        Address
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: font(11.5),
                          color: colors.text,
                          maxWidth: "60%",
                          textAlign: "right",
                        }}
                        numberOfLines={2}
                      >
                        {[
                          businessAddress,
                          businessCity,
                          getStateName(businessStateId),
                          businessPincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* --------------------------------------------------------- */}
              {/* SECTION 1: GST CERTIFICATE                                */}
              {/* --------------------------------------------------------- */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: spacing(4),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(13.5),
                      color: colors.primary,
                    }}
                  >
                    1
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: colors.text,
                    }}
                  >
                    GST Certificate Details
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11.5),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    Legal entity name and GST verification
                  </Text>
                </View>
              </View>

              <AppInputField
                label="Legal Business Name as per GST"
                required
                prefixIcon={<Building2 size={16} color={colors.textSecondary} />}
                placeholder="Enter legal entity name"
                value={legalBusinessName}
                onChangeText={(text) => {
                  setLegalBusinessName(text);
                  markFieldCorrected("legal_business_name");
                  if (errors.legalBusinessName)
                    setErrors((prev) => ({ ...prev, legalBusinessName: "" }));
                }}
                error={errors.legalBusinessName}
                isRejected={isFieldRejected("legal_business_name", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppInputField
                label="GSTIN"
                prefixIcon={<FileCheck2 size={16} color={colors.textSecondary} />}
                value={gstNumber}
                editable={false}
                isRejected={isFieldRejected("gst_number", 2) || isFieldRejected("gst_number", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppDocumentUploadCard
                label="GST Certificate Document"
                required
                document={gstCertificate}
                documentUrl={gstCertificateUrl}
                onPress={() => handlePickDocument("gst")}
                error={errors.gstCertificate}
                isRejected={isFieldRejected("gst_certificate", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* --------------------------------------------------------- */}
              {/* SECTION 2: PAN CARD                                       */}
              {/* --------------------------------------------------------- */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: spacing(8),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(13.5),
                      color: colors.primary,
                    }}
                  >
                    2
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: colors.text,
                    }}
                  >
                    PAN Card Details
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11.5),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    Permanent account number of proprietor or firm
                  </Text>
                </View>
              </View>

              <AppInputField
                label="PAN Number"
                required
                prefixIcon={<FileText size={16} color={colors.textSecondary} />}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
                value={panNumber}
                onChangeText={(text) => {
                  const upper = text.toUpperCase();
                  setPanNumber(upper);
                  markFieldCorrected("pan_number");
                  if (errors.panNumber)
                    setErrors((prev) => ({ ...prev, panNumber: "" }));
                }}
                error={errors.panNumber}
                isRejected={isFieldRejected("pan_number", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppInputField
                label="Name as per PAN"
                required
                prefixIcon={<User size={16} color={colors.textSecondary} />}
                placeholder="Enter name matching PAN card"
                value={panName}
                onChangeText={(text) => {
                  setPanName(text);
                  markFieldCorrected("pan_name");
                  if (errors.panName)
                    setErrors((prev) => ({ ...prev, panName: "" }));
                }}
                error={errors.panName}
                isRejected={isFieldRejected("pan_name", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppDocumentUploadCard
                label="PAN Card Document"
                required
                document={panCard}
                documentUrl={panCardUrl}
                onPress={() => handlePickDocument("pan")}
                error={errors.panCard}
                isRejected={isFieldRejected("pan_card", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* --------------------------------------------------------- */}
              {/* SECTION 3: AADHAAR CARD                                   */}
              {/* --------------------------------------------------------- */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: spacing(8),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(13.5),
                      color: colors.primary,
                    }}
                  >
                    3
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: colors.text,
                    }}
                  >
                    Aadhaar Card Details
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11.5),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    Proprietor or partner identity verification
                  </Text>
                </View>
              </View>

              <AppInputField
                label="Aadhaar Holder Name"
                required
                prefixIcon={<User size={16} color={colors.textSecondary} />}
                placeholder="Proprietor / Partner Aadhaar name"
                value={aadhaarHolderName}
                onChangeText={(text) => {
                  setAadhaarHolderName(text);
                  markFieldCorrected("aadhaar_holder_name");
                  if (errors.aadhaarHolderName)
                    setErrors((prev) => ({
                      ...prev,
                      aadhaarHolderName: "",
                    }));
                }}
                error={errors.aadhaarHolderName}
                isRejected={isFieldRejected("aadhaar_holder_name", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppDocumentUploadCard
                label="Aadhaar Card Document"
                required
                document={aadhaarCard}
                documentUrl={aadhaarCardUrl}
                onPress={() => handlePickDocument("aadhaar")}
                error={errors.aadhaarCard}
                isRejected={isFieldRejected("aadhaar_card", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* --------------------------------------------------------- */}
              {/* SECTION 4: BUSINESS PROOF DOCUMENT                        */}
              {/* --------------------------------------------------------- */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: spacing(8),
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: font(13.5),
                      color: colors.primary,
                    }}
                  >
                    4
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(14),
                      color: colors.text,
                    }}
                  >
                    Business Proof Document
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      fontSize: font(11.5),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    Trade licence, establishment or drug/chemical certificate
                  </Text>
                </View>
              </View>

              <AppDropdownPicker
                label="Business Proof Type"
                required
                prefixIcon={<Store size={16} color={colors.textSecondary} />}
                placeholder="Select business proof type..."
                modalTitle="Select Business Proof Type"
                searchPlaceholder="Search proof type..."
                items={businessProofTypes}
                getItemLabel={(t) => t}
                getItemKey={(t) => t}
                selectedText={businessProofType}
                onSelect={(t) => {
                  setBusinessProofType(t);
                  markFieldCorrected("business_proof_type");
                  if (errors.businessProofType)
                    setErrors((prev) => ({ ...prev, businessProofType: "" }));
                }}
                error={errors.businessProofType}
                isRejected={isFieldRejected("business_proof_type", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppDocumentUploadCard
                label="Business Proof Document"
                required
                document={businessProofDocument}
                documentUrl={businessProofUrl}
                onPress={() => handlePickDocument("proof")}
                error={errors.businessProofDocument}
                isRejected={isFieldRejected("business_proof_document", 4)}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* ========================================================= */}
              {/* ACTION BUTTONS                                            */}
              {/* ========================================================= */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(10),
                  marginTop: spacing(6),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(3)}
                  style={{
                    flex: 1,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    borderWidth: 1.2,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ArrowLeft size={16} color={colors.text} />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13.5),
                      color: colors.text,
                    }}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSavingKyc}
                  onPress={handleSaveKycDetails}
                  style={{
                    flex: 2,
                    height: INPUT_HEIGHT,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {isSavingKyc ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                          color: "#ffffff",
                        }}
                      >
                        Saving Documents...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13.5),
                          color: "#ffffff",
                        }}
                      >
                        Save & Review
                      </Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 5: REVIEW & SUBMIT APPLICATION                       */}
          {/* ========================================================= */}
          {!showStatusScreen && currentStep === 5 && (
            (() => {
              console.log("👀 [B2B Step 5 Render]: Rendering Review & Submit screen!", {
                ownerName,
                mobile,
                legalBusinessName,
                panNumber,
                panName,
                aadhaarHolderName,
                businessProofType,
                hasGst: !!gstCertificate || !!gstCertificateUrl,
                hasPan: !!panCard || !!panCardUrl,
                hasAadhaar: !!aadhaarCard || !!aadhaarCardUrl,
                hasProof: !!businessProofDocument || !!businessProofUrl,
              });
              return null;
            })()
          )}
          {!showStatusScreen && currentStep === 5 && (
            <View style={{ gap: spacing(16), marginBottom: spacing(24) }}>
              {/* Step Header */}
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(17),
                    color: colors.text,
                  }}
                >
                  Review Application
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Check all details and uploaded documents before final submission.
                </Text>
              </View>

              {/* ── Section 1: Basic Details Card ── */}
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: spacing(10),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "80",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(8),
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_700Bold",
                          fontSize: 11,
                          color: colors.primary,
                        }}
                      >
                        1
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                      }}
                    >
                      Basic Details
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(1)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: spacing(10),
                      paddingVertical: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(11),
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: spacing(8) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Owner / Contact Person
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {ownerName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Mobile Number
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {mobile || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Alternate Mobile
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {alternateMobile || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Email Address
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {email || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Mobile Verification
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: isVerified
                          ? "#10B98118"
                          : "#F59E0B18",
                        paddingHorizontal: spacing(8),
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      {isVerified ? (
                        <CheckCircle2 size={12} color="#10B981" />
                      ) : (
                        <AlertCircle size={12} color="#F59E0B" />
                      )}
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(11),
                          color: isVerified ? "#10B981" : "#F59E0B",
                        }}
                      >
                        {isVerified ? "Verified (OTP)" : "Pending"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Section 2: Business Details Card ── */}
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: spacing(10),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "80",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(8),
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_700Bold",
                          fontSize: 11,
                          color: colors.primary,
                        }}
                      >
                        2
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                      }}
                    >
                      Business Details
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(2)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: spacing(10),
                      paddingVertical: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(11),
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: spacing(8) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Business Name
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {businessName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Business Type
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {getBusinessTypeName(businessTypeId)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Dealer Category
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {getDealerCategoryName(dealerCategoryId)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Years in Business
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {yearsInBusiness || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      GSTIN
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.primary,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {gstNumber || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Referral Code
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.2,
                        textAlign: "right",
                      }}
                    >
                      {referralCode || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Section 3: Address Details Card ── */}
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(14),
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: spacing(10),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "80",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(8),
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_700Bold",
                          fontSize: 11,
                          color: colors.primary,
                        }}
                      >
                        3
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                      }}
                    >
                      Address Details
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(3)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: spacing(10),
                      paddingVertical: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(11),
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: spacing(8) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Business Address
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.4,
                        textAlign: "right",
                      }}
                    >
                      {businessAddress || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      City, State & Pincode
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.4,
                        textAlign: "right",
                      }}
                    >
                      {[
                        businessCity,
                        getStateName(businessStateId),
                        businessPincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Delivery Address
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.4,
                        textAlign: "right",
                      }}
                    >
                      {deliverySame === "Yes"
                        ? "Same as Business Address"
                        : [
                            deliveryAddress,
                            deliveryCity,
                            getStateName(deliveryStateId),
                            deliveryPincode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Warehouse Address
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.4,
                        textAlign: "right",
                      }}
                    >
                      {warehouseSame === "Yes"
                        ? "Same as Business Address"
                        : [
                            warehouseAddress,
                            warehouseCity,
                            getStateName(warehouseStateId),
                            warehousePincode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Section 4: KYC Documents Card ── */}
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(14),
                  gap: spacing(12),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: spacing(10),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "80",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(8),
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_700Bold",
                          fontSize: 11,
                          color: colors.primary,
                        }}
                      >
                        4
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                      }}
                    >
                      KYC Documents
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(4)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: spacing(10),
                      paddingVertical: 5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(11),
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Identity Information Details */}
                <View style={{ gap: spacing(8) }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Legal Business Name
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.3,
                        textAlign: "right",
                      }}
                    >
                      {legalBusinessName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      PAN Number & Name
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.3,
                        textAlign: "right",
                      }}
                    >
                      {panNumber
                        ? `${panNumber} (${panName || "—"})`
                        : "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Aadhaar Holder
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.3,
                        textAlign: "right",
                      }}
                    >
                      {aadhaarHolderName || "Not provided"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(12),
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      Business Proof Type
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(12),
                        color: colors.text,
                        flex: 1.3,
                        textAlign: "right",
                      }}
                    >
                      {businessProofType || "Not provided"}
                    </Text>
                  </View>
                </View>

                {/* Sub-header for Attached Documents */}
                <View
                  style={{
                    paddingTop: spacing(8),
                    borderTopWidth: 1,
                    borderTopColor: colors.border + "80",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(12),
                      color: colors.textSecondary,
                      marginBottom: spacing(8),
                    }}
                  >
                    Attached Document Files
                  </Text>

                  {/* 4 Document Rows with Document View button */}
                  <View style={{ gap: spacing(8) }}>
                    {/* 1. GST Certificate */}
                    {(() => {
                      const isAttached = !!gstCertificate || !!gstCertificateUrl;
                      const fileName =
                        gstCertificate?.name ||
                        (gstCertificateUrl
                          ? gstCertificateUrl.split("/").pop()?.split("?")[0]
                          : "");
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: colors.surface,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: spacing(12),
                            paddingVertical: spacing(9),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                              marginRight: spacing(8),
                            }}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: isAttached
                                  ? "#10B98114"
                                  : colors.border + "50",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileCheck2
                                size={18}
                                color={isAttached ? "#10B981" : colors.textSecondary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(12),
                                  color: colors.text,
                                }}
                                numberOfLines={1}
                              >
                                GST Certificate
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  fontSize: font(10.5),
                                  color: isAttached ? "#10B981" : "#EF4444",
                                  marginTop: 1,
                                }}
                                numberOfLines={1}
                              >
                                {isAttached
                                  ? fileName || "Uploaded ✓"
                                  : "Not uploaded"}
                              </Text>
                            </View>
                          </View>

                          {isAttached && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleOpenDocumentPreview(
                                  "GST Certificate",
                                  gstCertificate?.uri,
                                  gstCertificateUrl,
                                  gstCertificate?.name
                                )
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.primary + "14",
                                borderWidth: 1,
                                borderColor: colors.primary + "35",
                                paddingHorizontal: spacing(10),
                                paddingVertical: 5,
                                borderRadius: 7,
                              }}
                            >
                              <Eye size={13} color={colors.primary} />
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(11),
                                  color: colors.primary,
                                }}
                              >
                                View
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}

                    {/* 2. PAN Card */}
                    {(() => {
                      const isAttached = !!panCard || !!panCardUrl;
                      const fileName =
                        panCard?.name ||
                        (panCardUrl
                          ? panCardUrl.split("/").pop()?.split("?")[0]
                          : "");
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: colors.surface,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: spacing(12),
                            paddingVertical: spacing(9),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                              marginRight: spacing(8),
                            }}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: isAttached
                                  ? "#10B98114"
                                  : colors.border + "50",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileCheck2
                                size={18}
                                color={isAttached ? "#10B981" : colors.textSecondary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(12),
                                  color: colors.text,
                                }}
                                numberOfLines={1}
                              >
                                PAN Card
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  fontSize: font(10.5),
                                  color: isAttached ? "#10B981" : "#EF4444",
                                  marginTop: 1,
                                }}
                                numberOfLines={1}
                              >
                                {isAttached
                                  ? fileName || "Uploaded ✓"
                                  : "Not uploaded"}
                              </Text>
                            </View>
                          </View>

                          {isAttached && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleOpenDocumentPreview(
                                  "PAN Card",
                                  panCard?.uri,
                                  panCardUrl,
                                  panCard?.name
                                )
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.primary + "14",
                                borderWidth: 1,
                                borderColor: colors.primary + "35",
                                paddingHorizontal: spacing(10),
                                paddingVertical: 5,
                                borderRadius: 7,
                              }}
                            >
                              <Eye size={13} color={colors.primary} />
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(11),
                                  color: colors.primary,
                                }}
                              >
                                View
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}

                    {/* 3. Aadhaar Card */}
                    {(() => {
                      const isAttached = !!aadhaarCard || !!aadhaarCardUrl;
                      const fileName =
                        aadhaarCard?.name ||
                        (aadhaarCardUrl
                          ? aadhaarCardUrl.split("/").pop()?.split("?")[0]
                          : "");
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: colors.surface,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: spacing(12),
                            paddingVertical: spacing(9),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                              marginRight: spacing(8),
                            }}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: isAttached
                                  ? "#10B98114"
                                  : colors.border + "50",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileCheck2
                                size={18}
                                color={isAttached ? "#10B981" : colors.textSecondary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(12),
                                  color: colors.text,
                                }}
                                numberOfLines={1}
                              >
                                Aadhaar Card
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  fontSize: font(10.5),
                                  color: isAttached ? "#10B981" : "#EF4444",
                                  marginTop: 1,
                                }}
                                numberOfLines={1}
                              >
                                {isAttached
                                  ? fileName || "Uploaded ✓"
                                  : "Not uploaded"}
                              </Text>
                            </View>
                          </View>

                          {isAttached && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleOpenDocumentPreview(
                                  "Aadhaar Card",
                                  aadhaarCard?.uri,
                                  aadhaarCardUrl,
                                  aadhaarCard?.name
                                )
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.primary + "14",
                                borderWidth: 1,
                                borderColor: colors.primary + "35",
                                paddingHorizontal: spacing(10),
                                paddingVertical: 5,
                                borderRadius: 7,
                              }}
                            >
                              <Eye size={13} color={colors.primary} />
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(11),
                                  color: colors.primary,
                                }}
                              >
                                View
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}

                    {/* 4. Business Proof Document */}
                    {(() => {
                      const isAttached =
                        !!businessProofDocument || !!businessProofUrl;
                      const fileName =
                        businessProofDocument?.name ||
                        (businessProofUrl
                          ? businessProofUrl.split("/").pop()?.split("?")[0]
                          : "");
                      const proofLabel =
                        businessProofType || "Business Proof Document";
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: colors.surface,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: spacing(12),
                            paddingVertical: spacing(9),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                              marginRight: spacing(8),
                            }}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: isAttached
                                  ? "#10B98114"
                                  : colors.border + "50",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileCheck2
                                size={18}
                                color={isAttached ? "#10B981" : colors.textSecondary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(12),
                                  color: colors.text,
                                }}
                                numberOfLines={1}
                              >
                                {proofLabel}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  fontSize: font(10.5),
                                  color: isAttached ? "#10B981" : "#EF4444",
                                  marginTop: 1,
                                }}
                                numberOfLines={1}
                              >
                                {isAttached
                                  ? fileName || "Uploaded ✓"
                                  : "Not uploaded"}
                              </Text>
                            </View>
                          </View>

                          {isAttached && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleOpenDocumentPreview(
                                  proofLabel,
                                  businessProofDocument?.uri,
                                  businessProofUrl,
                                  businessProofDocument?.name
                                )
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.primary + "14",
                                borderWidth: 1,
                                borderColor: colors.primary + "35",
                                paddingHorizontal: spacing(10),
                                paddingVertical: 5,
                                borderRadius: 7,
                              }}
                            >
                              <Eye size={13} color={colors.primary} />
                              <Text
                                style={{
                                  fontFamily: "Poppins_600SemiBold",
                                  fontSize: font(11),
                                  color: colors.primary,
                                }}
                              >
                                View
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })()}
                  </View>
                </View>
              </View>

              {/* ── Final Confirmation Checkbox Card ── */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setFinalConfirmation(!finalConfirmation);
                  if (errors.finalConfirmation) {
                    setErrors((prev) => ({
                      ...prev,
                      finalConfirmation: "",
                    }));
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: errors.finalConfirmation
                    ? "#EF4444"
                    : finalConfirmation
                      ? colors.primary
                      : colors.border,
                  padding: spacing(14),
                  gap: spacing(12),
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: finalConfirmation
                      ? colors.primary
                      : colors.textSecondary + "80",
                    backgroundColor: finalConfirmation
                      ? colors.primary
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  {finalConfirmation && (
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  )}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.text,
                    lineHeight: 19,
                  }}
                >
                  I confirm that all information and documents in this
                  application are complete, current and correct. I understand
                  that the application will be reviewed before approval.
                </Text>
              </TouchableOpacity>
              {errors.finalConfirmation ? (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: "#EF4444",
                    marginLeft: 4,
                  }}
                >
                  {errors.finalConfirmation}
                </Text>
              ) : null}

              {/* ── Action Buttons Row ── */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(12),
                  marginTop: spacing(6),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(4)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceElevated,
                  }}
                >
                  <ArrowLeft size={16} color={colors.text} />
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: font(13),
                      color: colors.text,
                    }}
                  >
                    Back to KYC
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmittingApproval}
                  onPress={handleSubmitApplication}
                  style={{
                    flex: 1.6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    opacity: isSubmittingApproval ? 0.7 : 1,
                  }}
                >
                  {isSubmittingApproval ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13),
                          color: "#ffffff",
                        }}
                      >
                        Submitting...
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: font(13),
                          color: "#ffffff",
                        }}
                      >
                        {applicationStatus === "Correction Required"
                          ? "Resubmit Application"
                          : "Submit for Approval"}
                      </Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {applicationStatus && applicationStatus !== "Draft" && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowStatusScreen(true)}
                  style={{
                    alignItems: "center",
                    marginTop: spacing(10),
                    paddingVertical: spacing(8),
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: font(12.5),
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    ← Return to Application Status
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================================= */}
      {/* MODAL: BUSINESS CONSTITUTION PICKER                       */}
      {/* ========================================================= */}
      <Modal
        visible={showBusinessTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBusinessTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Business Constitution
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Choose your legal entity registration type
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBusinessTypeModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalSearchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search constitution type..."
                placeholderTextColor={colors.textSecondary + "80"}
                value={businessTypeSearch}
                onChangeText={setBusinessTypeSearch}
              />
              {businessTypeSearch ? (
                <TouchableOpacity onPress={() => setBusinessTypeSearch("")}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={filteredBusinessTypes}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isSelected = businessTypeId === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setBusinessTypeId(item.id);
                      setShowBusinessTypeModal(false);
                      setBusinessTypeSearch("");
                      if (errors.businessType)
                        setErrors((prev) => ({ ...prev, businessType: "" }));
                    }}
                    style={[
                      styles.modalItemRow,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "12"
                          : "transparent",
                        borderBottomColor: colors.border + "60",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <CheckCircle2 size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: STATE PICKER                                       */}
      {/* ========================================================= */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select State
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Choose state for {stateModalTarget} address
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStateModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalSearchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search state..."
                placeholderTextColor={colors.textSecondary + "80"}
                value={stateSearch}
                onChangeText={setStateSearch}
              />
              {stateSearch ? (
                <TouchableOpacity onPress={() => setStateSearch("")}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const currentSelectedId =
                  stateModalTarget === "business"
                    ? businessStateId
                    : stateModalTarget === "delivery"
                      ? deliveryStateId
                      : warehouseStateId;

                const isSelected = currentSelectedId === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectState(item.id)}
                    style={[
                      styles.modalItemRow,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "12"
                          : "transparent",
                        borderBottomColor: colors.border + "60",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <CheckCircle2 size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: BUSINESS PROOF TYPE PICKER                         */}
      {/* ========================================================= */}
      <Modal
        visible={showProofTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProofTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Business Proof Type
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Choose license or registration proof document
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowProofTypeModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 8 }}>
              {businessProofTypes.map((type) => {
                const isSelected = businessProofType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => {
                      setBusinessProofType(type);
                      setShowProofTypeModal(false);
                      if (errors.businessProofType)
                        setErrors((prev) => ({
                          ...prev,
                          businessProofType: "",
                        }));
                    }}
                    style={[
                      styles.modalItemRow,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "12"
                          : "transparent",
                        borderBottomColor: colors.border + "60",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                        },
                      ]}
                    >
                      {type}
                    </Text>
                    {isSelected && (
                      <CheckCircle2 size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: DOCUMENT PREVIEW                                   */}
      {/* ========================================================= */}
      <Modal
        visible={previewDocModal.visible}
        animationType="fade"
        transparent
        onRequestClose={() =>
          setPreviewDocModal((prev) => ({ ...prev, visible: false }))
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing(16),
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "85%",
              backgroundColor: colors.surfaceElevated,
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing(16),
                paddingVertical: spacing(14),
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(15),
                    color: colors.text,
                  }}
                  numberOfLines={1}
                >
                  {previewDocModal.title || "Document Preview"}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(11),
                    color: colors.textSecondary,
                  }}
                  numberOfLines={1}
                >
                  {previewDocModal.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setPreviewDocModal((prev) => ({ ...prev, visible: false }))
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body / Image / Document View */}
            <View
              style={{
                padding: spacing(16),
                alignItems: "center",
                justifyContent: "center",
                minHeight: 260,
                backgroundColor: colors.background,
              }}
            >
              {previewDocModal.uri ? (
                previewDocModal.uri.toLowerCase().endsWith(".pdf") ? (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: spacing(24),
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={32} color={colors.primary} />
                    </View>
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: font(13.5),
                        color: colors.text,
                        textAlign: "center",
                      }}
                    >
                      PDF Document Attached
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins_400Regular",
                        fontSize: font(11.5),
                        color: colors.textSecondary,
                        textAlign: "center",
                        paddingHorizontal: 16,
                      }}
                    >
                      Tap "Open Full File" below to view this PDF in your browser or reader.
                    </Text>
                  </View>
                ) : (
                  <RNImage
                    source={{ uri: previewDocModal.uri }}
                    style={{
                      width: "100%",
                      height: 300,
                      borderRadius: 10,
                    }}
                    resizeMode="contain"
                  />
                )
              ) : (
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: font(12),
                    color: colors.textSecondary,
                  }}
                >
                  No preview available
                </Text>
              )}
            </View>

            {/* Modal Footer Actions */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                padding: spacing(14),
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={async () => {
                  try {
                    const supported = await Linking.canOpenURL(previewDocModal.uri);
                    if (supported) {
                      await Linking.openURL(previewDocModal.uri);
                    } else {
                      Alert.alert("Notice", "Cannot open this file URL directly.");
                    }
                  } catch (e) {
                    Linking.openURL(previewDocModal.uri).catch(() => {
                      showToast("Failed to open document URL", "error");
                    });
                  }
                }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                }}
              >
                <ExternalLink size={15} color="#ffffff" />
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: font(12.5),
                    color: "#ffffff",
                  }}
                >
                  Open Full File
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setPreviewDocModal((prev) => ({ ...prev, visible: false }))
                }
                style={{
                  paddingHorizontal: spacing(18),
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: font(12.5),
                    color: colors.text,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Resend OTP Modal (WhatsApp / SMS Selection matching login flow) */}
      <ResendOtpModal
        visible={showResendModal}
        onClose={() => setShowResendModal(false)}
        onSelect={handleSelectResendChannel}
      />

      <View
        style={{ height: insets.bottom, backgroundColor: colors.background }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#20086b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  resetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resetPillText: {
    color: "#ffffff",
    fontSize: 10.5,
    fontFamily: "Poppins_500Medium",
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontSize: 19,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: "96%",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    width: "100%",
  },
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  stepNumber: {
    color: "#1E1B4B",
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
  stepNumberInactive: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  stepLabelActive: {
    color: "#FBC30B",
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },
  stepLabelDone: {
    color: "#10B981",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  stepLabelInactive: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  stepLine: {
    width: 18,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginHorizontal: 3,
    marginBottom: 14,
  },
  stepLineActive: {
    backgroundColor: "#10B981",
  },
  formCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  formHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  formSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  sessionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  sessionBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 5,
  },
  optionalBadge: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98118",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    color: "#10B981",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  phonePrefix: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    paddingRight: 4,
    borderRightWidth: 1,
    borderRightColor: "rgba(150, 150, 150, 0.3)",
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
  },
  textAreaContainer: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 76,
  },
  textAreaInput: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlignVertical: "top",
  },
  formTwoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  sectionHeaderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  toggleRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  toggleTitle: {
    fontSize: 12.5,
    fontFamily: "Poppins_600SemiBold",
  },
  toggleSubtitle: {
    fontSize: 10.5,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
    maxWidth: "90%",
  },
  subAddressBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  subAddressTitle: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  helperText: {
    fontSize: 10.5,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    marginLeft: 2,
    lineHeight: 15,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    marginTop: 4,
    marginLeft: 2,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifyBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  gstVerifiedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  gstCardTitle: {
    fontSize: 12.5,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  gstCardSub: {
    fontSize: 10.5,
    fontFamily: "Poppins_400Regular",
    lineHeight: 15,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  categoriesGrid: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 12,
  },
  categoryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 12.5,
    marginBottom: 1,
  },
  categoryDesc: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    lineHeight: 14,
  },
  yearsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearPillText: {
    fontSize: 11.5,
  },
  referralVerifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  referralVerifiedText: {
    color: "#10B981",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  backStepButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  backStepText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  saveStepButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#20086b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#20086b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  skipToStepBtn: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 4,
  },
  skipToStepText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  phoneBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  phoneBadgeText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  editPhoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editPhoneText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  otpBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  timerText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  resendBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  summaryCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  docChecklistContainer: {
    width: "100%",
    gap: 10,
    marginVertical: 10,
  },
  docItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  docItemTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  docItemSub: {
    fontSize: 10.5,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  benefitsHeader: {
    marginBottom: 12,
    marginTop: 6,
  },
  benefitsTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  benefitsGrid: {
    gap: 10,
  },
  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  benefitIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitCardTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  benefitCardDesc: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  modalSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 0,
  },
  modalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemText: {
    fontSize: 13,
  },
  // Correction notice box
  correctionNoticeBox: {
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderRadius: 14,
    backgroundColor: "#FFF8F8",
    padding: 14,
    width: "100%",
  },
  correctionNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  correctionNoticeTitle: {
    color: "#b42318",
    fontSize: 13.5,
    fontFamily: "Poppins_700Bold",
  },
  correctionNoticeSub: {
    color: "#667085",
    fontSize: 11.5,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
  correctionRemarkContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3d5d2",
    paddingTop: 8,
  },
  correctionRemarkLabel: {
    color: "#b42318",
    fontSize: 11.5,
    fontFamily: "Poppins_600SemiBold",
  },
  correctionRemarkText: {
    color: "#344054",
    fontSize: 11.5,
    fontFamily: "Poppins_400Regular",
    lineHeight: 17,
    marginTop: 2,
  },

  // Status Screen styles
  statusBadgeRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillSuccess: {
    backgroundColor: "#ecfdf3",
    borderWidth: 1,
    borderColor: "#a6f4c5",
  },
  statusPillWarning: {
    backgroundColor: "#fffaeb",
    borderWidth: 1,
    borderColor: "#fedf89",
  },
  statusPillError: {
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fecdca",
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  statusHeroTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  statusAppId: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 12,
  },
  statusHeroDesc: {
    fontSize: 12.5,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // KYC Section & Upload box styles
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 4,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontFamily: "Poppins_600SemiBold",
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  summaryCardTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  uploadBoxInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  uploadIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  uploadBoxSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  docAttachedIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  docAttachedName: {
    fontSize: 12.5,
    fontFamily: "Poppins_600SemiBold",
  },
  docAttachedHint: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    marginTop: 2,
  },

  // Review screen styles
  reviewSection: {
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    width: "100%",
  },
  reviewSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewSectionTitle: {
    fontSize: 13.5,
    fontFamily: "Poppins_700Bold",
  },
  reviewEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  reviewEditText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  reviewGrid: {
    gap: 8,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reviewLabel: {
    fontSize: 11.5,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  reviewValue: {
    fontSize: 11.5,
    fontFamily: "Poppins_600SemiBold",
    flex: 1.2,
    textAlign: "right",
  },
  declarationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginVertical: 14,
    width: "100%",
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  declarationText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  requiredAsterisk: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  selectTriggerText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
});
