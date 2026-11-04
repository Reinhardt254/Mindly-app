import { CATEGORIES } from "@/constants/Affirmations";
import { Affirmation } from "@/constants/UserTypes";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AffirmationCardProps {
  affirmation: Affirmation;
  onSwipe?: (direction: "left" | "right") => void;
  isActive?: boolean;
}

export const AffirmationCard: React.FC<AffirmationCardProps> = ({
  affirmation,
  onSwipe,
  isActive = true,
}) => {
  const handleSwipe = (direction: "left" | "right") => {
    onSwipe?.(direction);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {CATEGORIES[affirmation.category]}
            </ThemedText>
          </View>
        </View>

        {/* Affirmation Text */}
        <View style={styles.card}>
          <ThemedText style={styles.cardText}>
            &quot;{affirmation.text}&quot;
          </ThemedText>
        </View>

        {/* Swipe Instructions */}
        {isActive && (
          <View style={styles.instructions}>
            <TouchableOpacity
              onPress={() => handleSwipe("left")}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.hintText}>Swipe up for more</ThemedText>

            <TouchableOpacity
              onPress={() => handleSwipe("right")}
              style={styles.saveButton}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.saveText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  content: {
    width: "100%",
    maxWidth: 384,
  },
  badgeWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  badgeText: {
    color: "#2563eb",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  instructions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 16,
  },
  skipButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  skipText: {
    color: "#dc2626",
    fontWeight: "500",
  },
  hintText: {
    color: "#6b7280",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  saveText: {
    color: "#16a34a",
    fontWeight: "500",
  },
});
