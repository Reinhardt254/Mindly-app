import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useStatsStore } from "@/stores/statsStore";
import { Popup } from "@/components/Popup";
import { SimpleHeader } from "@/components/ModernHeader";

interface FavoriteAffirmation {
  id: string;
  text: string;
  category: string;
  likedAt: number;
}

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const { activityLog } = useStatsStore();
  const [favorites, setFavorites] = useState<FavoriteAffirmation[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });

  // Extract liked affirmations from activity log
  React.useEffect(() => {
    const likedActivities = activityLog.filter(
      (activity) => activity.type === "affirmation_liked"
    );

    const favoriteItems: FavoriteAffirmation[] = likedActivities.map(
      (activity) => ({
        id: activity.id,
        text: activity.affirmationText || "Unknown affirmation",
        category: activity.affirmationCategory || "General",
        likedAt: activity.timestamp,
      })
    );

    setFavorites(favoriteItems);
  }, [activityLog]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const showPopup = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[]
  ) => {
    setPopupConfig({ title, message, buttons });
    setIsPopupVisible(true);
  };

  const handleRemoveFavorite = (id: string) => {
    showPopup(
      "Remove Favorite",
      "Are you sure you want to remove this affirmation from your favorites?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            setFavorites((prev) => prev.filter((fav) => fav.id !== id));
            showPopup("Removed", "Affirmation removed from favorites", [
              { text: "OK", onPress: () => {} },
            ]);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
    >
      {/* Simple Header */}
      <SimpleHeader title="Favorites" />

      {/* Content */}
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="heart-outline"
              size={64}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
              style={styles.emptyIcon}
            />
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              No Favorites Yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                {
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
            >
              Start liking affirmations to see them here
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View
              key={favorite.id}
              style={[
                styles.favoriteItem,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderBottomColor: Colors[colorScheme ?? "light"].tint,
                },
              ]}
            >
              <View style={styles.favoriteRow}>
                <View style={styles.favoriteTextContainer}>
                  <Text
                    style={[
                      styles.favoriteText,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    {favorite.text}
                  </Text>
                  <Text
                    style={[
                      styles.favoriteDate,
                      {
                        color: Colors[colorScheme ?? "light"].tabIconDefault,
                      },
                    ]}
                  >
                    {formatDate(favorite.likedAt)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleRemoveFavorite(favorite.id)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={Colors[colorScheme ?? "light"].highlight}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Popup */}
      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20,
  },
  favoriteItem: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  favoriteTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  favoriteText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  favoriteDate: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
});
