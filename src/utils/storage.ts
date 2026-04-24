import * as SecureStore from "expo-secure-store";

export const StorageKeys = {
  VISITOR_ID: "visitor_id",
  TOKEN: "visitor_token",
  PINCODE: "user_pincode",
  USER_ID: "user_id",
  USER_NAME: "user_name",
};

export const StorageUtil = {
  // ── Visitor ──────────────────────────────────────
  setVisitor: async (visitorId: string, token: string) => {
    await SecureStore.setItemAsync(StorageKeys.VISITOR_ID, visitorId);
    await SecureStore.setItemAsync(StorageKeys.TOKEN, token);
  },
  getVisitorId: async () => SecureStore.getItemAsync(StorageKeys.VISITOR_ID),
  getToken: async () => SecureStore.getItemAsync(StorageKeys.TOKEN),
  clearVisitor: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.VISITOR_ID);
    await SecureStore.deleteItemAsync(StorageKeys.TOKEN);
  },

  // ── User ─────────────────────────────────────────
  setUser: async (userId: string, userName: string) => {
    await SecureStore.setItemAsync(StorageKeys.USER_ID, userId);
    await SecureStore.setItemAsync(StorageKeys.USER_NAME, userName);
  },
  getUserId: async () => SecureStore.getItemAsync(StorageKeys.USER_ID),
  getUserName: async () => SecureStore.getItemAsync(StorageKeys.USER_NAME),
  clearUser: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.USER_ID);
    await SecureStore.deleteItemAsync(StorageKeys.USER_NAME);
  },

  // ── Pincode ──────────────────────────────────────
  setPincode: async (pincode: string) =>
    SecureStore.setItemAsync(StorageKeys.PINCODE, pincode),
  getPincode: async () => SecureStore.getItemAsync(StorageKeys.PINCODE),
  clearPincode: async () => SecureStore.deleteItemAsync(StorageKeys.PINCODE),
};
