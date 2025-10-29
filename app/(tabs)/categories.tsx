import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { SimpleHeader } from "@/components/ModernHeader";
import { useCategoryStore } from "@/stores/categoryStore";
import { CATEGORIES, AffirmationCategory } from "@/constants/Affirmations";

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { selectedCategory, setSelectedCategory } = useCategoryStore();

  const handleCategoryPress = (categoryId: AffirmationCategory) => {
    setSelectedCategory(categoryId);
    // Navigate back to home to see filtered affirmations
    router.push("/(tabs)");
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
    >
      {/* Header */}
      <SimpleHeader title="Categories" />

      <ScrollView className="flex-1 px-4 py-6">
        {/* Description */}
        <View className="mb-6">
          <Text
            className="text-lg text-center"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              opacity: 0.8,
            }}
          >
            Choose a category to filter affirmations
          </Text>
        </View>

        {/* Categories Grid */}
        <View
          style={{ width: "100%", flexWrap: "wrap" }}
          className="flex-row flex-wrap justify-between"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                className="mb-4 rounded-2xl overflow-hidden"
                style={{
                  width: "48%",
                  backgroundColor: isSelected
                    ? Colors[colorScheme ?? "light"].highlight + "20"
                    : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor: isSelected
                    ? Colors[colorScheme ?? "light"].text + "20"
                    : Colors[colorScheme ?? "light"].text + "30",

                  height: 180,
                }}
              >
                {/* Category Content */}
                <View
                  style={{ padding: 12 }}
                  className=" items-center flex justify-center h-full w-full"
                >
                  {/* Icon Container */}
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{
                      backgroundColor: category.color + "20",
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={32}
                      color={category.color}
                    />
                  </View>

                  {/* Category Name */}
                  <Text
                    className="text-base font-semibold text-center mb-1"
                    style={{
                      color: isSelected
                        ? category.color
                        : Colors[colorScheme ?? "light"].text,
                    }}
                  >
                    {category.name}
                  </Text>

                  {/* Description */}
                  <Text
                    className="text-xs text-center"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      opacity: 0.6,
                    }}
                  >
                    {category.description}
                  </Text>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <View className="mt-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={category.color}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Selection Info */}
        <View
          className="mt-6 p-4 rounded-xl"
          style={{
            backgroundColor:
              Colors[colorScheme ?? "light"].tabIconSelected + "10",
          }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors[colorScheme ?? "light"].tabIconSelected}
            />
            <Text
              className="ml-2 text-sm"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                opacity: 0.8,
              }}
            >
              Currently showing:{" "}
              <Text className="font-semibold">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </Text>
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
