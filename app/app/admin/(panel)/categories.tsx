import React, { useState } from "react";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { Popup } from "@/components/Popup";
import { EmptyState, Screen } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { AdminCategory, useAdminCategories, useAdminContentMutations, useMe } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { withAlpha } from "@/lib/color";

export default function AdminCategoriesScreen() {
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const categories = useAdminCategories(me.data?.role === "ADMIN");
  const content = useAdminContentMutations();
  const [pending, setPending] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!pending) return;
    setError(null);
    try {
      await content.deleteCategory.mutateAsync(pending.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't delete that category.");
    }
  };

  return (
    <AdminGate title="Categories">
      <Screen
        title="Categories"
        right={
          <TouchableOpacity onPress={() => router.push("/admin/category" as Href)} hitSlop={8}>
            <Ionicons name="add-circle" size={28} color={palette.accent} />
          </TouchableOpacity>
        }
      >
        {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
        {categories.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 24 }} />
        ) : (categories.data ?? []).length === 0 ? (
          <EmptyState icon="albums-outline" title="No categories" subtitle="Add a category with a cover photo." />
        ) : (
          <View style={styles.grid}>
            {(categories.data ?? []).map((category) => (
              <View key={category.id} style={styles.cell}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: "/admin/category", params: { id: category.id } } as Href)}
                >
                  <ImageBackground
                    source={category.imageUrl ? { uri: category.imageUrl } : undefined}
                    style={[styles.card, !category.imageUrl && { backgroundColor: category.color }]}
                    imageStyle={styles.cardImage}
                  >
                    <LinearGradient
                      colors={[withAlpha(category.color, 0.15), withAlpha(category.color, 0.88)]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name={category.icon as React.ComponentProps<typeof Ionicons>["name"]} size={22} color="#FFFFFF" />
                    <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
                    <Text style={styles.meta}>{category.count} affirmations{category.isPremium ? " · Premium" : ""}</Text>
                  </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPending(category)} style={styles.delete} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <Popup
          visible={!!pending}
          title="Delete category"
          message={
            pending && pending.count > 0
              ? `${pending.name} still has affirmations. Delete those first.`
              : `Delete ${pending?.name ?? "this category"}? This cannot be undone.`
          }
          buttons={
            pending && pending.count > 0
              ? [{ text: "OK", onPress: () => {} }]
              : [
                  { text: "Cancel", onPress: () => {}, style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: remove },
                ]
          }
          onClose={() => setPending(null)}
        />
      </Screen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, fontFamily: Fonts.medium, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  cell: { width: "48.5%" },
  card: { height: 148, borderRadius: Radius.lg, padding: 14, justifyContent: "flex-end", overflow: "hidden" },
  cardImage: { borderRadius: Radius.lg },
  name: { color: "#FFFFFF", fontSize: 15, fontFamily: Fonts.semibold, marginTop: 8 },
  meta: { color: "rgba(255,255,255,0.86)", fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  delete: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
