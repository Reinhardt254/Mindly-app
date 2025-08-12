import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

interface WelcomeCardProps {
  onGetStarted: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onGetStarted }) => {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors[colorScheme ?? "light"].tabbarBackground}
        translucent={true}
        animated={true}
      />
      <ThemedView className="flex-1 justify-center items-center px-6">
        <View className="items-center space-y-8">
          {/* App Logo/Icon */}
          {/* <View className="justify-center items-center mb-8 w-24 h-24 bg-blue-500 rounded-full">
            <Text className="text-4xl font-bold text-white">✨</Text>
          </View> */}

          {/* Welcome Text */}
          <View className="items-center pb-2 space-y-4">
            <ThemedText style={{ fontSize: 45, lineHeight: 50 }} type="title" className="text-center">
              Welcome to Moodly
            </ThemedText>

            <ThemedText className="pt-4 max-w-sm text-xl leading-6 text-center">
              Start your day with positive affirmations tailored just for you.
              Build confidence, gratitude, and inner strength one affirmation at
              a time.
            </ThemedText>
          </View>

          {/* Features */}
          <View className="flex-col gap-1 space-y-3 w-full max-w-sm">
            <View className="flex-row gap-2 items-center space-x-3">
              <View className="justify-center items-center w-5 h-5 bg-blue-500 rounded-full">
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText className="text-md">Personalized daily affirmations</ThemedText>
            </View>
            <View className="flex-row gap-2 items-center space-x-3">
              <View className="justify-center items-center w-5 h-5 bg-blue-500 rounded-full">
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText className="text-md">Track your daily progress</ThemedText>
            </View>
            <View className="flex-row gap-2 items-center space-x-3">
              <View className="justify-center items-center w-5 h-5 bg-blue-500 rounded-full">
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText className="text-md">Beautiful, calming interface</ThemedText>
            </View>
            <View className="flex-row gap-2 items-center space-x-3">
              <View className="justify-center items-center w-5 h-5 bg-blue-500 rounded-full">
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText className="text-md">Save your favorite affirmations</ThemedText>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={onGetStarted}
            className="px-8 py-4 mt-8 bg-blue-500 rounded-full"
            activeOpacity={0.8}
          >
            <ThemedText className="text-lg font-semibold text-white">
              Get Started
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
};
