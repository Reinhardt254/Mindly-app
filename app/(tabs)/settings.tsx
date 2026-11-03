import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { SimpleHeader } from "@/components/ModernHeader";
import { Popup } from "@/components/Popup";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
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
  const { setThemeMode, isDark } = useTheme();
  const { userProfile } = useLocalStorage();
  const colorScheme = useColorScheme();
  const router = useRouter();

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

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setIsCheckingPermissions(true);
    try {
      const enabled = await notificationService.areNotificationsEnabled();
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error("Error checking notification status:", error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleThemeToggle = async (value: boolean) => {
    const newMode = value ? "dark" : "light";
    await setThemeMode(newMode);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // Enable notifications
      try {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission && userProfile) {
          await notificationService.scheduleAffirmationNotifications({
            frequency: userProfile.affirmationFrequency,
            startHour: userProfile.reminderStartHour || 8,
            endHour: userProfile.reminderEndHour || 20,
          });
          setNotificationsEnabled(true);
          showPopup(
            "Notifications Enabled! 🔔",
            `You'll receive ${userProfile.affirmationFrequency} affirmation reminder${
              userProfile.affirmationFrequency > 1 ? "s" : ""
            } per day.`,
            [{ text: "Great!", onPress: () => {} }]
          );
        } else {
          showPopup(
            "Permission Denied",
            "Please enable notifications in your device settings to receive affirmation reminders.",
            [
              { text: "Cancel", onPress: () => {}, style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  // This would open device settings in a real app
                  console.log("Open device settings");
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        showPopup(
          "Error",
          "Failed to enable notifications. Please try again.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    } else {
      // Disable notifications
      try {
        await notificationService.cancelAllNotifications();
        setNotificationsEnabled(false);
        showPopup(
          "Notifications Disabled",
          "You won't receive any more affirmation reminders.",
          [{ text: "OK", onPress: () => {} }]
        );
      } catch (error) {
        console.error("Error disabling notifications:", error);
        showPopup(
          "Error",
          "Failed to disable notifications. Please try again.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    }
  };

  const theme = Colors[colorScheme ?? "light"];
  const cardShadow =
    colorScheme === "dark"
      ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
      : "0 0 10px 0 rgba(0, 0, 0, 0.1)";
  const cardColors = {
    backgroundColor: theme.background,
    borderColor: theme.tabIconSelected,
    boxShadow: cardShadow,
  };
  const switchTrackColor = {
    false: "#767577",
    true: theme.highlight,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Simple Header */}
      <SimpleHeader title="Settings" />

      <ScrollView style={styles.scrollView}>
        {/* Notifications */}
        <View style={styles.notificationsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notifications
          </Text>

          <View style={[styles.card, cardColors]}>
            <View style={styles.row}>
              <View style={styles.rowLeftFlex}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={theme.highlight}
                />
                <View style={styles.notificationTextContainer}>
                  <Text style={[styles.rowLabelPlain, { color: theme.text }]}>
                    Affirmation Reminders
                  </Text>
                  {userProfile && notificationsEnabled && (
                    <Text
                      style={[styles.notificationSubtext, { color: theme.text }]}
                    >
                      {userProfile.affirmationFrequency}x daily,{" "}
                      {userProfile.reminderStartHour || 8}:00 -{" "}
                      {userProfile.reminderEndHour || 20}:00
                    </Text>
                  )}
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={switchTrackColor}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
                disabled={isCheckingPermissions}
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.card, styles.cardSpaced, cardColors]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Appearance
          </Text>

          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="moon" size={24} color={theme.highlight} />
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={switchTrackColor}
                thumbColor={isDark ? "#ffffff" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/theme")}
              style={styles.row}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="color-palette"
                  size={24}
                  color={theme.highlight}
                />
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Customize Background
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Interaction */}
        <View style={[styles.card, styles.cardSpaced, cardColors]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Interaction
          </Text>

          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name="phone-portrait"
                  size={24}
                  color={theme.highlight}
                />
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Haptic Feedback
                </Text>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={switchTrackColor}
                thumbColor={hapticFeedback ? "#ffffff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View style={[styles.card, styles.cardSpaced, cardColors]}>
          <Text style={[styles.sectionTitle, styles.aboutTitle, { color: theme.text }]}>
            About
          </Text>

          <View
            style={[
              styles.aboutList,
              {
                backgroundColor: theme.background,
                borderColor: theme.tabIconSelected,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.card, styles.linkRow, cardColors]}
              onPress={() => router.push("/(tabs)/version")}
            >
              <Ionicons
                name="information-circle"
                size={24}
                color={theme.highlight}
              />
              <Text style={[styles.linkLabel, { color: theme.text }]}>
                Version 1.0.0
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={styles.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.linkRow, cardColors]}
              onPress={() => router.push("/(tabs)/terms-of-service")}
            >
              <Ionicons name="document-text" size={24} color={theme.highlight} />
              <Text style={[styles.linkLabel, { color: theme.text }]}>
                Terms of Service
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={styles.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.linkRow, cardColors]}
              onPress={() => router.push("/(tabs)/privacy-policy")}
            >
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={theme.highlight}
              />
              <Text style={[styles.linkLabel, { color: theme.text }]}>
                Privacy Policy
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={styles.chevron}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[styles.bottomSpacer, { backgroundColor: theme.background }]}
        ></View>
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
    paddingVertical: 0,
  },
  notificationsSection: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 8,
  },
  card: {
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 0,
    marginTop: 0,
  },
  cardSpaced: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "600",
  },
  aboutTitle: {
    paddingLeft: 20,
  },
  sectionBody: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLeftFlex: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowLabel: {
    marginLeft: 16,
    fontSize: 18,
    paddingLeft: 10,
  },
  rowLabelPlain: {
    fontSize: 18,
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: 16,
    paddingLeft: 10,
  },
  notificationSubtext: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.6,
  },
  aboutList: {
    borderWidth: 0,
    borderRadius: 10,
    borderStyle: "solid",
    paddingTop: 10,
    paddingHorizontal: 0,
    margin: 0,
    marginTop: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  linkLabel: {
    marginLeft: 16,
    fontSize: 18,
  },
  chevron: {
    marginLeft: "auto",
  },
  bottomSpacer: {
    flex: 1,
    height: 120,
  },
});
