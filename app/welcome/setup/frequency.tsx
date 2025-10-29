import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/UserTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";

export default function FrequencySetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(
    null
  );
  const [startHour, setStartHour] = useState<number>(8); // Default 8 AM
  const [endHour, setEndHour] = useState<number>(20); // Default 8 PM
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { saveUserProfile } = useLocalStorage();

  const frequencyOptions = [
    {
      value: 1,
      label: "Once a day",
      description: "Perfect for beginners",
      icon: "sunny",
    },
    {
      value: 2,
      label: "2 times a day",
      description: "Morning and evening",
      icon: "partly-sunny",
    },
    {
      value: 3,
      label: "3 times a day",
      description: "Build a strong habit",
      icon: "sunny-outline",
    },
    {
      value: 4,
      label: "4 times a day",
      description: "Regular reminders",
      icon: "time",
    },
    {
      value: 5,
      label: "5 times a day",
      description: "Maximum positivity",
      icon: "star",
    },
  ];

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const createDateFromHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      const hour = selectedDate.getHours();
      setStartHour(hour);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      const hour = selectedDate.getHours();
      setEndHour(hour);
    }
  };

  const handleComplete = async () => {
    if (selectedFrequency === null) return;

    // Validate time range
    if (startHour >= endHour) {
      Alert.alert("Invalid Time Range", "End time must be after start time");
      return;
    }

    try {
      // Get all setup data
      const name = await AsyncStorage.getItem("setup-name");
      const gender = await AsyncStorage.getItem("setup-gender");
      const age = await AsyncStorage.getItem("setup-age");

      // Create user profile
      const profile: UserProfile = {
        name: name || "User",
        ageRange: (age as UserProfile["ageRange"]) || "25-34",
        gender: (gender as UserProfile["gender"]) || "prefer-not-to-say",
        affirmationFrequency: selectedFrequency,
        reminderStartHour: startHour,
        reminderEndHour: endHour,
        isFirstTime: false,
        dailyAffirmationsShown: 0,
      };

      // Save profile
      await saveUserProfile(profile);

      // Request notification permissions and schedule notifications
      try {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission) {
          await notificationService.scheduleAffirmationNotifications({
            frequency: selectedFrequency,
            startHour,
            endHour,
          });
          console.log("✅ Notifications scheduled successfully");
        } else {
          Alert.alert(
            "Notifications Disabled",
            "You can enable notifications later in Settings to receive affirmation reminders.",
            [{ text: "OK" }]
          );
        }
      } catch (notificationError) {
        console.error("Error setting up notifications:", notificationError);
        // Continue anyway - notifications are not critical
      }

      // Clean up setup data
      await AsyncStorage.multiRemove([
        "setup-name",
        "setup-gender",
        "setup-age",
      ]);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing setup:", error);
      Alert.alert("Error", "Failed to complete setup. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <ScrollView className="flex-1">
        <View className="relative flex-1 justify-start px-8 pt-10">
          <View className="flex-row justify-between items-center pb-10 w-full">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBack}
              className=""
              style={{ zIndex: 1 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View className="">
              <Text
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  opacity: 0.6,
                }}
              >
                4 of 4
              </Text>
            </View>
          </View>

          <View className="items-center pt-10 space-y-8">
            {/* Question */}
            <View className="items-center mb-4 space-y-4">
              <Text
                className="text-3xl font-bold text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                Set up your reminders
              </Text>

              <Text
                className="text-lg text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 16,
                  opacity: 0.7,
                }}
              >
                Choose how often and when you&apos;d like to receive
                affirmations
              </Text>
            </View>

            {/* Frequency Options */}
            <View className="w-full">
              <Text
                className="text-lg font-semibold mb-3"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                How many times per day?
              </Text>
              <View className="flex flex-col gap-2 justify-center items-center w-full">
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedFrequency(option.value)}
                    className="p-5 w-full rounded-2xl"
                    style={{
                      backgroundColor:
                        selectedFrequency === option.value
                          ? Colors[colorScheme ?? "light"].tabIconSelected +
                            "20"
                          : Colors[colorScheme ?? "light"].background,
                      borderWidth: 1,
                      borderColor:
                        selectedFrequency === option.value
                          ? Colors[colorScheme ?? "light"].tabIconSelected
                          : Colors[colorScheme ?? "light"].text + "20",
                      padding: 8,
                    }}
                  >
                    <View className="flex-row gap-2 items-center">
                      <Ionicons
                        name={option.icon as any}
                        size={28}
                        color={
                          selectedFrequency === option.value
                            ? Colors[colorScheme ?? "light"].tabIconSelected
                            : Colors[colorScheme ?? "light"].text + "60"
                        }
                      />
                      <View className="flex-1 ml-4">
                        <Text
                          className="text-lg font-semibold"
                          style={{
                            color:
                              selectedFrequency === option.value
                                ? Colors[colorScheme ?? "light"].tabIconSelected
                                : Colors[colorScheme ?? "light"].text,
                            fontSize: 18,
                            fontWeight: "600",
                          }}
                        >
                          {option.label}
                        </Text>
                        <Text
                          className="mt-1 text-sm"
                          style={{
                            color:
                              selectedFrequency === option.value
                                ? Colors[colorScheme ?? "light"]
                                    .tabIconSelected + "80"
                                : Colors[colorScheme ?? "light"].text + "60",
                            fontSize: 14,
                          }}
                        >
                          {option.description}
                        </Text>
                      </View>

                      {selectedFrequency === option.value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors[colorScheme ?? "light"].tabIconSelected}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Range Selection */}
            <View className="w-full mt-6">
              <Text
                className="text-lg font-semibold mb-3"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Active hours
              </Text>

              <View className="flex-row gap-4 w-full">
                {/* Start Time */}
                <View className="flex-1">
                  <Text
                    className="text-sm mb-2"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      opacity: 0.7,
                    }}
                  >
                    From
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="p-4 rounded-xl flex-row items-center justify-between"
                    style={{
                      backgroundColor:
                        Colors[colorScheme ?? "light"].background,
                      borderWidth: 1,
                      borderColor: Colors[colorScheme ?? "light"].text + "20",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors[colorScheme ?? "light"].text,
                        fontSize: 16,
                      }}
                    >
                      {formatHour(startHour)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                    />
                  </TouchableOpacity>
                </View>

                {/* End Time */}
                <View className="flex-1">
                  <Text
                    className="text-sm mb-2"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      opacity: 0.7,
                    }}
                  >
                    To
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="p-4 rounded-xl flex-row items-center justify-between"
                    style={{
                      backgroundColor:
                        Colors[colorScheme ?? "light"].background,
                      borderWidth: 1,
                      borderColor: Colors[colorScheme ?? "light"].text + "20",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors[colorScheme ?? "light"].text,
                        fontSize: 16,
                      }}
                    >
                      {formatHour(endHour)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Time Pickers */}
              {showStartPicker && (
                <DateTimePicker
                  value={createDateFromHour(startHour)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onStartTimeChange}
                  textColor={Colors[colorScheme ?? "light"].text}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={createDateFromHour(endHour)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onEndTimeChange}
                  textColor={Colors[colorScheme ?? "light"].text}
                />
              )}

              {/* Info Text */}
              {selectedFrequency && startHour < endHour && (
                <View
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    backgroundColor:
                      Colors[colorScheme ?? "light"].tabIconSelected + "10",
                  }}
                >
                  <Text
                    className="text-sm text-center"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      opacity: 0.8,
                    }}
                  >
                    You&apos;ll receive {selectedFrequency} reminder
                    {selectedFrequency > 1 ? "s" : ""} between{" "}
                    {formatHour(startHour)} and {formatHour(endHour)}
                  </Text>
                  <Text
                    className="text-xs text-center mt-1"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      opacity: 0.6,
                    }}
                  >
                    (Every{" "}
                    {Math.floor((endHour - startHour) / selectedFrequency)}{" "}
                    hours approximately)
                  </Text>
                </View>
              )}
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              onPress={handleComplete}
              className="py-4 mt-8 w-full rounded-2xl mb-10"
              style={{
                backgroundColor:
                  selectedFrequency !== null && startHour < endHour
                    ? Colors[colorScheme ?? "light"].tabIconSelected
                    : Colors[colorScheme ?? "light"].tabIconSelected + "40",
                paddingVertical: 16,
              }}
              disabled={selectedFrequency === null || startHour >= endHour}
            >
              <Text
                className="text-lg font-semibold text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].background,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Complete Setup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
