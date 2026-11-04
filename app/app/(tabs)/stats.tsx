import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMe } from "@/hooks/useApi";
import { useStatsStore } from "@/stores/statsStore";
import { useIsPremium } from "@/stores/premiumStore";
import { Card, ListRow, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function StatsScreen() {
  const palette = usePalette();
  const router = useRouter();
  const isPremium = useIsPremium();
  const me = useMe();
  const { userProfile } = useLocalStorage();
  const {
    totalAffirmationsViewed,
    daysActive,
    achievements,
    getTodayStats,
    getStreakInfo,
  } = useStatsStore();

  const todayStats = getTodayStats();
  const localStreak = getStreakInfo();
  const streakInfo = me.data
    ? {
        current: me.data.streak.currentStreak,
        longest: me.data.streak.longestStreak,
      }
    : localStreak;

  if (!userProfile) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  const viewed = todayStats?.affirmationsViewed || 0;
  const goal = userProfile.affirmationFrequency;
  const percent = Math.min(100, Math.round((viewed / goal) * 100));
  const remaining = Math.max(0, goal - viewed);

  return (
    <Screen title="Your Progress">
      {/* Today */}
      <LinearGradient
        colors={palette.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>Today</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroNumber}>{viewed}</Text>
          <Text style={styles.heroGoal}>/ {goal} affirmations</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.heroHint}>
          {remaining === 0
            ? "Goal reached. Beautiful work."
            : `${remaining} more to reach today's goal`}
        </Text>
      </LinearGradient>

      {/* Stat tiles */}
      <View style={styles.tiles}>
        <StatTile icon="flame-outline" value={streakInfo.current} label="Day streak" />
        <StatTile icon="trophy-outline" value={streakInfo.longest} label="Best streak" />
        <StatTile icon="calendar-outline" value={daysActive} label="Days active" />
        <StatTile
          icon="book-outline"
          value={totalAffirmationsViewed}
          label="Read"
        />
      </View>

      <SectionLabel>Insights</SectionLabel>
      <Card>
        <ListRow
          icon="analytics-outline"
          label="Mood & progress insights"
          subtitle="Weekly and monthly trends, top themes, streak history"
          onPress={() => router.push(isPremium ? "/(tabs)/insights" : "/paywall")}
          right={
            isPremium ? undefined : (
              <Ionicons name="lock-closed" size={16} color={palette.accent} />
            )
          }
          isLast
        />
      </Card>

      <SectionLabel>Achievements</SectionLabel>
      <Card>
        {achievements.map((achievement, index) => (
          <View
            key={achievement.id}
            style={[
              styles.achievement,
              index < achievements.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                {
                  backgroundColor: achievement.unlocked
                    ? palette.accentSoft
                    : palette.surfaceMuted,
                },
              ]}
            >
              <Ionicons
                name={
                  achievement.unlocked
                    ? (achievement.icon as IconName)
                    : "lock-closed-outline"
                }
                size={18}
                color={achievement.unlocked ? palette.accent : palette.textMuted}
              />
            </View>
            <View style={styles.achievementText}>
              <Text
                style={[
                  styles.achievementTitle,
                  {
                    color: achievement.unlocked
                      ? palette.text
                      : palette.textMuted,
                  },
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[styles.achievementDesc, { color: palette.textMuted }]}
              >
                {achievement.description}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <View style={[styles.tip, { backgroundColor: palette.accentSoft }]}>
        <Ionicons name="bulb-outline" size={20} color={palette.accent} />
        <Text style={[styles.tipText, { color: palette.text }]}>
          Consistency is key. Read your affirmations at the same time each day
          to build a lasting habit.
        </Text>
      </View>
    </Screen>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: number;
  label: string;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <Ionicons name={icon} size={18} color={palette.accent} />
      <Text style={[styles.tileValue, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: Radius.lg,
    padding: 20,
    boxShadow: "0 12px 28px rgba(124, 92, 252, 0.28)",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  heroNumber: {
    color: "#FFFFFF",
    fontSize: 44,
    fontFamily: Fonts.bold,
    letterSpacing: -1,
  },
  heroGoal: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  heroHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 12,
  },
  tiles: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  tileValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginTop: 10,
  },
  tileLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  achievementIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
  achievementDesc: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  tip: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    marginTop: 22,
  },
  tipText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
});
