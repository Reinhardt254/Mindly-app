import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProfile } from "@/constants/UserTypes";
import { notificationService } from "@/services/notificationService";
import { SimpleHeader } from "@/components/ModernHeader";
import { Popup } from "@/components/Popup";

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { userProfile, saveUserProfile } = useLocalStorage();

  const [name, setName] = useState("");
  const [selectedAge, setSelectedAge] =
    useState<UserProfile["ageRange"]>("25-34");
  const [selectedGender, setSelectedGender] =
    useState<UserProfile["gender"]>("prefer-not-to-say");
  const [selectedFrequency, setSelectedFrequency] = useState<number>(1);
  const [startHour, setStartHour] = useState<number>(8);
  const [endHour, setEndHour] = useState<number>(20);
  const [isSaving, setIsSaving] = useState(false);
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
    if (userProfile) {
      setName(userProfile.name);
      setSelectedAge(userProfile.ageRange);
      setSelectedGender(userProfile.gender);
      setSelectedFrequency(userProfile.affirmationFrequency);
      setStartHour(userProfile.reminderStartHour || 8);
      setEndHour(userProfile.reminderEndHour || 20);
    }
  }, [userProfile]);

  const ageRanges: UserProfile["ageRange"][] = [
    "13-17",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ];

  const genderOptions: { value: UserProfile["gender"]; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  const frequencyOptions = [
    { value: 1, label: "Once a day" },
    { value: 2, label: "2 times a day" },
    { value: 3, label: "3 times a day" },
    { value: 4, label: "4 times a day" },
    { value: 5, label: "5 times a day" },
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

  const handleSave = async () => {
    if (!name.trim()) {
      showPopup("Error", "Please enter your name", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    if (startHour >= endHour) {
      showPopup("Error", "End time must be after start time", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile: UserProfile = {
        ...userProfile!,
        name: name.trim(),
        ageRange: selectedAge,
        gender: selectedGender,
        affirmationFrequency: selectedFrequency,
        reminderStartHour: startHour,
        reminderEndHour: endHour,
      };

      await saveUserProfile(updatedProfile);

      // Check if notification settings changed
      const notificationSettingsChanged =
        userProfile!.affirmationFrequency !== selectedFrequency ||
        userProfile!.reminderStartHour !== startHour ||
        userProfile!.reminderEndHour !== endHour;

      if (notificationSettingsChanged) {
        try {
          const hasPermission =
            await notificationService.areNotificationsEnabled();
          if (hasPermission) {
            await notificationService.scheduleAffirmationNotifications({
              frequency: selectedFrequency,
              startHour,
              endHour,
            });
            console.log("✅ Notifications rescheduled");
          }
        } catch (notificationError) {
          console.error("Error rescheduling notifications:", notificationError);
          // Continue anyway - notifications are not critical
        }
      }

      showPopup("Success! 🎉", "Your profile has been updated successfully!", [
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      showPopup("Error", "Failed to update profile. Please try again.", [
        { text: "OK", onPress: () => {} },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const theme = Colors[colorScheme ?? "light"];

  const getOptionStyle = (selected: boolean) => ({
    backgroundColor: selected
      ? theme.tabIconSelected + "20"
      : theme.background,
    borderColor: selected ? theme.tabIconSelected : theme.text + "20",
  });

  const getOptionTextStyle = (selected: boolean) => ({
    color: selected ? theme.tabIconSelected : theme.text,
    fontWeight: selected ? ("600" as const) : ("400" as const),
  });

  if (!userProfile) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <SimpleHeader title="Edit Profile" />

      <ScrollView style={styles.scrollView}>
        {/* Name Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.text + "60"}
            style={[
              styles.nameInput,
              {
                backgroundColor: theme.background,
                borderColor: theme.text + "20",
                color: theme.text,
              },
            ]}
          />
        </View>

        {/* Age Range Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Age Range
          </Text>
          <View style={styles.ageContainer}>
            {ageRanges.map((age) => (
              <TouchableOpacity
                key={age}
                onPress={() => setSelectedAge(age)}
                style={[styles.ageOption, getOptionStyle(selectedAge === age)]}
              >
                <Text style={getOptionTextStyle(selectedAge === age)}>
                  {age}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Gender
          </Text>
          <View style={styles.optionList}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedGender(option.value)}
                style={[
                  styles.listOption,
                  getOptionStyle(selectedGender === option.value),
                ]}
              >
                <Text
                  style={getOptionTextStyle(selectedGender === option.value)}
                >
                  {option.label}
                </Text>
                {selectedGender === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.tabIconSelected}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Daily Reminders
          </Text>
          <View style={styles.optionList}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedFrequency(option.value)}
                style={[
                  styles.listOption,
                  getOptionStyle(selectedFrequency === option.value),
                ]}
              >
                <Text
                  style={getOptionTextStyle(selectedFrequency === option.value)}
                >
                  {option.label}
                </Text>
                {selectedFrequency === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.tabIconSelected}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Range Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Hours
          </Text>

          <View style={styles.timeRow}>
            {/* Start Time */}
            <View style={styles.timeColumn}>
              <Text style={[styles.timeLabel, { color: theme.text }]}>
                From
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.text + "20",
                  },
                ]}
              >
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {formatHour(startHour)}
                </Text>
                <Ionicons name="time-outline" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View style={styles.timeColumn}>
              <Text style={[styles.timeLabel, { color: theme.text }]}>To</Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.text + "20",
                  },
                ]}
              >
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {formatHour(endHour)}
                </Text>
                <Ionicons name="time-outline" size={20} color={theme.text} />
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
              textColor={theme.text}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={createDateFromHour(endHour)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onEndTimeChange}
              textColor={theme.text}
            />
          )}

          {/* Info Text */}
          {startHour < endHour && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: theme.tabIconSelected + "10",
                },
              ]}
            >
              <Text style={[styles.infoText, { color: theme.text }]}>
                You&apos;ll receive {selectedFrequency} reminder
                {selectedFrequency > 1 ? "s" : ""} between{" "}
                {formatHour(startHour)} and {formatHour(endHour)}
              </Text>
              <Text style={[styles.infoSubtext, { color: theme.text }]}>
                (Every {Math.floor((endHour - startHour) / selectedFrequency)}{" "}
                hours approximately)
              </Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || startHour >= endHour}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                !isSaving && startHour < endHour
                  ? theme.highlight
                  : theme.highlight + "40",
            },
          ]}
        >
          <Text style={[styles.saveButtonText, { color: theme.background }]}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer}></View>
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  nameInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  ageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ageOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionList: {
    gap: 8,
  },
  listOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeRow: {
    flexDirection: "row",
    gap: 16,
  },
  timeColumn: {
    flex: 1,
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
  timeText: {
    fontSize: 16,
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
  saveButton: {
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 40,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 20,
  },
});
