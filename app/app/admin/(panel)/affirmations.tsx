import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { Popup } from "@/components/Popup";
import { Card, EmptyState, Screen } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { AdminAffirmation, useAdminAffirmations, useAdminContentMutations, useMe } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";

export default function AdminAffirmationsScreen() {
  const palette = usePalette();
  const router = useRouter();
  const me = useMe();
  const affirmations = useAdminAffirmations(me.data?.role === "ADMIN");
  const content = useAdminContentMutations();
  const [pending, setPending] = useState<AdminAffirmation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const items = affirmations.data ?? [];

  const remove = async () => {
    if (!pending) return;
    setError(null);
    try {
      await content.deleteAffirmation.mutateAsync(pending.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't delete that affirmation.");
    }
  };

  return (
    <AdminGate title="Affirmations">
      <Screen
        title="Affirmations"
        right={
          <TouchableOpacity onPress={() => router.push("/admin/affirmation" as Href)} hitSlop={8}>
            <Ionicons name="add-circle" size={28} color={palette.accent} />
          </TouchableOpacity>
        }
      >
        {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}
        {affirmations.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 24 }} />
        ) : items.length === 0 ? (
          <EmptyState icon="chatbubble-ellipses-outline" title="No affirmations" subtitle="Add one with a photo for its card." />
        ) : (
          <Card>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push({ pathname: "/admin/affirmation", params: { id: item.id } } as Href)}
                style={[
                  styles.row,
                  index < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
                ]}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: palette.accentSoft }]}>
                    <Ionicons name="image-outline" size={18} color={palette.accent} />
                  </View>
                )}
                <View style={styles.flex}>
                  <Text style={[styles.text, { color: palette.text }]} numberOfLines={2}>{item.text}</Text>
                  <Text style={[styles.meta, { color: palette.textMuted }]}>
                    {item.categoryId}
                    {item.isPremium ? " · Premium" : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setPending(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={palette.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </Card>
        )}
        <Popup
          visible={!!pending}
          title="Delete affirmation"
          message="This removes it for everyone, including people who saved it."
          buttons={[
            { text: "Cancel", onPress: () => {}, style: "cancel" },
            { text: "Delete", style: "destructive", onPress: remove },
          ]}
          onClose={() => setPending(null)}
        />
      </Screen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, fontFamily: Fonts.medium, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  thumb: { width: 52, height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  text: { fontSize: 14, lineHeight: 19, fontFamily: Fonts.medium },
  meta: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 3 },
});
