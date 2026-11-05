import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AdminGate } from "@/components/admin/AdminGate";
import { Card, EmptyState, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { AdminOverview, useAdminOverview, useMe } from "@/hooks/useApi";

export default function AdminOverviewScreen() {
  const palette = usePalette();
  const me = useMe();
  const overview = useAdminOverview(me.data?.role === "ADMIN");

  return (
    <AdminGate title="Overview">
      <Screen title="Overview">
        {overview.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 12 }} />
        ) : overview.data ? (
          <Overview data={overview.data} />
        ) : (
          <EmptyState icon="cloud-offline-outline" title="Couldn't load totals" subtitle="Check your connection and try again." />
        )}
      </Screen>
    </AdminGate>
  );
}

function Overview({ data }: { data: AdminOverview }) {
  const palette = usePalette();
  const max = Math.max(1, ...data.signups.map((day) => day.count));
  const tiles = [
    ["Users", data.users],
    ["New, 7 days", data.newUsers7d],
    ["Admins", data.admins],
    ["Premium", data.premium],
    ["Check-ins, 7 days", data.moodCheckins7d],
    ["AI today", data.aiGenerationsToday],
    ["Recordings", data.voiceRecordings],
  ] as const;

  return (
    <>
      <View style={styles.tiles}>
        {tiles.map(([label, value]) => (
          <View key={label} style={[styles.tile, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.tileValue, { color: palette.text }]}>{value}</Text>
            <Text style={[styles.tileLabel, { color: palette.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
      <SectionLabel>Signups, 14 days</SectionLabel>
      <Card style={styles.chartCard}>
        <View style={styles.chart}>
          {data.signups.map((day, index) => {
            const showLabel = index === 0 || index === data.signups.length - 1 || index === 7;
            return (
              <View key={day.date} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.bar, { height: `${Math.max(4, (day.count / max) * 100)}%`, backgroundColor: palette.accent }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: palette.textMuted }]}>{showLabel ? day.date.slice(8) : ""}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "31%",
    flexGrow: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  tileValue: { fontSize: 20, fontFamily: Fonts.bold },
  tileLabel: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  chartCard: { paddingVertical: 16 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 3 },
  barColumn: { flex: 1, alignItems: "center" },
  barTrack: { height: 96, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 3 },
  barLabel: { fontSize: 10, fontFamily: Fonts.medium, marginTop: 6, height: 14 },
});
