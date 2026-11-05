import React, { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MOOD_INFO, Mood } from "@/constants/Affirmations";
import { AdminGate } from "@/components/admin/AdminGate";
import { PrimaryButton, Screen, Toggle } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { AffirmationDraft, useAdminAffirmations, useAdminCategories, useAdminContentMutations, useMe } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { withAlpha } from "@/lib/color";
import { pickContentImage } from "@/lib/content-image";

const MOODS = Object.keys(MOOD_INFO) as Mood[];

export default function AffirmationFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const isAdmin = me.data?.role === "ADMIN";
  const categories = useAdminCategories(isAdmin);
  const affirmations = useAdminAffirmations(isAdmin);
  const content = useAdminContentMutations();
  const existing = affirmations.data?.find((item) => item.id === id);
  const [form, setForm] = useState<AffirmationDraft>({
    text: "",
    categoryId: "",
    moods: [],
    isPremium: false,
    imageKey: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!id);

  useEffect(() => {
    if (!id || me.data?.role !== "ADMIN" || !affirmations.isFetched || ready) return;
    if (!existing) {
      setError("Affirmation not found.");
      setReady(true);
      return;
    }
    setForm({
      text: existing.text,
      categoryId: existing.categoryId,
      moods: existing.moods,
      isPremium: existing.isPremium,
      imageKey: existing.imageKey ?? "",
    });
    setReady(true);
  }, [affirmations.isFetched, existing, id, me.data?.role, ready]);

  useEffect(() => {
    if (id || form.categoryId || !categories.data?.[0]) return;
    setForm((current) => ({ ...current, categoryId: categories.data![0].id }));
  }, [id, form.categoryId, categories.data]);

  const category = categories.data?.find((item) => item.id === form.categoryId);
  const shown = preview ?? existing?.imageUrl;
  const canSave = form.text.trim().length > 0 && !!form.categoryId && (!!id || !!form.imageKey);

  const choosePhoto = async () => {
    setError(null);
    setUploading(true);
    try {
      const picked = await pickContentImage();
      if (picked) {
        setPreview(picked.previewUri);
        setForm((current) => ({ ...current, imageKey: picked.key }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload that photo.");
    } finally {
      setUploading(false);
    }
  };

  const toggleMood = (mood: Mood) => {
    setForm((current) => ({
      ...current,
      moods: current.moods.includes(mood) ? current.moods.filter((item) => item !== mood) : [...current.moods, mood],
    }));
  };

  const save = async () => {
    setError(null);
    try {
      await content.saveAffirmation.mutateAsync({ id, draft: form });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save that affirmation.");
    }
  };

  const wash = category?.color ?? palette.accent;

  return (
    <AdminGate title={id ? "Edit affirmation" : "New affirmation"}>
      <Screen title={id ? "Edit affirmation" : "New affirmation"}>
        {!ready ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.form}>
            <TouchableOpacity onPress={choosePhoto} activeOpacity={0.85}>
              <ImageBackground
                source={shown ? { uri: shown } : undefined}
                style={[styles.hero, { backgroundColor: wash }]}
                imageStyle={styles.heroImage}
              >
                <LinearGradient colors={[withAlpha(wash, 0.25), withAlpha(wash, 0.84)]} style={StyleSheet.absoluteFill} />
                <Text style={styles.quote} numberOfLines={4}>{form.text || "The affirmation appears here"}</Text>
                <Text style={styles.hint}>{uploading ? "Uploading…" : category?.name ?? "Choose a photo"}</Text>
              </ImageBackground>
            </TouchableOpacity>

            <Text style={[styles.label, { color: palette.textMuted }]}>Affirmation</Text>
            <TextInput
              value={form.text}
              onChangeText={(text) => setForm((current) => ({ ...current, text }))}
              placeholder="I am allowed to take up space."
              placeholderTextColor={palette.textMuted}
              multiline
              style={[inputStyle(palette), styles.multiline]}
            />

            <Text style={[styles.label, { color: palette.textMuted }]}>Category</Text>
            <View style={styles.chips}>
              {(categories.data ?? []).map((item) => {
                const selected = item.id === form.categoryId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setForm((current) => ({ ...current, categoryId: item.id }))}
                    style={[styles.chip, { backgroundColor: selected ? item.color : palette.surface, borderColor: palette.border }]}
                  >
                    <Text style={{ color: selected ? "#FFFFFF" : palette.text, fontFamily: Fonts.medium, fontSize: 13 }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { color: palette.textMuted }]}>Moods</Text>
            <View style={styles.chips}>
              {MOODS.map((mood) => {
                const selected = form.moods.includes(mood);
                return (
                  <TouchableOpacity
                    key={mood}
                    onPress={() => toggleMood(mood)}
                    style={[styles.chip, { backgroundColor: selected ? palette.accent : palette.surface, borderColor: palette.border }]}
                  >
                    <Text style={{ color: selected ? "#FFFFFF" : palette.text, fontFamily: Fonts.medium, fontSize: 13 }}>
                      {MOOD_INFO[mood].emoji} {MOOD_INFO[mood].label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: palette.text }]}>Premium</Text>
              <Toggle value={form.isPremium} onValueChange={(isPremium) => setForm((current) => ({ ...current, isPremium }))} />
            </View>
            {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
            <PrimaryButton
              title={id ? "Save affirmation" : "Add affirmation"}
              onPress={save}
              disabled={!canSave || uploading}
              loading={content.saveAffirmation.isPending}
            />
          </View>
        )}
      </Screen>
    </AdminGate>
  );
}

const inputStyle = (palette: ReturnType<typeof usePalette>) => ({
  backgroundColor: palette.surface,
  borderColor: palette.border,
  color: palette.text,
  borderWidth: StyleSheet.hairlineWidth,
  borderRadius: Radius.md,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  fontFamily: Fonts.medium,
});

const styles = StyleSheet.create({
  form: { gap: 12 },
  hero: { minHeight: 180, borderRadius: Radius.lg, padding: 20, justifyContent: "flex-end", overflow: "hidden" },
  heroImage: { borderRadius: Radius.lg },
  quote: { color: "#FFFFFF", fontSize: 22, lineHeight: 30, fontFamily: Fonts.semibold },
  hint: { color: "rgba(255,255,255,0.86)", fontSize: 12, fontFamily: Fonts.regular, marginTop: 8 },
  label: { fontSize: 12, fontFamily: Fonts.semibold, marginLeft: 2 },
  multiline: { minHeight: 88, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { fontSize: 15, fontFamily: Fonts.medium },
  error: { fontSize: 13, fontFamily: Fonts.medium },
});
