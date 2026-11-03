import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
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

  const theme = Colors[colorScheme ?? "light"];
  const cardShadow =
    colorScheme === "dark"
      ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
      : "0 0 10px 0 rgba(0, 0, 0, 0.1)";

  const getAchievementBadgeStyle = (achievement: {
    id: string;
    unlocked: boolean;
  }) => {
    if (!achievement.unlocked) return styles.badgeLocked;
    switch (achievement.id) {
      case "first_steps":
        return styles.badgeFirstSteps;
      case "on_fire":
        return styles.badgeOnFire;
      case "affirmation_master":
        return styles.badgeMaster;
      case "heart_lover":
        return styles.badgeHeartLover;
      case "social_butterfly":
        return styles.badgeSocial;
      default:
        return styles.badgeDefault;
    }
  };

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Simple Header */}
      <SimpleHeader title="Your Progress" />

      <ScrollView style={styles.scrollView}>
        {/* Today's Progress */}
        <View
          style={[
            styles.todayCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
              boxShadow: cardShadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Today&apos;s Progress
          </Text>

          <View
            style={[styles.todayRow, { backgroundColor: theme.background }]}
          >
            <View style={styles.todayStat}>
              <Text style={[styles.todayNumber, styles.todayNumberBlue]}>
                {todayStats?.affirmationsViewed || 0}
              </Text>
              <Text style={{ color: theme.text }}>Viewed</Text>
            </View>

            <View style={styles.todayStat}>
              <Text style={[styles.todayNumber, styles.todayNumberGreen]}>
                {userProfile.affirmationFrequency}
              </Text>
              <Text style={{ color: theme.text }}>Goal</Text>
            </View>

            <View style={styles.todayStat}>
              <Text style={[styles.todayNumber, styles.todayNumberYellow]}>
                {todayStats
                  ? Math.round(
                      (todayStats.affirmationsViewed /
                        userProfile.affirmationFrequency) *
                        100
                    )
                  : 0}
                %
              </Text>
              <Text style={{ color: theme.text }}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Weekly Stats */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
              boxShadow: cardShadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            This Week
          </Text>

          <View
            style={[
              styles.listContainer,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
              },
            ]}
          >
            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={theme.background}
                  style={[styles.statIcon, { backgroundColor: theme.highlight }]}
                />
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Days Active
                </Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {daysActive}
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={theme.background}
                  style={[styles.statIcon, { backgroundColor: theme.highlight }]}
                />
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Total Affirmations
                </Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalAffirmationsViewed}
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons
                  name="trophy"
                  size={24}
                  color={theme.background}
                  style={[styles.statIcon, { backgroundColor: theme.highlight }]}
                />
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Streak
                </Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {streakInfo.current} days
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View
          style={[
            styles.achievementsCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
              boxShadow: cardShadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Achievements
          </Text>

          <View
            style={[
              styles.listContainer,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
              },
            ]}
          >
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementRow,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementBadge,
                    getAchievementBadgeStyle(achievement),
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={
                      achievement.unlocked
                        ? "#FFFFFF" // White icon for unlocked achievements
                        : "#FFFFFF" // White icon for locked achievements too
                    }
                    style={[
                      styles.achievementIcon,
                      {
                        backgroundColor: achievement.unlocked
                          ? theme.highlight // No background for unlocked (the parent View provides the colored background)
                          : theme.text, // No background for locked either
                      },
                    ]}
                  />
                </View>
                <View style={styles.achievementTextContainer}>
                  <Text
                    style={[styles.achievementTitle, { color: theme.text }]}
                  >
                    {achievement.title}
                  </Text>
                  <Text style={{ color: theme.text }}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
              boxShadow: cardShadow,
            },
          ]}
        >
          <Text style={[styles.insightsTitle, { color: theme.text }]}>
            Insights
          </Text>

          <View style={styles.insightsList}>
            <View
              style={[styles.insightItem, { backgroundColor: theme.background }]}
            >
              <Text style={[styles.insightTitle, { color: theme.text }]}>
                💡 Tip of the Day
              </Text>
              <Text style={{ color: theme.text }}>
                Consistency is key! Try to read your affirmations at the same
                time each day to build a lasting habit.
              </Text>
            </View>

            <View style={[styles.insightItem, styles.goalInsight]}>
              <Text style={[styles.insightTitle, { color: theme.text }]}>
                🎯 Your Goal
              </Text>
              <Text style={{ color: theme.text }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingText: {
    fontSize: 18,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "600",
  },
  todayCard: {
    marginBottom: 24,
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingVertical: 30,
    paddingHorizontal: 20,
    height: "auto",
    margin: 0,
    marginTop: 0,
  },
  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  todayStat: {
    alignItems: "center",
  },
  todayNumber: {
    fontSize: 30,
    fontWeight: "700",
  },
  todayNumberBlue: {
    color: "#3b82f6",
  },
  todayNumberGreen: {
    color: "#22c55e",
  },
  todayNumberYellow: {
    color: "#eab308",
  },
  sectionCard: {
    marginBottom: 24,
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    height: "auto",
    margin: 0,
    marginTop: 0,
  },
  listContainer: {
    borderWidth: 0,
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
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    borderRadius: 100,
    padding: 7,
  },
  statLabel: {
    marginLeft: 10,
    fontSize: 18,
  },
  statValue: {
    marginLeft: "auto",
    fontSize: 18,
    fontWeight: "600",
  },
  achievementsCard: {
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    height: "auto",
    margin: 0,
    marginTop: 0,
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginBottom: 20,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 9999,
  },
  badgeFirstSteps: {
    backgroundColor: "#22c55e",
  },
  badgeOnFire: {
    backgroundColor: "#2563eb",
  },
  badgeMaster: {
    backgroundColor: "#9333ea",
  },
  badgeHeartLover: {
    backgroundColor: "#ef4444",
  },
  badgeSocial: {
    backgroundColor: "#ec4899",
  },
  badgeDefault: {
    backgroundColor: "#eab308",
  },
  badgeLocked: {
    backgroundColor: "#6b7280",
  },
  achievementIcon: {
    borderRadius: 100,
    padding: 7,
  },
  achievementTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  insightsTitle: {
    paddingLeft: 20,
    marginBottom: 16,
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "600",
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    paddingVertical: 16,
    borderRadius: 8,
  },
  insightTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "600",
  },
  goalInsight: {
    backgroundColor: "rgba(34,197,94,0.2)",
  },
});
