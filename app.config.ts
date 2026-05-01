export default {
  expo: {
    name: "pestobazaar",
    slug: "pestobazaar",
    scheme: "pestobazaar",
    version: "1.0.0",
    orientation: "portrait",

    userInterfaceStyle: "automatic",

    // ✅ ADD THIS
    icon: "./assets/icon.png",

    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      buildNumber: "1",
      bundleIdentifier: "com.pestobazaar.app",
    },

    android: {
      versionCode: 1,
      package: "com.pestobazaar.app",

      // ✅ ADD THIS
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
    },

    extra: {
      app_name: "pestobazaar",
      app_version: "1.0.0",
      app_code: 1,
      eas: {
        projectId: "e3cc2f8b-4160-46c3-a5cd-d85cfee7252e",
      },
    },
  },
};
