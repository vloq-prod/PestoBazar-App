import * as SecureStore from "expo-secure-store";

export const StorageKeys = {
  VISITOR_ID: "visitor_id",
  TOKEN: "visitor_token",
  PINCODE: "user_pincode",
  USER_ID: "user_id",
  USER_NAME: "user_name",
  USER_EMAIL: "user_email",
  USER_AVATAR: "user_avatar",
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
  setUser: async (userId: string, userName: string, email?: string, avatar?: string) => {
    await SecureStore.setItemAsync(StorageKeys.USER_ID, userId);
    await SecureStore.setItemAsync(StorageKeys.USER_NAME, userName);
    if (email) await SecureStore.setItemAsync(StorageKeys.USER_EMAIL, email);
    if (avatar) await SecureStore.setItemAsync(StorageKeys.USER_AVATAR, avatar);
  },
  getUserId: async () => SecureStore.getItemAsync(StorageKeys.USER_ID),
  getUserName: async () => SecureStore.getItemAsync(StorageKeys.USER_NAME),
  getUserEmail: async () => SecureStore.getItemAsync(StorageKeys.USER_EMAIL),
  getUserAvatar: async () => SecureStore.getItemAsync(StorageKeys.USER_AVATAR),
  clearUser: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.USER_ID);
    await SecureStore.deleteItemAsync(StorageKeys.USER_NAME);
    await SecureStore.deleteItemAsync(StorageKeys.USER_EMAIL);
    await SecureStore.deleteItemAsync(StorageKeys.USER_AVATAR);
  },

  // ── Pincode ──────────────────────────────────────
  setPincode: async (pincode: string) =>
    SecureStore.setItemAsync(StorageKeys.PINCODE, pincode),
  getPincode: async () => SecureStore.getItemAsync(StorageKeys.PINCODE),
  clearPincode: async () => SecureStore.deleteItemAsync(StorageKeys.PINCODE),
};
