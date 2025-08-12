import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AgeSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedAge, setSelectedAge] = useState("");

  const ageRanges = [
    { id: "13-17", label: "13-17", icon: "school" },
    { id: "18-24", label: "18-24", icon: "person" },
    { id: "25-34", label: "25-34", icon: "briefcase" },
    { id: "35-44", label: "35-44", icon: "home" },
    { id: "45-54", label: "45-54", icon: "medal" },
    { id: "55-64", label: "55-64", icon: "library" },
    { id: "65+", label: "65+", icon: "flower" },
  ];

  const handleNext = async () => {
    if (!selectedAge) return;

    try {
      await AsyncStorage.setItem("setup-age", selectedAge);
      router.push("/welcome/setup/frequency");
    } catch (error) {
      console.error("Error saving age:", error);
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
              3 of 4
            </Text>
          </View>
        </View>
        <View className="items-center pt-10 space-y-8">
          {/* Question */}
          <View className="items-center mt-5 mb-4 space-y-4">
            <Text
              className="text-3xl font-bold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              How old are you?
            </Text>

            <Text
              className="text-lg text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 16,
                opacity: 0.7,
              }}
            >
              We ll customize affirmations for your life stage
            </Text>
          </View>

          {/* Age Options */}
          <View className="flex flex-col gap-2 justify-center items-center mt-5 w-full">
            {ageRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                onPress={() => setSelectedAge(range.id)}
                className="flex-row items-center p-4 w-full rounded-2xl"
                style={{
                  backgroundColor:
                    selectedAge === range.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                      : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor:
                    selectedAge === range.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "30",
                }}
              >
                <Ionicons
                  name={range.icon as any}
                  size={24}
                  color={
                    selectedAge === range.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "60"
                  }
                />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    color:
                      selectedAge === range.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text,
                    fontSize: 18,
                    fontWeight: selectedAge === range.id ? "600" : "400",
                    marginLeft: 10,
                  }}
                >
                  {range.label}
                </Text>

                {selectedAge === range.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors[colorScheme ?? "light"].tabIconSelected}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            className="py-4 mt-6 w-full rounded-2xl"
            style={{
              backgroundColor: selectedAge
                ? Colors[colorScheme ?? "light"].tabIconSelected
                : Colors[colorScheme ?? "light"].tabIconSelected + "40",
              paddingVertical: 16,
            }}
            disabled={!selectedAge}
          >
            <Text
              className="text-lg font-semibold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].background,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}
