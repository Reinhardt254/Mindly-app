import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UserProfile } from "@/constants/UserTypes";
import { notificationService } from "@/services/notificationService";
import { Popup } from "@/components/Popup";
import { PrimaryButton, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const palette = usePalette();
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

  const frequencyOptions = [1, 2, 3, 4, 5];

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
    if (selectedDate) setStartHour(selectedDate.getHours());
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) setEndHour(selectedDate.getHours());
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showPopup("Name required", "Please enter your name.", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    if (startHour >= endHour) {
      showPopup("Check your hours", "End time must be after start time.", [
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
          }
        } catch (notificationError) {
          console.error("Error rescheduling notifications:", notificationError);
        }
      }

      showPopup("Saved", "Your profile has been updated.", [
        { text: "Done", onPress: () => router.back() },
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

  if (!userProfile) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  const fieldStyle = {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  };

  return (
    <Screen
      title="Edit Profile"
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            title="Save changes"
            onPress={handleSave}
            loading={isSaving}
            disabled={startHour >= endHour}
          />
        </View>
      }
    >
      <SectionLabel style={styles.firstLabel}>Name</SectionLabel>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={palette.textMuted}
        style={[styles.input, fieldStyle, { color: palette.text }]}
      />

      <SectionLabel>Age range</SectionLabel>
      <View style={styles.chips}>
        {ageRanges.map((age) => (
          <Chip
            key={age}
            label={age}
            selected={selectedAge === age}
            onPress={() => setSelectedAge(age)}
          />
        ))}
      </View>

      <SectionLabel>Gender</SectionLabel>
      <View style={[styles.group, fieldStyle]}>
        {genderOptions.map((option, index) => (
          <OptionRow
            key={option.value}
            label={option.label}
            selected={selectedGender === option.value}
            onPress={() => setSelectedGender(option.value)}
            isLast={index === genderOptions.length - 1}
          />
        ))}
      </View>

      <SectionLabel>Daily reminders</SectionLabel>
      <View style={styles.chips}>
        {frequencyOptions.map((value) => (
          <Chip
            key={value}
            label={`${value}x`}
            selected={selectedFrequency === value}
            onPress={() => setSelectedFrequency(value)}
            wide
          />
        ))}
      </View>

      <SectionLabel>Active hours</SectionLabel>
      <View style={styles.timeRow}>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          style={[styles.timeButton, fieldStyle]}
        >
          <Text style={[styles.timeLabel, { color: palette.textMuted }]}>
            From
          </Text>
          <Text style={[styles.timeText, { color: palette.text }]}>
            {formatHour(startHour)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          style={[styles.timeButton, fieldStyle]}
        >
          <Text style={[styles.timeLabel, { color: palette.textMuted }]}>
            To
          </Text>
          <Text style={[styles.timeText, { color: palette.text }]}>
            {formatHour(endHour)}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={createDateFromHour(startHour)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onStartTimeChange}
          textColor={palette.text}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={createDateFromHour(endHour)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onEndTimeChange}
          textColor={palette.text}
        />
      )}

      <View style={[styles.info, { backgroundColor: palette.accentSoft }]}>
        <Ionicons
          name="notifications-outline"
          size={18}
          color={palette.accent}
        />
        <Text style={[styles.infoText, { color: palette.text }]}>
          {startHour < endHour
            ? `${selectedFrequency} reminder${
                selectedFrequency > 1 ? "s" : ""
              } between ${formatHour(startHour)} and ${formatHour(endHour)}`
            : "End time must be after start time"}
        </Text>
      </View>

      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </Screen>
  );
}

function Chip({
  label,
  selected,
  onPress,
  wide,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  wide?: boolean;
}) {
  const palette = usePalette();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        wide && styles.chipWide,
        {
          backgroundColor: selected ? palette.accent : palette.surface,
          borderColor: selected ? palette.accent : palette.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : palette.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
  isLast,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast: boolean;
}) {
  const palette = usePalette();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.optionRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.optionText, { color: palette.text }]}>{label}</Text>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? palette.accent : palette.iconRing,
            backgroundColor: selected ? palette.accent : "transparent",
          },
        ]}
      >
        {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  firstLabel: {
    marginTop: 0,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipWide: {
    minWidth: 56,
    alignItems: "center",
  },
  chipText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  group: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    gap: 10,
  },
  timeButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: 14,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  timeText: {
    fontSize: 17,
    fontFamily: Fonts.semibold,
    marginTop: 4,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: Radius.md,
    marginTop: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
