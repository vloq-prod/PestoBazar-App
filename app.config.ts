import type { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Pestobazaar",
  owner: "daniyalpesto3",
  slug: "pestobazaar",
  version: "1.0.0",
  orientation: "portrait",

  // @ts-ignore: newArchEnabled is supported by Expo CLI but might be missing in local type definitions
  newArchEnabled: true,
  userInterfaceStyle: "automatic",

  scheme: [
    "pestobazaar",
    "com.googleusercontent.apps.147081453519-o44pc2pd7vj224gdq1q5atc992lsrrvh",
  ],

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
  },

  android: {
    package: "com.pestobazaar.app",
    versionCode: 1,
    permissions: ["INTERNET", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
      },
    },
  },

  extra: {
  eas: {
    projectId: "39a653d1-c4b6-4d43-b679-0c85a74c1f85"
  },
},
});
