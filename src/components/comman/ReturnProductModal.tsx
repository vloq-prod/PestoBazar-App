import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, ChevronDown, Check, Plus } from "lucide-react-native";
import { Image } from "expo-image";
import { useTheme } from "../../../src/theme";
import { useResponsive } from "../../../src/utils/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReturnReason } from "../../hooks/orderHooks";

// Safe Dynamic Import to prevent crash when bundler is not restarted
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  console.warn("expo-image-picker module not found or loaded in ReturnProductModal");
}

interface ReturnProductModalProps {
  visible: boolean;
  orderId?: string | number;
  productName?: string;
  onClose: () => void;
  onConfirm: (
    reasonId: number,
    reasonText: string,
    subReasonId: number | null,
    subReasonText: string,
    comments: string,
    imageUris: string[]
  ) => void;
  isSubmitting?: boolean;

  // Pre-fill / initial states if returning to same modal
  initialReasonId?: number | null;
  initialReasonText?: string;
  initialSubReasonId?: number | null;
  initialSubReasonText?: string;
  initialComments?: string;
  initialImages?: string[];
}

const INPUT_HEIGHT = 48;

const ReturnProductModal: React.FC<ReturnProductModalProps> = ({
  visible,
  orderId,
  productName,
  onClose,
  onConfirm,
  isSubmitting = false,
  initialReasonId = null,
  initialReasonText = "",
  initialSubReasonId = null,
  initialSubReasonText = "",
  initialComments = "",
  initialImages = [],
}) => {
  const { colors } = useTheme();
  const { font, spacing } = useResponsive();
  const insets = useSafeAreaInsets();

  // Fetch return reasons
  const { data: returnReasonsData, isLoading: isLoadingReasons } = useReturnReason();
  const reasonsList = returnReasonsData?.data?.return_reason || [];

  // Filter main reasons (parent_id === 0)
  const mainReasonsList = reasonsList.filter((item) => item.parent_id === 0);

  const [reasonId, setReasonId] = useState<number | null>(initialReasonId);
  const [reasonText, setReasonText] = useState(initialReasonText);
  
  const [subReasonId, setSubReasonId] = useState<number | null>(initialSubReasonId);
  const [subReasonText, setSubReasonText] = useState(initialSubReasonText);
  const [comments, setComments] = useState(initialComments);
  const [images, setImages] = useState<string[]>(initialImages);

  // Sync state ONLY when the modal transitions to visible
  React.useEffect(() => {
    if (visible) {
      setReasonId(initialReasonId);
      setReasonText(initialReasonText);
      setSubReasonId(initialSubReasonId);
      setSubReasonText(initialSubReasonText);
      setComments(initialComments);
      setImages(initialImages || []);
    }
  }, [visible]);

  // Picker modals visibility
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [subReasonModalVisible, setSubReasonModalVisible] = useState(false);

  // Filter sub-reasons (parent_id === selected reasonId)
  const subReasonsList = reasonId !== null ? reasonsList.filter((item) => item.parent_id === reasonId) : [];

  const handleAddPhoto = async () => {
    if (!ImagePicker) {
      Alert.alert("Module Offline", "expo-image-picker not loaded");
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera roll permission is required to upload images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset: any) => asset.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!reasonId || !comments.trim() || (subReasonsList.length > 0 && subReasonId === null)) return;
    onConfirm(reasonId, reasonText, subReasonId, subReasonText, comments, images);
  };

  const handleClose = () => {
    setReasonModalVisible(false);
    setSubReasonModalVisible(false);
    onClose();
  };

  const isFormValid =
    reasonId !== null &&
    comments.trim().length > 0 &&
    (subReasonsList.length === 0 || subReasonId !== null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay || "rgba(0,0,0,0.45)",
          }}
        >
          {/* Outside click close */}
          <Pressable style={{ flex: 1 }} onPress={handleClose} />

          {/* Bottom Sheet */}
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* Floating Cross */}
            <View
              style={{
                position: "absolute",
                top: -spacing(50),
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.8}
                style={{
                  width: spacing(36),
                  height: spacing(36),
                  borderRadius: spacing(18),
                  backgroundColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <X size={font(16)} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View
              style={{
                paddingVertical: spacing(12),
                paddingHorizontal: spacing(16),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: font(16),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  includeFontPadding: false,
                  lineHeight: font(20),
                }}
              >
                Return / Exchange Product
              </Text>
              {productName && (
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {productName}
                </Text>
              )}
            </View>

            {/* Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: spacing(16),
                paddingTop: spacing(16),
                paddingBottom: Math.max(insets.bottom, spacing(24)),
              }}
            >
              {/* Dropdown 1: Reason for Return */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginBottom: 5,
                }}
              >
                Reason for return <Text style={{ color: "#e10320" }}>*</Text>
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setReasonModalVisible(true)}
                style={{
                  height: INPUT_HEIGHT,
                  borderWidth: reasonId ? 1.8 : 1.2,
                  borderColor: reasonId ? colors.primary : colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  paddingHorizontal: spacing(12),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: spacing(10),
                }}
              >
                {isLoadingReasons ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text
                      style={{
                        fontFamily: reasonId ? "Poppins_500Medium" : "Poppins_400Regular",
                        fontSize: font(13),
                        color: reasonId ? colors.text : colors.textTertiary,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {reasonText || "Select a reason"}
                    </Text>
                    <ChevronDown
                      size={16}
                      color={reasonId ? colors.primary : colors.textTertiary}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Dropdown 2: Specific Reason (Appears only after selecting Reason 1) */}
              {reasonId !== null && subReasonsList.length > 0 && (
                <>
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: font(12),
                      color: colors.text,
                      marginLeft: 1,
                      marginBottom: 5,
                      marginTop: spacing(6),
                    }}
                  >
                    Specific reason <Text style={{ color: "#e10320" }}>*</Text>
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSubReasonModalVisible(true)}
                    style={{
                      height: INPUT_HEIGHT,
                      borderWidth: subReasonId ? 1.8 : 1.2,
                      borderColor: subReasonId ? colors.primary : colors.border,
                      borderRadius: 12,
                      backgroundColor: colors.inputBackground ?? colors.surface,
                      paddingHorizontal: spacing(12),
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: spacing(10),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: subReasonId ? "Poppins_500Medium" : "Poppins_400Regular",
                        fontSize: font(13),
                        color: subReasonId ? colors.text : colors.textTertiary,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {subReasonText || "Select specific details"}
                    </Text>
                    <ChevronDown
                      size={16}
                      color={subReasonId ? colors.primary : colors.textTertiary}
                    />
                  </TouchableOpacity>
                </>
              )}

              {/* Additional Comments */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginTop: spacing(6),
                  marginBottom: 5,
                }}
              >
                Additional comments <Text style={{ color: "#e10320" }}>*</Text>
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.2,
                  borderColor: colors.border,
                  borderRadius: 12,
                  backgroundColor: colors.inputBackground ?? colors.surface,
                  color: colors.text,
                  fontSize: font(13),
                  fontFamily: "Poppins_400Regular",
                  paddingHorizontal: spacing(12),
                  paddingVertical: spacing(12),
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                placeholder="Tell us more about the issue..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                value={comments}
                onChangeText={setComments}
              />

              {/* Upload Photos section */}
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: font(12),
                  color: colors.text,
                  marginLeft: 1,
                  marginTop: spacing(10),
                  marginBottom: 8,
                }}
              >
                Upload Photos (Max 5)
              </Text>
              
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {images.map((uri, index) => (
                  <View
                    key={uri + index}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(index)}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}

                {images.length < 5 && (
                  <TouchableOpacity
                    onPress={handleAddPhoto}
                    activeOpacity={0.8}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.backgroundgray,
                    }}
                  >
                    <Plus size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing(10),
                  marginTop: spacing(20),
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: spacing(10),
                    paddingHorizontal: spacing(20),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                  onPress={handleClose}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: font(13),
                      color: colors.textSecondary,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isFormValid ? 1 : 0.5,
                    paddingVertical: spacing(10),
                    paddingHorizontal: spacing(20),
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={isFormValid && !isSubmitting ? 0.8 : 1}
                  disabled={!isFormValid || isSubmitting}
                  onPress={handleSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Poppins_500Medium",
                        fontSize: font(13),
                        color: "#FFFFFF",
                      }}
                    >
                      Confirm Return
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Nested Modal for Reason Picker */}
        <Modal visible={reasonModalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              justifyContent: "flex-end",
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setReasonModalVisible(false)} />
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + spacing(16),
                maxHeight: "80%",
              }}
            >
              {/* Floating Cross */}
              <View
                style={{
                  position: "absolute",
                  top: -spacing(50),
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setReasonModalVisible(false)}
                  activeOpacity={0.8}
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: spacing(18),
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 0.5,
                    borderColor: colors.border,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <X size={font(16)} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Header */}
              <View
                style={{
                  paddingVertical: spacing(12),
                  paddingHorizontal: spacing(16),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: font(16),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                    lineHeight: font(20),
                  }}
                >
                  Select Reason
                </Text>
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 4,
                  }}
                >
                  Please tell us why you are returning this product
                </Text>
              </View>

              {/* List */}
              <FlatList
                data={mainReasonsList}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = reasonId === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setReasonId(item.id);
                        setReasonText(item.reason);
                        setSubReasonId(null);
                        setSubReasonText("");
                        setReasonModalVisible(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: spacing(16),
                        paddingVertical: spacing(16),
                        backgroundColor: isSelected
                          ? colors.primary + "08"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                          fontSize: font(13),
                          color: isSelected ? colors.primary : colors.text,
                          flex: 1,
                        }}
                      >
                        {item.reason}
                      </Text>
                      {isSelected && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      opacity: 0.4,
                      marginHorizontal: spacing(16),
                    }}
                  />
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Nested Modal for Sub-Reason Picker */}
        <Modal visible={subReasonModalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              justifyContent: "flex-end",
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setSubReasonModalVisible(false)} />
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + spacing(16),
                maxHeight: "80%",
              }}
            >
              {/* Floating Cross */}
              <View
                style={{
                  position: "absolute",
                  top: -spacing(50),
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSubReasonModalVisible(false)}
                  activeOpacity={0.8}
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: spacing(18),
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 0.5,
                    borderColor: colors.border,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <X size={font(16)} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Header */}
              <View
                style={{
                  paddingVertical: spacing(12),
                  paddingHorizontal: spacing(16),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: font(16),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                    lineHeight: font(20),
                  }}
                >
                  Select Specific Details
                </Text>
                <Text
                  style={{
                    fontSize: font(13),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                    lineHeight: font(18),
                    marginTop: 4,
                  }}
                >
                  Choose specific issue regarding: {reasonText}
                </Text>
              </View>

              {/* List */}
              <FlatList
                data={subReasonsList}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = subReasonId === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setSubReasonId(item.id);
                        setSubReasonText(item.reason);
                        setSubReasonModalVisible(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: spacing(16),
                        paddingVertical: spacing(16),
                        backgroundColor: isSelected
                          ? colors.primary + "08"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: isSelected
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                          fontSize: font(13),
                          color: isSelected ? colors.primary : colors.text,
                          flex: 1,
                        }}
                      >
                        {item.reason}
                      </Text>
                      {isSelected && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      opacity: 0.4,
                      marginHorizontal: spacing(16),
                    }}
                  />
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReturnProductModal;
