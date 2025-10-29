import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      {/* Simple Header */}
      <SimpleHeader title="Favorites" />

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        {favorites.length === 0 ? (
          <View
            className="items-center justify-center flex-1"
            style={{
              paddingVertical: 60,
            }}
          >
            <Ionicons
              name="heart-outline"
              size={64}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
              style={{ marginBottom: 16 }}
            />
            <Text
              className="text-lg font-semibold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                marginBottom: 8,
              }}
            >
              No Favorites Yet
            </Text>
            <Text
              className="text-center"
              style={{
                color: Colors[colorScheme ?? "light"].tabIconDefault,
                lineHeight: 20,
              }}
            >
              Start liking affirmations to see them here
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View
              key={favorite.id}
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
                paddingVertical: 16,
                paddingHorizontal: 0,
                borderBottomWidth: 1,
                borderBottomColor: Colors[colorScheme ?? "light"].tint,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1" style={{ marginRight: 16 }}>
                  <Text
                    className="text-base leading-6"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      marginBottom: 8,
                    }}
                  >
                    {favorite.text}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: Colors[colorScheme ?? "light"].tabIconDefault,
                    }}
                  >
                    {formatDate(favorite.likedAt)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleRemoveFavorite(favorite.id)}
                  style={{
                    padding: 8,
                  }}
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

      {/* Bottom indicator */}
      {/* <View
        style={{
          height: 1,
          backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      /> */}

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
