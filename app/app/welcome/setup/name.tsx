import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { OnboardingNextButton } from "@/components/OnboardingNextButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NameSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      // Save name to storage
      await AsyncStorage.setItem("setup-name", name.trim());
      router.push("/welcome/setup/gender");
    } catch (error) {
      console.error("Error saving name:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                1 of 4
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
                What do we call you?
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
              >
                We ll use this to personalize your affirmations
              </Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputBlock}>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError("");
                }}
                placeholder="Enter your name"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "60"
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                    borderColor: error
                      ? "#EF4444"
                      : Colors[colorScheme ?? "light"].text + "20",
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <OnboardingNextButton ready={!!name.trim()} onPress={handleNext} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    position: "relative",
    justifyContent: "flex-start",
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 40,
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
  inputBlock: {
    width: "100%",
    gap: 8,
  },
  input: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 18,
    marginTop: 0,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginLeft: 8,
  },
});
