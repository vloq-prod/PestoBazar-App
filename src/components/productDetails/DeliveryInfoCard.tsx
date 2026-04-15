import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import {
  Truck,
  Banknote,
  PackageCheck,
  MapPin,
  Search,
  AlertCircle,
} from "lucide-react-native";
import { useEstimatedDelivery } from "../../hooks/productDetailsHook";

interface Props {
  variationId: number;
}

// ─── Info Row ────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  text,
  colors,
  spacing,
  font,
  isLast = false,
}: {
  icon: React.ReactNode;
  text: string;
  colors: any;
  spacing: (n: number) => number;
  font: (n: number) => number;
  isLast?: boolean;
}) => (
  <View
    style={[
      styles.infoRow,
      {
        paddingVertical: spacing(10),

        gap: spacing(10),
      },
    ]}
  >
    <View
      style={[
        styles.iconBox,
        {
          width: spacing(32),
          height: spacing(32),
          borderRadius: spacing(8),
          backgroundColor: colors.primary + "12",
        },
      ]}
    >
      {icon}
    </View>
    <Text
      style={{
        flex: 1,
        fontSize: font(12.5),
        fontFamily: "Poppins_400Regular",
        color: colors.textSecondary,
        lineHeight: font(18),
      }}
    >
      {text}
    </Text>
  </View>
);

// ─── Skeleton Row ────────────────────────────────────────────────
const SkeletonRow = ({
  colors,
  spacing,
  isLast = false,
}: {
  colors: any;
  spacing: (n: number) => number;
  isLast?: boolean;
}) => (
  <View
    style={[
      styles.infoRow,
      {
        paddingVertical: spacing(10),
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: colors.border,
        gap: spacing(10),
        alignItems: "center",
      },
    ]}
  >
    <View
      style={{
        width: spacing(32),
        height: spacing(32),
        borderRadius: spacing(8),
        backgroundColor: colors.border,
      }}
    />
    <View style={{ flex: 1, gap: spacing(5) }}>
      <View
        style={{
          height: spacing(9),
          width: "70%",
          borderRadius: spacing(4),
          backgroundColor: colors.border,
        }}
      />
      <View
        style={{
          height: spacing(9),
          width: "45%",
          borderRadius: spacing(4),
          backgroundColor: colors.border + "80",
        }}
      />
    </View>
  </View>
);

// ─── Main Component ──────────────────────────────────────────────
const DeliveryInfoCard = ({ variationId }: Props) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();

  const [touched, setTouched] = useState(false);

  const [inputPincode, setInputPincode] = useState("");
  const [submittedPincode, setSubmittedPincode] = useState("");

  const { delivery, loading, error } = useEstimatedDelivery({
    selected_variation_id: variationId ?? 0,
    pincode: submittedPincode,
  });

  const handleCheck = () => {
    setTouched(true);

    const trimmed = inputPincode.trim();

    if (trimmed.length === 6 && /^\d+$/.test(trimmed)) {
      setSubmittedPincode(trimmed);
    }
  };

  // ── Build rows from API response ──
  const rows = delivery
    ? [
        delivery.location_message && {
          icon: (
            <MapPin
              size={spacing(16)}
              color={colors.primary}
              strokeWidth={1.8}
            />
          ),
          text: delivery.location_message,
        },
        delivery.delivery_date_message && {
          icon: (
            <Truck
              size={spacing(16)}
              color={colors.primary}
              strokeWidth={1.8}
            />
          ),
          text: delivery.delivery_date_message,
        },
        delivery.free_shipping_message && {
          icon: (
            <PackageCheck
              size={spacing(16)}
              color={colors.primary}
              strokeWidth={1.8}
            />
          ),
          text: delivery.free_shipping_message,
        },
        delivery.cod_message && {
          icon: (
            <Banknote
              size={spacing(16)}
              color={colors.primary}
              strokeWidth={1.8}
            />
          ),
          text: delivery.cod_message,
        },
      ].filter(Boolean)
    : [];

  // ── Detect "does not ship" case ──
  const doesNotShip = error?.toLowerCase().includes("invalid pincode");

  const isPincodeInvalid =
    inputPincode.length > 0 &&
    (inputPincode.length < 6 || !/^\d+$/.test(inputPincode));


  return (
    <View style={[styles.card]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.cardHeader,
          {
            gap: spacing(6),
          },
        ]}
      >
        <Truck size={spacing(14)} color={colors.primary} strokeWidth={2} />
        <Text
          style={{
            fontSize: font(13),
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
          }}
        >
          Check Delivery Time
        </Text>
      </View>

      {/* ── Pincode Input Row ── */}
      <View
        style={{
          gap: spacing(6),
        }}
      >
        {/* ── Label ── */}
        <Text
          style={{
            fontSize: font(12),
            fontFamily: "Poppins_500Medium",
            color: colors.textSecondary,
          }}
        >
          Enter Pincode
        </Text>

        {/* ── Input Row ── */}
        <View style={{ flexDirection: "row", gap: spacing(8) }}>
          {/* Input */}
          <View
            style={{
              flex: 1,
              height: spacing(36), // ✅ smaller height
              borderWidth: 1,
              borderColor: isPincodeInvalid
                ? "#EF4444"
                : submittedPincode
                  ? colors.primary
                  : colors.border,
              borderRadius: spacing(8),
              paddingHorizontal: spacing(10),
              flexDirection: "row",
              alignItems: "center", // ✅ vertical center
              backgroundColor: colors.primary + "05",
            }}
          >
            <TextInput
              value={inputPincode}
              onChangeText={(t) => {
                if (t.length <= 6) setInputPincode(t.replace(/[^0-9]/g, ""));
              }}
              placeholder="6 digit pincode"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleCheck}
              style={{
                flex: 1,
                fontSize: font(12.5),
                fontFamily: "Poppins_400Regular",
                color: colors.text,
                textAlignVertical: "center", // ✅ fix Android
                paddingVertical: 0, // ✅ remove default spacing
              }}
            />
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleCheck}
            activeOpacity={0.85}
            style={{
              height: spacing(36), // ✅ same as input
              paddingHorizontal: spacing(14),
              borderRadius: spacing(8),
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: font(12),
                fontFamily: "Poppins_600SemiBold",
                color: "#fff",
              }}
            >
              Check
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Results ── */}
      <View>
        {/* Loading skeletons */}
        {loading &&
          [0, 1, 2, 3].map((i) => (
            <SkeletonRow
              key={i}
              colors={colors}
              spacing={spacing}
              isLast={i === 3}
            />
          ))}

        {/* Does not ship error state */}
        {!loading && doesNotShip && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing(5),
              paddingVertical: spacing(10),
            }}
          >
            <AlertCircle size={spacing(16)} color="#EF4444" strokeWidth={1.8} />
            <Text
              style={{
                fontSize: font(12.5),
                fontFamily: "Poppins_400Regular",
                color: "#EF4444",
                flex: 1,
                lineHeight: font(18),
              }}
            >
              Sorry, Does not ship to pincode
            </Text>
          </View>
        )}

        {/* Normal rows */}
        {!loading &&
          !doesNotShip &&
          (rows as any[]).map((row, i) => (
            <InfoRow
              key={i}
              icon={row.icon}
              text={row.text}
              colors={colors}
              spacing={spacing}
              font={font}
              isLast={i === rows.length - 1}
            />
          ))}

        {/* Empty state — pincode not yet checked */}
        {!loading && !submittedPincode && (
          <View
            style={{
              paddingVertical: spacing(14),
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: font(12),
                fontFamily: "Poppins_400Regular",
                color: colors.textTertiary,
              }}
            >
              Enter your pincode to check delivery options
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DeliveryInfoCard;

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    justifyContent: "center",
  },
  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
});
