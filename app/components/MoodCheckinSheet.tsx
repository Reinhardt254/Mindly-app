import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AFFIRMATIONS, MOODS, MOOD_INFO, Mood } from "@/constants/Affirmations";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { Affirmation } from "@/constants/UserTypes";
import { useMoodCheckin } from "@/hooks/useApi";
import { PrimaryButton } from "@/components/ui/Kit";

function localMatch(mood: Mood): Affirmation {
  const matches = AFFIRMATIONS.filter((a) => a.moods?.includes(mood));
  const pool = matches.length ? matches : AFFIRMATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function MoodCheckinSheet({
  visible,
  onClose,
  onShowAffirmation,
}: {
  visible: boolean;
  onClose: () => void;
  onShowAffirmation?: (affirmation: Affirmation) => void;
}) {
  const palette = usePalette();
  const checkin = useMoodCheckin();
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<Affirmation | null>(null);

  useEffect(() => {
    if (!visible) {
      setMood(null);
      setNote("");
      setResult(null);
      checkin.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const submit = async () => {
    if (!mood) return;
    try {
      const res = await checkin.mutateAsync({ mood, note: note.trim() || undefined });
      setResult(res.affirmation ?? localMatch(mood));
    } catch {
      setResult(localMatch(mood));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.grabber, { backgroundColor: palette.iconRing }]} />
          {result ? (
            <>
              <Text style={[styles.title, { color: palette.text }]}>
                {mood ? `${MOOD_INFO[mood].emoji}  For when you feel ${MOOD_INFO[mood].label.toLowerCase()}` : ""}
              </Text>
              <View style={[styles.resultCard, { backgroundColor: palette.accentSoft }]}>
                <Text style={[styles.resultText, { color: palette.text }]}>{result.text}</Text>
              </View>
              <PrimaryButton
                title="Show on home"
                icon="home-outline"
                onPress={() => {
                  onShowAffirmation?.(result);
                  onClose();
                }}
              />
              <TouchableOpacity onPress={onClose} style={styles.secondary}>
                <Text style={[styles.secondaryText, { color: palette.textMuted }]}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: palette.text }]}>How are you feeling?</Text>
              <Text style={[styles.subtitle, { color: palette.textMuted }]}>
                Pick a mood and get an affirmation that fits.
              </Text>
              <View style={styles.grid}>
                {MOODS.map((m) => {
                  const selected = mood === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMood(m)}
                      activeOpacity={0.8}
                      style={[
                        styles.mood,
                        {
                          backgroundColor: selected ? palette.accentSoft : palette.surfaceMuted,
                          borderColor: selected ? palette.accent : "transparent",
                        },
                      ]}
                    >
                      <Text style={styles.emoji}>{MOOD_INFO[m].emoji}</Text>
                      <Text style={[styles.moodLabel, { color: palette.text }]}>{MOOD_INFO[m].label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a note (optional)"
                placeholderTextColor={palette.textMuted}
                maxLength={500}
                style={[styles.note, { backgroundColor: palette.surfaceMuted, color: palette.text }]}
              />
              {checkin.isPending ? (
                <ActivityIndicator color={palette.accent} style={{ marginVertical: 16 }} />
              ) : (
                <PrimaryButton title="Check in" onPress={submit} disabled={!mood} />
              )}
            </>
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
  subtitle: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginTop: 18,
  },
  mood: {
    width: "23.5%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 26,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginTop: 6,
  },
  note: {
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginVertical: 16,
  },
  resultCard: {
    borderRadius: Radius.lg,
    padding: 22,
    marginVertical: 18,
  },
  resultText: {
    fontSize: 21,
    lineHeight: 29,
    fontFamily: Fonts.bold,
  },
  secondary: {
    alignItems: "center",
    paddingTop: 14,
  },
  secondaryText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});
