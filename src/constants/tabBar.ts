import { Platform } from "react-native";

export const TAB_BAR_HEIGHT = 56;
export const TAB_BAR_ITEM_GAP = 5;
export const TAB_BAR_PREVIEW_GAP = 6;

export function getTabBarBottomOffset(insetsBottom: number = 0): number {
  return Platform.select({
    ios: insetsBottom > 0 ? insetsBottom + 6 : 20,
    default: insetsBottom > 0 ? insetsBottom + 16 : 24,
  });
}
