import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface WelcomeCardProps {
  onGetStarted: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onGetStarted }) => {
  return (
    <ThemedView className="flex-1 justify-center items-center px-6">
      <View className="items-center space-y-8">
        {/* App Logo/Icon */}
        <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-8">
          <Text className="text-white text-4xl font-bold">✨</Text>
        </View>

        {/* Welcome Text */}
        <View className="items-center space-y-4">
          <ThemedText type="title" className="text-center">
            Welcome to Mood Affirmations
          </ThemedText>

          <ThemedText className="text-center text-lg leading-6 max-w-sm">
            Start your day with positive affirmations tailored just for you.
            Build confidence, gratitude, and inner strength one affirmation at a
            time.
          </ThemedText>
        </View>

        {/* Features */}
        <View className="space-y-3 w-full max-w-sm">
          <View className="flex-row items-center space-x-3">
            <View className="w-2 h-2 bg-blue-500 rounded-full" />
            <ThemedText>Personalized daily affirmations</ThemedText>
          </View>
          <View className="flex-row items-center space-x-3">
            <View className="w-2 h-2 bg-blue-500 rounded-full" />
            <ThemedText>Track your daily progress</ThemedText>
          </View>
          <View className="flex-row items-center space-x-3">
            <View className="w-2 h-2 bg-blue-500 rounded-full" />
            <ThemedText>Beautiful, calming interface</ThemedText>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={onGetStarted}
          className="bg-blue-500 px-8 py-4 rounded-full mt-8"
          activeOpacity={0.8}
        >
          <ThemedText className="text-white font-semibold text-lg">
            Get Started
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};
