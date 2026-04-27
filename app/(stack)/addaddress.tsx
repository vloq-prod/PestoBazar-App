import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useAppVisitorStore } from "../../src/store/auth";
import { useResponsive } from "../../src/utils/useResponsive";
import { useTheme } from "../../src/theme";
import AppNavbar from "../../src/components/comman/AppNavbar";
import { addressSchema } from "../../src/schema/address.schema";
import {
  Home,
  Warehouse,
  Briefcase,
  MapPin,
  MoreHorizontal,
  ChevronDown,
  Search,
  Check,
  X,
} from "lucide-react-native";
import {
  useAddress,
  useSaveAddress,
  useSingleAddress,
} from "../../src/hooks/CheckoutHooks";
import { StateItem } from "../../src/types/checkout.types";

// ── Types ──────────────────────────────────────────────────────
type AddressLabel = "Home" | "Office" | "Warehouse" | "Others";

const ADDRESS_LABELS: { key: AddressLabel; icon: any }[] = [
  { key: "Home", icon: Home },
  { key: "Warehouse", icon: Warehouse },
  { key: "Office", icon: Briefcase },
  { key: "Others", icon: MoreHorizontal },
];

const INPUT_HEIGHT = 48;

// ── Field Component ────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  maxLength?: number;
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  returnKeyType?: any;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
  optional?: boolean;
}

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  inputRef,
  onSubmitEditing,
  returnKeyType = "next",
  colors,
  font,
  spacing,
  optional,
}: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={{ gap: 5 }}>
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

      <View
        style={{
          height: INPUT_HEIGHT,
          borderWidth: focused || !!error ? 1.8 : 1.2,
          borderColor,
          borderRadius: 12,
          backgroundColor: colors.inputBackground ?? colors.surface,
          paddingHorizontal: spacing(12),
          justifyContent: "center",
        }}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(13),
            color: colors.text,
            paddingVertical: 0,
            ...Platform.select({
              android: { includeFontPadding: false },
              ios: {},
            }),
          }}
        />
      </View>

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
  );
};

// ── State Picker Field ─────────────────────────────────────────
interface StatePickerProps {
  selected: StateItem | null;
  onSelect: (state: StateItem) => void;
  states: StateItem[];
  error?: string;
  colors: any;
  font: (n: number) => number;
  spacing: (n: number) => number;
}

const StatePicker = ({
  selected,
  onSelect,
  states,
  error,
  colors,
  font,
  spacing,
}: StatePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();

  const filtered = useMemo(
    () =>
      search.trim()
        ? states.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase()),
          )
        : states,
    [search, states],
  );

  const borderColor = error
    ? colors.error
    : selected
      ? colors.primary
      : colors.border;

  return (
    <>
      {/* Label */}
      <Text
        style={{
          fontFamily: "Poppins_500Medium",
          fontSize: font(11),
          color: error
            ? colors.error
            : selected
              ? colors.primary
              : colors.textSecondary,
          marginLeft: 1,
          marginBottom: 5,
        }}
      >
        State
      </Text>

      {/* Trigger */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={{
          height: INPUT_HEIGHT,
          borderWidth: selected || error ? 1.8 : 1.2,
          borderColor,
          borderRadius: 12,
          backgroundColor: colors.inputBackground ?? colors.surface,
          paddingHorizontal: spacing(12),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: selected ? "Poppins_500Medium" : "Poppins_400Regular",
            fontSize: font(13),
            color: selected ? colors.text : colors.textTertiary,
            flex: 1,
          }}
        >
          {selected ? selected.name : "Select state"}
        </Text>
        <ChevronDown
          size={16}
          color={selected ? colors.primary : colors.textTertiary}
        />
      </TouchableOpacity>

      {!!error && (
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            fontSize: font(11),
            color: colors.error,
            marginLeft: 1,
            marginTop: 5,
          }}
        >
          {error}
        </Text>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + spacing(16),
              maxHeight: "80%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing(16),
                paddingTop: spacing(20),
                paddingBottom: spacing(12),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: font(16),
                  color: colors.text,
                }}
              >
                Select State
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearch("");
                }}
                style={{
                  width: spacing(32),
                  height: spacing(32),
                  borderRadius: spacing(16),
                  backgroundColor: colors.inputBackground,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing(10),
                marginHorizontal: spacing(16),
                marginVertical: spacing(12),
                height: INPUT_HEIGHT,
                borderWidth: 1.2,
                borderColor: colors.border,
                borderRadius: 12,
                backgroundColor: colors.inputBackground ?? colors.surface,
                paddingHorizontal: spacing(12),
              }}
            >
              <Search size={16} color={colors.textTertiary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search state..."
                placeholderTextColor={colors.textTertiary}
                style={{
                  flex: 1,
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(13),
                  color: colors.text,
                  paddingVertical: 0,
                  ...Platform.select({
                    android: { includeFontPadding: false },
                    ios: {},
                  }),
                }}
              />
              {!!search && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <X size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = selected?.id === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item);
                      setModalVisible(false);
                      setSearch("");
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: spacing(16),
                      paddingVertical: spacing(13),
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
                        fontSize: font(14),
                        color: isSelected ? colors.primary : colors.text,
                        flex: 1,
                      }}
                    >
                      {item.name}
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
    </>
  );
};

// ── Helper Components ──────────────────────────────────────────
const SectionCard = ({ children, colors, spacing }: any) => (
  <View
    style={{
      backgroundColor: colors.surface,
      borderRadius: spacing(16),
      paddingVertical: spacing(14),
      gap: spacing(14),
    }}
  >
    {children}
  </View>
);

const SectionLabel = ({ title, font, colors }: any) => (
  <Text
    style={{
      fontFamily: "Poppins_600SemiBold",
      fontSize: font(11),
      color: colors.textSecondary,
      letterSpacing: 0.9,
      textTransform: "uppercase",
    }}
  >
    {title}
  </Text>
);

// ── Main Screen ────────────────────────────────────────────────
export default function AddAddress() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { spacing, font } = useResponsive();
  const { type, id } = useLocalSearchParams<{ type: string; id?: string }>();
  const userId = useAppVisitorStore((s) => s.userId);

  const { data: addressData } = useAddress({ user_id: userId! });
  const stateList: StateItem[] = addressData?.data?.state_master ?? [];

  const { data: singleAddress } = useSingleAddress({
    user_id: userId!,
    id: id ? Number(id) : 0,
  });

  const { mutate: saveAddress, isPending } = useSaveAddress(() => {
    router.back();
  });
  const actionTitle = id ? "Edit" : "Add";
  const addressType = type === "delivery" ? "Delivery" : "Billing";

  // ── Form State ─────────────────────────────────────────────
  const [form, setForm] = useState({
    full_name: "",
    number: "",
    email: "",
    building: "",
    area: "",
    address: "",
    city: "",
    pincode: "",
    gst: "",
  });

  const [selectedState, setSelectedState] = useState<StateItem | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<AddressLabel>("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form | "state" | "label", string>>
  >({});

  // Populate form if editing
  useEffect(() => {
    if (singleAddress) {
      setForm({
        full_name: singleAddress.full_name || "",
        number: singleAddress.mobile_no || "",
        email: singleAddress.email || "",
        building: singleAddress.building || "",
        area: singleAddress.area || "",
        address: singleAddress.address || "",
        city: singleAddress.city || "",
        pincode: singleAddress.pincode || "",
        gst: singleAddress.gst || "",
      });

      if (singleAddress.state && stateList.length > 0) {
        const found = stateList.find((s) => s.id === singleAddress.state);
        if (found) setSelectedState(found);
      }

      const label = singleAddress.address_name;
      if (["Home", "Office", "Warehouse"].includes(label)) {
        setSelectedLabel(label as AddressLabel);
      } else if (label) {
        setSelectedLabel("Others");
        setCustomLabel(label);
      }
    }
  }, [singleAddress, stateList]);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // ── Refs ──────────────────────────────────────────────────
  const phoneRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const buildingRef = useRef<TextInput | null>(null);
  const areaRef = useRef<TextInput | null>(null);
  const addressRef = useRef<TextInput | null>(null);
  const cityRef = useRef<TextInput | null>(null);
  const pincodeRef = useRef<TextInput | null>(null);
  const gstRef = useRef<TextInput | null>(null);
  const customLabelRef = useRef<TextInput | null>(null);

  // ── Submit ─────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    // Validate state separately
    if (!selectedState) {
      setErrors((p) => ({ ...p, state: "Please select a state" }));
      return;
    }

    const result = addressSchema.safeParse({
      ...form,
      state: String(selectedState.id),
    });

    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (selectedLabel === "Others" && !customLabel.trim()) {
      setErrors((p) => ({ ...p, label: "Please enter address label" }));
      return;
    }

    saveAddress({
      user_id: userId!,
      address_type: (type === "delivery" ? "delivery" : "billing") as
        | "delivery"
        | "billing",
      address_name: selectedLabel,
      full_name: form.full_name,
      number: form.number,
      email: form.email,
      building: form.building,
      area: form.area,
      address: form.address,
      state: String(selectedState.id),
      city: form.city,
      pincode: form.pincode,
      gst: form.gst || undefined,
      address_id: id ? String(id) : undefined,
    });
  }, [
    form,
    selectedState,
    selectedLabel,
    customLabel,
    userId,
    type,
    id,
    singleAddress,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: insets.top }} />
      <AppNavbar title={`${actionTitle} ${addressType} Address`} showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: spacing(16),
            paddingTop: spacing(16),
            paddingBottom: insets.bottom + spacing(100),
            gap: spacing(10),
          }}
        >
          {/* ── Map Placeholder ── */}
          <View
            style={{
              height: 180,
              borderRadius: spacing(16),
              borderWidth: 1,
              borderColor: colors.primary + "28",
              borderStyle: "dashed",
              backgroundColor: colors.primary + "08",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing(6),
            }}
          >
            <MapPin size={28} color={colors.primary + "60"} />
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: font(13),
                color: colors.primary + "80",
                marginTop: spacing(8),
              }}
            >
              Map Selection Coming Soon
            </Text>
          </View>

          {/* ── Address Label ── */}
          <SectionCard colors={colors} spacing={spacing}>
            <SectionLabel title="Address Label" font={font} colors={colors} />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing(10),
              }}
            >
              {ADDRESS_LABELS.map(({ key, icon: Icon }) => {
                const isSelected = selectedLabel === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedLabel(key);
                      setErrors((p) => ({ ...p, label: undefined }));
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing(6),
                      paddingHorizontal: spacing(14),
                      paddingVertical: spacing(8),
                      borderRadius: 999,
                      borderWidth: isSelected ? 1.8 : 1.2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.primary + "10"
                        : colors.background,
                    }}
                  >
                    <Icon
                      size={14}
                      color={isSelected ? colors.primary : colors.textSecondary}
                      strokeWidth={isSelected ? 2.2 : 1.8}
                    />
                    <Text
                      style={{
                        fontFamily: isSelected
                          ? "Poppins_600SemiBold"
                          : "Poppins_400Regular",
                        fontSize: font(12),
                        color: isSelected
                          ? colors.primary
                          : colors.textSecondary,
                      }}
                    >
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedLabel === "Others" && (
              <Field
                label="Custom Label"
                value={customLabel}
                onChangeText={(v) => {
                  setCustomLabel(v);
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                placeholder="e.g. Farm House, Studio"
                error={errors.label}
                inputRef={customLabelRef}
                returnKeyType="done"
                colors={colors}
                font={font}
                spacing={spacing}
              />
            )}
          </SectionCard>

          {/* ── Contact Info ── */}
          <SectionCard colors={colors} spacing={spacing}>
            <SectionLabel
              title="Contact Information"
              font={font}
              colors={colors}
            />
            <View style={{ gap: spacing(10) }}>
              <View style={{ flexDirection: "row", gap: spacing(10) }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Full Name"
                    value={form.full_name}
                    onChangeText={set("full_name")}
                    placeholder="e.g. Rahul Sharma"
                    error={errors.full_name}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Phone Number"
                    value={form.number}
                    onChangeText={(v) =>
                      set("number")(v.replace(/[^0-9]/g, "").slice(0, 10))
                    }
                    placeholder="e.g. 9876543210"
                    error={errors.number}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    inputRef={phoneRef}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
              </View>

              <Field
                label="Email"
                value={form.email}
                onChangeText={set("email")}
                placeholder="e.g. rahul@gmail.com"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                inputRef={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => buildingRef.current?.focus()}
                colors={colors}
                font={font}
                spacing={spacing}
              />
            </View>
          </SectionCard>

          {/* ── Address Details ── */}
          <SectionCard colors={colors} spacing={spacing}>
            <SectionLabel title="Address Details" font={font} colors={colors} />
            <View style={{ gap: spacing(10) }}>
              <View style={{ flexDirection: "row", gap: spacing(10) }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Flat / House No"
                    value={form.building}
                    onChangeText={set("building")}
                    placeholder="e.g. B-204"
                    error={errors.building}
                    inputRef={buildingRef}
                    returnKeyType="next"
                    onSubmitEditing={() => areaRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Area / Sector"
                    value={form.area}
                    onChangeText={set("area")}
                    placeholder="e.g. Andheri West"
                    error={errors.area}
                    inputRef={areaRef}
                    returnKeyType="next"
                    onSubmitEditing={() => addressRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
              </View>

              <Field
                label="Building / Street / Locality"
                value={form.address}
                onChangeText={set("address")}
                placeholder="e.g. Sunrise Apt, MG Road"
                error={errors.address}
                inputRef={addressRef}
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
                colors={colors}
                font={font}
                spacing={spacing}
              />

              {/* State Picker + City — row */}
              <View style={{ flexDirection: "row", gap: spacing(10) }}>
                <View style={{ flex: 1 }}>
                  <StatePicker
                    selected={selectedState}
                    onSelect={(s) => {
                      setSelectedState(s);
                      setErrors((p) => ({ ...p, state: undefined }));
                    }}
                    states={stateList}
                    error={errors.state}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="City"
                    value={form.city}
                    onChangeText={set("city")}
                    placeholder="e.g. Mumbai"
                    error={errors.city}
                    inputRef={cityRef}
                    returnKeyType="next"
                    onSubmitEditing={() => pincodeRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
              </View>

              {/* Pincode + GST — row */}
              <View style={{ flexDirection: "row", gap: spacing(10) }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Pincode"
                    value={form.pincode}
                    onChangeText={(v) =>
                      set("pincode")(v.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    placeholder="e.g. 400001"
                    error={errors.pincode}
                    keyboardType="number-pad"
                    inputRef={pincodeRef}
                    returnKeyType="next"
                    onSubmitEditing={() => gstRef.current?.focus()}
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="GST Number"
                    value={form.gst}
                    onChangeText={(v) => set("gst")(v.toUpperCase())}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    error={errors.gst}
                    autoCapitalize="characters"
                    inputRef={gstRef}
                    returnKeyType="done"
                    optional
                    colors={colors}
                    font={font}
                    spacing={spacing}
                  />
                </View>
              </View>
            </View>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Bar ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing(16),
          paddingTop: spacing(12),
          paddingBottom: insets.bottom + spacing(12),
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isPending}
          style={{
            height: 52,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isPending ? colors.primary + "80" : colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isPending ? 0 : 0.28,
            shadowRadius: 10,
            elevation: isPending ? 0 : 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              fontSize: font(15),
              color: "#fff",
              letterSpacing: 0.3,
            }}
          >
            {isPending ? "Saving..." : "Save Address"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
