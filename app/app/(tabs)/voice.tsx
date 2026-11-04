import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Popup } from "@/components/Popup";
import { PremiumGate } from "@/components/PremiumGate";
import { EmptyState, Screen } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { VoiceRecording, useDeleteVoice, useVoiceRecordings } from "@/hooks/useApi";
import { useIsPremium } from "@/stores/premiumStore";

function formatMs(ms: number) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function VoiceScreen() {
  const palette = usePalette();
  const isPremium = useIsPremium();
  const recordings = useVoiceRecordings(isPremium);
  const deleteVoice = useDeleteVoice();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VoiceRecording | null>(null);

  const toggle = (r: VoiceRecording) => {
    if (playingId === r.id && status.playing) {
      player.pause();
      return;
    }
    if (playingId !== r.id) {
      player.replace({ uri: r.url });
      setPlayingId(r.id);
    } else if (status.didJustFinish || status.currentTime >= status.duration) {
      player.seekTo(0);
    }
    player.play();
  };

  const items = recordings.data ?? [];

  return (
    <Screen title="My Voice">
      <PremiumGate
        title="Hear it in your own voice"
        description="Record yourself reading affirmations and play them back whenever you need them."
      >
        {recordings.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="mic-outline"
            title="No recordings yet"
            subtitle="On the home screen, tap the microphone under any affirmation to record it in your voice."
          />
        ) : (
          <View style={styles.list}>
            {items.map((r) => {
              const active = playingId === r.id && status.playing;
              return (
                <View key={r.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <TouchableOpacity
                    onPress={() => toggle(r)}
                    style={[styles.play, { backgroundColor: active ? palette.accent : palette.accentSoft }]}
                  >
                    <Ionicons name={active ? "pause" : "play"} size={20} color={active ? "#FFFFFF" : palette.accent} />
                  </TouchableOpacity>
                  <View style={styles.flex}>
                    <Text style={[styles.text, { color: palette.text }]} numberOfLines={3}>
                      {r.affirmationText ?? "Recording"}
                    </Text>
                    <Text style={[styles.meta, { color: palette.textMuted }]}>
                      {formatMs(r.durationMs)} · {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setPendingDelete(r)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color={palette.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </PremiumGate>

      <Popup
        visible={!!pendingDelete}
        title="Delete recording"
        message="This can't be undone."
        buttons={[
          { text: "Cancel", onPress: () => {}, style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (!pendingDelete) return;
              if (playingId === pendingDelete.id) player.pause();
              deleteVoice.mutate(pendingDelete.id);
            },
          },
        ]}
        onClose={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.semibold,
  },
  meta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
});
