import React, { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { PrimaryButton, Screen, Toggle } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { CategoryDraft, useAdminCategories, useAdminContentMutations, useMe } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { withAlpha } from "@/lib/color";
import { pickContentImage } from "@/lib/content-image";

const ICONS = ["sparkles", "heart", "leaf", "flame", "shield-checkmark", "fitness", "trending-up", "cloud", "briefcase", "people", "diamond", "school", "happy", "rocket", "bandage", "sunny", "moon", "star"] as const;
const COLORS = ["#8B5CF6", "#3B82F6", "#EC4899", "#14B8A6", "#F97316", "#F59E0B", "#EF4444", "#10B981", "#6366F1", "#0EA5E9", "#DB2777", "#22C55E"];

const empty = (): CategoryDraft => ({
  id: "",
  name: "",
  icon: "sparkles",
  color: "#8B5CF6",
  description: "",
  isPremium: false,
  imageKey: "",
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const categories = useAdminCategories(me.data?.role === "ADMIN");
  const content = useAdminContentMutations();
  const existing = categories.data?.find((category) => category.id === id);
  const [form, setForm] = useState<CategoryDraft>(empty);
  const [idTouched, setIdTouched] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!editing);

  useEffect(() => {
    if (!editing || me.data?.role !== "ADMIN" || !categories.isFetched || ready) return;
    if (!existing) {
      setError("Category not found.");
      setReady(true);
      return;
    }
    setForm({
      id: existing.id,
      name: existing.name,
      icon: existing.icon,
      color: existing.color,
      description: existing.description,
      isPremium: existing.isPremium,
      imageKey: existing.imageKey ?? "",
    });
    setReady(true);
  }, [categories.isFetched, editing, existing, me.data?.role, ready]);

  const shown = preview ?? existing?.imageUrl;
  const canSave = !!form.name.trim() && !!form.description.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.id) && (editing || !!form.imageKey);

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

  const save = async () => {
    setError(null);
    try {
      await content.saveCategory.mutateAsync({ editing, draft: form });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save that category.");
    }
  };

  return (
    <AdminGate title={editing ? "Edit category" : "New category"}>
      <Screen title={editing ? "Edit category" : "New category"} scroll={false}>
        {!ready ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <TouchableOpacity onPress={choosePhoto} activeOpacity={0.85} style={styles.heroWrap}>
                <ImageBackground
                  source={shown ? { uri: shown } : undefined}
                  style={[styles.hero, { backgroundColor: form.color }]}
                  imageStyle={styles.heroImage}
                >
                  <LinearGradient colors={[withAlpha(form.color, 0.15), withAlpha(form.color, 0.88)]} style={StyleSheet.absoluteFill} />
                  <Ionicons name={form.icon as React.ComponentProps<typeof Ionicons>["name"]} size={26} color="#FFFFFF" />
                  <Text style={styles.heroName}>{form.name || "Category name"}</Text>
                  <Text style={styles.heroHint}>{uploading ? "Uploading…" : "Tap to choose a photo"}</Text>
                </ImageBackground>
              </TouchableOpacity>

              <Field label="Name" palette={palette}>
                <TextInput
                  value={form.name}
                  onChangeText={(name) =>
                    setForm((current) => ({ ...current, name, id: editing || idTouched ? current.id : slugify(name) }))
                  }
                  placeholder="Calm"
                  placeholderTextColor={palette.textMuted}
                  style={inputStyle(palette)}
                />
              </Field>
              {!editing && (
                <Field label="Id" palette={palette}>
                  <TextInput
                    value={form.id}
                    autoCapitalize="none"
                    onChangeText={(value) => {
                      setIdTouched(true);
                      setForm((current) => ({ ...current, id: slugify(value) }));
                    }}
                    placeholder="calm"
                    placeholderTextColor={palette.textMuted}
                    style={inputStyle(palette)}
                  />
                </Field>
              )}
              <Field label="Description" palette={palette}>
                <TextInput
                  value={form.description}
                  onChangeText={(description) => setForm((current) => ({ ...current, description }))}
                  placeholder="What this collection is for"
                  placeholderTextColor={palette.textMuted}
                  style={inputStyle(palette)}
                />
              </Field>
              <Text style={[styles.label, { color: palette.textMuted }]}>Icon</Text>
              <View style={styles.chips}>
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setForm((current) => ({ ...current, icon }))}
                    style={[styles.iconChip, { backgroundColor: form.icon === icon ? palette.accent : palette.surface, borderColor: palette.border }]}
                  >
                    <Ionicons name={icon} size={18} color={form.icon === icon ? "#FFFFFF" : palette.text} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: palette.textMuted }]}>Color</Text>
              <View style={styles.chips}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setForm((current) => ({ ...current, color }))}
                    style={[styles.swatch, { backgroundColor: color }, form.color === color && styles.swatchOn]}
                  />
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: palette.text }]}>Premium pack</Text>
                <Toggle value={form.isPremium} onValueChange={(isPremium) => setForm((current) => ({ ...current, isPremium }))} />
              </View>
              {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
            </ScrollView>
            <PrimaryButton
              title={editing ? "Save category" : "Add category"}
              onPress={save}
              disabled={!canSave || uploading}
              loading={content.saveCategory.isPending}
              style={styles.save}
            />
          </>
        )}
      </Screen>
    </AdminGate>
  );
}

function Field({ label, children, palette }: { label: string; children: React.ReactNode; palette: ReturnType<typeof usePalette> }) {
  return (
    <View>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      {children}
    </View>
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
  form: { paddingBottom: 24, gap: 12 },
  heroWrap: { marginBottom: 4 },
  hero: { height: 160, borderRadius: Radius.lg, padding: 16, justifyContent: "flex-end", overflow: "hidden" },
  heroImage: { borderRadius: Radius.lg },
  heroName: { color: "#FFFFFF", fontSize: 20, fontFamily: Fonts.semibold, marginTop: 8 },
  heroHint: { color: "rgba(255,255,255,0.86)", fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  label: { fontSize: 12, fontFamily: Fonts.semibold, marginBottom: 6, marginLeft: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconChip: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  swatchOn: { borderWidth: 3, borderColor: "#FFFFFF" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  switchLabel: { fontSize: 15, fontFamily: Fonts.medium },
  error: { fontSize: 13, fontFamily: Fonts.medium },
  save: { marginBottom: 8 },
});
