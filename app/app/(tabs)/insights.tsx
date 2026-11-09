import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PremiumGate } from "@/components/PremiumGate";
import { Card, EmptyState, Screen, SectionLabel } from "@/components/ui/Kit";
import { MOOD_INFO, Mood } from "@/constants/Affirmations";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { Insights, useInsights } from "@/hooks/useApi";
import { useIsPremium } from "@/stores/premiumStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const SCORE_COLORS = ["#E5484D", "#F97316", "#F59E0B", "#14B8A6", "#003049"];
const scoreColor = (score: number) => SCORE_COLORS[Math.min(4, Math.max(0, Math.round(score) - 1))];

export default function InsightsScreen() {
  const palette = usePalette();
  const isPremium = useIsPremium();
  const [range, setRange] = useState<"week" | "month">("week");
  const insights = useInsights(range, isPremium);

  return (
    <Screen title="Insights">
      <PremiumGate
        title="See how you're really doing"
        description="Mood trends over time, weekly and monthly summaries, your top themes and streak history."
      >
        <View style={[styles.segment, { backgroundColor: palette.surfaceMuted }]}>
          {(["week", "month"] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[styles.segmentItem, range === r && { backgroundColor: palette.surface }]}
            >
              <Text style={[styles.segmentText, { color: range === r ? palette.text : palette.textMuted }]}>
                {r === "week" ? "This week" : "This month"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {insights.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
        ) : insights.error || !insights.data ? (
          <EmptyState icon="cloud-offline-outline" title="Couldn't load insights" subtitle="Check your connection and try again." />
        ) : (
          <InsightsBody data={insights.data} />
        )}
      </PremiumGate>
    </Screen>
  );
}

function InsightsBody({ data }: { data: Insights }) {
  const palette = usePalette();
  const delta =
    data.averageScore !== null && data.previousAverageScore !== null
      ? Math.round((data.averageScore - data.previousAverageScore) * 10) / 10
      : null;

  const moodEntries = (Object.entries(data.moodCounts) as [Mood, number][]).sort((a, b) => b[1] - a[1]);
  const maxMood = Math.max(1, ...moodEntries.map(([, n]) => n));
  const activeDates = new Set(data.activity.dates);

  return (
    <>
      <View style={styles.tiles}>
        <Tile icon="happy-outline" value={String(data.totalCheckins)} label="Check-ins" />
        <Tile
          icon="pulse-outline"
          value={data.averageScore !== null ? data.averageScore.toFixed(1) : "–"}
          label={delta === null ? "Avg mood /5" : `${delta >= 0 ? "+" : ""}${delta} vs before`}
        />
        <Tile icon="flame-outline" value={String(data.streak.currentStreak)} label="Day streak" />
      </View>

      <SectionLabel>Mood trend</SectionLabel>
      <Card style={styles.chartCard}>
        {data.totalCheckins === 0 ? (
          <Text style={[styles.muted, { color: palette.textMuted }]}>
            Check in with your mood from the home screen to see your trend here.
          </Text>
        ) : (
          <View style={styles.chart}>
            {data.daily.map((d, i) => {
              const height = d.averageScore ? (d.averageScore / 5) * 100 : 4;
              const showLabel = data.daily.length <= 7 || i % 5 === 0 || i === data.daily.length - 1;
              return (
                <View key={d.date} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${height}%`,
                          backgroundColor: d.averageScore ? scoreColor(d.averageScore) : palette.iconRing,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: palette.textMuted }]}>
                    {showLabel ? dayLabel(d.date, data.daily.length) : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {moodEntries.length > 0 && (
        <>
          <SectionLabel>How you felt</SectionLabel>
          <Card style={styles.listCard}>
            {moodEntries.map(([mood, count]) => (
              <View key={mood} style={styles.moodRow}>
                <Text style={styles.moodEmoji}>{MOOD_INFO[mood]?.emoji ?? "•"}</Text>
                <Text style={[styles.moodName, { color: palette.text }]}>{MOOD_INFO[mood]?.label ?? mood}</Text>
                <View style={[styles.moodTrack, { backgroundColor: palette.surfaceMuted }]}>
                  <View style={[styles.moodFill, { width: `${(count / maxMood) * 100}%`, backgroundColor: palette.accent }]} />
                </View>
                <Text style={[styles.moodCount, { color: palette.textMuted }]}>{count}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {data.topThemes.length > 0 && (
        <>
          <SectionLabel>Top themes</SectionLabel>
          <View style={styles.themes}>
            {data.topThemes.map((t) => (
              <View key={t.id} style={[styles.theme, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Ionicons name={t.icon as IconName} size={16} color={t.color} />
                <Text style={[styles.themeText, { color: palette.text }]}>{t.name}</Text>
                <Text style={[styles.themeCount, { color: palette.textMuted }]}>{t.count}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <SectionLabel>Streak history</SectionLabel>
      <Card style={styles.listCard}>
        <View style={styles.calendar}>
          {data.daily.map((d) => (
            <View
              key={d.date}
              style={[
                styles.calendarDot,
                { backgroundColor: activeDates.has(d.date) ? palette.accent : palette.surfaceMuted },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.muted, { color: palette.textMuted, marginTop: 12 }]}>
          Active {data.activity.activeDays} of {data.daily.length} days · best streak {data.streak.longestStreak}
        </Text>
      </Card>

      <SectionLabel>Activity</SectionLabel>
      <View style={styles.tiles}>
        <Tile icon="book-outline" value={String(data.activity.viewed)} label="Read" />
        <Tile icon="heart-outline" value={String(data.activity.liked)} label="Liked" />
        <Tile icon="share-outline" value={String(data.activity.shared)} label="Shared" />
        <Tile icon="play-outline" value={String(data.activity.practiceSessions)} label="Sessions" />
      </View>
    </>
  );
}

function dayLabel(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  return days <= 7 ? d.toLocaleDateString(undefined, { weekday: "narrow" }) : String(d.getDate());
}

function Tile({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const palette = usePalette();
  return (
    <View style={[styles.tile, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Ionicons name={icon} size={18} color={palette.accent} />
      <Text style={[styles.tileValue, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: palette.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
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
  chartCard: {
    paddingVertical: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
    gap: 3,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    height: 128,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    marginTop: 6,
    height: 14,
  },
  listCard: {
    paddingVertical: 14,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodName: {
    width: 72,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  moodTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  moodFill: {
    height: "100%",
    borderRadius: 4,
  },
  moodCount: {
    width: 24,
    textAlign: "right",
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  themes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  theme: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  themeText: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
  },
  themeCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  calendarDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  muted: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.regular,
  },
});
