export default {
  expo: {
    name: "pestobazaar",
    slug: "pestobazaar",
    version: "1.0.0",
    ios: {
      buildNumber: "1",
    },
    android: {
      versionCode: 1,
      package: "com.pestobazaar.app" // 👈 ADD THIS
    },

    extra: {
      app_name: "pestobazaar",
      app_version: "1.0.0",
      app_code: 1,
      eas: {
        projectId: "83a50a4d-fbc1-414f-a6aa-a920ac8feac8"
      }
    },
  },
};