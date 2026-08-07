import type { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Pestobazaar",
  owner: "daniyalpesto",
  slug: "pestobazaar",
  version: "1.0.0",
  orientation: "portrait",

  // @ts-ignore
  newArchEnabled: true,
  userInterfaceStyle: "automatic",


  scheme: "pestobazaar",

  icon: "./assets/icon.png",

  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

plugins: [
  "expo-router",
  "expo-dev-client",
  "expo-notifications",

  [
    "expo-location",
    {
      locationWhenInUsePermission:
        "Allow Pestobazaar to access your location.",
    },
  ],
],

  ios: {
    buildNumber: "1",
    bundleIdentifier: "com.pestobazaar.app",

    // iOS Universal Links — all deep-linkable paths
    associatedDomains: [
      "applinks:pestobazaar.com",
      "applinks:www.pestobazaar.com",
    ],
  },

  android: {
    package: "com.pestobazaar.app",
    versionCode: 1,

    permissions: [
      "INTERNET",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ],

    googleServicesFile: "./google-services.json",

    // Android App Links — covers all deep-linkable routes.
    // autoVerify: true enables instant link verification via .well-known/assetlinks.json
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/product" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/category" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/shop" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/search" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/cart" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/checkout" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/orders" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/orderdetails" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/deals" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/coupons" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/profile" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/about" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/terms" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/privacy" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/shipping" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/section" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/reviews" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/diy" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/bulkorder" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/home" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],

    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },

    config: {
      googleMaps: {
        apiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY || "",
      },
    },
  },

  extra: {
    eas: {
      projectId: "aadf1ca0-11a7-4839-be1c-9c888bab7e32",
    },
  },
});