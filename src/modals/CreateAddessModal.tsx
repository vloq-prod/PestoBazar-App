import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useAppVisitorStore } from "../store/auth";
import { useSaveAddress } from "../hooks/CheckoutHooks";
import { SaveAddressRequest } from "../types/checkout.types";
import { addressSchema } from "../schema/address.schema";
// ✅ external schema

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateAddressModal({ visible, onClose }: Props) {
  const { userId } = useAppVisitorStore();
  const { mutate: saveAddress, isPending } = useSaveAddress();

  const [error, setError] = useState("");

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

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = () => {
    // ✅ validate
    const result = addressSchema.safeParse(form);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || "Invalid input");
      return;
    }

    if (!userId) {
      setError("User not logged in");
      return;
    }

    // ✅ clean validated data
    const cleanData = result.data;

    const payload: SaveAddressRequest = {
      user_id: String(userId),
      address_name: "Home",
      full_name: cleanData.full_name,
      number: cleanData.number,
      email: cleanData.email,
      building: cleanData.building,
      area: cleanData.area,
      address: cleanData.address,
      state: "21",
      city: cleanData.city,
      pincode: cleanData.pincode,
      gst: cleanData.gst || "",
      address_id: "",
      address_type: "delivery",
    };

    console.log("📦 Address Payload:", payload);

    saveAddress(payload, {
      onSuccess: () => {
        setForm({
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
        onClose();
      },
      onError: () => {
        setError("Failed to save address");
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", padding: 16 }}>
          <Text>Add Address</Text>

          <TextInput placeholder="Full Name" value={form.full_name} onChangeText={(t) => handleChange("full_name", t)} />
          <TextInput placeholder="Mobile" value={form.number} keyboardType="number-pad" onChangeText={(t) => handleChange("number", t)} />
          <TextInput placeholder="Email" value={form.email} onChangeText={(t) => handleChange("email", t)} />
          <TextInput placeholder="Building" value={form.building} onChangeText={(t) => handleChange("building", t)} />
          <TextInput placeholder="Area" value={form.area} onChangeText={(t) => handleChange("area", t)} />
          <TextInput placeholder="Address" value={form.address} onChangeText={(t) => handleChange("address", t)} />
          <TextInput placeholder="City" value={form.city} onChangeText={(t) => handleChange("city", t)} />
          <TextInput placeholder="Pincode" value={form.pincode} keyboardType="number-pad" onChangeText={(t) => handleChange("pincode", t)} />
          <TextInput placeholder="GST (Optional)" value={form.gst} onChangeText={(t) => handleChange("gst", t.toUpperCase())} />

          {!!error && <Text style={{ color: "red" }}>{error}</Text>}

          <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
            <Text>{isPending ? "Saving..." : "Save Address"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}