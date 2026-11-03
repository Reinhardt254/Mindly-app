import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { SimpleHeader } from "@/components/ModernHeader";
import { useCategoryStore } from "@/stores/categoryStore";
import { CATEGORIES, AffirmationCategory } from "@/constants/Affirmations";

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { selectedCategory, setSelectedCategory } = useCategoryStore();

  const handleCategoryPress = (categoryId: AffirmationCategory) => {
    setSelectedCategory(categoryId);
    // Navigate back to home to see filtered affirmations
    router.push("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      {/* Header */}
      <SimpleHeader title="Categories" />

      <ScrollView style={styles.scrollView}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text
            style={[
              styles.descriptionText,
              {
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
          >
            Choose a category to filter affirmations
          </Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected
                      ? Colors[colorScheme ?? "light"].highlight + "20"
                      : Colors[colorScheme ?? "light"].background,
                    borderColor: isSelected
                      ? Colors[colorScheme ?? "light"].text + "20"
                      : Colors[colorScheme ?? "light"].text + "30",
                  },
                ]}
              >
                {/* Category Content */}
                <View style={styles.categoryContent}>
                  {/* Icon Container */}
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: category.color + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={32}
                      color={category.color}
                    />
                  </View>

                  {/* Category Name */}
                  <Text
                    style={[
                      styles.categoryName,
                      {
                        color: isSelected
                          ? category.color
                          : Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>

                  {/* Description */}
                  <Text
                    style={[
                      styles.categoryDescription,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    {category.description}
                  </Text>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={category.color}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Selection Info */}
        <View
          style={[
            styles.selectionInfo,
            {
              backgroundColor:
                Colors[colorScheme ?? "light"].tabIconSelected + "10",
            },
          ]}
        >
          <View style={styles.selectionRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors[colorScheme ?? "light"].tabIconSelected}
            />
            <Text
              style={[
                styles.selectionText,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              Currently showing:{" "}
              <Text style={styles.selectionName}>
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </Text>
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
  },
  grid: {
    width: "100%",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 180,
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryContent: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
  selectedIndicator: {
    marginTop: 8,
  },
  selectionInfo: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  selectionName: {
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});
