import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Popup } from "@/components/Popup";
import { EmptyState, Screen } from "@/components/ui/Kit";
import { findCategory } from "@/constants/Affirmations";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { Affirmation } from "@/constants/UserTypes";
import { useCategories, useFavorites, useToggleFavorite } from "@/hooks/useApi";

export default function FavoritesScreen() {
  const palette = usePalette();
  const favorites = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { categories } = useCategories();
  const [pendingRemoval, setPendingRemoval] = useState<Affirmation | null>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const items = favorites.data ?? [];

  return (
    <Screen title="Favorites">
      {favorites.isLoading ? (
        <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No favorites yet"
          subtitle="Tap the heart on any affirmation and it will show up here."
        />
      ) : (
        <View style={styles.list}>
          {items.map((favorite) => (
            <View
              key={favorite.id}
              style={[
                styles.card,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.quote, { color: palette.text }]}>
                {favorite.text}
              </Text>
              <View style={styles.footer}>
                <View
                  style={[styles.chip, { backgroundColor: palette.accentSoft }]}
                >
                  <Text style={[styles.chipText, { color: palette.accent }]}>
                    {findCategory(favorite.category, categories)?.name ?? favorite.category}
                  </Text>
                </View>
                <Text style={[styles.date, { color: palette.textMuted }]}>
                  {formatDate(favorite.favoritedAt)}
                </Text>
                <TouchableOpacity
                  onPress={() => setPendingRemoval(favorite)}
                  hitSlop={10}
                >
                  <Ionicons name="heart" size={20} color={palette.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Popup
        visible={!!pendingRemoval}
        title="Remove favorite"
        message="Remove this affirmation from your favorites?"
        buttons={[
          { text: "Cancel", onPress: () => {}, style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () =>
              pendingRemoval &&
              toggleFavorite.mutate({ affirmation: pendingRemoval, favorite: false }),
          },
        ]}
        onClose={() => setPendingRemoval(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  quote: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: Fonts.semibold,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
  date: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
});
