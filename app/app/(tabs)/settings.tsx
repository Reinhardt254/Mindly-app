import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Popup } from "@/components/Popup";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNotificationsToggle } from "@/hooks/useNotificationsToggle";
import {
  Card,
  ListRow,
  Screen,
  SectionLabel,
  Toggle,
} from "@/components/ui/Kit";

export default function SettingsScreen() {
  const [hapticFeedback, setHapticFeedback] = useState(true);
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

  const notifications = useNotificationsToggle(showPopup);

  return (
    <Screen title="Settings">
      <SectionLabel style={{ marginTop: 0 }}>Notifications</SectionLabel>
      <Card>
        <ListRow
          icon="notifications-outline"
          label="Affirmation Reminders"
          subtitle={
            userProfile && notifications.enabled
              ? `${userProfile.affirmationFrequency}x daily, ${
                  userProfile.reminderStartHour || 8
                }:00 – ${userProfile.reminderEndHour || 20}:00`
              : "Off"
          }
          right={
            <Toggle
              value={notifications.enabled}
              onValueChange={notifications.toggle}
              disabled={notifications.isChecking}
            />
          }
          isLast
        />
      </Card>

      <SectionLabel>Appearance</SectionLabel>
      <Card>
        <ListRow
          icon="moon-outline"
          label="Dark Theme"
          right={
            <Toggle
              value={isDark}
              onValueChange={(v) => setThemeMode(v ? "dark" : "light")}
            />
          }
        />
        <ListRow
          icon="image-outline"
          label="Customize Background"
          onPress={() => router.push("/(tabs)/theme")}
          isLast
        />
      </Card>

      <SectionLabel>Interaction</SectionLabel>
      <Card>
        <ListRow
          icon="phone-portrait-outline"
          label="Haptic Feedback"
          right={
            <Toggle value={hapticFeedback} onValueChange={setHapticFeedback} />
          }
          isLast
        />
      </Card>

      <SectionLabel>About</SectionLabel>
      <Card>
        <ListRow
          icon="information-circle-outline"
          label="Version"
          value="1.0.0"
          onPress={() => router.push("/(tabs)/version")}
        />
        <ListRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => router.push("/(tabs)/terms-of-service")}
        />
        <ListRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => router.push("/(tabs)/privacy-policy")}
          isLast
        />
      </Card>

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
