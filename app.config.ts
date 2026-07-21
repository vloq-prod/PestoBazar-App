import type { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Pestobazaar",
  owner: "daniyalpestobazar5",
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

    // iOS Universal Links
    associatedDomains: [
      "applinks:pestobazaar.com"
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

    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,

        data: [
          {
            scheme: "https",
            host: "pestobazaar.com",
            pathPrefix: "/product"
          }
        ],

        category: [
          "BROWSABLE",
          "DEFAULT"
        ]
      }
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
      projectId: "95f230e5-bd85-4f99-a3e4-34ee870b6795",
    },
  },
});