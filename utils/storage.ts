import { AppState, UserProfile } from "@/constants/UserTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_PROFILE: "@user_profile",
  APP_STATE: "@app_state",
  LAST_AFFIRMATION_DATE: "@last_affirmation_date",
  DAILY_AFFIRMATIONS_SHOWN: "@daily_affirmations_shown",
} as const;

export const storage = {
  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error("Error setting user profile:", error);
    }
  },

  // App State
  async getAppState(): Promise<AppState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting app state:", error);
      return null;
    }
  },

  async setAppState(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error("Error setting app state:", error);
    }
  },

  // Daily tracking
  async getLastAffirmationDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_AFFIRMATION_DATE);
    } catch (error) {
      console.error("Error getting last affirmation date:", error);
      return null;
    }
  },

  async setLastAffirmationDate(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_AFFIRMATION_DATE, date);
    } catch (error) {
      console.error("Error setting last affirmation date:", error);
    }
  },

  async getDailyAffirmationsShown(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.DAILY_AFFIRMATIONS_SHOWN
      );
      return data ? parseInt(data, 10) : 0;
    } catch (error) {
      console.error("Error getting daily affirmations shown:", error);
      return 0;
    }
  },

  async setDailyAffirmationsShown(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_AFFIRMATIONS_SHOWN,
        count.toString()
      );
    } catch (error) {
      console.error("Error setting daily affirmations shown:", error);
    }
  },

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  },
};
