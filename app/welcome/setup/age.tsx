import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AgeSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedAge, setSelectedAge] = useState("");

  const ageRanges = [
    { id: "13-17", label: "13-17", icon: "school" },
    { id: "18-24", label: "18-24", icon: "person" },
    { id: "25-34", label: "25-34", icon: "briefcase" },
    { id: "35-44", label: "35-44", icon: "home" },
    { id: "45-54", label: "45-54", icon: "medal" },
    { id: "55-64", label: "55-64", icon: "library" },
    { id: "65+", label: "65+", icon: "flower" },
  ];

  const handleNext = async () => {
    if (!selectedAge) return;

    try {
      await AsyncStorage.setItem("setup-age", selectedAge);
      router.push("/welcome/setup/frequency");
    } catch (error) {
      console.error("Error saving age:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View>
            <Text
              style={{
                color: Colors[colorScheme ?? "light"].text,
                opacity: 0.6,
              }}
            >
              3 of 4
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          {/* Question */}
          <View style={styles.questionBlock}>
            <Text
              style={[
                styles.title,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              How old are you?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              We ll customize affirmations for your life stage
            </Text>
          </View>

          {/* Age Options */}
          <View style={styles.optionsList}>
            {ageRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                onPress={() => setSelectedAge(range.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      selectedAge === range.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                        : Colors[colorScheme ?? "light"].background,
                    borderColor:
                      selectedAge === range.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text + "30",
                  },
                ]}
              >
                <Ionicons
                  name={range.icon as any}
                  size={24}
                  color={
                    selectedAge === range.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "60"
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        selectedAge === range.id
                          ? Colors[colorScheme ?? "light"].tabIconSelected
                          : Colors[colorScheme ?? "light"].text,
                      fontWeight: selectedAge === range.id ? "600" : "400",
                    },
                  ]}
                >
                  {range.label}
                </Text>

                {selectedAge === range.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors[colorScheme ?? "light"].tabIconSelected}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextButton,
              {
                backgroundColor: selectedAge
                  ? Colors[colorScheme ?? "light"].tabIconSelected
                  : Colors[colorScheme ?? "light"].tabIconSelected + "40",
              },
            ]}
            disabled={!selectedAge}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color: Colors[colorScheme ?? "light"].background,
                },
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    position: "relative",
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 32,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },
  backButton: {
    zIndex: 1,
  },
  content: {
    alignItems: "center",
    paddingTop: 40,
    gap: 32,
  },
  questionBlock: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    opacity: 0.7,
  },
  optionsList: {
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  nextButton: {
    paddingVertical: 16,
    marginTop: 24,
    width: "100%",
    borderRadius: 16,
  },
  nextButtonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
