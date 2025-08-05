import { CATEGORIES } from "@/constants/Affirmations";
import { Affirmation } from "@/constants/UserTypes";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AffirmationCardProps {
  affirmation: Affirmation;
  onSwipe?: (direction: "left" | "right") => void;
  isActive?: boolean;
}

export const AffirmationCard: React.FC<AffirmationCardProps> = ({
  affirmation,
  onSwipe,
  isActive = true,
}) => {
  const handleSwipe = (direction: "left" | "right") => {
    onSwipe?.(direction);
  };

  return (
    <ThemedView className="flex-1 justify-center items-center px-8">
      <View className="w-full max-w-sm">
        {/* Category Badge */}
        <View className="items-center mb-6">
          <View className="bg-blue-100 px-4 py-2 rounded-full">
            <ThemedText className="text-blue-600 font-medium">
              {CATEGORIES[affirmation.category]}
            </ThemedText>
          </View>
        </View>

        {/* Affirmation Text */}
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <ThemedText className="text-2xl font-semibold text-center leading-relaxed">
            &quot;{affirmation.text}&quot;
          </ThemedText>
        </View>

        {/* Swipe Instructions */}
        {isActive && (
          <View className="flex-row justify-between items-center mt-8 px-4">
            <TouchableOpacity
              onPress={() => handleSwipe("left")}
              className="bg-red-100 px-6 py-3 rounded-full"
              activeOpacity={0.7}
            >
              <ThemedText className="text-red-600 font-medium">Skip</ThemedText>
            </TouchableOpacity>

            <ThemedText className="text-gray-500 text-sm">
              Swipe up for more
            </ThemedText>

            <TouchableOpacity
              onPress={() => handleSwipe("right")}
              className="bg-green-100 px-6 py-3 rounded-full"
              activeOpacity={0.7}
            >
              <ThemedText className="text-green-600 font-medium">
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  );
};
