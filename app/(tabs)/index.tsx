import { AffirmationCard } from "@/components/AffirmationCard";
import { Header } from "@/components/Header";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AFFIRMATIONS } from "@/constants/Affirmations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { storage } from "@/utils/storage";
import { timeUtils } from "@/utils/timeUtils";
import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

export default function AffirmationScreen() {
  const { userProfile, saveAppState } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const lastDate = await storage.getLastAffirmationDate();
      const shown = await storage.getDailyAffirmationsShown();

      if (lastDate && timeUtils.isToday(lastDate)) {
        setDailyShown(shown);
      } else {
        // New day, reset counter
        setDailyShown(0);
        await storage.setDailyAffirmationsShown(0);
        await storage.setLastAffirmationDate(timeUtils.getCurrentDateString());
      }
    } catch (error) {
      console.error("Error loading daily progress:", error);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    try {
      const newShown = dailyShown + 1;
      setDailyShown(newShown);
      await storage.setDailyAffirmationsShown(newShown);

      // Move to next affirmation
      const nextIndex = (currentIndex + 1) % AFFIRMATIONS.length;
      setCurrentIndex(nextIndex);

      // Save app state
      await saveAppState({
        userProfile: userProfile!,
        currentAffirmationIndex: nextIndex,
        dailyAffirmationsShown: newShown,
        lastAffirmationDate: timeUtils.getCurrentDateString(),
      });

      // Show feedback
      if (direction === "right") {
        Alert.alert(
          "Saved!",
          "This affirmation has been saved to your favorites."
        );
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };

  const handleProfilePress = () => {
    Alert.alert("Profile", "Profile settings coming soon!");
  };

  const handleNotificationPress = () => {
    Alert.alert("Notifications", "Notification settings coming soon!");
  };

  const handleReset = () => {
    Alert.alert(
      "Reset App",
      "This will clear all your data and take you back to the welcome screen. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.clearAllData();
              // Force reload by updating the app state
              window.location.reload();
            } catch (error) {
              console.error("Error resetting app:", error);
            }
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const currentAffirmation = AFFIRMATIONS[currentIndex];
  const progressPercentage =
    (dailyShown / userProfile.affirmationFrequency) * 100;

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <Header
        userName={userProfile.name}
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Main Content */}
      <View className="flex-1">
        <AffirmationCard
          affirmation={currentAffirmation}
          onSwipe={handleSwipe}
        />
      </View>

      {/* Progress Bar */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center mb-2">
          <ThemedText className="text-sm text-gray-600">
            Daily Progress
          </ThemedText>
          <ThemedText className="text-sm font-medium">
            {dailyShown}/{userProfile.affirmationFrequency}
          </ThemedText>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <View
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </View>

        {/* Reset Button (for testing) */}
        <TouchableOpacity
          onPress={handleReset}
          className="self-center px-4 py-2 mt-4 bg-red-500 rounded-lg"
        >
          <ThemedText className="text-sm text-white">Reset App</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
