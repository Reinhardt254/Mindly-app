import { ProfileSetup } from "@/components/ProfileSetup";
import { UserProfile } from "@/constants/UserTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { router } from "expo-router";
import React from "react";

export default function SetupScreen() {
  const { saveUserProfile } = useLocalStorage();

  const handleProfileComplete = async (profile: UserProfile) => {
    try {
      await saveUserProfile(profile);
      router.replace("/");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return <ProfileSetup onComplete={handleProfileComplete} />;
}
