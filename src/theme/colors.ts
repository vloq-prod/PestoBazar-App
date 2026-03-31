export const palette = {
  // Brand
  purple: "#3a286c",
  purpleLight: "#E0D9F3",
  purpleDark: "#261b4a",
  purpleMuted: "#5c4a9e",

  red: "#e10320",
  redLight: "#ff1a35",
  redDark: "#b8021a",
  redMuted: "#ff4d61",

  // Neutrals
  white: "#ffffff",
  black: "#000000",

  gray50: "#f9f9f9",
  gray100: "#f3f3f3",
  gray200: "#e8e8e8",
  gray300: "#d4d4d4",
  gray400: "#a8a8a8",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#3d3d3d",
  gray800: "#262626",
  gray900: "#171717",

  // Semantic
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const lightTheme = {
  // Backgrounds
  background: palette.white,
  surface: palette.white,
  surfaceElevated: palette.white,
  overlay: "rgba(0,0,0,0.5)",
  backgroundSkeleton: palette.gray200,

  // Brand
  primary: palette.purple,
  primaryLight: palette.purpleLight,
  primaryDark: palette.purpleDark,
  primaryMuted: palette.purpleMuted,
  primaryForeground: palette.white,

  secondary: palette.red,
  secondaryLight: palette.redLight,
  secondaryDark: palette.redDark,
  secondaryMuted: palette.redMuted,
  secondaryForeground: palette.white,

  // Text
  text: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textOnPrimary: palette.white,
  textOnSecondary: palette.white,

  // Borders
  border: palette.gray200,
  borderStrong: palette.gray300,
  borderblack: palette.black,
  borderPrimary: palette.purple,

  // States
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,

  // UI
  inputBackground: palette.gray100,
  inputBorder: palette.gray300,
  cardBackground: palette.white,
  tabBar: palette.white,
  tabBarActive: palette.purple,
  tabBarInactive: palette.gray400,
  statusBar: "dark" as const,
} as const;

export const darkTheme = {
  // Backgrounds
  background: palette.gray900,
  surface: palette.gray800,
  surfaceElevated: palette.gray700,
  overlay: "rgba(0,0,0,0.7)",

  // Brand — brand colors stay vivid on dark too
  primary: palette.purpleLight,
  primaryLight: palette.purpleMuted,
  primaryDark: palette.purple,
  primaryMuted: palette.purpleMuted,
  primaryForeground: palette.white,
  backgroundSkeleton: palette.gray200,

  secondary: palette.redLight,
  secondaryLight: palette.redMuted,
  secondaryDark: palette.red,
  secondaryMuted: palette.redMuted,
  secondaryForeground: palette.white,

  // Text
  text: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray600,
  textInverse: palette.gray900,
  textOnPrimary: palette.white,
  textOnSecondary: palette.white,

  // Borders
  border: palette.gray700,
  borderStrong: palette.gray600,
  borderblack: palette.white,
  borderPrimary: palette.purple,

  // States
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,

  // UI
  inputBackground: palette.gray100,
  inputBorder: palette.gray700,
  cardBackground: palette.gray800,
  tabBar: palette.gray900,
  tabBarActive: palette.purpleLight,
  tabBarInactive: palette.gray600,
  statusBar: "light" as const,
} as const;

export type ThemeColors = {
  [K in keyof typeof lightTheme]: K extends "statusBar"
    ? "dark" | "light"
    : string;
};
