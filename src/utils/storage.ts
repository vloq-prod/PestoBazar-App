import * as SecureStore from "expo-secure-store";

const ENV_SUFFIX = (
  process.env.EXPO_PUBLIC_ENVIRONMENT?.toLowerCase() ?? "production"
);

export const StorageKeys = {
  VISITOR_ID: `visitor_id_${ENV_SUFFIX}`,
  TOKEN: `visitor_token_${ENV_SUFFIX}`,
  PINCODE: "user_pincode",
  USER_ID: `user_id_${ENV_SUFFIX}`,
  USER_NAME: "user_name",
  USER_EMAIL: "user_email",
  USER_AVATAR: "user_avatar",
  B2B_PUBLIC_ID: `b2b_public_id_${ENV_SUFFIX}`,
  B2B_TRACKING_TOKEN: `b2b_tracking_token_${ENV_SUFFIX}`,
  B2B_MOBILE: `b2b_mobile_${ENV_SUFFIX}`,
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

  // ── B2B Dealer Session ───────────────────────────
  setB2BSession: async (publicId: string, trackingToken?: string, mobile?: string) => {
    if (publicId) await SecureStore.setItemAsync(StorageKeys.B2B_PUBLIC_ID, publicId);
    if (trackingToken) await SecureStore.setItemAsync(StorageKeys.B2B_TRACKING_TOKEN, trackingToken);
    if (mobile) await SecureStore.setItemAsync(StorageKeys.B2B_MOBILE, mobile);
  },
  getB2BSession: async () => {
    const publicId = await SecureStore.getItemAsync(StorageKeys.B2B_PUBLIC_ID);
    const trackingToken = await SecureStore.getItemAsync(StorageKeys.B2B_TRACKING_TOKEN);
    const mobile = await SecureStore.getItemAsync(StorageKeys.B2B_MOBILE);
    return { publicId, trackingToken, mobile };
  },
  clearB2BSession: async () => {
    await SecureStore.deleteItemAsync(StorageKeys.B2B_PUBLIC_ID);
    await SecureStore.deleteItemAsync(StorageKeys.B2B_TRACKING_TOKEN);
    await SecureStore.deleteItemAsync(StorageKeys.B2B_MOBILE);
  },
};
