import React from "react";
import { ToastItem } from "./ToastItem";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../context/ToastContext";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        styles.wrapper,
        { top: insets.top + (Platform.OS === "android" ? 12 : 8) },
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999,
    alignItems: "center",
    gap: 8,
    pointerEvents: "box-none",
  },
});