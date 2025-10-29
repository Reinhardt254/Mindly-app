import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProfile } from "@/constants/UserTypes";
import { notificationService } from "@/services/notificationService";

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
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (startHour >= endHour) {
      Alert.alert("Error", "End time must be after start time");
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

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!userProfile) {
    return (
      <View
        className="items-center justify-center flex-1"
        style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
      >
        <Text style={{ color: Colors[colorScheme ?? "light"].text }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pt-12 pb-4"
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme ?? "light"].text + "10",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: Colors[colorScheme ?? "light"].text }}
        >
          Edit Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Name Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors[colorScheme ?? "light"].text + "60"}
            className="p-4 rounded-xl"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 1,
              borderColor: Colors[colorScheme ?? "light"].text + "20",
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 16,
            }}
          />
        </View>

        {/* Age Range Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Age Range
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ageRanges.map((age) => (
              <TouchableOpacity
                key={age}
                onPress={() => setSelectedAge(age)}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    selectedAge === age
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                      : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor:
                    selectedAge === age
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "20",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedAge === age
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text,
                    fontWeight: selectedAge === age ? "600" : "400",
                  }}
                >
                  {age}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Gender
          </Text>
          <View className="gap-2">
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedGender(option.value)}
                className="p-4 rounded-xl flex-row items-center justify-between"
                style={{
                  backgroundColor:
                    selectedGender === option.value
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                      : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor:
                    selectedGender === option.value
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "20",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedGender === option.value
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text,
                    fontWeight: selectedGender === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {selectedGender === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors[colorScheme ?? "light"].tabIconSelected}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Daily Reminders
          </Text>
          <View className="gap-2">
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedFrequency(option.value)}
                className="p-4 rounded-xl flex-row items-center justify-between"
                style={{
                  backgroundColor:
                    selectedFrequency === option.value
                      ? Colors[colorScheme ?? "light"].tabIconSelected + "20"
                      : Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor:
                    selectedFrequency === option.value
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].text + "20",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedFrequency === option.value
                        ? Colors[colorScheme ?? "light"].tabIconSelected
                        : Colors[colorScheme ?? "light"].text,
                    fontWeight:
                      selectedFrequency === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </Text>
                {selectedFrequency === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors[colorScheme ?? "light"].tabIconSelected}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Range Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Active Hours
          </Text>

          <View className="flex-row gap-4">
            {/* Start Time */}
            <View className="flex-1">
              <Text
                className="text-sm mb-2"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  opacity: 0.7,
                }}
              >
                From
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                className="p-4 rounded-xl flex-row items-center justify-between"
                style={{
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme ?? "light"].text + "20",
                }}
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
            <View className="flex-1">
              <Text
                className="text-sm mb-2"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  opacity: 0.7,
                }}
              >
                To
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                className="p-4 rounded-xl flex-row items-center justify-between"
                style={{
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme ?? "light"].text + "20",
                }}
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
          {startHour < endHour && (
            <View
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor:
                  Colors[colorScheme ?? "light"].tabIconSelected + "10",
              }}
            >
              <Text
                className="text-sm text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  opacity: 0.8,
                }}
              >
                You&apos;ll receive {selectedFrequency} reminder
                {selectedFrequency > 1 ? "s" : ""} between{" "}
                {formatHour(startHour)} and {formatHour(endHour)}
              </Text>
              <Text
                className="text-xs text-center mt-1"
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  opacity: 0.6,
                }}
              >
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
          className="py-4 mt-4 mb-10 rounded-2xl"
          style={{
            backgroundColor:
              !isSaving && startHour < endHour
                ? Colors[colorScheme ?? "light"].tabIconSelected
                : Colors[colorScheme ?? "light"].tabIconSelected + "40",
            paddingVertical: 16,
          }}
        >
          <Text
            className="text-lg font-semibold text-center"
            style={{
              color: Colors[colorScheme ?? "light"].background,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
