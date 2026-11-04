import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useQueryClient } from "@tanstack/react-query";
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, usePalette } from "@/constants/Theme";
import { Affirmation } from "@/constants/UserTypes";
import { queryKeys } from "@/hooks/useApi";
import { uploadVoiceRecording } from "@/lib/voice";

const MAX_MS = 2 * 60_000;

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VoiceRecorderSheet({
  visible,
  affirmation,
  onClose,
}: {
  visible: boolean;
  affirmation: Affirmation | null;
  onClose: () => void;
}) {
  const palette = usePalette();
  const qc = useQueryClient();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [recorded, setRecorded] = useState<{ uri: string; durationMs: number } | null>(null);
  const player = useAudioPlayer(recorded?.uri ?? null);
  const playerStatus = useAudioPlayerStatus(player);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setRecorded(null);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (recorderState.isRecording && recorderState.durationMillis >= MAX_MS) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.durationMillis]);

  const start = async () => {
    setError(null);
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setError("Microphone permission is needed to record.");
      return;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    setRecorded(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    const durationMs = recorderState.durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri) setRecorded({ uri: recorder.uri, durationMs });
  };

  const togglePlay = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      if (playerStatus.didJustFinish || playerStatus.currentTime >= playerStatus.duration) player.seekTo(0);
      player.play();
    }
  };

  const save = async () => {
    if (!recorded || !affirmation) return;
    setSaving(true);
    setError(null);
    try {
      await uploadVoiceRecording({
        uri: recorded.uri,
        durationMs: recorded.durationMs,
        affirmationId: affirmation.id,
        affirmationText: affirmation.text,
      });
      await qc.invalidateQueries({ queryKey: queryKeys.voice });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Could not save the recording");
    } finally {
      setSaving(false);
    }
  };

  const isRecording = recorderState.isRecording;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={isRecording ? undefined : onClose} />
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.grabber, { backgroundColor: palette.iconRing }]} />
          <Text style={[styles.title, { color: palette.text }]}>Record in your voice</Text>
          <Text style={[styles.quote, { color: palette.text }]}>“{affirmation?.text}”</Text>
          <Text style={[styles.hint, { color: palette.textMuted }]}>
            Read it slowly, like you mean it. Up to 2 minutes.
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={isRecording ? stop : start}
              activeOpacity={0.85}
              style={[styles.recordButton, { backgroundColor: isRecording ? palette.danger : palette.accent }]}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={30} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.timer, { color: palette.text }]}>
              {formatMs(isRecording ? recorderState.durationMillis : recorded?.durationMs ?? 0)}
            </Text>
            {recorded && !isRecording && (
              <TouchableOpacity onPress={togglePlay} style={[styles.playButton, { borderColor: palette.iconRing }]}>
                <Ionicons name={playerStatus.playing ? "pause" : "play"} size={20} color={palette.text} />
              </TouchableOpacity>
            )}
          </View>

          {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}

          {saving ? (
            <ActivityIndicator color={palette.accent} style={{ marginVertical: 16 }} />
          ) : (
            <PrimaryButton title="Save recording" icon="cloud-upload-outline" onPress={save} disabled={!recorded || isRecording} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 8, 20, 0.45)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  quote: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: Fonts.semibold,
    marginTop: 14,
  },
  hint: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginVertical: 26,
  },
  recordButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    minWidth: 60,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: "center",
    marginBottom: 12,
  },
});
