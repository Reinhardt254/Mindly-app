import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface PolicyPageProps {
  title: string;
  content: string;
  showBackButton?: boolean;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  title,
  content,
  showBackButton = true,
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <ScrollView className="flex-1 px-6 py-8">
        <View style={{ height: 20 }}></View>

        {/* Header */}
        <View className="mb-8">
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-4"
            >
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
              <Text className="ml-2 text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )}

          <Text
            className="text-2xl font-bold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            {title}
          </Text>
          <Text
            className="mt-2 text-md"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Content */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: colorScheme === "dark" ? 0 : 15,
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? ""
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
          className="rounded-lg"
        >
          <Text
            className="text-base leading-6 whitespace-pre-line"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            {content}
          </Text>
        </View>

        <View
          className="flex-1"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            height: 50,
          }}
        ></View>
      </ScrollView>
    </View>
  );
};
