import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

interface WelcomeCardProps {
  onGetStarted: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onGetStarted }) => {
  const colorScheme = useColorScheme();

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          {/* App Logo/Icon */}
          {/* <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 32, width: 96, height: 96, backgroundColor: "#3b82f6", borderRadius: 9999 }}>
            <Text style={{ fontSize: 36, fontWeight: "700", color: "#fff" }}>✨</Text>
          </View> */}

          {/* Welcome Text */}
          <View style={styles.textBlock}>
            <ThemedText
              style={[styles.title, { fontSize: 45, lineHeight: 50 }]}
              type="title"
            >
              Welcome to Moodly
            </ThemedText>

            <ThemedText style={styles.description}>
              Start your day with positive affirmations tailored just for you.
              Build confidence, gratitude, and inner strength one affirmation at
              a time.
            </ThemedText>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText style={styles.featureText}>
                Personalized daily affirmations
              </ThemedText>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText style={styles.featureText}>
                Track your daily progress
              </ThemedText>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText style={styles.featureText}>
                Beautiful, calming interface
              </ThemedText>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
              <ThemedText style={styles.featureText}>
                Save your favorite affirmations
              </ThemedText>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={onGetStarted}
            style={styles.button}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Get Started</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 32,
  },
  textBlock: {
    alignItems: "center",
    paddingBottom: 8,
    gap: 16,
  },
  title: {
    textAlign: "center",
  },
  description: {
    paddingTop: 16,
    maxWidth: 384,
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
  },
  features: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
    maxWidth: 384,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  checkIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 9999,
  },
  featureText: {
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 32,
    backgroundColor: "#3b82f6",
    borderRadius: 9999,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
