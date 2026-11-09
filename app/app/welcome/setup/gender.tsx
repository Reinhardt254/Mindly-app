import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { OnboardingNextButton } from "@/components/OnboardingNextButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GenderSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedGender, setSelectedGender] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem("setup-name");
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error("Error loading name:", error);
    }
  };

  const genderOptions = [
    { id: "male", label: "Male", icon: "person" },
    { id: "female", label: "Female", icon: "person" },
    { id: "non-binary", label: "Non-binary", icon: "person" },
    { id: "prefer-not-to-say", label: "Prefer not to say", icon: "person" },
  ];

  const handleNext = async () => {
    if (!selectedGender) return;

    try {
      await AsyncStorage.setItem("setup-gender", selectedGender);
      router.push("/welcome/setup/age");
    } catch (error) {
      console.error("Error saving gender:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
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
              2 of 4
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
              Which option represents you, {userName}?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              This helps us personalize your experience
            </Text>
          </View>

          {/* Gender Options */}
          <View style={styles.optionsList}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedGender(option.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      selectedGender === option.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                        : Colors[colorScheme ?? "light"].background,
                    borderColor:
                      selectedGender === option.id
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text + "30",
                  },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    selectedGender === option.id
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "60"
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        selectedGender === option.id
                          ? Colors[colorScheme ?? "light"].tabIconSelected
                          : Colors[colorScheme ?? "light"].text,
                      fontWeight: selectedGender === option.id ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>

                {selectedGender === option.id && (
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

          <OnboardingNextButton ready={!!selectedGender} onPress={handleNext} />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
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
    paddingTop: 24,
    gap: 20,
  },
  questionBlock: {
    alignItems: "center",
    gap: 12,
    width: "100%",
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
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
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
    marginLeft: 16,
    fontSize: 18,
  },
});
