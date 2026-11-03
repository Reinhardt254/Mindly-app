import { AppState, UserProfile } from "@/constants/UserTypes";
import { storage } from "@/utils/storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LocalStorageContextValue = {
  userProfile: UserProfile | null;
  appState: AppState | null;
  isLoading: boolean;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  saveAppState: (state: AppState) => Promise<void>;
  clearAllData: () => Promise<void>;
  loadData: () => Promise<void>;
};

const LocalStorageContext = createContext<LocalStorageContextValue | null>(
  null
);

export function LocalStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [profile, state] = await Promise.all([
        storage.getUserProfile(),
        storage.getAppState(),
      ]);

      setUserProfile(profile);
      setAppState(state);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      await storage.setUserProfile(profile);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  }, []);

  const saveAppState = useCallback(async (state: AppState) => {
    try {
      await storage.setAppState(state);
      setAppState(state);
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await storage.clearAllData();
      setUserProfile(null);
      setAppState(null);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      userProfile,
      appState,
      isLoading,
      saveUserProfile,
      saveAppState,
      clearAllData,
      loadData,
    }),
    [
      userProfile,
      appState,
      isLoading,
      saveUserProfile,
      saveAppState,
      clearAllData,
      loadData,
    ]
  );

  return React.createElement(
    LocalStorageContext.Provider,
    { value },
    children
  );
}

export const useLocalStorage = () => {
  const context = useContext(LocalStorageContext);
  if (!context) {
    throw new Error(
      "useLocalStorage must be used within a LocalStorageProvider"
    );
  }
  return context;
};
