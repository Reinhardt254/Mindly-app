import Constants from "expo-constants";
import { Platform } from "react-native";

export interface WidgetData {
  text: string;
  streak: number;
}

let setWidgetData: ((json: string, packageName: string) => void) | null = null;
if (Platform.OS === "android") {
  try {
    // Native module is missing in Expo Go; the widget only exists in dev/prod builds.
    setWidgetData = require("@bittingz/expo-widgets").setWidgetData;
  } catch {
    setWidgetData = null;
  }
}

let last = "";

/** Pushes today's affirmation to the Android home-screen widget (read by DailyAffirmationWidget.kt). */
export function updateWidget(data: WidgetData) {
  const packageName = Constants.expoConfig?.android?.package;
  if (!setWidgetData || !packageName) return;
  const key = JSON.stringify(data);
  if (key === last) return;
  last = key;
  try {
    setWidgetData(JSON.stringify({ ...data, updatedAt: new Date().toISOString() }), packageName);
  } catch (e) {
    console.warn("Widget update failed", e);
  }
}
