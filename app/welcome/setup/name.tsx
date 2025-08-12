import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NameSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      // Save name to storage
      await AsyncStorage.setItem("setup-name", name.trim());
      router.push("/welcome/setup/gender");
    } catch (error) {
      console.error("Error saving name:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
              1 of 4
            </Text>
          </View>
          </View>

          <View className="items-center pt-10 space-y-8">
            {/* Question */}
            <View className="items-center space-y-4">
              <Text
                className="text-3xl font-bold text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                What do we call you?
              </Text>

              <Text
                className="text-lg text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 16,
                  opacity: 0.7,
                }}
              >
                We ll use this to personalize your affirmations
              </Text>
            </View>

            {/* Name Input */}
            <View className="space-y-4 w-full">
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError("");
                }}
                placeholder="Enter your name"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "60"
                }
                className="px-6 py-4 w-full text-lg rounded-2xl"
                style={{
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor: error
                    ? "#EF4444"
                    : Colors[colorScheme ?? "light"].text + "20",
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 18,
                  marginTop: 10,
                }}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />

              {error ? (
                <Text style={{ color: "#EF4444", fontSize: 14, marginLeft: 8 }}>
                  {error}
                </Text>
              ) : null}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              onPress={handleNext}
              className="py-4 mt-8 w-full rounded-2xl"
              style={{
                backgroundColor: name.trim()
                  ? Colors[colorScheme ?? "light"].tabIconSelected
                  : Colors[colorScheme ?? "light"].tabIconSelected + "40",
                paddingVertical: 16,
              }}
              disabled={!name.trim()}
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
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
