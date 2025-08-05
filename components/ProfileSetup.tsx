import { UserProfile } from "@/constants/UserTypes";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ageRange: "" as UserProfile["ageRange"],
    gender: "" as UserProfile["gender"],
    affirmationFrequency: 3 as UserProfile["affirmationFrequency"],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown states
  const [genderOpen, setGenderOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);

  const ageRanges: UserProfile["ageRange"][] = [
    "18-25",
    "26-35",
    "36-45",
    "46+",
  ];

  const genders: UserProfile["gender"][] = [
    "Male",
    "Female",
    "Non-binary",
    "Prefer not to say",
  ];

  const frequencies: UserProfile["affirmationFrequency"][] = [1, 2, 3, 5];

  // Dropdown items
  const genderItems = genders.map((gender) => ({
    label: gender,
    value: gender,
  }));

  const ageItems = ageRanges.map((age) => ({
    label: age,
    value: age,
  }));

  const frequencyItems = frequencies.map((frequency) => ({
    label: `${frequency} ${frequency === 1 ? "time" : "times"} a day`,
    value: frequency,
  }));

  // Password validation
  const passwordRequirements = {
    length: formData.password.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !passwordRequirements.length ||
      !passwordRequirements.special ||
      !passwordRequirements.number
    ) {
      newErrors.password = "Password doesn't meet requirements";
    }

    if (!formData.ageRange) {
      newErrors.ageRange = "Please select an age range";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const profile: UserProfile = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        ageRange: formData.ageRange,
        gender: formData.gender,
        affirmationFrequency: formData.affirmationFrequency,
        isFirstTime: false,
        dailyAffirmationsShown: 0,
      };
      onComplete(profile);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const renderFormContent = () => (
    <View className="flex-1 px-3 py-20 pb-0 w-full h-full bg-gray-800">
      {/* Header */}
      <View className="flex-col gap-3 items-center mb-0">
        <Text className="w-full text-4xl font-bold text-center text-white">
          Welcome to Moodly
        </Text>
        <Text className="w-full text-xl font-semibold text-center text-gray-300">
          Let&apos;s Get to Know You, This helps us personalize your experience
        </Text>
      </View>

      {/* Form Container */}
      <View className="flex flex-col gap-4 p-4 pt-10 pb-2 mb-32 space-y-6 w-full rounded-xl">
        {/* First Name */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">
            First Name
          </Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(text) => updateFormData("firstName", text)}
            placeholder="Enter your first name"
            placeholderTextColor="#6B7280"
            className="px-4 py-3 h-16 text-base text-white bg-gray-700 rounded-lg"
          />
          {errors.firstName && (
            <Text className="text-sm text-red-400">{errors.firstName}</Text>
          )}
        </View>

        {/* Last Name */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">Last Name</Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(text) => updateFormData("lastName", text)}
            placeholder="Enter your last name"
            placeholderTextColor="#6B7280"
            className="px-4 py-3 h-16 text-base text-white bg-gray-700 rounded-lg"
          />
          {errors.lastName && (
            <Text className="text-sm text-red-400">{errors.lastName}</Text>
          )}
        </View>

        {/* Gender Dropdown */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">Gender</Text>
          <DropDownPicker
            open={genderOpen}
            value={formData.gender}
            items={genderItems}
            setOpen={setGenderOpen}
            setValue={(callback) => {
              const value =
                typeof callback === "function"
                  ? callback(formData.gender)
                  : callback;
              updateFormData("gender", value);
            }}
            placeholder="Select gender"
            placeholderStyle={{ color: "#6B7280" }}
            style={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderRadius: 8,
              borderWidth: 1,
              minHeight: 60,
            }}
            textStyle={{
              color: "#F3F4F6",
              fontSize: 16,
            }}
            dropDownContainerStyle={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderWidth: 1,
            }}
            listItemLabelStyle={{
              color: "#F3F4F6",
            }}
            selectedItemLabelStyle={{
              color: "#3B82F6",
              fontWeight: "bold",
            }}
            selectedItemContainerStyle={{
              backgroundColor: "#1F2937",
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
          {errors.gender && (
            <Text className="text-sm text-red-400">{errors.gender}</Text>
          )}
        </View>

        {/* Age Dropdown */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">Age</Text>
          <DropDownPicker
            open={ageOpen}
            value={formData.ageRange}
            items={ageItems}
            setOpen={setAgeOpen}
            setValue={(callback) => {
              const value =
                typeof callback === "function"
                  ? callback(formData.ageRange)
                  : callback;
              updateFormData("ageRange", value);
            }}
            placeholder="Select age range"
            placeholderStyle={{ color: "#6B7280" }}
            style={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderRadius: 8,
              borderWidth: 1,
              height: 55,
            }}
            textStyle={{
              color: "#F3F4F6",
              fontSize: 16,
            }}
            dropDownContainerStyle={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderWidth: 1,
            }}
            listItemLabelStyle={{
              color: "#F3F4F6",
            }}
            selectedItemLabelStyle={{
              color: "#3B82F6",
              fontWeight: "bold",
            }}
            selectedItemContainerStyle={{
              backgroundColor: "#1F2937",
            }}
            zIndex={2000}
            zIndexInverse={2000}
          />
          {errors.ageRange && (
            <Text className="text-sm text-red-400">{errors.ageRange}</Text>
          )}
        </View>

        {/* Affirmation Frequency */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">
            Affirmation Frequency
          </Text>
          <DropDownPicker
            open={frequencyOpen}
            value={formData.affirmationFrequency}
            items={frequencyItems}
            setOpen={setFrequencyOpen}
            setValue={(callback) => {
              const value =
                typeof callback === "function"
                  ? callback(formData.affirmationFrequency)
                  : callback;
              updateFormData("affirmationFrequency", value);
            }}
            placeholder="Select frequency"
            placeholderStyle={{ color: "#6B7280" }}
            style={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderRadius: 8,
              borderWidth: 1,
              height: 55,
            }}
            textStyle={{
              color: "#F3F4F6",
              fontSize: 16,
            }}
            dropDownContainerStyle={{
              backgroundColor: "#374151",
              borderColor: "#4B5563",
              borderWidth: 1,
            }}
            listItemLabelStyle={{
              color: "#F3F4F6",
            }}
            selectedItemLabelStyle={{
              color: "#3B82F6",
              fontWeight: "bold",
            }}
            selectedItemContainerStyle={{
              backgroundColor: "#1F2937",
            }}
            zIndex={1000}
            zIndexInverse={3000}
          />
        </View>

        {/* Email */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">Email ID</Text>
          <TextInput
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
            placeholder="eg:john@gmail.com"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            className="px-4 py-3 h-16 text-base text-white bg-gray-700 rounded-lg"
            style={{
              height: 55,
            }}
          />
          {errors.email && (
            <Text className="text-sm text-red-400">{errors.email}</Text>
          )}
        </View>

        {/* Password */}
        <View className="space-y-2">
          <Text className="pb-1 text-lg font-medium text-white">Password</Text>
          <View className="relative">
            <TextInput
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              placeholder="Enter your password"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              className="px-4 py-3 pr-12 h-14 text-base text-white bg-gray-700 rounded-lg"
              style={{
                height: 55,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View className="mt-3 space-y-2">
            <View className="flex-row items-center space-x-2">
              <Ionicons
                name={
                  passwordRequirements.length
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={passwordRequirements.length ? "#10B981" : "#EF4444"}
              />
              <Text className="text-sm text-gray-400">
                At least 8 character
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons
                name={
                  passwordRequirements.special
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={passwordRequirements.special ? "#10B981" : "#EF4444"}
              />
              <Text className="text-sm text-gray-400">1 special character</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons
                name={
                  passwordRequirements.number
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={passwordRequirements.number ? "#10B981" : "#EF4444"}
              />
              <Text className="text-sm text-gray-400">1 number</Text>
            </View>
          </View>
          {errors.password && (
            <Text className="text-sm text-red-400">{errors.password}</Text>
          )}
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="py-4 mt-4 bg-blue-500 rounded-lg"
          activeOpacity={0.8}
        >
          <Text className="text-lg font-semibold text-center text-white">
            Create account
          </Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View className="mt-6 mb-8">
          <Text className="text-sm text-center text-gray-400">
            By clicking create account, I agree to the{" "}
            <Text className="text-blue-500">Terms of service</Text> and{" "}
            <Text className="text-blue-500">Privacy policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 w-screen h-full bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-0.05 w-screen h-7 bg-gray-900"></View>
      <FlatList
        data={[{ key: "form" }]}
        renderItem={() => renderFormContent()}
        keyExtractor={() => "form"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </KeyboardAvoidingView>
  );
};
