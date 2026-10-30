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
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../src/theme";
import { useResponsive } from "../../src/utils/useResponsive";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { useToast } from "../../src/context/ToastContext";
import { StorageUtil } from "../../src/utils/storage";
import ResendOtpModal, { OtpChannel } from "../../src/modals/auth/ResendOtpModal";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import {
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

// Master Data: Business Types (from MySQL b2b_business_type_master)
const BUSINESS_TYPES = [
  { id: 11, name: "Sole Proprietorship" },
  { id: 12, name: "Partnership Firm" },
  { id: 13, name: "Limited Liability Partnership — LLP" },
  { id: 14, name: "Private Limited Company" },
  { id: 15, name: "Public Limited Company" },
  { id: 16, name: "Hindu Undivided Family — HUF" },
  { id: 17, name: "Cooperative Society" },
  { id: 18, name: "Farmer Producer Organisation — FPO" },
  { id: 19, name: "Trust / Society" },
  { id: 20, name: "Government / Institution" },
];

// Master Data: Dealer Categories (from MySQL b2b_dealer_category_master)
const DEALER_CATEGORIES = [
  {
    id: 11,
    name: "Retailer",
    desc: "Local retail shop selling to farmers & consumers",
    icon: Store,
  },
  {
    id: 13,
    name: "Distributor",
    desc: "Wholesale distributor supplying to dealers & retailers",
    icon: Truck,
  },
  {
    id: 17,
    name: "Institutional Buyer",
    desc: "Corporate, commercial farms, or institutions",
    icon: Building,
  },
  {
    id: 19,
    name: "Cooperative / FPO",
    desc: "Farmer Producer Org or Co-op society",
    icon: Users,
  },
  {
    id: 20,
    name: "Pest Control",
    desc: "PCO service operator & professional applicator",
    icon: Bug,
  },
];

// Years in Business Options (exact match with Web)
const YEARS_IN_BUSINESS_OPTIONS = [
  "Less than 1 year",
  "1 - 3 years",
  "3 - 5 years",
  "5 - 10 years",
  "10 - 20 years",
  "More than 20 years",
];

// Business Proof Types (exact match with Web)
const BUSINESS_PROOF_TYPES = [
  "Insecticide Licence",
  "Pest Control Licence",
  "Shop & Establishment Licence",
  "Other",
];

// 36 Indian States & Union Territories (from MySQL state table)
const INDIAN_STATES = [
  { id: 1, name: "Andaman & Nicobar Islands" },
  { id: 2, name: "Andhra Pradesh" },
  { id: 3, name: "Arunachal Pradesh" },
  { id: 4, name: "Assam" },
  { id: 5, name: "Bihar" },
  { id: 6, name: "Chandigarh" },
  { id: 7, name: "Chhattisgarh" },
  { id: 8, name: "Dadra & Nagar Haveli" },
  { id: 9, name: "Daman & Diu" },
  { id: 10, name: "Delhi" },
  { id: 11, name: "Goa" },
  { id: 12, name: "Gujarat" },
  { id: 13, name: "Haryana" },
  { id: 14, name: "Himachal Pradesh" },
  { id: 15, name: "Jammu & Kashmir" },
  { id: 16, name: "Jharkhand" },
  { id: 17, name: "Karnataka" },
  { id: 18, name: "Kerala" },
  { id: 19, name: "Lakshadweep" },
  { id: 20, name: "Madhya Pradesh" },
  { id: 21, name: "Maharashtra" },
  { id: 22, name: "Manipur" },
  { id: 23, name: "Meghalaya" },
  { id: 24, name: "Mizoram" },
  { id: 25, name: "Nagaland" },
  { id: 26, name: "Odisha" },
  { id: 27, name: "Puducherry" },
  { id: 28, name: "Punjab" },
  { id: 29, name: "Rajasthan" },
  { id: 30, name: "Sikkim" },
  { id: 31, name: "Tamil Nadu" },
  { id: 32, name: "Telangana" },
  { id: 33, name: "Tripura" },
  { id: 34, name: "Uttar Pradesh" },
  { id: 35, name: "Uttarakhand" },
  { id: 36, name: "West Bengal" },
];

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
  colors,
  font,
  spacing,
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={{ gap: 5 }}>
      {/* Label */}
      <Text
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(11),
          color: error
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

      {/* Input box */}
      <View
        style={{
          height: multiline ? undefined : INPUT_HEIGHT,
          minHeight: multiline
            ? numberOfLines
              ? numberOfLines * 22 + 20
              : 74
            : undefined,
          borderWidth: focused || !!error ? 1.8 : 1.2,
          borderColor,
          borderRadius: 12,
          backgroundColor: colors.inputBackground ?? colors.surface,
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
          onChangeText={onChangeText}
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

      {!!error ? (
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

  const borderColor = error
    ? colors.error
    : selectedText
      ? colors.primary
      : colors.border;

  return (
    <>
      <View style={{ gap: 5 }}>
        <Text
          style={{
            fontFamily: "Poppins_500Medium",
            fontSize: font(11),
            color: error
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

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={{
            height: INPUT_HEIGHT,
            borderWidth: selectedText || !!error ? 1.8 : 1.2,
            borderColor,
            borderRadius: 12,
            backgroundColor: colors.inputBackground ?? colors.surface,
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

        {!!error && (
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
        )}
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
  helperText,
  colors,
  font,
  spacing,
}) => {
  const isAttached = !!document || !!documentUrl;
  const fileName = document
    ? document.name
    : documentUrl
      ? documentUrl.split("/").pop() || "Document Attached"
      : "";

  return (
    <View style={{ gap: 5 }}>
      {/* Label */}
      <Text
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(11),
          color: error ? colors.error : colors.textSecondary,
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

      {/* Upload button container */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={{
          borderRadius: 12,
          borderWidth: 1.2,
          borderStyle: isAttached ? "solid" : "dashed",
          borderColor: error
            ? "#EF4444"
            : isAttached
              ? "#10B981"
              : colors.border,
          backgroundColor: isAttached
            ? "#10B9810A"
            : colors.surface,
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
              backgroundColor: isAttached
                ? "#10B9811C"
                : colors.primary + "14",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAttached ? (
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
                color: colors.text,
              }}
              numberOfLines={1}
            >
              {isAttached ? fileName : `Attach ${label}`}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: font(11),
                color: isAttached ? "#10B981" : colors.textSecondary,
                marginTop: 1,
              }}
            >
              {isAttached
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
              backgroundColor: isAttached
                ? "#10B98118"
                : colors.primary + "10",
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: font(11),
                color: isAttached ? "#10B981" : colors.primary,
              }}
            >
              {isAttached ? "Change" : "Upload"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Error / Helper */}
      {!!error ? (
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
        const session = await StorageUtil.getB2BSession();
        const userId = await StorageUtil.getUserId();

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
                "Under Review",
                "Approved",
                "Correction Required",
              ].includes(d.status)
            ) {
              setShowStatusScreen(true);
              setCurrentStep(5);
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
        owner_name: ownerName.trim(),
        mobile: mobile.trim(),
        alternate_mobile: alternateMobile.trim() || null,
        email: email.trim().toLowerCase(),
        terms_accepted: 1,
      });

      if (response.status === 1 && response.data?.public_id) {
        setPublicId(response.data.public_id);
        await StorageUtil.setB2BSession(
          response.data.public_id,
          "",
          mobile.trim(),
        );
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

      if (response.status === 1 && response.data?.tracking_token) {
        setTrackingToken(response.data.tracking_token);
        setIsVerified(true);
        setLastCompletedStep((prev) => Math.max(prev, 1));
        await StorageUtil.setB2BSession(
          publicId,
          response.data.tracking_token,
          mobile,
        );
        showToast("Mobile Number Verified Successfully!", "success");

        setTimeout(() => {
          setCurrentStep(2);
        }, 400);
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
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message || "Business details saved successfully!",
          "success",
        );
        setCurrentStep(3);
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
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message || "Address details saved successfully!",
          "success",
        );
        setCurrentStep(4);
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
    const found = INDIAN_STATES.find((s) => s.id === id);
    return found ? found.name : "Select State...";
  };

  const getBusinessTypeName = (id: number | null) => {
    if (!id) return "Not specified";
    const found = BUSINESS_TYPES.find((b) => b.id === id);
    return found ? found.name : "Not specified";
  };

  const getDealerCategoryName = (id: number | null) => {
    if (!id) return "Not specified";
    const found = DEALER_CATEGORIES.find((c) => c.id === id);
    return found ? found.name : "Not specified";
  };

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const selectedBusinessType = BUSINESS_TYPES.find(
    (b) => b.id === businessTypeId,
  );

  const selectedDealerCategory = DEALER_CATEGORIES.find(
    (c) => c.id === dealerCategoryId,
  );

  const filteredBusinessTypes = BUSINESS_TYPES.filter((item) =>
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
                if (errors.gstCertificate)
                  setErrors((prev) => ({ ...prev, gstCertificate: "" }));
              } else if (field === "pan") {
                setPanCard(fileObj);
                if (errors.panCard)
                  setErrors((prev) => ({ ...prev, panCard: "" }));
              } else if (field === "aadhaar") {
                setAadhaarCard(fileObj);
                if (errors.aadhaarCard)
                  setErrors((prev) => ({ ...prev, aadhaarCard: "" }));
              } else if (field === "proof") {
                setBusinessProofDocument(fileObj);
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
                if (errors.gstCertificate)
                  setErrors((prev) => ({ ...prev, gstCertificate: "" }));
              } else if (field === "pan") {
                setPanCard(fileObj);
                if (errors.panCard)
                  setErrors((prev) => ({ ...prev, panCard: "" }));
              } else if (field === "aadhaar") {
                setAadhaarCard(fileObj);
                if (errors.aadhaarCard)
                  setErrors((prev) => ({ ...prev, aadhaarCard: "" }));
              } else if (field === "proof") {
                setBusinessProofDocument(fileObj);
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
  // Step 4: Save KYC Documents Handler
  // -------------------------------------------------------------
  const handleSaveKycDetails = async () => {
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
      showToast(
        "Please fill all required KYC fields and attach documents.",
        "error",
      );
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
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("tracking_token", trackingToken);
      formData.append("legal_business_name", legalBusinessName.trim());
      formData.append("pan_number", cleanPan);
      formData.append("pan_name", panName.trim());
      formData.append("aadhaar_holder_name", aadhaarHolderName.trim());
      formData.append("business_proof_type", businessProofType.trim());

      if (gstCertificate) {
        formData.append("gst_certificate", {
          uri: gstCertificate.uri,
          name: gstCertificate.name,
          type: gstCertificate.type,
        } as any);
      }
      if (panCard) {
        formData.append("pan_card", {
          uri: panCard.uri,
          name: panCard.name,
          type: panCard.type,
        } as any);
      }
      if (aadhaarCard) {
        formData.append("aadhaar_card", {
          uri: aadhaarCard.uri,
          name: aadhaarCard.name,
          type: aadhaarCard.type,
        } as any);
      }
      if (businessProofDocument) {
        formData.append("business_proof_document", {
          uri: businessProofDocument.uri,
          name: businessProofDocument.name,
          type: businessProofDocument.type,
        } as any);
      }

      const response = await saveKycDetails(formData);

      if (response.status === 1) {
        setLastCompletedStep((prev) => Math.max(prev, 4));
        await StorageUtil.setB2BSession(publicId, trackingToken, mobile);
        showToast(
          response.message ||
            "KYC documents saved. Please review your application.",
          "success",
        );
        setCurrentStep(5);
      } else {
        showToast(response.message || "Failed to save KYC documents.", "error");
      }
    } catch (err: any) {
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
      showToast(
        "Application session missing. Please verify mobile again.",
        "error",
      );
      return;
    }

    try {
      const response = await submitKycDetails({
        public_id: publicId,
        tracking_token: trackingToken,
        final_confirmation: 1,
      });

      if (response.status === 1) {
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
        showToast(response.message || "Failed to submit application.", "error");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit application.";
      showToast(msg, "error");
    }
  };

  // Stepper Clickability (Allowed if step already unlocked)
  const canGoToStep = (stepNumber: 1 | 2 | 3 | 4 | 5) => {
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
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
          {showStatusScreen &&
            applicationStatus &&
            applicationStatus !== "Draft" && (
              <View
                style={[
                  styles.formCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    paddingVertical: 28,
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.statusBadgeRow}>
                  <View
                    style={[
                      styles.statusPill,
                      applicationStatus === "Approved"
                        ? styles.statusPillSuccess
                        : applicationStatus === "Correction Required"
                          ? styles.statusPillError
                          : styles.statusPillWarning,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        applicationStatus === "Approved"
                          ? { color: "#027A48" }
                          : applicationStatus === "Correction Required"
                            ? { color: "#B42318" }
                            : { color: "#B54708" },
                      ]}
                    >
                      Application Status: {applicationStatus}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.statusHeroTitle, { color: colors.text }]}>
                  Bulk Buyer Application
                </Text>

                {publicId ? (
                  <Text
                    style={[
                      styles.statusAppId,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Reference ID:{" "}
                    <Text
                      style={{
                        fontFamily: "Poppins_600SemiBold",
                        color: colors.text,
                      }}
                    >
                      {publicId}
                    </Text>
                  </Text>
                ) : null}

                {applicationStatus === "Submitted for Approval" && (
                  <Text
                    style={[
                      styles.statusHeroDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Your application has been submitted successfully and is
                    waiting for admin review. Our verification team will review
                    your business and KYC documents shortly.
                  </Text>
                )}

                {applicationStatus === "Under Review" && (
                  <Text
                    style={[
                      styles.statusHeroDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    The admin team is reviewing your profile and submitted KYC
                    documents. You will receive an update once the verification
                    is complete.
                  </Text>
                )}

                {applicationStatus === "Correction Required" && (
                  <View style={{ width: "100%", marginVertical: 12 }}>
                    <Text
                      style={[
                        styles.statusHeroDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      The admin has requested corrections in your application.
                    </Text>
                    {lastAdminRemark ? (
                      <View style={styles.correctionRemarkContainer}>
                        <Text style={styles.correctionRemarkLabel}>
                          Correction Remark:
                        </Text>
                        <Text style={styles.correctionRemarkText}>
                          {lastAdminRemark}
                        </Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setShowStatusScreen(false);
                        setCurrentStep(4);
                      }}
                      style={[
                        styles.saveStepButton,
                        { backgroundColor: colors.primary, marginTop: 16 },
                      ]}
                    >
                      <Text style={styles.submitButtonText}>
                        Correct and Resubmit
                      </Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}

                {applicationStatus === "Approved" && (
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles.statusHeroDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Your Bulk Buyer application is approved. You now have full
                      access to wholesale bulk pricing.
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push("/(tabs)")}
                      style={[
                        styles.saveStepButton,
                        { backgroundColor: "#10B981", marginTop: 16 },
                      ]}
                    >
                      <Text style={styles.submitButtonText}>
                        START SHOPPING
                      </Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}

                {applicationStatus !== "Correction Required" &&
                  applicationStatus !== "Approved" && (
                    <View style={{ width: "100%", marginTop: 20 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowStatusScreen(false);
                          setCurrentStep(5);
                        }}
                        style={[
                          styles.backStepButton,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.surface,
                            width: "100%",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <Eye size={16} color={colors.text} />
                        <Text
                          style={[
                            styles.backStepText,
                            { color: colors.text, marginLeft: 8 },
                          ]}
                        >
                          View Submitted Application
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
                  if (errors.ownerName) setErrors({ ...errors, ownerName: "" });
                }}
                error={errors.ownerName}
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
                  if (errors.mobile) setErrors({ ...errors, mobile: "" });
                }}
                helperText="OTP verification will be sent to this mobile number"
                error={errors.mobile}
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
                  if (errors.alternateMobile)
                    setErrors({ ...errors, alternateMobile: "" });
                }}
                error={errors.alternateMobile}
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
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                error={errors.email}
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
                      Sending OTP...
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
                      Send Verification OTP
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
                  if (errors.gstNumber)
                    setErrors((prev) => ({ ...prev, gstNumber: "" }));
                }}
                error={errors.gstNumber}
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
                  if (errors.businessName)
                    setErrors({ ...errors, businessName: "" });
                }}
                error={errors.businessName}
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
                items={BUSINESS_TYPES}
                getItemLabel={(item) => item.name}
                getItemKey={(item) => item.id}
                selectedText={selectedBusinessType?.name}
                onSelect={(item) => {
                  setBusinessTypeId(item.id);
                  if (errors.businessType)
                    setErrors({ ...errors, businessType: "" });
                }}
                error={errors.businessType}
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
                items={DEALER_CATEGORIES}
                getItemLabel={(cat) => cat.name}
                getItemKey={(cat) => cat.id}
                getItemSubLabel={(cat) => cat.desc}
                getItemIcon={(cat) => cat.icon}
                selectedText={selectedDealerCategory?.name}
                onSelect={(cat) => {
                  setDealerCategoryId(cat.id);
                  if (errors.dealerCategory)
                    setErrors({ ...errors, dealerCategory: "" });
                }}
                error={errors.dealerCategory}
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
                items={YEARS_IN_BUSINESS_OPTIONS}
                getItemLabel={(yr) => yr}
                getItemKey={(yr) => yr}
                selectedText={yearsInBusiness || null}
                onSelect={(yr) => setYearsInBusiness(yr)}
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
                  if (errors.referralCode)
                    setErrors((prev) => ({ ...prev, referralCode: "" }));
                }}
                error={errors.referralCode}
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
                  if (errors.businessAddress)
                    setErrors((prev) => ({ ...prev, businessAddress: "" }));
                }}
                error={errors.businessAddress}
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
                      if (errors.businessCity)
                        setErrors((prev) => ({ ...prev, businessCity: "" }));
                    }}
                    error={errors.businessCity}
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
                      if (errors.businessPincode)
                        setErrors((prev) => ({
                          ...prev,
                          businessPincode: "",
                        }));
                    }}
                    error={errors.businessPincode}
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
                items={INDIAN_STATES}
                getItemLabel={(s) => s.name}
                getItemKey={(s) => s.id}
                selectedText={
                  INDIAN_STATES.find((s) => s.id === businessStateId)?.name
                }
                onSelect={(s) => {
                  setBusinessStateId(s.id);
                  if (errors.businessStateId)
                    setErrors((prev) => ({ ...prev, businessStateId: "" }));
                }}
                error={errors.businessStateId}
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
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "14",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={17} color={colors.primary} />
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
                  if (errors.legalBusinessName)
                    setErrors((prev) => ({ ...prev, legalBusinessName: "" }));
                }}
                error={errors.legalBusinessName}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              <AppInputField
                label="GSTIN"
                prefixIcon={<FileCheck2 size={16} color={colors.textSecondary} />}
                value={gstNumber}
                editable={false}
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
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "14",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={17} color={colors.primary} />
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
                  if (errors.panNumber)
                    setErrors((prev) => ({ ...prev, panNumber: "" }));
                }}
                error={errors.panNumber}
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
                  if (errors.panName)
                    setErrors((prev) => ({ ...prev, panName: "" }));
                }}
                error={errors.panName}
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
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "14",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={17} color={colors.primary} />
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
                  if (errors.aadhaarHolderName)
                    setErrors((prev) => ({
                      ...prev,
                      aadhaarHolderName: "",
                    }));
                }}
                error={errors.aadhaarHolderName}
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
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "14",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Store size={17} color={colors.primary} />
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
                items={BUSINESS_PROOF_TYPES}
                getItemLabel={(t) => t}
                getItemKey={(t) => t}
                selectedText={businessProofType}
                onSelect={(t) => {
                  setBusinessProofType(t);
                  if (errors.businessProofType)
                    setErrors((prev) => ({ ...prev, businessProofType: "" }));
                }}
                error={errors.businessProofType}
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
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.formHeader}>
                <View
                  style={[
                    styles.formHeaderIcon,
                    { backgroundColor: colors.primary + "18" },
                  ]}
                >
                  <FileBadge size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formTitle, { color: colors.text }]}>
                    Step 5: Review Application
                  </Text>
                  <Text
                    style={[
                      styles.formSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Check details and documents before final submission.
                  </Text>
                </View>
              </View>

              {/* Section 1: Basic Details */}
              <View
                style={[
                  styles.reviewSection,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reviewSectionHeader,
                    { borderBottomColor: colors.border + "80" },
                  ]}
                >
                  <Text
                    style={[styles.reviewSectionTitle, { color: colors.text }]}
                  >
                    1. Basic Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(1)}
                    style={[
                      styles.reviewEditBtn,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={[styles.reviewEditText, { color: colors.primary }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewGrid}>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Owner / Contact Person
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {ownerName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Mobile Number
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {mobile || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Alternate Mobile
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {alternateMobile || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Email Address
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {email || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Mobile Verified
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        { color: "#10B981", fontFamily: "Poppins_600SemiBold" },
                      ]}
                    >
                      {isVerified ? "Yes (Verified via OTP)" : "Pending"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Section 2: Business Details */}
              <View
                style={[
                  styles.reviewSection,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reviewSectionHeader,
                    { borderBottomColor: colors.border + "80" },
                  ]}
                >
                  <Text
                    style={[styles.reviewSectionTitle, { color: colors.text }]}
                  >
                    2. Business Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(2)}
                    style={[
                      styles.reviewEditBtn,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={[styles.reviewEditText, { color: colors.primary }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewGrid}>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Business Name
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {businessName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Business Type
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {getBusinessTypeName(businessTypeId)}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Dealer Category
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {getDealerCategoryName(dealerCategoryId)}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Years in Business
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {yearsInBusiness || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      GSTIN
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        {
                          color: colors.primary,
                          fontFamily: "Poppins_600SemiBold",
                        },
                      ]}
                    >
                      {gstNumber || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Referral Code
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {referralCode || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Section 3: Address Details */}
              <View
                style={[
                  styles.reviewSection,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reviewSectionHeader,
                    { borderBottomColor: colors.border + "80" },
                  ]}
                >
                  <Text
                    style={[styles.reviewSectionTitle, { color: colors.text }]}
                  >
                    3. Address Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(3)}
                    style={[
                      styles.reviewEditBtn,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={[styles.reviewEditText, { color: colors.primary }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewGrid}>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Business Address
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {businessAddress || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      City, State & Pincode
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {[
                        businessCity,
                        getStateName(businessStateId),
                        businessPincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Section 4: KYC Documents */}
              <View
                style={[
                  styles.reviewSection,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reviewSectionHeader,
                    { borderBottomColor: colors.border + "80" },
                  ]}
                >
                  <Text
                    style={[styles.reviewSectionTitle, { color: colors.text }]}
                  >
                    4. KYC Documents
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(4)}
                    style={[
                      styles.reviewEditBtn,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                  >
                    <Edit2 size={12} color={colors.primary} />
                    <Text
                      style={[styles.reviewEditText, { color: colors.primary }]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewGrid}>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Legal Business Name
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {legalBusinessName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      PAN Number & Name
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {panNumber ? `${panNumber} (${panName})` : "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Aadhaar Holder
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {aadhaarHolderName || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Business Proof Type
                    </Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                      {businessProofType || "Not provided"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      GST Certificate File
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        {
                          color:
                            gstCertificate || gstCertificateUrl
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {gstCertificate
                        ? gstCertificate.name
                        : gstCertificateUrl
                          ? "Uploaded ✓"
                          : "Not uploaded"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      PAN Card File
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        {
                          color: panCard || panCardUrl ? "#10B981" : "#EF4444",
                        },
                      ]}
                    >
                      {panCard
                        ? panCard.name
                        : panCardUrl
                          ? "Uploaded ✓"
                          : "Not uploaded"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Aadhaar Card File
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        {
                          color:
                            aadhaarCard || aadhaarCardUrl
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {aadhaarCard
                        ? aadhaarCard.name
                        : aadhaarCardUrl
                          ? "Uploaded ✓"
                          : "Not uploaded"}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Business Proof Document
                    </Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        {
                          color:
                            businessProofDocument || businessProofUrl
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {businessProofDocument
                        ? businessProofDocument.name
                        : businessProofUrl
                          ? "Uploaded ✓"
                          : "Not uploaded"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Final Confirmation Checkbox */}
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
                style={[
                  styles.declarationCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.finalConfirmation
                      ? "#EF4444"
                      : finalConfirmation
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkboxSquare,
                    finalConfirmation && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {finalConfirmation && (
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  )}
                </View>
                <Text style={[styles.declarationText, { color: colors.text }]}>
                  I confirm that all information and documents in this
                  application are complete, current and correct. I understand
                  that the application will be reviewed before approval.
                </Text>
              </TouchableOpacity>
              {errors.finalConfirmation ? (
                <Text
                  style={[styles.fieldError, { marginTop: 4, marginBottom: 8 }]}
                >
                  {errors.finalConfirmation}
                </Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(4)}
                  style={[
                    styles.backStepButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <ArrowLeft size={16} color={colors.text} />
                  <Text style={[styles.backStepText, { color: colors.text }]}>
                    Back to KYC
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmittingApproval}
                  onPress={handleSubmitApplication}
                  style={[
                    styles.saveStepButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: isSubmittingApproval ? 0.7 : 1,
                    },
                  ]}
                >
                  {isSubmittingApproval ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.submitButtonText}>
                        Submitting Application...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.loadingRow}>
                      <Text style={styles.submitButtonText}>
                        {applicationStatus === "Correction Required"
                          ? "Resubmit for Approval"
                          : "Submit for Approval"}
                      </Text>
                      <ArrowRight size={18} color="#ffffff" />
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
                    marginTop: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12.5,
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
              {BUSINESS_PROOF_TYPES.map((type) => {
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
    borderWidth: 1,
    borderColor: "#f0c3bf",
    borderLeftWidth: 4,
    borderLeftColor: "#d92d20",
    borderRadius: 10,
    backgroundColor: "#fff8f7",
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
