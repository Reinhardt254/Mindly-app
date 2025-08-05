import { WelcomeCard } from "@/components/WelcomeCard";
import { router } from "expo-router";
import React from "react";

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push("/welcome/setup");
  };

  return <WelcomeCard onGetStarted={handleGetStarted} />;
}
