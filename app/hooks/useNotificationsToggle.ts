import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";

type PopupButton = {
  text: string;
  onPress: () => void;
  style?: "default" | "destructive" | "cancel";
};

type ShowPopup = (
  title: string,
  message: string,
  buttons: PopupButton[]
) => void;

export function useNotificationsToggle(showPopup: ShowPopup) {
  const { userProfile } = useLocalStorage();
  const [enabled, setEnabled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setEnabled(await notificationService.areNotificationsEnabled());
      } catch (error) {
        console.error("Error checking notification status:", error);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const toggle = async (value: boolean) => {
    if (value) {
      try {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission && userProfile) {
          await notificationService.scheduleAffirmationNotifications({
            frequency: userProfile.affirmationFrequency,
            startHour: userProfile.reminderStartHour || 8,
            endHour: userProfile.reminderEndHour || 20,
          });
          setEnabled(true);
          showPopup(
            "Notifications enabled",
            `You'll receive ${userProfile.affirmationFrequency} affirmation reminder${
              userProfile.affirmationFrequency > 1 ? "s" : ""
            } per day.`,
            [{ text: "Great", onPress: () => {} }]
          );
        } else {
          showPopup(
            "Permission denied",
            "Please enable notifications in your device settings to receive affirmation reminders.",
            [{ text: "OK", onPress: () => {} }]
          );
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        showPopup("Error", "Failed to enable notifications. Please try again.", [
          { text: "OK", onPress: () => {} },
        ]);
      }
    } else {
      try {
        await notificationService.cancelAllNotifications();
        setEnabled(false);
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

  return { enabled, isChecking, toggle };
}
