import React from "react";
import { View, Text, Animated, Easing } from "react-native";
import {
  ShoppingBag,
  Calendar,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";

const ORDER_STATUSES = [
  {
    label: "Order Placed",
    icon: ShoppingBag,
    short: "Placed",
    description:
      "Your order has been successfully placed and is being processed.",
  },
  {
    label: "Pickup Scheduled",
    icon: Calendar,
    short: "Pickup",
    description:
      "A pickup for your items has been scheduled with our courier partner.",
  },
  {
    label: "Product Dispatched",
    icon: Package,
    short: "Dispatched",
    description: "Your package has left our facility and is on its way to you.",
  },
  {
    label: "On Delivery",
    icon: Truck,
    short: "On Way",
    description:
      "Our delivery partner is heading to your location for delivery.",
  },
  {
    label: "Product Delivered",
    icon: CheckCircle2,
    short: "Delivered",
    description:
      "Order has been successfully delivered. Thank you for shopping!",
  },
];

interface OrderStatusTrackerProps {
  currentStatus: string;
  colors: any;
  font: (size: number) => number;
  spacing: (size: number) => number;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  currentStatus,
  colors,
  font,
  spacing,
}) => {
  const isCancelled = currentStatus?.toLowerCase() === "cancelled";
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!isCancelled) {
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
  }, [isCancelled]);

  if (isCancelled) {
    return (
      <View style={{ marginBottom: spacing(20), alignItems: "center" }}>
        <View
          style={{
            backgroundColor: "#FEF2F2",

            padding: 10,
            borderRadius: 16,
            width: "100%",

            gap: spacing(4),
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
              Order Cancelled
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
            Your order has been cancelled. If you have already paid, the refund
            will be initiated soon.
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = ORDER_STATUSES.findIndex(
    (s) => s.label.toLowerCase() === currentStatus?.toLowerCase(),
  );

  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const activeColor = "#22C55E";

  return (
    <View style={{ paddingLeft: spacing(4), marginBottom: 4 }}>
      {ORDER_STATUSES.map((status, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isActive = index <= activeIndex;
        const isLast = index === ORDER_STATUSES.length - 1;

        return (
          <View
            key={status.label}
            style={{
              flexDirection: "row",
              minHeight: spacing(52),
            }}
          >
            {/* Left: Tracker Line & Dots */}
            <View style={{ alignItems: "center", width: spacing(30) }}>
              {/* Dot */}
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
                {/* Pulse ring for current active step */}
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
                {/* White inner dot for completed steps */}
                {isCompleted && (
                  <View
                    style={{
                      width: spacing(6),
                      height: spacing(6),
                      borderRadius: spacing(3),
                      backgroundColor: "#FFF",
                    }}
                  />
                )}
              </View>

              {/* Vertical Line */}
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor:
                      index < activeIndex ? activeColor : colors.border,
                    marginVertical: -spacing(2),
                  }}
                />
              )}
            </View>

            {/* Right: Status Info */}
            <View
              style={{
                marginLeft: spacing(16),
                paddingBottom: spacing(16),

                flex: 1,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={{
                    fontFamily: isCurrent
                      ? "Poppins_700Bold"
                      : isCompleted
                        ? "Poppins_600SemiBold"
                        : "Poppins_500Medium",
                    fontSize: font(13),
                    color: isActive ? colors.text : colors.textTertiary,
                  }}
                  numberOfLines={1}
                >
                  {status.label}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: font(11),
                  color: isActive ? colors.textSecondary : colors.textTertiary,
                  marginTop: 2,
                  lineHeight: font(11) * 1.55,
                }}
                numberOfLines={2}
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

export default OrderStatusTracker;
