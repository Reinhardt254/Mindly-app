import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PremiumGate } from "@/components/PremiumGate";
import { Card, PrimaryButton, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { useAiGenerate, useAiUsage, useCustomAffirmationMutations } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { useIsPremium } from "@/stores/premiumStore";

const LANGUAGES = ["English", "Swahili", "French"] as const;
const EXAMPLES = ["I have a job interview tomorrow", "I feel behind my friends", "My exams start next week"];

export default function AiScreen() {
  const palette = usePalette();
  const isPremium = useIsPremium();
  const usage = useAiUsage(isPremium);
  const generate = useAiGenerate();
  const { create } = useCustomAffirmationMutations();
  const [situation, setSituation] = useState("");
  const [lang, setLang] = useState<(typeof LANGUAGES)[number]>("English");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const result = generate.data;
  const error =
    generate.error instanceof ApiError && generate.error.status === 429
      ? "You've reached today's limit. Come back tomorrow."
      : generate.error
        ? "Couldn't generate affirmations right now. Please try again."
        : null;

  const handleGenerate = () => {
    setSaved(new Set());
    generate.mutate({ situation: situation.trim(), lang });
  };

  const save = async (text: string) => {
    await create.mutateAsync({ text, source: "ai" });
    setSaved((s) => new Set(s).add(text));
  };

  return (
    <Screen title="AI Affirmations">
      <PremiumGate
        title="Affirmations written for you"
        description="Describe what's going on and get affirmations tailored to your situation, in English, Swahili or French."
      >
        <Text style={[styles.intro, { color: palette.textMuted }]}>
          What's on your mind? Be as specific as you like.
        </Text>
        <TextInput
          value={situation}
          onChangeText={setSituation}
          placeholder="e.g. I have an interview tomorrow and I'm nervous"
          placeholderTextColor={palette.textMuted}
          multiline
          maxLength={500}
          style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
        />
        <View style={styles.chips}>
          {EXAMPLES.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => setSituation(e)}
              style={[styles.chip, { backgroundColor: palette.surfaceMuted }]}
            >
              <Text style={[styles.chipText, { color: palette.text }]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.segment, { backgroundColor: palette.surfaceMuted }]}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLang(l)}
              style={[styles.segmentItem, lang === l && { backgroundColor: palette.surface }]}
            >
              <Text style={[styles.segmentText, { color: lang === l ? palette.text : palette.textMuted }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Write my affirmations"
          icon="sparkles"
          onPress={handleGenerate}
          loading={generate.isPending}
          disabled={situation.trim().length < 3 || usage.data?.remaining === 0}
          style={styles.button}
        />
        {usage.data && (
          <Text style={[styles.usage, { color: palette.textMuted }]}>
            {usage.data.remaining} of {usage.data.limit} left today
          </Text>
        )}
        {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}

        {result && (
          <>
            {result.crisis && (
              <View style={[styles.crisis, { backgroundColor: palette.dangerSoft }]}>
                <Ionicons name="heart" size={18} color={palette.danger} />
                <Text style={[styles.crisisText, { color: palette.text }]}>
                  It sounds like things are really hard right now. You don't have to carry this alone. Please reach out
                  to someone you trust, or contact your local emergency number if you're in danger.
                </Text>
              </View>
            )}
            <SectionLabel>For you</SectionLabel>
            <Card>
              {result.affirmations.map((text, i) => (
                <View
                  key={text}
                  style={[
                    styles.result,
                    i < result.affirmations.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.resultText, { color: palette.text }]}>{text}</Text>
                  <TouchableOpacity onPress={() => save(text)} disabled={saved.has(text)} hitSlop={10}>
                    <Ionicons
                      name={saved.has(text) ? "checkmark-circle" : "add-circle-outline"}
                      size={24}
                      color={palette.accent}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
            <Text style={[styles.usage, { color: palette.textMuted }]}>
              Tap + to save one to Your Affirmations. It will appear in your feed and reminders.
            </Text>
          </>
        )}
      </PremiumGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 12,
  },
  input: {
    minHeight: 110,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.medium,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
  },
  segment: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 4,
    marginTop: 16,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  segmentText: {
    fontSize: 13.5,
    fontFamily: Fonts.semibold,
  },
  button: {
    marginTop: 16,
  },
  usage: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 10,
  },
  error: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: "center",
    marginTop: 10,
  },
  crisis: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: Radius.md,
    marginTop: 18,
  },
  crisisText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: Fonts.semibold,
  },
});
