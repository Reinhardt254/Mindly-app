import { useGreeting } from "@/hooks/useGreeting";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface HeaderProps {
  userName: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onProfilePress,
  onNotificationPress,
}) => {
  const greeting = useGreeting(userName);

  return (
    <ThemedView style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingWrapper}>
        <ThemedText type="subtitle" style={styles.greeting}>
          {greeting}
        </ThemedText>
      </View>

      {/* Icons */}
      <View style={styles.icons}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <View style={styles.bellWrapper}>
            <ThemedText style={styles.bellText}>🔔</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity
          onPress={onProfilePress}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  greetingWrapper: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bellWrapper: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bellText: {
    fontSize: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: "#3b82f6",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
