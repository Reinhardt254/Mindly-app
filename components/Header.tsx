import { useGreeting } from "@/hooks/useGreeting";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface HeaderProps {
  userName: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onProfilePress,
  onNotificationPress,
}) => {
  const greeting = useGreeting(userName);

  return (
    <ThemedView className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
      {/* Greeting */}
      <View className="flex-1">
        <ThemedText type="subtitle" className="text-lg">
          {greeting}
        </ThemedText>
      </View>

      {/* Icons */}
      <View className="flex-row items-center space-x-4">
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <View className="w-6 h-6 items-center justify-center">
            <ThemedText className="text-xl">🔔</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity
          onPress={onProfilePress}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
            <ThemedText className="text-white font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};
