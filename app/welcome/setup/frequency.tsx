import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/UserTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function FrequencySetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(
    null
  );
  const { saveUserProfile } = useLocalStorage();

  const frequencyOptions = [
    {
      value: 1,
      label: "Once a day",
      description: "Perfect for beginners",
      icon: "sunny",
    },
    {
      value: 3,
      label: "3 times a day",
      description: "Build a strong habit",
      icon: "partly-sunny",
    },
    {
      value: 5,
      label: "5 times a day",
      description: "Maximum positivity",
      icon: "star",
    },
  ];

  const handleComplete = async () => {
    if (selectedFrequency === null) return;

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
        affirmationFrequency: selectedFrequency as 1 | 3 | 5,
        isFirstTime: false,
        dailyAffirmationsShown: 0,
      };

      // Save profile
      await saveUserProfile(profile);

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
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
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
              How often would you like affirmations?
            </Text>

            <Text
              className="text-lg text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 16,
                opacity: 0.7,
              }}
            >
              Choose what works best for your schedule
            </Text>
          </View>

          {/* Frequency Options */}
          <View className="flex flex-col gap-2 justify-center items-center mt-5 w-full">
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedFrequency(option.value)}
                className="p-5 w-full rounded-2xl"
                style={{
                  backgroundColor:
                    selectedFrequency === option.value
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
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
                            ? Colors[colorScheme ?? "light"].tabIconSelected +
                              "80"
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

          {/* Complete Button */}
          <TouchableOpacity
            onPress={handleComplete}
            className="py-4 mt-8 w-full rounded-2xl"
            style={{
              backgroundColor:
                selectedFrequency !== null
                  ? Colors[colorScheme ?? "light"].tabIconSelected
                  : Colors[colorScheme ?? "light"].tabIconSelected + "40",
              paddingVertical: 16,
            }}
            disabled={selectedFrequency === null}
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
    </GradientBackground>
  );
}
