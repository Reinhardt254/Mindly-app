import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStatsStore } from "@/stores/statsStore";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SimpleHeader } from "@/components/ModernHeader";
import { Popup } from "@/components/Popup";

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { userProfile, clearAllData } = useLocalStorage();
  const { resetStats } = useStatsStore();
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

  const handleLogout = () => {
    showPopup(
      "Logout",
      "Are you sure you want to logout? All your data will be cleared.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all data
              await clearAllData();

              // Reset stats
              resetStats();

              // Navigate to welcome screen
              router.replace("/welcome");
            } catch (error) {
              console.error("Error during logout:", error);
              showPopup("Error", "Failed to logout. Please try again.", [
                { text: "OK", onPress: () => {} },
              ]);
            }
          },
        },
      ]
    );
  };

  const theme = Colors[colorScheme ?? "light"];
  const actionShadow =
    colorScheme === "dark"
      ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
      : "0 0 10px 0 rgba(0, 0, 0, 0.1)";

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Simple Header */}
      <SimpleHeader title="Profile" />

      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.05)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[styles.avatar, { backgroundColor: theme.highlight }]}
            >
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {userProfile.name}
            </Text>
            <Text style={styles.memberSince}>Member since today</Text>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                boxShadow:
                  colorScheme === "dark"
                    ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                    : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Profile Information
            </Text>

            <View style={styles.infoList}>
              <View style={[styles.infoRow, styles.infoRowFirst]}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  Age Range
                </Text>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  {userProfile.ageRange}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  Gender
                </Text>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  {userProfile.gender}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  Daily Affirmations
                </Text>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  {userProfile.affirmationFrequency} times
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  Reminder Hours
                </Text>
                <Text style={[styles.infoLabel, { color: theme.text }]}>
                  {userProfile.reminderStartHour || 8}:00 -{" "}
                  {userProfile.reminderEndHour || 20}:00
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View
          style={[
            styles.actionsContainer,
            {
              backgroundColor: theme.background,
              borderColor: theme.tabIconSelected,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/edit-profile")}
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
                boxShadow: actionShadow,
              },
            ]}
          >
            <Ionicons name="person" size={24} color={theme.highlight} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Edit Profile
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
                boxShadow: actionShadow,
              },
            ]}
          >
            <Ionicons name="notifications" size={24} color={theme.highlight} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Notifications
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
                boxShadow: actionShadow,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={theme.highlight}
            />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Privacy
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[
              styles.actionButton,
              {
                borderColor: theme.tabIconSelected,
                boxShadow: actionShadow,
              },
              styles.logoutButton,
            ]}
          >
            <Ionicons name="log-out" size={24} color="red" />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingText: {
    fontSize: 18,
  },
  profileCard: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingVertical: 30,
    paddingHorizontal: 10,
    paddingBottom: 10,
    height: "auto",
    margin: 0,
    marginTop: 0,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 32,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    height: 120,
    width: 120,
    borderRadius: 100,
  },
  userName: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: "700",
  },
  memberSince: {
    marginTop: 8,
    fontSize: 16,
    color: "#9ca3af",
  },
  infoCard: {
    borderRadius: 10,
    padding: 25,
    paddingHorizontal: 15,
  },
  infoTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "600",
  },
  infoList: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 5,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  infoRowFirst: {
    marginVertical: 40,
  },
  infoLabel: {
    fontSize: 20,
  },
  actionsContainer: {
    borderWidth: 0,
    borderRadius: 0,
    borderStyle: "solid",
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 0,
    marginTop: 0,
    boxShadow: "none",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 0,
    marginTop: 0,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
  },
  actionText: {
    marginLeft: 10,
    fontSize: 18,
  },
  chevron: {
    marginLeft: "auto",
  },
});
