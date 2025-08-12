import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function StatsScreen() {
  const { userProfile } = useLocalStorage();
  const colorScheme = useColorScheme();

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
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <ScrollView className="flex-1 px-6 py-8">
        {/* Header */}
        <View
          className=""
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            height: 30,
          }}
        ></View>
        <View className="mb-8">
          <Text
            className="text-2xl font-bold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Your Progress
          </Text>
          <Text
            className="mt-2 text-md"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Track your affirmation journey
          </Text>
        </View>

        {/* Today's Progress */}
        <View
          className="mb-6 rounded-lg"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 30,
            paddingHorizontal: 20,
            height: "auto",
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Today&apos;s Progress
          </Text>

          <View
            className="flex-row justify-between items-center"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              paddingTop: 10,
            }}
          >
            <View className="items-center">
              <Text className="text-3xl font-bold text-blue-500">
                {userProfile.dailyAffirmationsShown}
              </Text>
              <Text
                className=""
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Viewed
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-3xl font-bold text-green-500">
                {userProfile.affirmationFrequency}
              </Text>
              <Text
                className=""
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Goal
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-3xl font-bold text-yellow-500">
                {Math.round(
                  (userProfile.dailyAffirmationsShown /
                    userProfile.affirmationFrequency) *
                    100
                )}
                %
              </Text>
              <Text
                className=""
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Complete
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Stats */}
        <View
          className="p-6 mb-6 rounded-lg"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 30,
            paddingHorizontal: 20,
            paddingBottom: 10,
            height: "auto",
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            This Week
          </Text>

          <View
            className="space-y-4"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 0,
              margin: 0,
              marginTop: 0,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              gap: 10,
            }}
          >
            <View className="flex-row justify-between items-center w-full">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    marginLeft: 10,
                    color: Colors[colorScheme ?? "light"].text,
                  }}
                >
                  Days Active
                </Text>
              </View>
              <Text
                style={{
                  marginLeft: "auto",
                  color: Colors[colorScheme ?? "light"].text,
                }}
                className="ml-auto text-lg font-semibold"
              >
                7
              </Text>
            </View>

            <View className="flex-row justify-between items-center w-full">
              <View className="flex-row items-center">
                <Ionicons name="heart" size={24} color="#EF4444" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    marginLeft: 10,
                    color: Colors[colorScheme ?? "light"].text,
                  }}
                >
                  Total Affirmations
                </Text>
              </View>
              <Text
                style={{
                  marginLeft: "auto",
                  color: Colors[colorScheme ?? "light"].text,
                }}
                className="text-lg font-semibold"
              >
                21
              </Text>
            </View>

            <View className="flex-row justify-between items-center w-full">
              <View className="flex-row items-center">
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    marginLeft: 10,
                    color: Colors[colorScheme ?? "light"].text,
                  }}
                >
                  Streak
                </Text>
              </View>
              <Text
                className="text-lg font-semibold"
                style={{
                  marginLeft: "auto",
                  color: Colors[colorScheme ?? "light"].text,
                }}
              >
                5 days
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
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
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Achievements
          </Text>

          <View
            className="space-y-4"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 0,
              margin: 0,
              marginTop: 0,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              gap: 10,
            }}
          >
            <View className="flex-row items-center">
              <View className="justify-center items-center w-12 h-12 bg-green-500 rounded-full">
                <Ionicons name="checkmark" size={24} color="blue" />
              </View>
              <View style={{ marginLeft: 10 }} className="flex-1 ml-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  First Steps
                </Text>
                <Text
                  className=""
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Complete your first affirmation
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="justify-center items-center w-12 h-12 bg-blue-600 rounded-full">
                <Ionicons name="flame" size={24} color="white" />
              </View>
              <View style={{ marginLeft: 10 }} className="flex-1 ml-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  On Fire
                </Text>
                <Text
                  className=""
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Complete 7 days in a row
                </Text>
              </View>
            </View>

            <View className="flex-row items-center opacity-50">
              <View className="justify-center items-center w-12 h-12 rounded-full">
                <Ionicons name="star" size={24} color="white" />
              </View>
              <View style={{ marginLeft: 10 }} className="flex-1 ml-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Affirmation Master
                </Text>
                <Text
                  className=""
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Complete 30 days in a row
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View
          className="p-6 mb-6 rounded-lg"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 30,
            paddingHorizontal: 20,
            paddingBottom: 10,
            height: "auto",
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text
            className="pl-5 mb-4 ml-5 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Insights
          </Text>

          <View className="space-y-4">
            <View
              className="py-4 rounded-lg"
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
              }}
            >
              <Text
                className="mb-2 text-xl font-semibold text-blue-400"
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                💡 Tip of the Day
              </Text>
              <Text
                className=""
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Consistency is key! Try to read your affirmations at the same
                time each day to build a lasting habit.
              </Text>
            </View>

            <View className="py-4 rounded-lg bg-green-500/20">
              <Text
                className="mb-2 text-xl font-semibold text-green-400"
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                🎯 Your Goal
              </Text>
              <Text
                className=""
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                You&apos;re{" "}
                {userProfile.affirmationFrequency -
                  userProfile.dailyAffirmationsShown}{" "}
                affirmations away from today&apos;s goal!
              </Text>
            </View>
          </View>
        </View>

        <View
          className="flex-1"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            height: 20,
          }}
        ></View>
      </ScrollView>
    </View>
  );
}
