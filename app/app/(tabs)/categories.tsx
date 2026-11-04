import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCategoryStore } from "@/stores/categoryStore";
import { useIsPremium } from "@/stores/premiumStore";
import { CategoryInfo } from "@/constants/Affirmations";
import { useCategories } from "@/hooks/useApi";
import { Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

export default function CategoriesScreen() {
  const router = useRouter();
  const palette = usePalette();
  const isPremium = useIsPremium();
  const { categories } = useCategories();
  const { selectedCategory, setSelectedCategory } = useCategoryStore();

  const isLocked = (c: CategoryInfo) => !!c.isPremium && !isPremium;

  const handleCategoryPress = (category: CategoryInfo) => {
    if (isLocked(category)) {
      router.push("/paywall");
      return;
    }
    setSelectedCategory(category.id);
    router.push("/(tabs)");
  };

  const free = categories.filter((c) => !c.isPremium);
  const packs = categories.filter((c) => c.isPremium);

  const renderGrid = (items: CategoryInfo[]) => (
    <View style={styles.grid}>
      {items.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          selected={selectedCategory === category.id}
          locked={isLocked(category)}
          onPress={() => handleCategoryPress(category)}
        />
      ))}
    </View>
  );

  return (
    <Screen title="Categories">
      <Text style={[styles.intro, { color: palette.textMuted }]}>
        Pick what you want to focus on today.
      </Text>

      {renderGrid(free)}

      {packs.length > 0 && (
        <>
          <SectionLabel>{isPremium ? "Premium packs" : "Premium packs · unlock with Premium"}</SectionLabel>
          {renderGrid(packs)}
        </>
      )}
    </Screen>
  );
}

function CategoryCard({
  category,
  selected,
  locked,
  onPress,
}: {
  category: CategoryInfo;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();
  const icon = category.icon as React.ComponentProps<typeof Ionicons>["name"];

  const body = (
    <>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: selected
              ? "rgba(255,255,255,0.22)"
              : palette.accentSoft,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={selected ? "#FFFFFF" : palette.accent}
        />
      </View>
      <Text
        style={[styles.name, { color: selected ? "#FFFFFF" : palette.text }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
      <Text
        style={[
          styles.description,
          { color: selected ? "rgba(255,255,255,0.8)" : palette.textMuted },
        ]}
        numberOfLines={2}
      >
        {category.description}
      </Text>
      {selected && (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={13} color={palette.accent} />
        </View>
      )}
      {locked && (
        <View style={[styles.check, { backgroundColor: palette.accentSoft }]}>
          <Ionicons name="lock-closed" size={11} color={palette.accent} />
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cell}>
      {selected ? (
        <LinearGradient
          colors={palette.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {body}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          {body}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 18,
    marginLeft: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  cell: {
    width: "48.5%",
  },
  card: {
    height: 156,
    borderRadius: Radius.lg,
    padding: 16,
    justifyContent: "flex-end",
  },
  iconCircle: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
  },
  check: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
