import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleGetStarted = () => {
    router.push("/welcome/setup/name");
  };

  return (
    <GradientBackground>
      <View className="flex-1 justify-center items-center px-8">
        <View className="items-center space-y-8">
          {/* Welcome Icon */}
          <View className="mb-8">
            <Ionicons
              name="heart-circle"
              size={120}
              color={Colors[colorScheme ?? "light"].tabIconSelected}
            />
          </View>

          {/* Welcome Text */}
          <View className="items-center space-y-4">
            <Text
              className="text-4xl font-bold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 32,
                fontWeight: "bold",
              }}
            >
              Welcome to Your Journey
            </Text>

            <Text
              className="text-lg leading-7 text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 18,
                lineHeight: 28,
                opacity: 0.8,
                marginTop: 16,
              }}
            >
              Discover daily affirmations tailored just for you. Transform your
              mindset, one positive thought at a time.
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleGetStarted}
            className="px-8 py-4 mt-12 rounded-full"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].tabIconSelected,
              paddingHorizontal: 48,
              paddingVertical: 16,
              borderRadius: 30,
              marginTop: 48,
            }}
          >
            <Text
              className="text-lg font-semibold"
              style={{
                color: Colors[colorScheme ?? "light"].background,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>

          {/* Subtitle */}
          <Text
            className="mt-4 text-sm text-center"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 14,
              opacity: 0.6,
              marginTop: 16,
            }}
          >
            Just a few questions to personalize your experience
          </Text>
        </View>
      </View>
    </GradientBackground>
  );
}
