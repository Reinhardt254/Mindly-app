import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { userProfile, clearAllData } = useLocalStorage();

  const handleLogout = () => {
    clearAllData();
  };

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
    >
      <ScrollView className="flex-1 px-4 py-8">
        <View
          className="flex-1"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            height: 5,
          }}
        ></View>
        {/* Header */}

        {/* Profile Info */}
        <View
          className="p-6 mb-6 rounded-lg"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 30,
            paddingHorizontal: 10,
            paddingBottom: 10,
            height: "auto",
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.05)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <View className="items-center mt-20 mb-8 h-auto">
            <View
              className="justify-center items-center mb-4 w-24 h-24 bg-blue-500 rounded-full"
              style={{
                marginBottom: 10,
                height: 120,
                width: 120,
                borderRadius: 100,
              }}
            >
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text
              className="pt-5 text-xl font-bold"
              style={{ color: Colors[colorScheme ?? "light"].text }}
            >
              {userProfile.name}
            </Text>
            <Text className="mt-2 text-gray-400 text-md">
              Member since today
            </Text>
          </View>

          <View
            style={{
              borderRadius: 10,
              padding: 25,
              paddingHorizontal: 15,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              className="mb-2 text-xl font-semibold"
              style={{ color: Colors[colorScheme ?? "light"].text }}
            >
              Profile Information
            </Text>

            <View
              className="flex flex-col gap-10 justify-center items-center space-y-4 w-full h-auto"
              style={{
                width: "100%",
                gap: 5,
                marginTop: 10,
              }}
            >
              <View className="flex-row justify-between items-center my-10 w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Age Range
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.ageRange}
                </Text>
              </View>

              <View className="flex-row justify-between items-center w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Gender
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.gender}
                </Text>
              </View>

              <View className="flex-row justify-between items-center w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Daily Affirmations
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.affirmationFrequency} times
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View
          className="space-y-4"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: 10,
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            gap: 10,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center p-4 w-full rounded-lg"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 10,
              margin: 0,
              marginTop: 0,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Ionicons name="person" size={24} color="#3B82F6" />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Edit Profile
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 w-full rounded-lg"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 10,
              margin: 0,
              marginTop: 0,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Ionicons name="notifications" size={24} color="#3B82F6" />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Notifications
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 w-full rounded-lg"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 10,
              margin: 0,
              marginTop: 0,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Privacy
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 !bg-red-600 rounded-lg w-full"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 10,
              margin: 0,
              marginTop: 0,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Ionicons name="log-out" size={24} color="red" />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
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
}
