import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SimpleHeader } from "@/components/ModernHeader";
import { useStatsStore } from "@/stores/statsStore";

export default function StatsScreen() {
  const { userProfile } = useLocalStorage();
  const colorScheme = useColorScheme();
  const {
    totalAffirmationsViewed,
    daysActive,
    achievements,
    getTodayStats,
    getStreakInfo,
  } = useStatsStore();

  const todayStats = getTodayStats();
  const streakInfo = getStreakInfo();

  if (!userProfile) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-900">
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
      {/* Simple Header */}
      <SimpleHeader title="Your Progress" />

      <ScrollView className="flex-1 px-4 py-0">
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
            className="flex-row items-center justify-between"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              paddingTop: 10,
            }}
          >
            <View className="items-center">
              <Text className="text-3xl font-bold text-blue-500">
                {todayStats?.affirmationsViewed || 0}
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
                {todayStats
                  ? Math.round(
                      (todayStats.affirmationsViewed /
                        userProfile.affirmationFrequency) *
                        100
                    )
                  : 0}
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
            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar"
                  size={20}
                  color={Colors[colorScheme ?? "light"].background}
                  style={{
                    backgroundColor: Colors[colorScheme ?? "light"].highlight,
                    borderRadius: 100,
                    padding: 7,
                  }}
                />
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
                {daysActive}
              </Text>
            </View>

            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center">
                <Ionicons
                  name="heart"
                  size={20}
                  color={Colors[colorScheme ?? "light"].background}
                  style={{
                    backgroundColor: Colors[colorScheme ?? "light"].highlight,
                    borderRadius: 100,
                    padding: 7,
                  }}
                />
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
                {totalAffirmationsViewed}
              </Text>
            </View>

            <View className="flex-row items-center justify-between w-full">
              <View className="flex-row items-center">
                <Ionicons
                  name="trophy"
                  size={24}
                  color={Colors[colorScheme ?? "light"].background}
                  style={{
                    backgroundColor: Colors[colorScheme ?? "light"].highlight,
                    borderRadius: 100,
                    padding: 7,
                  }}
                />
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
                {streakInfo.current} days
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            height: "auto",
            margin: 0,
            marginTop: 0,
            paddingVertical: 30,
            paddingHorizontal: 20,
            paddingBottom: 10,
            marginBottom: 20,
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
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className={`flex-row items-center ${achievement.unlocked ? "" : "opacity-50"}`}
              >
                <View
                  className={`items-center justify-center w-12 h-12 rounded-full ${
                    achievement.unlocked
                      ? achievement.id === "first_steps"
                        ? "bg-green-500"
                        : achievement.id === "on_fire"
                          ? "bg-blue-600"
                          : achievement.id === "affirmation_master"
                            ? "bg-purple-600"
                            : achievement.id === "heart_lover"
                              ? "bg-red-500"
                              : achievement.id === "social_butterfly"
                                ? "bg-pink-500"
                                : "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={
                      achievement.unlocked
                        ? "#FFFFFF" // White icon for unlocked achievements
                        : "#FFFFFF" // White icon for locked achievements too
                    }
                    style={{
                      backgroundColor: achievement.unlocked
                        ? Colors[colorScheme ?? "light"].highlight // No background for unlocked (the parent View provides the colored background)
                        : Colors[colorScheme ?? "light"].text, // No background for locked either
                      borderRadius: 100,
                      padding: 7,
                    }}
                  />
                </View>
                <View style={{ marginLeft: 10 }} className="flex-1 ml-4">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: Colors[colorScheme ?? "light"].text }}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    className=""
                    style={{ color: Colors[colorScheme ?? "light"].text }}
                  >
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
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
                {Math.max(
                  0,
                  userProfile.affirmationFrequency -
                    (todayStats?.affirmationsViewed || 0)
                )}{" "}
                affirmations away from today&apos;s goal!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
