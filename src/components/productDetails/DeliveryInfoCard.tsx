import { Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme } from "../../theme";
import { useResponsive } from "../../utils/useResponsive";
import { Truck, CheckCircle2, XCircle } from "lucide-react-native";
import { useEstimatedDelivery } from "../../hooks/productDetailsHook";
import { useDeliveryStore } from "../../store/deliveryStore";

interface Props {
  variationId: number;
  onOpenPincode: () => void;
}

const DeliveryInfoCard = ({ variationId, onOpenPincode }: Props) => {
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { pincode } = useDeliveryStore();

  const { delivery, loading } = useEstimatedDelivery({
    selected_variation_id: variationId ?? 0,
    pincode: pincode ?? "",
  });

  const deliveryDateMessage = delivery?.delivery_date_message;
  const locationMessage = delivery?.location_message;
  const freeShipping = delivery?.free_shipping_message;
  const codeMessage = delivery?.cod_message;

  const hasDelivery = deliveryDateMessage && locationMessage;
  const hasPincode = pincode && pincode.length === 6;

  const hasBottomData = freeShipping || codeMessage;

  const isCodAvailable =
    codeMessage?.toLowerCase().includes("cod available") &&
    !codeMessage?.toLowerCase().includes("not");



    if (loading) {
  return (
    <View
      style={{
        marginHorizontal: spacing(16),
        borderWidth: 1,
        borderRadius: spacing(12),
        borderColor: colors.border,
        padding: spacing(12),
        gap: spacing(12),
      }}
    >
      {/* Top skeleton */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              height: 12,
              width: "70%",
              backgroundColor: colors.backgroundgray,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              height: 10,
              width: "50%",
              backgroundColor: colors.backgroundgray,
              borderRadius: 6,
            }}
          />
        </View>

        <View
          style={{
            width: 80,
            height: 30,
            backgroundColor: colors.backgroundgray,
            borderRadius: 8,
          }}
        />
      </View>

      {/* Bottom skeleton */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[1, 2].map((i) => (
          <View key={i} style={{ flex: 1, flexDirection: "row", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.backgroundgray,
              }}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <View
                style={{
                  height: 10,
                  width: "80%",
                  backgroundColor: colors.backgroundgray,
                  borderRadius: 6,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
  return (
    <View
      style={{
        marginHorizontal: spacing(16),
        borderWidth: 1,
        borderRadius: spacing(12),
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* ── Top Row ── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: spacing(10),
        }}
      >
        {/* Left — icon + text */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: spacing(10),
          }}
        >
          {/* <View style={{padding: 4, backgroundColor: colors.success, borderRadius: 30, }}>
        <Check size={12} color={colors.background} strokeWidth={3} />
      </View> */}

          <View style={{ flex: 1 }}>
            {hasDelivery ? (
              <>
                <Text
                  style={{
                    fontSize: font(12),
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.text,
                    includeFontPadding: false,
                  }}
                >
                  {deliveryDateMessage}
                </Text>
                <Text
                  style={{
                    fontSize: font(11),
                    fontFamily: "Poppins_400Regular",
                    color: colors.textSecondary,
                    includeFontPadding: false,
                  }}
                >
                  {pincode} ({locationMessage})
                </Text>
              </>
            ) : (
              <Text
                style={{
                  fontSize: font(13),
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Check Delivery Date
              </Text>
            )}
          </View>
        </View>

        {/* Right — Change / Enter Pincode button */}
        <TouchableOpacity
          onPress={onOpenPincode}
          activeOpacity={0.8}
          style={{
            paddingVertical: spacing(6),
            paddingHorizontal: spacing(14),
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: spacing(10),
            marginLeft: spacing(10),
          }}
        >
          <Text
            style={{
              fontSize: font(13),
              fontFamily: "Poppins_600SemiBold",
              color: colors.primary,
            }}
          >
            {hasPincode ? "Change" : "Enter Pincode"}
          </Text>
        </TouchableOpacity>
      </View>
      {hasBottomData && (
        <>
          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.border }} />

          <View
            style={{
              flexDirection: "row",
              padding: spacing(12),
              gap: spacing(12),
            }}
          >
            {/* COD */}
            {codeMessage && (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: spacing(18),
                    backgroundColor: colors.backgroundgray,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCodAvailable ? (
                    <CheckCircle2 size={spacing(18)} color="green" />
                  ) : (
                    <XCircle size={spacing(18)} color="red" />
                  )}
                </View>

                <Text
                  style={{
                    fontSize: font(11),
                    fontFamily: "Poppins_500Medium",
                    color: colors.text,
                  }}
                >
                  {codeMessage}
                </Text>
              </View>
            )}

            {/* Free Shipping */}
            {freeShipping && (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing(10),
                }}
              >
                <View
                  style={{
                    width: spacing(36),
                    height: spacing(36),
                    borderRadius: spacing(18),
                    backgroundColor: colors.backgroundgray,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Truck size={spacing(18)} color={colors.textSecondary} />
                </View>

                <Text
                  style={{
                    flex: 1,
                    fontSize: font(11),
                    fontFamily: "Poppins_500Medium",
                    color: colors.text,
                  }}
                >
                  {freeShipping}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default DeliveryInfoCard;
