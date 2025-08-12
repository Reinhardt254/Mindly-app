import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GenderSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedGender, setSelectedGender] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem("setup-name");
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error("Error loading name:", error);
    }
  };

  const genderOptions = [
    { id: "male", label: "Male", icon: "person" },
    { id: "female", label: "Female", icon: "person" },
    { id: "non-binary", label: "Non-binary", icon: "person" },
    { id: "prefer-not-to-say", label: "Prefer not to say", icon: "person" },
  ];

  const handleNext = async () => {
    if (!selectedGender) return;

    try {
      await AsyncStorage.setItem("setup-gender", selectedGender);
      router.push("/welcome/setup/age");
    } catch (error) {
      console.error("Error saving gender:", error);
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
              2 of 4
            </Text>
          </View>
        </View>

        <View className="items-center pt-10 space-y-8">
          {/* Question */}
          <View className="items-center mb-4 space-y-4 w-full">
            <Text
              className="text-3xl font-bold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              Which option represents you, {userName}?
            </Text>

            <Text
              className="text-lg text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 16,
                opacity: 0.7,
              }}
            >
              This helps us personalize your experience
            </Text>
          </View>

          {/* Gender Options */}
          <View className="flex flex-col gap-3 justify-center items-center mt-5 w-full">
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedGender(option.id)}
                className="flex-row items-center p-4 w-full rounded-2xl"
                style={{
                  backgroundColor:
                    selectedGender === option.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                      : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor:
                    selectedGender === option.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "30",
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    selectedGender === option.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "60"
                  }
                />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    color:
                      selectedGender === option.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text,
                    fontSize: 18,
                    fontWeight: selectedGender === option.id ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>

                {selectedGender === option.id && (
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
            className="py-4 mt-8 w-full rounded-2xl"
            style={{
              backgroundColor: selectedGender
                ? Colors[colorScheme ?? "light"].tabIconSelected
                : Colors[colorScheme ?? "light"].tabIconSelected + "40",
              paddingVertical: 16,
            }}
            disabled={!selectedGender}
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
