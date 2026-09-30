import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAppUpdateApi } from "../api/appVersion.api";
import { AppUpdateModal } from "../components/common/AppUpdateModal";
import type { AppUpdateData } from "../types/appVersion.types";

const SNOOZE_KEY = "PESTOBAZAAR_APP_UPDATE_SNOOZED_AT";
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_BACKGROUND_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

interface AppUpdateContextType {
  updateData: AppUpdateData | null;
  checkForUpdates: (forceCheck?: boolean) => Promise<void>;
  isChecking: boolean;
}

const AppUpdateContext = createContext<AppUpdateContextType>({
  updateData: null,
  checkForUpdates: async () => {},
  isChecking: false,
});

export const useAppUpdate = () => useContext(AppUpdateContext);

export const AppUpdateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [updateData, setUpdateData] = useState<AppUpdateData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const lastCheckedAt = useRef<number>(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const checkForUpdates = useCallback(async (forceCheck = false) => {
    try {
      setIsChecking(true);
      const res = await checkAppUpdateApi();

      if (res?.status && res?.data?.update_available) {
        const data = res.data;
        setUpdateData(data);

        // Force update MUST always be shown immediately
        if (data.force_update) {
          setModalVisible(true);
          return;
        }

        // Soft update: Check if user snoozed in last 24 hours
        if (!forceCheck) {
          const snoozedAtStr = await AsyncStorage.getItem(SNOOZE_KEY);
          if (snoozedAtStr) {
            const snoozedAt = parseInt(snoozedAtStr, 10);
            if (Date.now() - snoozedAt < SNOOZE_DURATION_MS) {
              return;
            }
          }
        }

        setModalVisible(true);
      } else {
        setUpdateData(null);
        setModalVisible(false);
      }
    } catch (error) {
      // Gracefully swallow error so user flow is never blocked
      // console.log("App update check skipped/failed:", error);
    } finally {
      setIsChecking(false);
      lastCheckedAt.current = Date.now();
    }
  }, []);

  // Initial check on app startup (slight delay for smooth startup)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  // Check when coming back from background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // If 30+ minutes passed since last check, re-check
          if (
            Date.now() - lastCheckedAt.current >
            MIN_BACKGROUND_CHECK_INTERVAL_MS
          ) {
            checkForUpdates();
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [checkForUpdates]);

  const handleDismiss = useCallback(async () => {
    setModalVisible(false);
    // Snooze soft update for 24 hours
    try {
      await AsyncStorage.setItem(SNOOZE_KEY, Date.now().toString());
    } catch (_) {}
  }, []);

  return (
    <AppUpdateContext.Provider
      value={{
        updateData,
        checkForUpdates,
        isChecking,
      }}
    >
      {children}
      <AppUpdateModal
        visible={modalVisible}
        data={updateData}
        onDismiss={handleDismiss}
      />
    </AppUpdateContext.Provider>
  );
};
