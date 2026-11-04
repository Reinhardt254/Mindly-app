import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleGetStarted = () => {
    router.push("/welcome/setup/name");
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Welcome Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons
              name="heart-circle"
              size={120}
              color={Colors[colorScheme ?? "light"].tabIconSelected}
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.textBlock}>
            <Text
              style={[
                styles.title,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              Welcome to Your Journey
            </Text>

            <Text
              style={[
                styles.description,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              Discover daily affirmations tailored just for you. Transform your
              mindset, one positive thought at a time.
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleGetStarted}
            style={[
              styles.button,
              {
                backgroundColor: Colors[colorScheme ?? "light"].tabIconSelected,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: Colors[colorScheme ?? "light"].background,
                },
              ]}
            >
              Get Started
            </Text>
          </TouchableOpacity>

          {/* Subtitle */}
          <Text
            style={[
              styles.subtitle,
              {
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
          >
            Just a few questions to personalize your experience
          </Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    gap: 32,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  textBlock: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 28,
    opacity: 0.8,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 48,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
    marginTop: 16,
  },
});
