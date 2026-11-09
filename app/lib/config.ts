import { Platform } from "react-native";

const fallback = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? fallback).replace(/\/$/, "");

export const APP_SCHEME = "moodly";
export const APP_NAME = "Moodly";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.kirix.moodly";

export const REVENUECAT_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "",
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "",
};

export const PREMIUM_ENTITLEMENT = "premium";

/** When false, all premium features are unlocked and the paywall is disabled. */
export const PREMIUM_ENABLED =
  (process.env.EXPO_PUBLIC_PREMIUM_ENABLED ?? "true") !== "false";
