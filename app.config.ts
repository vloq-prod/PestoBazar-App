import type { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Pestobazaar",
  owner: "vloq",
  slug: "pestobazaar",
  version: "1.3.3",
  orientation: "default",

  // @ts-ignore
  newArchEnabled: true,
  userInterfaceStyle: "automatic",

  scheme: [
    "pestobazaar",
    "com.googleusercontent.apps.147081453519-lap730k31jgsjlk2d0ovb6ok4p9rn8tr",
    "com.googleusercontent.apps.147081453519-il1blpe3btouncujaemet7q3bokt447a",
    "com.googleusercontent.apps.147081453519-o44pc2pd7vj224gdq1q5atc992lsrrvh",
    ...(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
      ? [
          `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.replace(/\.apps\.googleusercontent\.com$/, "")}`,
        ]
      : []),
    ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      ? [
          `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.replace(/\.apps\.googleusercontent\.com$/, "")}`,
        ]
      : []),
  ],

  notification: {
    icon: "./assets/icon-android.png",
    color: "#5f16e9",
  },

  icon: "./assets/icon-ios.png",

  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  plugins: [
    "expo-router",
    "expo-dev-client",
    "expo-notifications",
    "expo-font",
    "expo-apple-authentication",

    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow Pestobazaar to access your location.",
      },
    ],
  ],

  ios: {
    icon: "./assets/icon-ios.png",
    buildNumber: "5",
    bundleIdentifier: "com.pestobazaar.app",
    usesAppleSignIn: true,
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },

    // iOS Universal Links — all deep-linkable paths
    associatedDomains: [
      "applinks:pestobazaar.com",
      "applinks:pestobazaar.vloq.com",
    ],
  },

  android: {
    package: "com.pestobazaar.app",
    versionCode: 14,

    permissions: ["INTERNET", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],

    googleServicesFile: "./google-services.json",

    // Android App Links — simplified host-based verification across all domains.
    // autoVerify: true enables instant link verification via .well-known/assetlinks.json
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: "pestobazaar.com" },
          { scheme: "https", host: "pestobazaar.vloq.com" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],

    adaptiveIcon: {
      foregroundImage: "./assets/icon-android.png",
      backgroundColor: "#5f16e9",
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
    app_version: "1.3.3",
    app_code: 14,
  },
});
