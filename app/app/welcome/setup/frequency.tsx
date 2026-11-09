import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GradientBackground } from "@/components/GradientBackground";
import { OnboardingNextButton } from "@/components/OnboardingNextButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Popup } from "@/components/Popup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/UserTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";

export default function FrequencySetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(
    null
  );
  const [startHour, setStartHour] = useState<number>(8); // Default 8 AM
  const [endHour, setEndHour] = useState<number>(20); // Default 8 PM
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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
  const { saveUserProfile } = useLocalStorage();

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

  const frequencyOptions = [
    {
      value: 1,
      label: "Once a day",
      description: "Perfect for beginners",
      icon: "sunny",
    },
    {
      value: 2,
      label: "2 times a day",
      description: "Morning and evening",
      icon: "partly-sunny",
    },
    {
      value: 3,
      label: "3 times a day",
      description: "Build a strong habit",
      icon: "sunny-outline",
    },
    {
      value: 4,
      label: "4 times a day",
      description: "Regular reminders",
      icon: "time",
    },
    {
      value: 5,
      label: "5 times a day",
      description: "Maximum positivity",
      icon: "star",
    },
  ];

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const createDateFromHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      const hour = selectedDate.getHours();
      setStartHour(hour);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      const hour = selectedDate.getHours();
      setEndHour(hour);
    }
  };

  const handleComplete = async () => {
    if (selectedFrequency === null) return;

    // Validate time range
    if (startHour >= endHour) {
      showPopup("Invalid Time Range", "End time must be after start time", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    try {
      // Get all setup data
      const name = await AsyncStorage.getItem("setup-name");
      const gender = await AsyncStorage.getItem("setup-gender");
      const age = await AsyncStorage.getItem("setup-age");

      // Create user profile
      const profile: UserProfile = {
        name: name || "User",
        ageRange: (age as UserProfile["ageRange"]) || "25-34",
        gender: (gender as UserProfile["gender"]) || "prefer-not-to-say",
        affirmationFrequency: selectedFrequency,
        reminderStartHour: startHour,
        reminderEndHour: endHour,
        isFirstTime: false,
        dailyAffirmationsShown: 0,
      };

      // Save profile
      await saveUserProfile(profile);

      // Request notification permissions and schedule notifications
      try {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission) {
          await notificationService.scheduleAffirmationNotifications({
            frequency: selectedFrequency,
            startHour,
            endHour,
          });
          console.log("✅ Notifications scheduled successfully");
        } else {
          showPopup(
            "Notifications Disabled",
            "You can enable notifications later in Settings to receive affirmation reminders.",
            [{ text: "OK", onPress: () => {} }]
          );
        }
      } catch (notificationError) {
        console.error("Error setting up notifications:", notificationError);
        // Continue anyway - notifications are not critical
      }

      // Clean up setup data
      await AsyncStorage.multiRemove([
        "setup-name",
        "setup-gender",
        "setup-age",
      ]);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error completing setup:", error);
      showPopup("Error", "Failed to complete setup. Please try again.", [
        { text: "OK", onPress: () => {} },
      ]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.flex}>
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
                4 of 4
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
                Set up your reminders
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
              >
                Choose how often and when you&apos;d like to receive
                affirmations
              </Text>
            </View>

            {/* Frequency Options */}
            <View style={styles.fullWidth}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
              >
                How many times per day?
              </Text>
              <View style={styles.optionsList}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedFrequency(option.value)}
                    style={[
                      styles.option,
                      {
                        backgroundColor:
                          selectedFrequency === option.value
                            ? Colors[colorScheme ?? "light"].tabIconSelected +
                              "20"
                            : Colors[colorScheme ?? "light"].background,
                        borderColor:
                          selectedFrequency === option.value
                            ? Colors[colorScheme ?? "light"].tabIconSelected
                            : Colors[colorScheme ?? "light"].text + "20",
                      },
                    ]}
                  >
                    <View style={styles.optionRow}>
                      <Ionicons
                        name={option.icon as any}
                        size={28}
                        color={
                          selectedFrequency === option.value
                            ? Colors[colorScheme ?? "light"].tabIconSelected
                            : Colors[colorScheme ?? "light"].text + "60"
                        }
                      />
                      <View style={styles.optionTextBlock}>
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color:
                                selectedFrequency === option.value
                                  ? Colors[colorScheme ?? "light"]
                                      .tabIconSelected
                                  : Colors[colorScheme ?? "light"].text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.optionDescription,
                            {
                              color:
                                selectedFrequency === option.value
                                  ? Colors[colorScheme ?? "light"]
                                      .tabIconSelected + "80"
                                  : Colors[colorScheme ?? "light"].text + "60",
                            },
                          ]}
                        >
                          {option.description}
                        </Text>
                      </View>

                      {selectedFrequency === option.value && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors[colorScheme ?? "light"].tabIconSelected}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Range Selection */}
            <View style={styles.timeSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                  },
                ]}
              >
                Active hours
              </Text>

              <View style={styles.timeRow}>
                {/* Start Time */}
                <View style={styles.flex}>
                  <Text
                    style={[
                      styles.timeLabel,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    From
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor:
                          Colors[colorScheme ?? "light"].background,
                        borderColor: Colors[colorScheme ?? "light"].text + "20",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: Colors[colorScheme ?? "light"].text,
                        fontSize: 16,
                      }}
                    >
                      {formatHour(startHour)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                    />
                  </TouchableOpacity>
                </View>

                {/* End Time */}
                <View style={styles.flex}>
                  <Text
                    style={[
                      styles.timeLabel,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    To
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor:
                          Colors[colorScheme ?? "light"].background,
                        borderColor: Colors[colorScheme ?? "light"].text + "20",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: Colors[colorScheme ?? "light"].text,
                        fontSize: 16,
                      }}
                    >
                      {formatHour(endHour)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors[colorScheme ?? "light"].text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Time Pickers */}
              {showStartPicker && (
                <DateTimePicker
                  value={createDateFromHour(startHour)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onStartTimeChange}
                  textColor={Colors[colorScheme ?? "light"].text}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={createDateFromHour(endHour)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onEndTimeChange}
                  textColor={Colors[colorScheme ?? "light"].text}
                />
              )}

              {/* Info Text */}
              {selectedFrequency && startHour < endHour && (
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor:
                        Colors[colorScheme ?? "light"].tabIconSelected + "10",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    You&apos;ll receive {selectedFrequency} reminder
                    {selectedFrequency > 1 ? "s" : ""} between{" "}
                    {formatHour(startHour)} and {formatHour(endHour)}
                  </Text>
                  <Text
                    style={[
                      styles.infoSubtext,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    (Every{" "}
                    {Math.floor((endHour - startHour) / selectedFrequency)}{" "}
                    hours approximately)
                  </Text>
                </View>
              )}
            </View>

            <OnboardingNextButton
              label="Complete Setup"
              ready={selectedFrequency !== null && startHour < endHour}
              onPress={handleComplete}
              style={styles.completeButton}
            />
          </View>
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  fullWidth: {
    width: "100%",
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
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  optionsList: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 8,
  },
  option: {
    width: "100%",
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  timeSection: {
    width: "100%",
    marginTop: 24,
  },
  timeRow: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
  },
  timeLabel: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBox: {
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
  infoSubtext: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
  completeButton: {
    marginBottom: 40,
  },
});
