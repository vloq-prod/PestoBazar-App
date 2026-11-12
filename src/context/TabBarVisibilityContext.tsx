import React, { createContext, useContext } from "react";
import {
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";

type TabBarVisibilityContextType = {
  tabBarVisible: SharedValue<number>; // 1 = fully visible, 0 = hidden offscreen
  showTabBar: () => void;
  hideTabBar: () => void;
};

const TabBarVisibilityContext =
  createContext<TabBarVisibilityContextType | null>(null);

export const TabBarVisibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const tabBarVisible = useSharedValue(1);

  const showTabBar = () => {
    "worklet";
    tabBarVisible.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
  };

  const hideTabBar = () => {
    "worklet";
    tabBarVisible.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
  };

  return (
    <TabBarVisibilityContext.Provider
      value={{ tabBarVisible, showTabBar, hideTabBar }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  return useContext(TabBarVisibilityContext);
};

