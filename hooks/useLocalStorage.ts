import { AppState, UserProfile } from "@/constants/UserTypes";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";

export const useLocalStorage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      await storage.setUserProfile(profile);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  const saveAppState = async (state: AppState) => {
    try {
      await storage.setAppState(state);
      setAppState(state);
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  };

  const clearAllData = async () => {
    try {
      await storage.clearAllData();
      setUserProfile(null);
      setAppState(null);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  return {
    userProfile,
    appState,
    isLoading,
    saveUserProfile,
    saveAppState,
    clearAllData,
    loadData,
  };
};
