import type { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Pestobazaar",
  owner: "vloq",
  slug: "pestobazaar",
  version: "1.0.0",
  orientation: "portrait",

  // @ts-ignore
  newArchEnabled: true,
  userInterfaceStyle: "automatic",

  scheme: [
    "pestobazaar",
    "com.googleusercontent.apps.147081453519-o44pc2pd7vj224gdq1q5atc992lsrrvh",
  ],

  notification: {
    icon: "./assets/Pestobazaarlogosmall.png",
    color: "#6C63FF",
  },

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
      "applinks:pestobazaar.confidevtech.com",
    ],
  },

  android: {
    package: "com.pestobazaar.app",
    versionCode: 1,

    permissions: ["INTERNET", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],

    googleServicesFile: "./google-services.json",

    // Android App Links — covers all deep-linkable routes.
    // autoVerify: true enables instant link verification via .well-known/assetlinks.json
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/products" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/products" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/products" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/product" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/product" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/product" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/category" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/category" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/category" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/shop" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/shop" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/shop" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/search" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/search" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/search" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/cart" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/cart" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/cart" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/checkout" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/checkout" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/checkout" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/orders" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/orders" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/orders" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/orderdetails" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/orderdetails" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/orderdetails" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/deals" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/deals" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/deals" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/coupons" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/coupons" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/coupons" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/profile" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/profile" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/profile" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/userprofile" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/userprofile" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/userprofile" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/address" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/address" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/address" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/addaddress" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/addaddress" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/addaddress" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/returns" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/returns" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/returns" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/returndetails" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/returndetails" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/returndetails" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/returnproducts" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/returnproducts" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/returnproducts" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/viewall" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/viewall" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/viewall" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/wishlist" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/wishlist" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/wishlist" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/notifications" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/notifications" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/notifications" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/ordersuccess" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/ordersuccess" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/ordersuccess" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/map" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/map" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/map" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/about" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/about" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/about" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/terms" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/terms" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/terms" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/privacy" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/privacy" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/privacy" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/shipping" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/shipping" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/shipping" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/section" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/section" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/section" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/reviews" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/reviews" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/reviews" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/diy" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/diy" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/diy" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/bulkorder" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/bulkorder" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/bulkorder" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/welcome" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/welcome" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/welcome" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/login" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/login" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/login" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/verifyotp" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/verifyotp" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/verifyotp" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/userinfo" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/userinfo" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/userinfo" },

          { scheme: "https", host: "pestobazaar.confidevtech.com", pathPrefix: "/home" },
          { scheme: "https", host: "pestobazaar.com", pathPrefix: "/home" },
          { scheme: "https", host: "www.pestobazaar.com", pathPrefix: "/home" },
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
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY || "",
      },
    },
  },

  extra: {
    eas: {
      projectId: "2ea7e59d-1026-4072-9292-9d1b8acf2fab",
    },
  },
});
