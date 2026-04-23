export default {
  expo: {
    name: "pestobazaar",
    slug: "pestobazaar",
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
        projectId: "5cfbb881-6243-45cd-b8f0-5d2966cd05d6",
      },
    },
  },
};