// src/utils/storage.ts

import * as SecureStore from "expo-secure-store";

export const StorageKeys = {
  VISITOR_ID: "visitor_id",
  TOKEN: "visitor_token",

  PINCODE: "user_pincode",
};

export const StorageUtil = {
  setVisitor: async (visitorId: string, token: string) => {
    await SecureStore.setItemAsync(StorageKeys.VISITOR_ID, visitorId);
    await SecureStore.setItemAsync(StorageKeys.TOKEN, token);
  },

  getVisitorId: async () => {
    return await SecureStore.getItemAsync(StorageKeys.VISITOR_ID);
  },

  getToken: async () => {
    return await SecureStore.getItemAsync(StorageKeys.TOKEN);
  },

  clearVisitor: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.VISITOR_ID);
    await SecureStore.deleteItemAsync(StorageKeys.TOKEN);
  },




  // ✅ PINCODE SAVE
  setPincode: async (pincode: string) => {
    await SecureStore.setItemAsync(StorageKeys.PINCODE, pincode);
  },

  // ✅ GET PINCODE
  getPincode: async () => {
    return await SecureStore.getItemAsync(StorageKeys.PINCODE);
  },

  // ✅ CLEAR PINCODE
  clearPincode: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.PINCODE);
  },
};
